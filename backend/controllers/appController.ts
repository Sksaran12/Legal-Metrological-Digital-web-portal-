import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Application } from '../models/Application';
import { InstrumentModel } from '../models/Instrument';
import { Verification } from '../models/Verification';
import { Certificate } from '../models/Certificate';
import { evaluateVerificationTests } from '../utils/mpeEngine';
import { calculateExpiryDates } from '../utils/expiryEngine';
import { AuthRequest } from '../middleware/auth';
import { buildLocation } from '../utils/location';
import { signCertificate } from '../utils/certificateSigning';
import { secureReference, secureId } from '../utils/identifiers';
import { getAppConfig } from '../config/env';
import { Payment } from '../models/Payment';
import { LmoOfficerModel } from '../models/LmoOfficer';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getAllApplications(req: AuthRequest, res: Response) {
  try {
    if (!req.user || !['administrator', 'owner', 'business', 'officer', 'lmo', 'gatc'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to list applications.' });
    }

    const { stage, paymentStatus, status, ownerId, search } = req.query;
    const filter: any = {};

    // Filter by logged in user role safely without triggering Mongoose ObjectId CastErrors
    if (req.user) {
      if (req.user.role === 'owner' || req.user.role === 'business') {
        const currentUserDoc = await User.findOne({
          $or: [
            ...(mongoose.Types.ObjectId.isValid(req.user.id) ? [{ _id: req.user.id }] : []),
            { email: req.user.email ? req.user.email.toLowerCase() : '' },
            { identifier: req.user.email ? req.user.email.toLowerCase() : '' },
            { identifier: req.user.id }
          ]
        });

        const ownerOrConditions: any[] = [];
        if (currentUserDoc) {
          ownerOrConditions.push({ owner: currentUserDoc._id });
        }
        if (req.user.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
          ownerOrConditions.push({ owner: req.user.id });
        }

        if (ownerOrConditions.length > 0) {
          filter.$or = ownerOrConditions;
        }
      } else if (req.user.role === 'officer' || req.user.role === 'lmo') {
        const officerIdentifierConditions: any[] = [];
        if (req.user.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
          officerIdentifierConditions.push({ assignedLmoUser: req.user.id });
        }
        if (req.user.id) {
          officerIdentifierConditions.push({ 'assignedLmo.id': req.user.id });
        }
        if (req.user.identifier) {
          officerIdentifierConditions.push({ 'assignedLmo.badgeNo': req.user.identifier });
        }
        if (req.user.name) {
          officerIdentifierConditions.push({ 'assignedLmo.name': req.user.name });
          officerIdentifierConditions.push({ 'assignedLmo.name': new RegExp(req.user.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') });
        }

        const currentOfficerDoc = await User.findOne({
          $or: [
            ...(mongoose.Types.ObjectId.isValid(req.user.id) ? [{ _id: req.user.id }] : []),
            { email: req.user.email ? req.user.email.toLowerCase() : '' },
            { identifier: req.user.id }
          ]
        });
        if (currentOfficerDoc) {
          officerIdentifierConditions.push({ assignedLmoUser: currentOfficerDoc._id });
          if (currentOfficerDoc.identifier) {
            officerIdentifierConditions.push({ 'assignedLmo.badgeNo': currentOfficerDoc.identifier });
          }
          if (currentOfficerDoc.name) {
            officerIdentifierConditions.push({ 'assignedLmo.name': currentOfficerDoc.name });
          }
        }

        filter.$or = officerIdentifierConditions;
        filter.status = { $in: ['ASSIGNED', 'SCHEDULED', 'UNDER VERIFICATION', 'VERIFIED', 'CERTIFICATE ISSUED'] };
      } else if (req.user.role === 'gatc') {
        const gatcOrConditions: any[] = [];
        if (req.user.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
          gatcOrConditions.push({ assignedGatcUser: req.user.id });
        }
        if (req.user.id) {
          gatcOrConditions.push({ 'assignedGatc.id': req.user.id });
        }
        if (gatcOrConditions.length > 0) {
          filter.$or = gatcOrConditions;
        }
      }
    }

    if (ownerId && typeof ownerId === 'string' && req.user?.role === 'administrator') {
      if (mongoose.Types.ObjectId.isValid(ownerId)) {
        filter.owner = ownerId;
      }
    }
    if (stage && typeof stage === 'string') {
      filter.stage = stage;
    }
    if (status && typeof status === 'string') {
      filter.status = status;
    }
    if (paymentStatus && typeof paymentStatus === 'string') {
      filter.paymentStatus = paymentStatus;
    }
    if (search && typeof search === 'string') {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      const searchOr = [
        { appNo: regex },
        { enterpriseName: regex },
        { equipmentName: regex },
        { equipmentSerial: regex }
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchOr }];
        delete filter.$or;
      } else {
        filter.$or = searchOr;
      }
    }

    const apps = await Application.find(filter)
      .populate('owner', 'name email enterpriseName phone')
      .populate('instrument')
      .populate('assignedLmoUser', 'name email role identifier zone')
      .populate('assignedGatcUser', 'name email role identifier zone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: apps.length, data: apps });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications.',
    });
  }
}

function canAccessApplication(app: any, req: AuthRequest) {
  const user = req.user;
  if (!user) return false;
  if (user.role === 'administrator') return true;

  const userId = user.id;
  if (user.role === 'owner' || user.role === 'business') {
    const ownerId = app.owner?._id?.toString?.() || app.owner?.toString?.();
    return ownerId === userId;
  }

  if (user.role === 'officer' || user.role === 'lmo') {
    const assignedId = app.assignedLmoUser?._id?.toString?.() || app.assignedLmoUser?.toString?.();
    return assignedId === userId || app.assignedLmo?.id === userId || app.assignedLmo?.badgeNo === user.identifier;
  }

  if (user.role === 'gatc') {
    const assignedId = app.assignedGatcUser?._id?.toString?.() || app.assignedGatcUser?.toString?.();
    return assignedId === userId || app.assignedGatc?.id === userId;
  }

  return false;
}

export async function getApplicationById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    let app = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      app = await Application.findById(id)
        .populate('owner', 'name email enterpriseName phone')
        .populate('instrument')
        .populate('assignedLmoUser', 'name email role identifier zone')
        .populate('assignedGatcUser', 'name email role identifier zone');
    }

    if (!app) {
      app = await Application.findOne({ appNo: id })
        .populate('owner', 'name email enterpriseName phone')
        .populate('instrument')
        .populate('assignedLmoUser', 'name email role identifier zone')
        .populate('assignedGatcUser', 'name email role identifier zone');
    }

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (!canAccessApplication(app, req)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to access this application.' });
    }

    return res.status(200).json({ success: true, data: app });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving application.' });
  }
}

