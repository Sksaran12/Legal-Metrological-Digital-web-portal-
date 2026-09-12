import { Request, Response } from 'express';
import { GatcCentreModel } from '../models/GatcCentre';
import { GatcApplicationModel } from '../models/GatcApplication';
import { secureReference } from '../utils/identifiers';

export async function getAllGatcCentres(req: Request, res: Response) {
  try {
    const centres = await GatcCentreModel.find().sort({ name: 1 });
    const formatted = centres.map((c: any) => ({
      ...c.toObject(),
      id: c._id.toString()
    }));
    return res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve GATC test centres.' });
  }
}

export async function createGatcCentre(req: Request, res: Response) {
  try {
    const data = req.body;
    const existing = await GatcCentreModel.findOne({ code: data.code });
    if (existing) {
      return res.status(400).json({ success: false, message: 'GATC Centre code already exists.' });
    }

    const centre = new GatcCentreModel(data);
    await centre.save();
    return res.status(201).json({ success: true, message: 'GATC test centre added.', data: centre });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create GATC test centre.' });
  }
}

/**
 * Submit statutory Second Schedule Application [Rule 5(1)]
 */
export async function submitSecondScheduleApplication(req: Request, res: Response) {
  try {
    const body = req.body;

    // Validate required statutory fields
    if (!body.applicantFullName || !body.applicantAddress || !body.contactEmail) {
      return res.status(400).json({
        success: false,
        message: 'Applicant full name, address, and email are mandatory under Clause (1).'
      });
    }

    if (!Array.isArray(body.appliedFirstScheduleItems) || body.appliedFirstScheduleItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one First Schedule weight/measure category must be selected under Clause (2).'
      });
    }

    if (!body.statutoryUndertakingAgreed) {
      return res.status(400).json({
        success: false,
        message: 'Statutory undertaking to abide by Legal Metrology Act 2009 is mandatory under Clause (16).'
      });
    }

    const applicationNo = secureReference('GATC-APP');

    const newApp = new GatcApplicationModel({
      ...body,
      applicationNo,
      status: 'SUBMITTED',
      undertakingDate: body.undertakingDate || new Date().toISOString().split('T')[0]
    });

    await newApp.save();

    return res.status(201).json({
      success: true,
      message: `Statutory GATC Accreditation Application ${applicationNo} submitted successfully.`,
      data: newApp
    });
  } catch (error: any) {
    console.error('GATC Application submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit Second Schedule GATC Application: ' + error.message
    });
  }
}

/**
 * Retrieve all Second Schedule GATC Applications for Admin Review
 */
export async function getSecondScheduleApplications(req: Request, res: Response) {
  try {
    const applications = await GatcApplicationModel.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve GATC applications: ' + error.message
    });
  }
}

/**
 * Update Status / Approve Second Schedule GATC Application
 */
export async function updateSecondScheduleApplicationStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, reviewRemarks, assignedInspector } = req.body;

    const validStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const app = await GatcApplicationModel.findById(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'GATC Application not found.' });
    }

    app.status = status;
    if (reviewRemarks !== undefined) app.reviewRemarks = reviewRemarks;
    if (assignedInspector !== undefined) app.assignedInspector = assignedInspector;

    // If APPROVED, auto-provision GATC Centre entry if not already created
    if (status === 'APPROVED' && !app.approvedCentreCode) {
      const code = secureReference('MH-GATC-REG');
      app.approvedCentreCode = code;

      const centre = new GatcCentreModel({
        code,
        name: app.applicantFullName,
        location: app.applicantAddress,
        nablAccreditationNo: `${app.nablCertificateNo} (${app.accreditationBody})`,
        validUntil: app.nablValidUntil || '31 Dec 2028',
        testingCapacities: app.appliedFirstScheduleItems.map((id) => `Statutory First Schedule: ${id}`),
        approvedFirstScheduleIds: app.appliedFirstScheduleItems,
        iso17025Accredited: app.iso17025Trained,
        jurisdictionArea: app.proposedJurisdictionArea,
        consumerComplaintNumber: app.consumerComplaintNumber,
        activeTestQueue: 0,
        status: 'Operational',
        contactPerson: `${app.principalOfficerName} (Principal Officer)`
      });

      await centre.save();
    }

    await app.save();

    return res.status(200).json({
      success: true,
      message: `GATC Application status updated to ${status}.`,
      data: app
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update GATC Application status: ' + error.message
    });
  }
}
