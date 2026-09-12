import { Request, Response } from 'express';
import { InstrumentModel } from '../models/Instrument';
import { Application } from '../models/Application';
import { AuthRequest } from '../middleware/auth';
import { escapeRegex } from '../utils/search';
import { secureId } from '../utils/identifiers';

export async function getAllInstruments(req: AuthRequest, res: Response) {
  try {
    if (!req.user || !['administrator', 'owner', 'business', 'officer', 'lmo', 'gatc'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to list instruments.' });
    }

    const { category, status, search, ownerId } = req.query;
    const filter: any = {};

    if (req.user) {
      if (req.user.role === 'owner' || req.user.role === 'business') {
        filter.owner = req.user.id;
      }
    }

    if (ownerId && typeof ownerId === 'string' && req.user.role === 'administrator') {
      filter.owner = ownerId;
    }
    if (category && typeof category === 'string') {
      filter.category = category;
    }
    if (status && typeof status === 'string') {
      filter.status = status;
    }
    if (search && typeof search === 'string') {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ type: regex }, { serialNo: regex }, { ownerName: regex }, { instrumentId: regex }];
    }

    const instruments = await InstrumentModel.find(filter)
      .populate('owner', 'name email enterpriseName phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: instruments.length, data: instruments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve instruments.' });
  }
}

export async function getInstrumentMetrics(req: AuthRequest, res: Response) {
  try {
    const filter: any = {};
    const appFilter: any = {};

    if (req.user) {
      if (req.user.role === 'owner' || req.user.role === 'business') {
        filter.owner = req.user.id;
        appFilter.owner = req.user.id;
      }
    }

    const [
      totalInstruments,
      compliant,
      dueForRenewal,
      expiringSoon,
      expired,
      violationReported,
      pendingApps,
      activeVerifications
    ] = await Promise.all([
      InstrumentModel.countDocuments(filter),
      InstrumentModel.countDocuments({ ...filter, status: 'Compliant' }),
      InstrumentModel.countDocuments({ ...filter, status: 'Due for Renewal' }),
      InstrumentModel.countDocuments({ ...filter, status: 'Expiring Soon' }),
      InstrumentModel.countDocuments({ ...filter, status: 'Expired' }),
      InstrumentModel.countDocuments({ ...filter, status: 'Violation Reported' }),
      Application.countDocuments({ ...appFilter, status: { $in: ['SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'SCHEDULED'] } }),
      Application.countDocuments({ ...appFilter, status: 'UNDER VERIFICATION' })
    ]);

    return res.status(200).json({
      success: true,
      metrics: {
        totalInstruments,
        pendingApplications: pendingApps,
        underVerification: activeVerifications,
        certified: compliant,
        expiringSoon: expiringSoon + dueForRenewal,
        expired: expired + violationReported
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to calculate instrument metrics.' });
  }
}

export async function createInstrument(req: AuthRequest, res: Response) {
  try {
    const data = req.body;

    if (req.user?.id && !data.owner) {
      data.owner = req.user.id;
      data.ownerName = data.ownerName || req.user.name;
    }

    const existing = await InstrumentModel.findOne({ serialNo: data.serialNo });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Instrument serial number already registered.' });
    }

    if (!data.qrHash) {
      data.qrHash = `QR-INST-${data.serialNo || secureId('QR')}`;
    }

    const instrument = new InstrumentModel(data);
    await instrument.save();

    const populated = await InstrumentModel.findById(instrument._id).populate('owner', 'name email enterpriseName');

    return res.status(201).json({ success: true, message: 'Instrument registered.', data: populated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create instrument.' });
  }
}

export async function updateInstrument(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const instrument = await InstrumentModel.findOne(
      { $or: [{ _id: id }, { serialNo: id }, { instrumentId: id }] },
    );

    if (!instrument) {
      return res.status(404).json({ success: false, message: 'Instrument not found.' });
    }

    const ownerId = instrument.owner?.toString?.();
    if (req.user?.role !== 'administrator' && ownerId !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this instrument.' });
    }

    const allowedFields = [
      'type', 'category', 'manufacturer', 'model', 'capacity', 'status',
      'lastVerified', 'nextVerificationDue', 'location', 'accuracyClass'
    ];
    for (const field of allowedFields) {
      if (field in req.body) {
        (instrument as any)[field] = req.body[field];
      }
    }
    const updated = await instrument.save();
    await updated.populate('owner', 'name email enterpriseName');

    return res.status(200).json({ success: true, message: 'Instrument updated.', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update instrument.' });
  }
}
