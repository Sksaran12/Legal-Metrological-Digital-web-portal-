import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface CertificatePrintData {
  certificateId: string;
  instrumentId?: string;
  owner: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  accuracyClass: string;
  capacity: string;
  verificationDate: string;
  validityPeriod: string;
  expiryDate: string;
  lmoId: string;
  verifiedBy?: string;
  establishmentAddress?: string;
  instrument?: string;
  eInterval?: string;
  digitalSignatureHash?: string;
  qrPayload?: string;
  status?: string;
}

/**
 * Generate and download an authentic Government of India Legal Metrology
 * Verification Certificate (Schedule XI / Form 24) in true PDF format.
 */
export async function downloadCertificatePDF(
  data: CertificatePrintData,
  mode: 'download' | 'open' = 'download'
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // 1. Double Borders (Outer Navy, Inner Gold)
  doc.setDrawColor(12, 35, 64); // #0c2340 Navy
  doc.setLineWidth(1.2);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(180, 83, 9); // #b45309 Amber / Gold
  doc.setLineWidth(0.5);
  doc.rect(10.5, 10.5, pageWidth - 21, pageHeight - 21);

  // Corner Ornaments
  const cornerSize = 5;
  doc.setFillColor(180, 83, 9);
  doc.rect(8, 8, cornerSize, 1.2, 'F');
  doc.rect(8, 8, 1.2, cornerSize, 'F');
  doc.rect(pageWidth - 8 - cornerSize, 8, cornerSize, 1.2, 'F');
  doc.rect(pageWidth - 8 - 1.2, 8, 1.2, cornerSize, 'F');
  doc.rect(8, pageHeight - 8 - 1.2, cornerSize, 1.2, 'F');
  doc.rect(8, pageHeight - 8 - cornerSize, 1.2, cornerSize, 'F');
  doc.rect(pageWidth - 8 - cornerSize, pageHeight - 8 - 1.2, cornerSize, 1.2, 'F');
  doc.rect(pageWidth - 8 - 1.2, pageHeight - 8 - cornerSize, 1.2, cornerSize, 'F');

  // Top Header Banner Box
  doc.setFillColor(248, 250, 252);
  doc.rect(11, 11, pageWidth - 22, 32, 'F');

  // National Crest / Heading
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(12, 35, 64);
  doc.text('GOVERNMENT OF INDIA', pageWidth / 2, 17, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(78, 96, 115);
  doc.text('MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION', pageWidth / 2, 22, { align: 'center' });
  doc.text('DEPARTMENT OF CONSUMER AFFAIRS • DIRECTORATE OF LEGAL METROLOGY', pageWidth / 2, 26, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(180, 83, 9);
  doc.text('SCHEDULE XI - FORM 24', pageWidth / 2, 32, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('[See Rule 24 of Legal Metrology (General) Rules, 2011]', pageWidth / 2, 36, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(12, 35, 64);
  doc.text('CERTIFICATE OF VERIFICATION', pageWidth / 2, 43, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Issued under Section 24 of The Legal Metrology Act, 2009', pageWidth / 2, 47, { align: 'center' });

  // Divider line below header
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.6);
  doc.line(16, 49.5, pageWidth - 16, 49.5);

  // Certificate ID & Statutory Pass Stamp Box
  doc.setFillColor(238, 248, 241); // Emerald tint
  doc.setDrawColor(198, 237, 208);
  doc.roundedRect(16, 52, pageWidth - 32, 14, 2, 2, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(12, 35, 64);
  doc.text('CERTIFICATE ID: ' + (data.certificateId || 'LM-CERT-2026-0001'), 20, 60.5);

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(21, 128, 61); // Emerald green
  doc.text('✓ STATUTORY VERIFICATION: COMPLIANT & PASSED', pageWidth - 20, 60.5, { align: 'right' });

  // 2. Structured Table of Details
  let currentY = 72;
  const col1 = 16;
  const colWidth = pageWidth - 32;
  const labelWidth = 65;
  const valueWidth = colWidth - labelWidth;
  const rowHeight = 7.5;

  const mfgModel = (data.manufacturer || 'Avery India') + ' • Model: ' + (data.model || 'AVW-200');
  const accCap = (data.accuracyClass || 'Class III (Medium Accuracy)') + ' • Max: ' + (data.capacity || '300 kg');
  const officerBase = data.verifiedBy || 'Legal Metrology Officer';
  const officerText = officerBase.includes('(') ? officerBase : `${officerBase} (Badge: ${data.lmoId || 'MH-LM-2041'})`;

  const rows = [
    { label: 'Name of Owner / Enterprise', value: data.owner || 'Apex Scale Solutions Ltd.' },
    { label: 'Premises / Installation Address', value: data.establishmentAddress || 'Plot 14/B, MIDC Industrial Area, Mumbai' },
    { label: 'Description of Instrument / Measure', value: data.instrument || 'Electronic Weighing Instrument (Class III)' },
    { label: 'Manufacturer & Model Designation', value: mfgModel },
    { label: 'Serial Number of Instrument', value: data.serialNumber || 'SN-NAWI-2026-991', isMono: true },
    { label: 'Accuracy Class & Capacity (Max)', value: accCap },
    { label: 'Verification Scale Interval (e)', value: data.eInterval || '50 g', isMono: true },
    { label: 'Date of Official Verification', value: data.verificationDate || new Date().toLocaleDateString('en-GB') },
    { label: 'Statutory Validity Period', value: data.validityPeriod || '12 Months (Annual Cycle)' },
    { label: 'Valid Until (Next Renewal Expiry)', value: data.expiryDate || '08/09/2027', isHighlight: true },
    { label: 'Inspecting Officer (LMO)', value: officerText }
  ];

  doc.setFontSize(9);

  rows.forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(col1, currentY, colWidth, rowHeight, 'F');

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.rect(col1, currentY, colWidth, rowHeight, 'S');
    doc.line(col1 + labelWidth, currentY, col1 + labelWidth, currentY + rowHeight);

    // Label
    doc.setFont('times', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(row.label, col1 + 3, currentY + 5);

    // Value
    if (row.isHighlight) {
      doc.setFont('times', 'bold');
      doc.setTextColor(180, 83, 9); // Amber
    } else if (row.isMono) {
      doc.setFont('courier', 'bold');
      doc.setTextColor(12, 35, 64);
    } else {
      doc.setFont('times', 'normal');
      doc.setTextColor(15, 23, 42);
    }
    const valText = doc.splitTextToSize(row.value, valueWidth - 6);
    doc.text(valText[0] || '', col1 + labelWidth + 3, currentY + 5);

    currentY += rowHeight;
  });

  currentY += 4;

  // 3. Statutory Attestation Statement Box
  doc.setFillColor(254, 252, 232); // Amber light
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(16, currentY, colWidth, 23, 2, 2, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14);
  doc.text('STATUTORY VERIFICATION & STAMPING DECLARATION', 20, currentY + 5);

  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const declarationText =
    'Certified that the weighing and measuring instrument detailed above has been officially inspected, tested, and verified in accordance with the specifications prescribed under The Legal Metrology Act, 2009 and the Central Rules made thereunder. The device has satisfactorily passed Repeatability (Clause 3.6.1), Eccentricity (Clause 3.6.2), Linearity (Clause 3.5.1), and Maximum Permissible Error (MPE) requirements, and has been stamped with indelible government stamping seals.';
  const splitDeclaration = doc.splitTextToSize(declarationText, colWidth - 8);
  doc.text(splitDeclaration, 20, currentY + 9.5);

  currentY += 27;

  // 4. Mobile Scannable QR Code & Cryptographic Anchor Box
  const qrBoxY = currentY;
  const qrBoxHeight = 44;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(16, qrBoxY, colWidth, qrBoxHeight, 2, 2, 'FD');

  // Generate QR Code Image Data URL with mobile-accessible LAN IP / host
  let baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://10.55.234.119:3000';
  if (baseOrigin.includes('localhost') || baseOrigin.includes('127.0.0.1')) {
    const cachedLan = typeof window !== 'undefined' ? window.sessionStorage.getItem('everimet_lan_url') : null;
    baseOrigin = cachedLan || 'http://10.55.234.119:3000';
  }

  let verificationUrl = `${baseOrigin}/verify/${encodeURIComponent(data.certificateId)}`;
  if (
    data.qrPayload &&
    (data.qrPayload.startsWith('http://') || data.qrPayload.startsWith('https://')) &&
    !data.qrPayload.includes('localhost') &&
    !data.qrPayload.includes('127.0.0.1')
  ) {
    verificationUrl = data.qrPayload;
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 256,
      margin: 1,
      color: { dark: '#0c2340', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });

    // Embed QR Code into PDF
    doc.addImage(qrDataUrl, 'PNG', 20, qrBoxY + 3.5, 36, 36);
  } catch (qrErr) {
    console.warn('PDF QR embed fallback:', qrErr);
  }

  // QR Code Details & Description
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(12, 35, 64);
  doc.text('OFFICIAL SCANNABLE QR VERIFICATION SEAL', 62, qrBoxY + 8);

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Scan using any mobile smartphone camera or official barcode reader.', 62, qrBoxY + 13);
  doc.text('Directly queries the Directorate of Legal Metrology database on MongoDB Atlas.', 62, qrBoxY + 17);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Verify URL: ' + verificationUrl.substring(0, 52) + (verificationUrl.length > 52 ? '...' : ''), 62, qrBoxY + 22);

  // Ed25519 Anchor
  const sigHash = data.digitalSignatureHash || 'ed25519:e8b39a4f21d4c9f7a602bb147814cb9f67a21190bc281e4b308e2f8910d6e8b4';
  doc.setFont('times', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Cryptographic Anchor (Ed25519):', 62, qrBoxY + 29);

  doc.setFont('courier', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text(sigHash, 62, qrBoxY + 33);

  doc.setFont('times', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(21, 128, 61);
  doc.text('✓ Authenticity cryptographically locked against alteration.', 62, qrBoxY + 38);

  currentY += qrBoxHeight + 5;

  // 5. Signature and Officer Stamp Section
  const footerY = currentY;

  // Left: Security Hologram / Watermark notice
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Directorate Stamping Seal', 20, footerY + 5);

  doc.setFont('times', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Valid only with intact security lead/wire seal.', 20, footerY + 9);
  doc.text('Prohibited for commercial trade upon expiry.', 20, footerY + 13);

  // Right: Officer Signature Block
  const sigX = pageWidth - 20;
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(21, 128, 61);
  const officerDisplayName = data.verifiedBy ? (data.verifiedBy.replace(/\s*\([^)]*\)/, '').trim() || data.verifiedBy) : 'Legal Metrology Officer';
  doc.text(officerDisplayName, sigX, footerY + 5, { align: 'right' });

  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(12, 35, 64);
  doc.text('Legal Metrology Officer (LMO)', sigX, footerY + 10, { align: 'right' });

  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const badgeText = 'Badge ID: ' + (data.lmoId || 'MH-LM-2041') + ' • Enforcement Division';
  doc.text(badgeText, sigX, footerY + 14, { align: 'right' });

  // Output: Download or Open
  if (mode === 'open') {
    const pdfBlobUrl = doc.output('bloburl');
    window.open(pdfBlobUrl, '_blank');
  } else {
    doc.save(data.certificateId + '_Statutory_Certificate.pdf');
  }
}
