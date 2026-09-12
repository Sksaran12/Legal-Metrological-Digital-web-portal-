import { Request, Response } from 'express';
import { Certificate } from '../models/Certificate';
import { Application } from '../models/Application';
import {
  generateGovernmentCertificateHTML,
  generateGovernmentCertificatePDFBuffer,
  CertificatePDFData
} from '../utils/pdfGenerator';
import { AuthRequest } from '../middleware/auth';
import { getAppConfig } from '../config/env';
import { escapeRegex } from '../utils/search';

export async function getAllCertificates(req: AuthRequest, res: Response) {
  try {
    if (!req.user || !['administrator', 'owner', 'business', 'officer', 'lmo', 'gatc'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to list certificates.' });
    }

    const { status, category, search, ownerId } = req.query;
    const filter: any = {};

    if (req.user && (req.user.role === 'owner' || req.user.role === 'business')) {
      filter.ownerRef = req.user.id;
    } else if (req.user && (req.user.role === 'officer' || req.user.role === 'lmo')) {
      filter.lmoRef = req.user.id;
    } else if (req.user && req.user.role === 'gatc') {
      filter.applicationRef = {
        $in: await Application.find({ assignedGatcUser: req.user.id }).distinct('_id')
      };
    }

    if (ownerId && typeof ownerId === 'string' && req.user?.role === 'administrator') {
      filter.ownerRef = ownerId;
    }
    if (status && typeof status === 'string') {
      filter.status = status;
    }
    if (category && typeof category === 'string') {
      filter.category = category;
    }
    if (search && typeof search === 'string') {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      const searchFilter = { $or: [
        { certificateId: regex },
        { serialNumber: regex },
        { instrumentId: regex },
        { owner: regex },
        { manufacturer: regex }
      ] };
      Object.assign(filter, searchFilter);
    }

    const certs = await Certificate.find(filter)
      .populate('ownerRef', 'name email enterpriseName')
      .populate('instrumentRef')
      .populate('applicationRef')
      .populate('lmoRef', 'name email identifier role')
      .sort({ createdAt: -1 });

    // Ensure verifiedBy and lmoId are accurately resolved
    const normalized = certs.map((c: any) => {
      const doc = c.toObject ? c.toObject() : c;
      const assignedName =
        doc.verifiedBy ||
        doc.lmoName ||
        doc.applicationRef?.assignedLmo?.name ||
        doc.applicationRef?.assignedLmoUser?.name ||
        doc.lmoRef?.name ||
        'Legal Metrology Officer';

      const assignedBadge =
        doc.lmoId ||
        doc.applicationRef?.assignedLmo?.badgeNo ||
        doc.applicationRef?.assignedLmoUser?.identifier ||
        doc.lmoRef?.identifier ||
        'MH-LM-2041';

      return {
        ...doc,
        lmoId: assignedBadge,
        verifiedBy: assignedName.includes('(') ? assignedName : `${assignedName} (${assignedBadge})`
      };
    });

    return res.status(200).json({
      success: true,
      count: normalized.length,
      data: normalized
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificates.',
    });
  }
}

export async function getCertificateByIdOrQuery(req: AuthRequest, res: Response) {
  try {
    const { query } = req.params;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search parameter required.' });
    }

    const clean = query.trim();
    const regex = new RegExp(`^${escapeRegex(clean)}$`, 'i');

    let cert: any = await Certificate.findOne({
      $or: [
        { certificateId: regex },
        { serialNumber: regex },
        { instrumentId: regex },
        { _id: clean.match(/^[0-9a-fA-F]{24}$/) ? clean : null }
      ]
    })
      .populate('ownerRef', 'name email enterpriseName')
      .populate('instrumentRef')
      .populate('applicationRef')
      .populate('lmoRef', 'name email identifier role');

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found. Only issued certificates are publicly verifiable.'
      });
    }

    if (req.user && req.user.role !== 'administrator') {
      const app = cert.applicationRef;
      const ownerId =
        cert.ownerRef?._id?.toString?.() ||
        cert.ownerRef?.toString?.() ||
        app?.owner?._id?.toString?.() ||
        app?.owner?.toString?.();
      const lmoId =
        cert.lmoRef?._id?.toString?.() ||
        cert.lmoRef?.toString?.() ||
        app?.assignedLmoUser?._id?.toString?.() ||
        app?.assignedLmoUser?.toString?.();
      const gatcId = app?.assignedGatcUser?._id?.toString?.() || app?.assignedGatcUser?.toString?.();
      const allowed =
        ((req.user.role === 'owner' || req.user.role === 'business') && ownerId === req.user.id) ||
        ((req.user.role === 'officer' || req.user.role === 'lmo') && lmoId === req.user.id) ||
        (req.user.role === 'gatc' && gatcId === req.user.id);
      if (!allowed) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this certificate.' });
      }
    }

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: `No Legal Metrology Certificate found for identifier '${query}'.`
      });
    }

    const doc = cert.toObject ? cert.toObject() : cert;
    if (!req.user) {
      const publicData = {
        certificateId: doc.certificateId,
        instrumentId: doc.instrumentId,
        owner: doc.owner,
        manufacturer: doc.manufacturer,
        model: doc.model,
        serialNumber: doc.serialNumber,
        accuracyClass: doc.accuracyClass,
        capacity: doc.capacity,
        verificationDate: doc.verificationDate,
        verificationDateUtc: doc.verificationDateUtc,
        validityPeriod: doc.validityPeriod,
        expiryDate: doc.expiryDate,
        expiryDateUtc: doc.expiryDateUtc,
        lmoId: doc.lmoId,
        status: doc.status,
        instrument: doc.instrument,
        category: doc.category,
        warningThresholdDays: doc.warningThresholdDays,
        daysRemaining: doc.daysRemaining,
        verifiedBy: doc.verifiedBy,
        establishmentAddress: doc.establishmentAddress,
        eInterval: doc.eInterval,
        digitalSignatureHash: doc.digitalSignatureHash,
        signature: doc.signature
      };
      return res.status(200).json({ success: true, data: publicData });
    }
    const assignedName =
      doc.verifiedBy ||
      doc.lmoName ||
      doc.applicationRef?.assignedLmo?.name ||
      doc.applicationRef?.assignedLmoUser?.name ||
      doc.lmoRef?.name ||
      'Legal Metrology Officer';

    const assignedBadge =
      doc.lmoId ||
      doc.applicationRef?.assignedLmo?.badgeNo ||
      doc.applicationRef?.assignedLmoUser?.identifier ||
      doc.lmoRef?.identifier ||
      'MH-LM-2041';

    doc.lmoId = assignedBadge;
    doc.verifiedBy = assignedName.includes('(') ? assignedName : `${assignedName} (${assignedBadge})`;

    return res.status(200).json({
      success: true,
      data: doc
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error looking up certificate.',
    });
  }
}