export async function createApplication(req: AuthRequest, res: Response) {
  try {
    const data = { ...req.body };
    const now = new Date();
    const config = getAppConfig();

    // Payment state is server-controlled. A browser-submitted "Paid" value
    // is accepted only when explicitly enabling development demo payments.
    if (data.paymentStatus === 'Paid' && !config.allowDemoPayments) {
      const paymentId = String(data.razorpayPaymentId || data.txnId || '');
      const payment = paymentId && req.user?.id
        ? await Payment.findOne({ paymentId, owner: req.user.id, status: 'verified' })
        : null;
      if (!payment) {
        return res.status(400).json({
          success: false,
          message: 'Payment must be completed and verified through Razorpay before submitting an application.'
        });
      }
    }
    if (data.paymentStatus === 'Exempted' && req.user?.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'Only an administrator can mark an application as exempted from payment.'
      });
    }
    if (data.paymentStatus !== 'Paid' && data.paymentStatus !== 'Exempted') {
      data.paymentStatus = 'Pending';
      delete data.txnId;
      delete data.razorpayPaymentId;
      delete data.razorpayOrderId;
      delete data.paymentMethod;
    }

    if (data.gpsCoordinates) {
      const location = buildLocation(data.gpsCoordinates, data.locationSource || 'manual_pin', data.locationAccuracyMeters);
      if (!location) {
        return res.status(400).json({
          success: false,
          message: 'gpsCoordinates must contain valid latitude and longitude values.'
        });
      }
      data.location = location;
    }

    if (!data.appNo) {
      data.appNo = secureReference('IN-MH-APP');
    }

    // Resolve owner User document to store valid ObjectId reference
    let ownerObjId = null;
    if (req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
      ownerObjId = req.user.id;
    }
    if (req.user?.email || req.user?.id) {
      const u = await User.findOne({
        $or: [
          ...(ownerObjId ? [{ _id: ownerObjId }] : []),
          { email: req.user.email ? req.user.email.toLowerCase() : '' },
          { identifier: req.user.email ? req.user.email.toLowerCase() : '' },
          { identifier: req.user.id }
        ]
      });
      if (u) {
        ownerObjId = u._id;
        if (!data.enterpriseName) {
          data.enterpriseName = u.enterpriseName || u.name;
        }
      }
    }
    if (ownerObjId) {
      data.owner = ownerObjId;
    }

    // Check or create associated instrument record safely
    let instDoc = null;
    if (data.equipmentSerial) {
      try {
        instDoc = await InstrumentModel.findOne({ serialNo: data.equipmentSerial });
        if (!instDoc) {
          const eqPrefix = (data.equipmentName || 'INS').substring(0, 3).toUpperCase();
          const instId = secureId(`INST-${eqPrefix}`);
          instDoc = new InstrumentModel({
            instrumentId: instId,
            type: data.equipmentName || data.instrumentType || 'Weighing Instrument',
            category: data.instrumentType || 'electronic_scales_weighbridges',
            serialNo: data.equipmentSerial,
            ownerName: data.enterpriseName || req.user?.name || 'Enterprise Owner',
            owner: data.owner,
            manufacturer: data.manufacturer || 'Standard Metrology Works',
            model: data.model || 'Standard Model',
            capacity: data.capacity || '30 kg',
            status: 'Due for Renewal',
            location: data.installationAddress || 'Default Address',
            accuracyClass: data.equipmentClass || 'Class III',
            qrHash: `QR-INST-${data.equipmentSerial}`,
            lastVerified: 'Pending',
            nextVerificationDue: 'Pending'
          });
          await instDoc.save();
        }
        if (instDoc && instDoc._id) {
          data.instrument = instDoc._id;
        }
      } catch (instErr: any) {
        console.warn('⚠️ Non-fatal instrument creation notice:', instErr?.message);
      }
    }

    // Process itemized instruments if provided
    if (data.instrumentsList && Array.isArray(data.instrumentsList) && data.instrumentsList.length > 0) {
      data.totalInstrumentsCount = data.instrumentsList.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0);
      if (!data.equipmentName && data.instrumentsList[0]) {
        const first = data.instrumentsList[0];
        data.equipmentName = data.instrumentsList.length === 1
          ? `${first.manufacturer || ''} ${first.model || ''}`.trim() || first.instrumentType
          : `${first.instrumentType} + ${data.instrumentsList.length - 1} more (${data.totalInstrumentsCount} units)`;
      }
    }

    data.jurisdiction = data.jurisdiction || 'Mumbai Metropolitan Region';
    data.zone = data.zone || req.user?.zone || 'Zone II (Mumbai Central)';
    data.enterpriseName = data.enterpriseName || req.user?.enterpriseName || req.user?.name || 'Registered Enterprise Owner';
    data.enterpriseType = data.enterpriseType || 'Trader / Importer';
    data.equipmentName = data.equipmentName || data.instrumentType || 'Weighing Instrument';
    data.equipmentSerial = data.equipmentSerial || secureReference('SN-MH');
    data.equipmentClass = data.equipmentClass || data.accuracyClass || 'Class III';

    data.date = data.date || now.toISOString().split('T')[0];
    data.time = data.time || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    data.submittedAt = now;
    data.status = data.status || 'SUBMITTED';
    data.stage = data.stage || 'intake';
    data.stageLabel = data.stageLabel || 'Intake & Review Pending';
    data.stageBadgeClass = data.stageBadgeClass || 'bg-amber-50 text-amber-700 border-amber-200';

    data.statusHistory = [
      {
        status: data.status,
        timestamp: now,
        updatedBy: req.user?.id,
        updatedByName: req.user?.name || 'Applicant',
        notes: 'Verification application submitted.'
      }
    ];

    const app = new Application(data);
    await app.save();

    const populatedApp = await Application.findById(app._id)
      .populate('owner', 'name email enterpriseName phone')
      .populate('instrument');

    return res.status(201).json({
      success: true,
      message: 'Verification application submitted successfully.',
      data: populatedApp
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create application.',
    });
  }
}

