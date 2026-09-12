import { Request, Response } from 'express';
import { InquiryModel } from '../models/Inquiry';
import { AuthRequest } from '../middleware/auth';
import { escapeRegex } from '../utils/search';
import { secureReference } from '../utils/identifiers';

export async function createInquiry(req: Request, res: Response) {
  try {
    const { name, email, topic, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message particulars are required.'
      });
    }

    const ticketNo = secureReference('INQ');

    const inquiry = new InquiryModel({
      ticketNo,
      name,
      email: email.toLowerCase(),
      topic: topic || 'Verification Docket Status Inquiry',
      message,
      status: 'Pending'
    });

    await inquiry.save();

    return res.status(201).json({
      success: true,
      message: 'Statutory Helpdesk Inquiry logged successfully.',
      ticketNo: inquiry.ticketNo,
      data: inquiry
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to log helpdesk inquiry.',
    });
  }
}

export async function getAllInquiries(req: AuthRequest, res: Response) {
  try {
    const { status, search } = req.query;
    const filter: any = {};

    if (status && typeof status === 'string') {
      filter.status = status;
    }
    if (search && typeof search === 'string') {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [
        { ticketNo: regex },
        { name: regex },
        { email: regex },
        { topic: regex }
      ];
    }

    const inquiries = await InquiryModel.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve helpdesk inquiries.',
    });
  }
}

export async function updateInquiryStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, responseNotes } = req.body;

    const updated = await InquiryModel.findOneAndUpdate(
      { $or: [{ _id: id }, { ticketNo: id }] },
      { status, responseNotes },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inquiry ticket not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Inquiry status updated successfully.',
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update inquiry status.',
    });
  }
}