/**
 * Helper to resolve full CertificatePDFData from either Certificate or Application collection
 */
async function resolveCertificateData(query: string): Promise<CertificatePDFData | null> {
  const clean = query.trim().replace(/\.pdf$/i, '');
  const regex = new RegExp(`^${escapeRegex(clean)}$`, 'i');

  let cert: any = await Certificate.findOne({
    $or: [
      { certificateId: regex },
      { serialNumber: regex },
      { instrumentId: regex },
      { _id: clean.match(/^[0-9a-fA-F]{24}$/) ? clean : null }
    ]
  })
    .populate('ownerRef', 'name email enterpriseName')
    .populate('instrumentRef')
    .populate('applicationRef')
    .populate('lmoRef', 'name email identifier role');

  if (!cert) return null;

  const doc = cert.toObject ? cert.toObject() : cert;
  const officerName =
    doc.verifiedBy ||
    doc.lmoName ||
    doc.applicationRef?.assignedLmo?.name ||
    doc.applicationRef?.assignedLmoUser?.name ||
    doc.lmoRef?.name ||
    'Legal Metrology Officer';

  const officerBadge =
    doc.lmoId ||
    doc.applicationRef?.assignedLmo?.badgeNo ||
    doc.applicationRef?.assignedLmoUser?.identifier ||
    doc.lmoRef?.identifier ||
    'MH-LM-2041';

  return {
    certificateId: doc.certificateId,
    instrumentId: doc.instrumentId,
    owner: doc.owner,
    manufacturer: doc.manufacturer || 'Standard Metrological Works',
    model: doc.model || 'Standard Model',
    serialNumber: doc.serialNumber,
    accuracyClass: doc.accuracyClass || 'Class III',
    capacity: doc.capacity || '300 kg',
    verificationDate: doc.verificationDate,
    validityPeriod: doc.validityPeriod || '12 Months',
    expiryDate: doc.expiryDate,
    lmoId: officerBadge,
    lmoName: officerName,
    verifiedBy: officerName.includes('(') ? officerName : `${officerName} (${officerBadge})`,
    establishmentAddress: doc.establishmentAddress,
    eInterval: doc.eInterval || '50 g',
    instrument: doc.instrument,
    digitalSignatureHash: doc.digitalSignatureHash,
    qrPayload: `${getAppConfig().publicAppUrl}/verify/${encodeURIComponent(doc.certificateId)}`
  };
}

/**
 * Serves the authentic, pristine white Form 24 Certificate page on mobile/desktop browsers
 * Guaranteed to open cleanly on all mobile devices and camera QR scanners
 */