function buildAppQuery(id: string) {
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { appNo: id }] };
  }
  return { appNo: id };
}

export async function updateApplication(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const app = await Application.findOne(buildAppQuery(id));
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (!canAccessApplication(app, req)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this application.' });
    }

    if ((req.user?.role === 'owner' || req.user?.role === 'business') &&
        Object.keys(updateData).some((field) => !['installationAddress', 'gpsCoordinates', 'photographName', 'supportingDocName', 'notes'].includes(field))) {
      return res.status(403).json({ success: false, message: 'Owners may only update application supporting details.' });
    }

    const allowedFields = req.user?.role === 'administrator'
      ? ['status', 'stage', 'stageLabel', 'stageBadgeClass', 'assignedLmoUser', 'assignedGatcUser', 'assignedLmo', 'assignedGatc', 'installationAddress', 'gpsCoordinates', 'photographName', 'supportingDocName', 'notes', 'testCentre', 'slaDeadline']
      : req.user?.role === 'officer' || req.user?.role === 'lmo' || req.user?.role === 'gatc'
      ? ['status', 'stage', 'stageLabel', 'stageBadgeClass', 'installationAddress', 'gpsCoordinates', 'photographName', 'supportingDocName', 'notes', 'testCentre']
      : ['installationAddress', 'gpsCoordinates', 'photographName', 'supportingDocName', 'notes'];
    for (const field of Object.keys(updateData)) {
      if (!allowedFields.includes(field)) delete updateData[field];
    }

    if (updateData.status && updateData.status !== app.status) {
      app.statusHistory.push({
        status: updateData.status,
        timestamp: new Date(),
        updatedBy: req.user?.id,
        updatedByName: req.user?.name || 'System User',
        notes: updateData.notes || `Status updated to ${updateData.status}`
      });
    }

    Object.assign(app, updateData);
    await app.save();

    const updatedApp = await Application.findById(app._id)
      .populate('owner', 'name email enterpriseName phone')
      .populate('instrument')
      .populate('assignedLmoUser', 'name email role identifier zone')
      .populate('assignedGatcUser', 'name email role identifier zone');

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully.',
      data: updatedApp
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update application.',
    });
  }
}

