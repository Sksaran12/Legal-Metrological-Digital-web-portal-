import { Request, Response } from 'express';
import { StakeholderModel } from '../models/Stakeholder';
import { escapeRegex } from '../utils/search';
import { secureReference } from '../utils/identifiers';

export async function getAllStakeholders(req: Request, res: Response) {
  try {
    const { status, type, search } = req.query;
    const filter: any = {};
    if (status && typeof status === 'string') filter.status = status;
    if (type && typeof type === 'string') filter.enterpriseType = type;
    if (search && typeof search === 'string') {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ enterpriseName: regex }, { ownerName: regex }, { licenseNo: regex }];
    }

    const stakeholders = await StakeholderModel.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: stakeholders.length, data: stakeholders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve stakeholders.' });
  }
}

export async function createStakeholder(req: Request, res: Response) {
  try {
    const data = req.body;
    if (!data.registrationNo) {
      data.registrationNo = secureReference('REG-MH');
    }
    const stakeholder = new StakeholderModel(data);
    await stakeholder.save();
    return res.status(201).json({ success: true, message: 'Stakeholder registered.', data: stakeholder });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to register stakeholder.' });
  }
}

export async function updateStakeholderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await StakeholderModel.findOneAndUpdate(
      { $or: [{ _id: id }, { registrationNo: id }, { licenseNo: id }] },
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Stakeholder not found.' });
    }
    return res.status(200).json({ success: true, message: 'Stakeholder status updated.', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update stakeholder status.' });
  }
}