export async function viewCertificateWhitePage(req: Request, res: Response) {
  try {
    const { query } = req.params;
    const certData = await resolveCertificateData(query);

    if (!certData) {
      const safeQuery = String(query).replace(/[&<>"']/g, (character) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character
      ));
      return res.status(404).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate Not Found | Directorate of Legal Metrology</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0c2340; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 32px; max-width: 480px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { color: #e11d48; font-size: 20px; margin-bottom: 12px; }
    p { font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 24px; }
    .btn { display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 36px; margin-bottom: 12px;">⚖️</div>
    <h1>Certificate Record Not Found</h1>
    <p>No active statutory certificate matches identifier <strong>"${safeQuery}"</strong> in the National Legal Metrology Database.</p>
    <a href="/?view=public-qr" class="btn">Search Central Portal</a>
  </div>
</body>
</html>`);
    }

    const htmlContent = await generateGovernmentCertificateHTML(certData);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(htmlContent);
  } catch (error: any) {
    return res.status(500).send(`Failed to load certificate view: ${error?.message}`);
  }
}

/**
 * Generates and downloads a TRUE, authentic binary PDF (%PDF-) file
 * Prevents mobile browser "http file not support" errors
 */
export async function downloadCertificateBinaryPdf(req: Request, res: Response) {
  try {
    const { query } = req.params;
    const certData = await resolveCertificateData(query);

    if (!certData) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    const pdfBuffer = await generateGovernmentCertificatePDFBuffer(certData);
    const filename = `${certData.certificateId}_Statutory_Certificate.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.status(200).send(pdfBuffer);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate binary PDF file.',
    });
  }
}

export async function createCertificate(req: AuthRequest, res: Response) {
  try {
    const applicationRef = String(req.body.applicationRef || '').trim();
    if (!applicationRef) {
      return res.status(400).json({ success: false, message: 'A source application is required to issue a certificate.' });
    }
    const application = await Application.findById(applicationRef);
    if (!application) return res.status(404).json({ success: false, message: 'Source application not found.' });
    if (!['officer', 'lmo', 'administrator'].includes(req.user?.role || '')) {
      return res.status(403).json({ success: false, message: 'Only authorized verification officers can issue certificates.' });
    }
    if (req.user?.role !== 'administrator' && application.assignedLmoUser?.toString() !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this application.' });
    }
    if (!['UNDER VERIFICATION', 'VERIFIED', 'CERTIFICATE ISSUED'].includes(application.status)) {
      return res.status(400).json({ success: false, message: 'The application must be verified before a certificate can be issued.' });
    }

    const allowedFields = [
      'certificateId', 'instrumentId', 'owner', 'manufacturer', 'model', 'serialNumber',
      'accuracyClass', 'capacity', 'verificationDate', 'validityPeriod', 'expiryDate',
      'lmoId', 'status', 'instrument', 'category', 'warningThresholdDays', 'daysRemaining',
      'verifiedBy', 'establishmentAddress', 'eInterval'
    ];
    const data = allowedFields.reduce<Record<string, unknown>>((result, field) => {
      if (req.body[field] !== undefined) result[field] = req.body[field];
      return result;
    }, {});
    data.applicationRef = application._id;
    data.ownerRef = application.owner;
    data.lmoRef = req.user?.id;
    data.qrPayload = `${getAppConfig().publicAppUrl}/verify/${encodeURIComponent(String(data.certificateId))}`;
    data.pdfUrl = `${getAppConfig().publicAppUrl}/api/certificates/pdf/${encodeURIComponent(String(data.certificateId))}.pdf`;

    const { signCertificate } = await import('../utils/certificateSigning');
    const signature = signCertificate(data);
    data.signature = signature;
    data.digitalSignatureHash = signature.signature;

    const existing = await Certificate.findOne({ certificateId: data.certificateId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Certificate ID already exists. Certificates cannot be overwritten.'
      });
    }

    const newCert = new Certificate(data);
    await newCert.save();
    if (application.status !== 'CERTIFICATE ISSUED') {
      application.status = 'CERTIFICATE ISSUED';
      application.stage = 'stamped';
      application.stageLabel = 'Certified & Stamped';
      await application.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Statutory verification certificate issued and recorded.',
      data: newCert
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to issue certificate.',
    });
  }
}

export async function updateCertificateStatus(req: AuthRequest, res: Response) {
  try {
    const { certificateId } = req.params;
    const { status } = req.body;

    const cert = await Certificate.findOneAndUpdate(
      { certificateId },
      { status },
      { new: true }
    );

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Certificate status updated to '${status}'.`,
      data: cert
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error updating certificate status.' });
  }
}