export async function assignOfficer(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { assignedLmoUser, assignedGatcUser, assignedLmo, assignedGatc, notes } = req.body;

    const app = await Application.findOne(buildAppQuery(id))
      .populate('assignedLmoUser')
      .populate('assignedGatcUser');
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (req.user?.role !== 'administrator' && !canAccessApplication(app, req)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to assign this application.' });
    }

    if (assignedLmoUser) {
      let officerUser = mongoose.Types.ObjectId.isValid(assignedLmoUser)
        ? await User.findById(assignedLmoUser)
        : null;

      // The admin roster uses LmoOfficer documents, while application ownership
      // and officer access use the linked User document.
      if (!officerUser) {
        const rosterOfficer = await LmoOfficerModel.findOne({
          $or: [
            ...(mongoose.Types.ObjectId.isValid(assignedLmoUser) ? [{ _id: assignedLmoUser }] : []),
            { badgeNo: assignedLmoUser }
          ]
        });
        if (rosterOfficer?.email) {
          officerUser = await User.findOne({
            $or: [
              { email: rosterOfficer.email.toLowerCase() },
              { identifier: rosterOfficer.badgeNo }
            ]
          });
        }
      }

      if (!officerUser) {
        return res.status(400).json({
          success: false,
          message: 'The selected LMO officer does not have a linked authentication account.'
        });
      }

      app.assignedLmoUser = officerUser._id;
      if (!assignedLmo) {
        app.assignedLmo = {
          id: officerUser._id.toString(),
          name: officerUser.name,
          badgeNo: officerUser.identifier || 'MH-LM-2041',
          avatar: '',
          zone: officerUser.zone || 'Zone II (Mumbai Central)',
          phone: officerUser.phone || '',
          email: officerUser.email
        };
      }
    }
    if (assignedLmo) {
      app.assignedLmo = assignedLmo;
      if (!assignedLmoUser && (assignedLmo.badgeNo || assignedLmo.email || assignedLmo.name)) {
        const u = await User.findOne({
          $or: [
            { identifier: assignedLmo.badgeNo },
            { email: assignedLmo.email ? assignedLmo.email.toLowerCase() : '' },
            { name: assignedLmo.name }
          ]
        });
        if (u && ['officer', 'lmo'].includes(u.role)) {
          app.assignedLmoUser = u._id;
        }
      }
    }
    if (assignedGatcUser) app.assignedGatcUser = assignedGatcUser;
    if (assignedGatc) app.assignedGatc = assignedGatc;

    app.status = 'ASSIGNED';
    app.stage = 'assign_lmo';
    app.stageLabel = 'Officer Assigned';
    app.stageBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';

    app.statusHistory.push({
      status: 'ASSIGNED',
      timestamp: new Date(),
      updatedBy: req.user?.id,
      updatedByName: req.user?.name || 'Admin',
      notes: notes || 'Assigned to inspecting officer / GATC test centre.'
    });

    await app.save();

    const updated = await Application.findById(app._id)
      .populate('owner', 'name email enterpriseName phone')
      .populate('instrument')
      .populate('assignedLmoUser', 'name email role identifier zone')
      .populate('assignedGatcUser', 'name email role identifier zone');

    return res.status(200).json({
      success: true,
      message: 'Officer/GATC assigned successfully.',
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to assign officer.',
    });
  }
}

