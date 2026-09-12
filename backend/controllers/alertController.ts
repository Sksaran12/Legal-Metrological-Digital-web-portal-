import { Request, Response } from 'express';
import { AlertModel } from '../models/Alert';
import { secureReference } from '../utils/identifiers';

export async function getAllAlerts(req: Request, res: Response) {
  try {
    const { severity, status, type } = req.query;
    const filter: any = {};
    if (severity && typeof severity === 'string') filter.severity = severity;
    if (status && typeof status === 'string') filter.status = status;
    if (type && typeof type === 'string') filter.type = type;

    const alerts = await AlertModel.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve compliance alerts.' });
  }
}

export async function createAlertOrGrievance(req: Request, res: Response) {
  try {
    const data = req.body;
    if (!data.alertNo) {
      data.alertNo = secureReference('ALT');
    }
    if (!data.reportedAt) {
      data.reportedAt = new Date().toISOString();
    }

    const alert = new AlertModel(data);
    await alert.save();

    return res.status(201).json({
      success: true,
      message: 'Complaint / Violation report logged with Directorate.',
      data: alert
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record alert/grievance report.',
    });
  }
}

export async function updateAlertStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, actionTaken } = req.body;

    const updated = await AlertModel.findOneAndUpdate(
      { $or: [{ _id: id }, { alertNo: id }] },
      { status, ...(actionTaken && { actionTaken }) },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Alert record not found.' });
    }
    return res.status(200).json({ success: true, message: 'Alert record updated.', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update alert.' });
  }
}
