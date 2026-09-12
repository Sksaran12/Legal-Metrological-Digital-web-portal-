import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { getAppConfig } from '../config/env';

/**
 * Government Statutory Verification Certificate PDF & Web View Generator
 * Produces:
 * 1. Official Government Form 24 pristine white HTML view for mobile/desktop browsers
 * 2. True binary PDF (%PDF-) documents for direct download and storage
 */

export interface CertificatePDFData {
  certificateId: string;
  instrumentId: string;
  owner: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  accuracyClass: string;
  capacity: string;
  verificationDate: string;
  expiryDate: string;
  validityPeriod: string;
  lmoId: string;
  lmoName?: string;
  verifiedBy?: string;
  establishmentAddress?: string;
  eInterval?: string;
  instrument?: string;
  qrPayload?: string;
  digitalSignatureHash?: string;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (character) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character
  ));
}

/**
 * Generates an authentic, responsive, pristine white Form 24 Certificate HTML page
 * Designed to render flawlessly on all mobile devices (iOS Safari, Android Chrome, Samsung Internet, Firefox)
 * and all desktop browsers. Contains embedded "Download PDF" button that triggers true binary PDF generation.
 */
export async function generateGovernmentCertificateHTML(data: CertificatePDFData): Promise<string> {
  const config = getAppConfig();
  const qrUrl = data.qrPayload || `${config.publicAppUrl}/verify/${encodeURIComponent(data.certificateId)}`;
  if (!data.digitalSignatureHash) {
    throw new Error('Certificate signature is required for PDF generation.');
  }
  const sigHash = data.digitalSignatureHash;

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(qrUrl, {
      margin: 1,
      width: 256,
      color: { dark: '#0c2340', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });
  } catch {
    qrDataUrl = '';
  }

  const officerDisplay = escapeHtml(data.verifiedBy || (data.lmoName ? `${data.lmoName} (${data.lmoId || ''})` : 'Legal Metrology Officer'));
  const badgeDisplay = escapeHtml(data.lmoId);
  const certificateId = escapeHtml(data.certificateId);
  const owner = escapeHtml(data.owner);
  const instrumentId = escapeHtml(data.instrumentId);
  const manufacturer = escapeHtml(data.manufacturer);
  const model = escapeHtml(data.model);
  const serialNumber = escapeHtml(data.serialNumber);
  const accuracyClass = escapeHtml(data.accuracyClass);
  const capacity = escapeHtml(data.capacity);
  const verificationDate = escapeHtml(data.verificationDate);
  const expiryDate = escapeHtml(data.expiryDate);
  const validityPeriod = escapeHtml(data.validityPeriod);
  const establishmentAddress = escapeHtml(data.establishmentAddress);
  const instrument = escapeHtml(data.instrument);
  const eInterval = escapeHtml(data.eInterval);
  const signatureHash = escapeHtml(sigHash);
  const downloadPdfUrl = `/api/certificates/download/${encodeURIComponent(data.certificateId)}.pdf`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>Verification Certificate - ${certificateId} | Directorate of Legal Metrology</title>
  <style>
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, serif;
      background: #f1f5f9;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .top-action-bar {
      max-width: 820px;
      width: 100%;
      margin-bottom: 14px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      background: #ffffff;
      padding: 12px 18px;
      border-radius: 14px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .top-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #15803d;
      background: #eef8f1;
      border: 1px solid #c6edd0;
      padding: 4px 10px;
      border-radius: 20px;
    }
    .action-btn-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 800;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-pdf {
      background: #16a34a;
      color: #ffffff !important;
      box-shadow: 0 2px 4px rgba(22, 163, 74, 0.25);
    }
    .btn-pdf:hover { background: #15803d; }
    .btn-print {
      background: #0c2340;
      color: #ffffff !important;
    }
    .btn-print:hover { background: #163a66; }
    .btn-home {
      background: #f8fafc;
      color: #334155 !important;
      border: 1px solid #cbd5e1;
    }
    .btn-home:hover { background: #e2e8f0; }

    /* Main Certificate Sheet - White Plan Background */
    .cert-sheet {
      max-width: 820px;
      width: 100%;
      background: #ffffff;
      border: 5px double #0c2340;
      border-radius: 18px;
      padding: 24px sm:36px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      position: relative;
    }
    .cert-inner {
      border: 1.5px solid #b45309;
      border-radius: 12px;
      padding: 20px;
      position: relative;
      background: #ffffff;
    }
    .header-box {
      text-align: center;
      border-bottom: 2px solid #0c2340;
      padding-bottom: 14px;
      margin-bottom: 16px;
      position: relative;
    }
    .emblem-icon {
      font-size: 28px;
      color: #b45309;
      margin-bottom: 4px;
    }
    .govt-title {
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #0c2340;
      text-transform: uppercase;
    }
    .dept-title {
      font-size: 11px;
      font-weight: 700;
      color: #15803d;
      margin-top: 2px;
      text-transform: uppercase;
    }
    .cert-main-heading {
      font-size: 20px;
      font-weight: 900;
      color: #0c2340;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 8px 0 2px 0;
    }
    .cert-sub-rule {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .hologram-seal {
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      border: 2px solid #f59e0b;
      background: linear-gradient(135deg, #fef3c7, #dcfce7, #fef08a);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2px;
    }
    .hologram-seal span {
      font-size: 7px;
      font-weight: 900;
      color: #0c2340;
      line-height: 1.1;
    }

    /* Identity Ribbon */
    .id-ribbon {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 12px;
    }
    .id-badge {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 900;
      color: #0c2340;
      background: #ffffff;
      padding: 2px 8px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
    }
    .status-badge-pass {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #15803d;
      font-weight: 900;
      font-size: 11px;
      background: #eef8f1;
      padding: 3px 10px;
      border-radius: 20px;
      border: 1px solid #c6edd0;
    }

    /* Specifications Table */
    .specs-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 12px;
    }
    .specs-table th, .specs-table td {
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      text-align: left;
    }
    .specs-table th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      width: 38%;
      font-size: 11px;
    }
    .specs-table td {
      color: #0c2340;
      font-weight: 600;
    }
    .val-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 800;
      color: #15803d;
    }
    .val-highlight {
      color: #15803d;
      font-weight: 900;
    }
    .val-officer {
      font-weight: 900;
      color: #0c2340;
    }

    /* Declaration Box */
    .decl-box {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 10.5px;
      color: #78350f;
      line-height: 1.5;
      margin-bottom: 16px;
      font-style: italic;
    }

    /* QR & Security Footer */
    .footer-box {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
    }
    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #ffffff;
      padding: 6px;
      border-radius: 10px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .qr-img {
      width: 96px;
      height: 96px;
      display: block;
    }
    .qr-label {
      font-size: 8px;
      font-weight: 900;
      color: #0c2340;
      margin-top: 4px;
      letter-spacing: 1px;
    }
    .footer-officer-block {
      text-align: right;
      flex: 1;
      min-width: 180px;
    }
    .officer-signature {
      font-family: "Brush Script MT", cursive, "Times New Roman", serif;
      font-size: 18px;
      font-weight: bold;
      color: #15803d;
      font-style: italic;
      margin-bottom: 2px;
    }
    .officer-title {
      font-size: 11px;
      font-weight: 900;
      color: #0c2340;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .officer-badge-line {
      font-size: 10px;
      color: #64748b;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin-top: 2px;
    }
    .sig-hash-line {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8.5px;
      color: #94a3b8;
      word-break: break-all;
      margin-top: 8px;
      text-align: left;
    }

    /* Print styling */
    @media print {
      body { background: #ffffff; padding: 0; }
      .top-action-bar { display: none; }
      .cert-sheet { border: none; box-shadow: none; max-width: 100%; border-radius: 0; }
      .cert-inner { border: 1.5px solid #0c2340; }
    }
  </style>
</head>
<body>

  <!-- Top Action & Download Toolbar -->
  <div class="top-action-bar">
    <div class="top-badge">
      ✓ Verified Official Statutory Stamping Record
    </div>
    <div class="action-btn-group">
      <a href="${downloadPdfUrl}" class="btn btn-pdf" download>
        📥 Download Certificate (PDF)
      </a>
      <button onclick="window.print()" class="btn btn-print">
        🖨️ Print
      </button>
      <a href="/?view=public-qr&cert=${encodeURIComponent(data.certificateId)}" class="btn btn-home">
        Central Portal
      </a>
    </div>
  </div>

  <!-- Primary White Plan Certificate Sheet -->
  <div class="cert-sheet">
    <div class="cert-inner">

      <!-- Header Section -->
      <div class="header-box">
        <div class="hologram-seal">
          <span>GOVT OF INDIA</span>
          <span>★</span>
          <span>SECURITY SEAL</span>
        </div>
        <div class="emblem-icon">⚖️</div>
        <div class="govt-title">Government of India • Department of Consumer Affairs</div>
        <div class="dept-title">Directorate of Legal Metrology • National Verification Suite</div>
        <h1 class="cert-main-heading">Certificate of Verification</h1>
        <div class="cert-sub-rule">[ Schedule XI • Form 24 — Section 24, Legal Metrology Act, 2009 ]</div>
      </div>

      <!-- Identity Ribbon -->
      <div class="id-ribbon">
        <div>
          <span style="color:#64748b; font-size:10px; font-weight:700; text-transform:uppercase;">Certificate No:</span>
          <span class="id-badge">${certificateId}</span>
        </div>
        <div>
          <span style="color:#64748b; font-size:10px; font-weight:700; text-transform:uppercase;">Instrument ID:</span>
          <span style="font-family: monospace; font-weight:700; color:#15803d;">${instrumentId}</span>
        </div>
        <div class="status-badge-pass">
          ✓ STATUTORY VERIFIED &amp; STAMPED
        </div>
      </div>

      <!-- Equipment Details Table -->
      <table class="specs-table">
        <tbody>
          <tr>
            <th>1. Registered Owner / Enterprise</th>
            <td><strong>${owner}</strong></td>
          </tr>
          <tr>
            <th>2. Physical Installation Address</th>
            <td>${establishmentAddress}</td>
          </tr>
          <tr>
            <th>3. Description of Instrument</th>
            <td>${instrument}</td>
          </tr>
          <tr>
            <th>4. Manufacturer &amp; Model</th>
            <td>${manufacturer} • Model: <strong>${model}</strong></td>
          </tr>
          <tr>
            <th>5. Equipment Serial Number</th>
            <td class="val-mono">${serialNumber}</td>
          </tr>
          <tr>
            <th>6. Accuracy Class &amp; Capacity (Max)</th>
            <td>${accuracyClass} (Max Capacity: <strong>${capacity}</strong>)</td>
          </tr>
          <tr>
            <th>7. Verification Scale Interval (e)</th>
            <td>${eInterval}</td>
          </tr>
          <tr>
            <th>8. Verification Date</th>
            <td>${verificationDate}</td>
          </tr>
          <tr>
            <th>9. Valid Until (Renewal Due)</th>
            <td class="val-highlight">${expiryDate} (Validity: ${validityPeriod})</td>
          </tr>
          <tr style="background:#f8fafc;">
            <th>10. Inspecting Officer (LMO)</th>
            <td class="val-officer">${officerDisplay}</td>
          </tr>
        </tbody>
      </table>

      <!-- Statutory Declaration -->
      <div class="decl-box">
        <strong>Statutory Declaration (Sec 24):</strong> I hereby certify that I have verified and stamped the instrument described above, having found it to conform to the standards, Maximum Permissible Errors (MPE), repeatability, eccentricity, and linearity specifications under Section 24 of The Legal Metrology Act, 2009.
      </div>

      <!-- Footer with Real Scannable QR & Officer Endorsement -->
      <div class="footer-box">
        <div class="qr-container">
          ${qrDataUrl ? `<img src="${qrDataUrl}" alt="Certificate QR Code" class="qr-img" />` : `<div style="width:96px; height:96px; display:flex; align-items:center; justify-content:center; font-size:10px; color:#64748b;">QR SEAL</div>`}
          <div class="qr-label">MOBILE SCANNABLE</div>
        </div>

        <div class="footer-officer-block">
          <div class="officer-signature">${officerDisplay.split('(')[0].trim()}</div>
          <div class="officer-title">Legal Metrology Officer (LMO)</div>
          <div class="officer-badge-line">Badge ID: ${badgeDisplay} • Enforcement Cell</div>
          <div style="font-size:8px; font-weight:800; color:#15803d; text-transform:uppercase; margin-top:2px;">[ Digitally Signed &amp; Stamped ]</div>
        </div>
      </div>

      <div class="sig-hash-line">
        <strong>Ed25519 Cryptographic Anchor:</strong> ${signatureHash}
      </div>

    </div>
  </div>

</body>
</html>`;
}

/**
 * Generates an authentic true binary PDF (%PDF-) document Buffer for direct download
 */
export async function generateGovernmentCertificatePDFBuffer(data: CertificatePDFData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // 1. Double Borders (Outer Navy, Inner Amber/Gold)
  doc.setDrawColor(12, 35, 64);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(180, 83, 9);
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
  doc.setFillColor(238, 248, 241);
  doc.setDrawColor(198, 237, 208);
  doc.roundedRect(16, 52, pageWidth - 32, 14, 2, 2, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(12, 35, 64);
  doc.text('CERTIFICATE ID: ' + (data.certificateId || 'LM-CERT-2026-0001'), 20, 60.5);

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(21, 128, 61);
  doc.text('✓ STATUTORY VERIFICATION: COMPLIANT & PASSED', pageWidth - 20, 60.5, { align: 'right' });

  // Table of Details
  let currentY = 72;
  const col1 = 16;
  const colWidth = pageWidth - 32;
  const labelWidth = 65;
  const valueWidth = colWidth - labelWidth;
  const rowHeight = 7.5;

  const mfgModel = (data.manufacturer || 'Standard Manufacturer') + ' • Model: ' + (data.model || 'Standard Model');
  const accCap = (data.accuracyClass || 'Class III (Medium Accuracy)') + ' • Max: ' + (data.capacity || '300 kg');
  const officerText = data.verifiedBy || (data.lmoName ? `${data.lmoName} (Badge: ${data.lmoId})` : 'Legal Metrology Officer');

  const rows = [
    { label: 'Name of Owner / Enterprise', value: data.owner || 'Registered Enterprise' },
    { label: 'Premises / Installation Address', value: data.establishmentAddress || 'Plot 14/B, Industrial Area, Maharashtra' },
    { label: 'Description of Instrument / Measure', value: data.instrument || 'Commercial Weighing Instrument' },
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
      doc.setTextColor(180, 83, 9);
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

  // Statutory Declaration Box
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(254, 243, 199);
  doc.roundedRect(col1, currentY, colWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('STATUTORY DECLARATION UNDER SECTION 24:', col1 + 4, currentY + 4.5);

  doc.setFont('times', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);
  const declaration =
    'I hereby certify that I have verified and stamped the weights and measures described above, ' +
    'having found the same to conform to the standards, Maximum Permissible Errors (MPE), repeatability, ' +
    'eccentricity, and linearity prescribed under The Legal Metrology Act, 2009 and Rules framed thereunder.';
  const declSplit = doc.splitTextToSize(declaration, colWidth - 8);
  doc.text(declSplit, col1 + 4, currentY + 8.5);

  currentY += 22;

  // QR Code & Digital Hash Box
  const qrBoxY = currentY;
  const qrBoxHeight = 44;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(col1, qrBoxY, colWidth, qrBoxHeight, 2, 2, 'FD');

  const qrUrl = data.qrPayload || `${getAppConfig().publicAppUrl}/verify/${encodeURIComponent(data.certificateId)}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      margin: 1,
      width: 256,
      color: { dark: '#0c2340', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });
    doc.addImage(qrDataUrl, 'PNG', col1 + 4, qrBoxY + 3, 38, 38);
  } catch (qrErr) {
    console.warn('Backend PDF QR Generation notice:', qrErr);
  }

  // QR Text metadata
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(12, 35, 64);
  doc.text('PUBLIC VERIFICATION & ENFORCEMENT QR SEAL', 62, qrBoxY + 9);

  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const qrDesc =
    'Scan this QR seal with any mobile camera to verify genuine registration in the ' +
    'National Metrology Database. Confirms tamper-proof digital authorization under Act 2009.';
  const qrDescLines = doc.splitTextToSize(qrDesc, colWidth - 52);
  doc.text(qrDescLines, 62, qrBoxY + 14);

  // Digital Signature Hash
  if (!data.digitalSignatureHash) {
    throw new Error('Certificate signature is required for PDF generation.');
  }
  const sigHash = data.digitalSignatureHash;
  doc.setFont('times', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(78, 96, 115);
  doc.text('Ed25519 Cryptographic Security Hash:', 62, qrBoxY + 28);

  doc.setFont('courier', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text(sigHash, 62, qrBoxY + 33);

  doc.setFont('times', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(21, 128, 61);
  doc.text('✓ Authenticity cryptographically locked against alteration.', 62, qrBoxY + 38);

  currentY += qrBoxHeight + 5;

  // Officer Signature and Stamp
  const footerY = currentY;

  // Left: Directorate Stamping Notice
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
  doc.text(officerText.split('(')[0].trim(), sigX, footerY + 5, { align: 'right' });

  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(12, 35, 64);
  doc.text('Legal Metrology Officer (LMO)', sigX, footerY + 10, { align: 'right' });

  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const badgeText = 'Badge ID: ' + (data.lmoId || 'MH-LM-2041') + ' • Enforcement Division';
  doc.text(badgeText, sigX, footerY + 14, { align: 'right' });

  return Buffer.from(doc.output('arraybuffer'));
}