export async function submitVerification(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const {
      maxCapacity,
      eInterval,
      dDivision,
      accuracyClass,
      verificationType = 'periodic',
      repeatability,
      eccentricity,
      linearity,
      remarks
    } = req.body;

    const app = await Application.findOne(buildAppQuery(id))
      .populate('owner')
      .populate('instrument');

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (req.user?.role !== 'administrator' && !canAccessApplication(app, req)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to verify this application.' });
    }

    const mpeResult = evaluateVerificationTests({
      maxCapacity: Number(maxCapacity),
      eInterval: Number(eInterval),
      dDivision: Number(dDivision || eInterval),
      accuracyClass: accuracyClass || app.equipmentClass || 'Class III',
      verificationType,
      repeatability,
      eccentricity,
      linearity
    });

    // Save Verification Record
    const verificationRecord = new Verification({
      application: app._id,
      instrument: app.instrument?._id,
      lmo: req.user?.id || app.assignedLmoUser || app._id,
      lmoName: req.user?.name || 'Inspecting Officer',
      maxCapacity: mpeResult.maxCapacity,
      eInterval: mpeResult.eInterval,
      dDivision: mpeResult.dDivision,
      accuracyClass: mpeResult.accuracyClass,
      serialNumber: app.equipmentSerial || app.instrument?.serialNo || app.instrumentModel || `SN-MH-${Math.floor(100000 + Math.random() * 900000)}`,
      repeatabilityTest: {
        testLoad: mpeResult.repeatability.testLoad,
        observedError: mpeResult.repeatability.observedError,
        mpe: mpeResult.repeatability.mpeTolerance,
        isPass: mpeResult.repeatability.isPass
      },
      eccentricityTest: {
        testLoad: mpeResult.eccentricity.testLoad,
        observedError: mpeResult.eccentricity.observedError,
        mpe: mpeResult.eccentricity.mpeTolerance,
        isPass: mpeResult.eccentricity.isPass
      },
      linearityTest: {
        testLoad: mpeResult.linearity.testLoad,
        observedError: mpeResult.linearity.observedError,
        mpe: mpeResult.linearity.mpeTolerance,
        isPass: mpeResult.linearity.isPass
      },
      overallResult: mpeResult.overallResult,
      remarks: remarks || mpeResult.summaryMessage
    });
    await verificationRecord.save();

    if (mpeResult.overallResult === 'PASS') {
      app.status = 'CERTIFICATE ISSUED';
      app.stage = 'stamped';
      app.stageLabel = 'Verified & Stamped';
      app.stageBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      app.statusHistory.push({
        status: 'VERIFIED',
        timestamp: new Date(),
        updatedBy: req.user?.id,
        updatedByName: req.user?.name || 'LMO Officer',
        notes: 'Statutory verification tests passed MPE requirements.'
      });
      app.statusHistory.push({
        status: 'CERTIFICATE ISSUED',
        timestamp: new Date(),
        updatedBy: req.user?.id,
        updatedByName: req.user?.name || 'LMO Officer',
        notes: 'Official verification certificate generated.'
      });
      await app.save();

      // Update Instrument Status
      if (app.instrument) {
        const category = app.instrumentType || 'electronic_scales_weighbridges';
        const { expiryDate } = calculateExpiryDates(new Date(), category);
        await InstrumentModel.findByIdAndUpdate(app.instrument._id, {
          status: 'Compliant',
          lastVerified: new Date().toLocaleDateString('en-GB'),
          nextVerificationDue: expiryDate.toLocaleDateString('en-GB')
        });
      }

      // Generate Official Certificate
      const rawCat = (app.instrumentType || '').toLowerCase();
      let statutoryCategory: 'electronic_scales_weighbridges' | 'weights_and_measures' | 'storage_tanks' = 'electronic_scales_weighbridges';
      if (rawCat.includes('tank') || rawCat.includes('prover')) {
        statutoryCategory = 'storage_tanks';
      } else if (rawCat.includes('weight') || rawCat.includes('measure') || rawCat.includes('conical')) {
        statutoryCategory = 'weights_and_measures';
      }

      const certId = secureReference('LM-CERT');
      const { expiryDate, validityMonths } = calculateExpiryDates(new Date(), statutoryCategory);

      // Prioritize the assigned inspecting officer so the certificate accurately reflects the designated officer
      const isOfficerSession = req.user?.role === 'officer' || req.user?.role === 'lmo';
      const officerName =
        (isOfficerSession && req.user?.name) ||
        app.assignedLmo?.name ||
        (app.assignedLmoUser as any)?.name ||
        req.user?.name ||
        'Legal Metrology Officer';

      const officerBadge =
        (isOfficerSession && req.user?.identifier) ||
        app.assignedLmo?.badgeNo ||
        (app.assignedLmoUser as any)?.identifier ||
        req.user?.identifier ||
        'MH-LM-2041';

      app.certificateNo = certId;
      app.certificateId = certId;
      await app.save();

      const certificatePayload = {
        certificateId: certId,
        instrumentId: app.instrument?.instrumentId || `INST-${app.equipmentSerial || 'SCALE-001'}`,
        owner: app.enterpriseName,
        manufacturer: app.manufacturer || 'Standard Metrology',
        model: app.model || 'Standard Model',
        serialNumber: app.equipmentSerial || app.instrument?.serialNo || app.instrumentModel || 'UNKNOWN',
        accuracyClass: accuracyClass || app.equipmentClass || 'Class III',
        capacity: `${maxCapacity} kg`,
        verificationDate: new Date().toISOString(),
        verificationDateUtc: new Date(),
        expiryDate: expiryDate.toISOString(),
        expiryDateUtc: expiryDate,
        lmoId: officerBadge
      };
      const signature = signCertificate(certificatePayload);

      const certDoc = new Certificate({
        certificateId: certId,
        instrumentId: app.instrument?.instrumentId || `INST-${app.equipmentSerial || 'SCALE-001'}`,
        owner: app.enterpriseName,
        manufacturer: app.manufacturer || 'Standard Metrology',
        model: app.model || 'Standard Model',
        serialNumber: app.equipmentSerial || app.instrument?.serialNo || app.instrumentModel || `SN-MH-${Math.floor(100000 + Math.random() * 900000)}`,
        accuracyClass: accuracyClass || app.equipmentClass || 'Class III',
        capacity: `${maxCapacity} kg`,
        verificationDate: new Date().toLocaleDateString('en-GB'),
        validityPeriod: `${validityMonths} months`,
        expiryDate: expiryDate.toLocaleDateString('en-GB'),
        verificationDateUtc: new Date(),
        expiryDateUtc: expiryDate,
        lmoId: officerBadge,
        status: 'valid',
        instrument: app.equipmentName,
        category: statutoryCategory,
        verifiedBy: officerName.includes('(') ? officerName : `${officerName} (${officerBadge})`,
        establishmentAddress: app.installationAddress || 'Enterprise Premises',
        eInterval: `${eInterval} g`,
        digitalSignatureHash: signature?.signature,
        signature,
        ownerRef: app.owner?._id || app.owner,
        instrumentRef: app.instrument?._id,
        applicationRef: app._id,
        lmoRef: req.user?.id || (app.assignedLmoUser as any)?._id || app.assignedLmoUser
      });
      await certDoc.save();

      return res.status(200).json({
        success: true,
        message: 'Verification completed successfully. Certificate issued.',
        mpeResult,
        certificate: certDoc,
        application: app
      });
    } else {
      app.status = 'FAIL';
      app.stage = 'intake';
      app.stageLabel = 'Verification Failed / Non-Compliant';
      app.stageBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
      app.statusHistory.push({
        status: 'FAIL',
        timestamp: new Date(),
        updatedBy: req.user?.id,
        updatedByName: req.user?.name || 'LMO Officer',
        notes: `Verification failed MPE tolerances. ${mpeResult.summaryMessage}`
      });
      await app.save();

      if (app.instrument) {
        await InstrumentModel.findByIdAndUpdate(app.instrument._id, {
          status: 'Violation Reported'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Verification completed. Device failed statutory MPE tolerances.',
        mpeResult,
        application: app
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process verification test submission.',
    });
  }
}

export async function deleteApplication(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await Application.findOneAndDelete({ $or: [{ _id: id }, { appNo: id }] });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    return res.status(200).json({ success: true, message: 'Application deleted.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete application.' });
  }
}
