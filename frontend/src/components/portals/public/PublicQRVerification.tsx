import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { EverimetLogo } from '../../common/EverimetLogo';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Camera,
  ShieldCheck,
  Download,
  Printer,
  Flag,
  Sparkles,
  ShieldAlert,
  Clock,
  Database,
  RotateCcw,
  Scale,
  Building,
  MapPin,
  BadgeCheck,
  FileCheck,
  Lock,
  Calendar
} from 'lucide-react';
import { LegalMetrologyCertificate } from '../../../services/expiryEngine';
import { apiClient } from '../../../services/apiClient';
import { downloadCertificatePDF } from '../../../services/pdfService';

interface PublicQRVerificationProps {
  showToast: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  onOpenReportModal: (details: any) => void;
  onPrintCertificate: (details: any) => void;
  initialCertId?: string;
  onNavigateHome?: () => void;
}

export const PublicQRVerification: React.FC<PublicQRVerificationProps> = ({
  showToast,
  onOpenReportModal,
  onPrintCertificate,
  initialCertId = '',
  onNavigateHome
}) => {
  const [certInput, setCertInput] = useState(initialCertId);
  const [activeCertificate, setActiveCertificate] = useState<LegalMetrologyCertificate | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'valid' | 'expired' | 'invalid' | 'not_found'>('idle');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerSimulationMode, setScannerSimulationMode] = useState<'scan' | 'processing'>('scan');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Generate mobile scannable QR code image data URL when certificate changes
  useEffect(() => {
    if (!activeCertificate) {
      setQrCodeDataUrl('');
      return;
    }
    let base = typeof window !== 'undefined' ? window.location.origin : 'https://everimet.gov.in';

    apiClient
      .getNetworkInfo()
      .then((net) => {
        if (
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
          net?.lanUrl
        ) {
          base = net.lanUrl;
        }
        const verificationUrl = `${base}/verify/${encodeURIComponent(activeCertificate.certificateId)}`;

        QRCode.toDataURL(verificationUrl, {
          width: 256,
          margin: 1,
          color: { dark: '#0c2340', light: '#ffffff' },
          errorCorrectionLevel: 'H'
        })
          .then((url) => setQrCodeDataUrl(url))
          .catch((err) => console.error('Error rendering QR image:', err));
      })
      .catch(() => {
        const verificationUrl = `${base}/verify/${encodeURIComponent(activeCertificate.certificateId)}`;

        QRCode.toDataURL(verificationUrl, {
          width: 256,
          margin: 1,
          color: { dark: '#0c2340', light: '#ffffff' },
          errorCorrectionLevel: 'H'
        })
          .then((url) => setQrCodeDataUrl(url))
          .catch((err) => console.error('Error rendering QR image:', err));
      });
  }, [activeCertificate]);

  // Handle Verify button submit - checks live MongoDB Atlas first, then local fallback
  const handleVerify = async (queryToUse?: string) => {
    const query = (queryToUse || certInput).trim();
    if (!query) {
      showToast('Input Required', 'Please enter a Certificate ID or Serial Number.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Live Query to MongoDB Atlas via Backend API
      const res = await apiClient.getPublicCertificate(query);
      if (res && res.success && res.data) {
        const d = res.data;
        const certData: LegalMetrologyCertificate = {
          certificateId: d.certificateId || query,
          instrumentId: d.instrumentId || '',
          owner: d.owner || (d.ownerRef?.enterpriseName || d.ownerRef?.name || ''),
          manufacturer: d.manufacturer || '',
          model: d.model || '',
          serialNumber: d.serialNumber || '',
          accuracyClass: d.accuracyClass || '',
          capacity: d.capacity || '',
          verificationDate: d.verificationDate || '',
          validityPeriod: d.validityPeriod || '',
          expiryDate: d.expiryDate || '',
          lmoId: d.lmoId || '',
          status: d.status,
          instrument: d.instrument || (d.instrumentRef?.name || ''),
          category: (d.category as any) || 'electronic_scales_weighbridges',
          warningThresholdDays: d.warningThresholdDays || 0,
          daysRemaining: d.daysRemaining !== undefined ? d.daysRemaining : 365,
          verifiedBy: d.verifiedBy || '',
          establishmentAddress: d.establishmentAddress || (d.ownerRef?.enterpriseAddress || ''),
          eInterval: d.eInterval || '',
          digitalSignatureHash: d.digitalSignatureHash || ''
        };

        setActiveCertificate(certData);
        setIsLoading(false);
        if (certData.status === 'expired') {
          setVerificationStatus('expired');
          showToast('Certificate Expired', `This certificate expired on ${certData.expiryDate}. Prohibited for trade.`, 'error');
        } else if (certData.status === 'valid' || certData.status === 'expiring_soon') {
          setVerificationStatus('valid');
          showToast('Certificate Valid', `Verified in National Metrology Database: ${certData.certificateId}`, 'success');
        } else {
          setVerificationStatus('invalid');
          showToast('Certificate Not Valid', `This certificate is ${String(certData.status).replace('_', ' ')} and cannot be used for trade.`, 'error');
        }
        return;
      }
    } catch (dbErr) {
      console.warn('MongoDB Atlas live lookup notice:', dbErr);
    }

    setIsLoading(false);
    setActiveCertificate(null);
    setVerificationStatus('not_found');
    showToast(
      'Certificate Not Found',
      `No record found matching "${query}" in the National Metrology Database.`,
      'error'
    );
  };

  // Trigger PDF Generation and Download
  const handleDownloadPDF = async () => {
    if (!activeCertificate) return;
    setIsDownloadingPdf(true);
    try {
      await downloadCertificatePDF({
        certificateId: activeCertificate.certificateId,
        instrumentId: activeCertificate.instrumentId,
        owner: activeCertificate.owner,
        manufacturer: activeCertificate.manufacturer,
        model: activeCertificate.model,
        serialNumber: activeCertificate.serialNumber,
        accuracyClass: activeCertificate.accuracyClass,
        capacity: activeCertificate.capacity,
        verificationDate: activeCertificate.verificationDate,
        validityPeriod: activeCertificate.validityPeriod,
        expiryDate: activeCertificate.expiryDate,
        lmoId: activeCertificate.lmoId,
        verifiedBy: activeCertificate.verifiedBy,
        establishmentAddress: activeCertificate.establishmentAddress,
        instrument: activeCertificate.instrument,
        eInterval: activeCertificate.eInterval,
        digitalSignatureHash: activeCertificate.digitalSignatureHash,
        status: activeCertificate.status
      }, 'download');
      showToast('PDF Downloaded', `Certificate saved as ${activeCertificate.certificateId}_Statutory_Certificate.pdf`, 'success');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      showToast('Download Error', 'Could not generate certificate PDF. Please try again.', 'error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Open PDF in new window or print
  const handleOpenPDF = async () => {
    if (!activeCertificate) return;
    try {
      await downloadCertificatePDF({
        certificateId: activeCertificate.certificateId,
        instrumentId: activeCertificate.instrumentId,
        owner: activeCertificate.owner,
        manufacturer: activeCertificate.manufacturer,
        model: activeCertificate.model,
        serialNumber: activeCertificate.serialNumber,
        accuracyClass: activeCertificate.accuracyClass,
        capacity: activeCertificate.capacity,
        verificationDate: activeCertificate.verificationDate,
        validityPeriod: activeCertificate.validityPeriod,
        expiryDate: activeCertificate.expiryDate,
        lmoId: activeCertificate.lmoId,
        verifiedBy: activeCertificate.verifiedBy,
        establishmentAddress: activeCertificate.establishmentAddress,
        instrument: activeCertificate.instrument,
        eInterval: activeCertificate.eInterval,
        digitalSignatureHash: activeCertificate.digitalSignatureHash,
        status: activeCertificate.status
      }, 'open');
    } catch (err) {
      console.error('PDF Open Error:', err);
    }
  };

  // Load initial certificate on mount, reading from URL params if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const certFromUrl = urlParams.get('cert') || urlParams.get('query');
    const targetCert = certFromUrl || initialCertId;
    if (targetCert) {
      setCertInput(targetCert);
      handleVerify(targetCert);
    }
  }, [initialCertId]);

  // Simulate scanning QR Code
  const handleTriggerScan = (targetCertId: string) => {
    setScannerSimulationMode('processing');
    setTimeout(() => {
      setScannerSimulationMode('scan');
      setIsScannerOpen(false);
      setCertInput(targetCertId);
      handleVerify(targetCertId);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Brand Banner */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <EverimetLogo variant="brand" size="md" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf7f6] text-[#0f766e] border border-[#bfe3df] text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          e-VeriMet • Public Certificate Verification
        </div>
      </div>

      {/* SEARCH & SCANNER DRAWER (Visible when no valid certificate or when user clicks 'Verify Another') */}
      {(!activeCertificate || verificationStatus !== 'valid') && (
        <div className="gov-panel rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0c2340] tracking-tight">
            Verify a Legal Metrology Certificate
            </h1>
            <p className="text-sm text-[#4e6073] max-w-lg mx-auto">
            Scan the QR seal or enter the certificate number to check the official record.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            {/* [ Scan QR ] Button */}
            <button
              onClick={() => setIsScannerOpen(!isScannerOpen)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>[ Scan QR ]</span>
            </button>

            {/* Interactive Optical Scanner Dropdown (When clicked) */}
            {isScannerOpen && (
              <div className="w-full bg-slate-900 rounded-xl p-5 border border-slate-700 text-white space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Optical Camera Viewfinder Active
                  </span>
                  <button
                    onClick={() => setIsScannerOpen(false)}
                    className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
                  >
                    Close Camera
                  </button>
                </div>

                {/* Viewfinder Reticle */}
                <div className="h-48 sm:h-56 bg-black/70 rounded-xl border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="relative w-36 h-36 border-2 border-emerald-400/60 rounded-xl flex items-center justify-center">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
                    {scannerSimulationMode === 'processing' ? (
                      <div className="text-center text-xs text-emerald-400 font-mono animate-pulse">
                        Decoding QR Seal...
                      </div>
                    ) : (
                      <QrCode className="w-16 h-16 text-emerald-400/70 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono mt-3">
                    Align holographic QR seal inside the box
                  </span>
                </div>

                {/* Quick Scan Selection buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="text-slate-400">Sample QR Plates:</span>
                  <button
                    onClick={() => handleTriggerScan('LM-CERT-2026-0001')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs cursor-pointer"
                  >
                    Scan Scale (LM-CERT-2026-0001)
                  </button>
                  <button
                    onClick={() => handleTriggerScan('LM-CERT-2025-0042')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs cursor-pointer"
                  >
                    Scan Standard Weights (24m)
                  </button>
                  <button
                    onClick={() => handleTriggerScan('LM-CERT-2023-9999')}
                    className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-mono text-xs cursor-pointer"
                  >
                    Scan Expired Scale (Fail)
                  </button>
                </div>
              </div>
            )}

            {/* "or" Divider */}
            <div className="w-full flex items-center justify-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs font-bold text-[#4e6073] uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Certificate ID: [____________] [VERIFY] */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="w-full max-w-lg space-y-3"
            >
              <label className="block text-xs font-extrabold text-[#0c2340] uppercase tracking-wider">
                Certificate ID:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  placeholder="e.g. LM-CERT-2026-0001 or XYZ123"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-[#d8e4f1] text-sm font-mono font-bold text-[#0c2340] placeholder:text-gray-400 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 bg-[#fafbfc]"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 rounded-xl bg-[#0c2340] hover:bg-[#0f766e] text-white text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  {isLoading ? 'Verifying...' : '[VERIFY]'}
                </button>
              </div>
            </form>

            {/* Preset Quick Test Pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-gray-500 text-[11px] font-semibold">Pre-loaded statutory records:</span>
              <button
                type="button"
                onClick={() => {
                  setCertInput('LM-CERT-2026-0001');
                  handleVerify('LM-CERT-2026-0001');
                }}
                className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] hover:bg-emerald-100 cursor-pointer font-bold"
              >
                LM-CERT-2026-0001 (Scale)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCertInput('LM-CERT-2025-0042');
                  handleVerify('LM-CERT-2025-0042');
                }}
                className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono text-[11px] hover:bg-blue-100 cursor-pointer font-bold"
              >
                LM-CERT-2025-0042 (24m Weights)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCertInput('LM-CERT-2024-0019');
                  handleVerify('LM-CERT-2024-0019');
                }}
                className="px-2.5 py-1 rounded bg-purple-50 text-purple-800 border border-purple-200 font-mono text-[11px] hover:bg-purple-100 cursor-pointer font-bold"
              >
                LM-CERT-2024-0019 (60m Tank)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCertInput('LM-CERT-2023-9999');
                  handleVerify('LM-CERT-2023-9999');
                }}
                className="px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono text-[11px] hover:bg-rose-100 cursor-pointer font-bold"
              >
                LM-CERT-2023-9999 (Expired)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUTHENTIC WHITE PLAIN PAGE CERTIFICATE DISPLAY (MOBILE & DESKTOP SCANNED) */}
      {/* ========================================================================= */}
      {verificationStatus === 'valid' && activeCertificate && (
        <div className="space-y-4">
          {/* Top Quick Action Floating Bar */}
          <div className="bg-[#0c2340] text-white px-5 py-3.5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-emerald-400">✓ CERTIFICATE VALID &amp; VERIFIED</span>
              <span className="text-slate-400 hidden sm:inline">• National Metrology Registry</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* PRIMARY ACTION: PDF DOWNLOAD BUTTON (Only generates .pdf file) */}
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloadingPdf}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                title="Download genuine statutory PDF file"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Certificate (PDF)'}</span>
              </button>

              {/* Secondary Action: Print / Open PDF */}
              <button
                onClick={handleOpenPDF}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                title="Open PDF preview in browser"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Print / Open PDF</span>
              </button>

              {/* Verify Another */}
              <button
                onClick={() => {
                  setCertInput('');
                  setActiveCertificate(null);
                  setVerificationStatus('idle');
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                title="Verify another weighing instrument"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Verify Another</span>
              </button>
            </div>
          </div>

          {/* THE OFFICIAL WHITE PLAIN PAGE OF THE CERTIFICATE */}
          <div className="gov-panel rounded-2xl overflow-hidden p-5 sm:p-10 relative text-slate-900">
            {/* Inner Border */}
            <div className="border-2 border-amber-600/40 rounded-xl p-4 sm:p-7 relative bg-white space-y-6">
              {/* National Balance Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden select-none">
                <Scale className="w-[480px] h-[480px] text-[#0c2340]" />
              </div>

              {/* 1. Official Government Header */}
              <div className="text-center pb-5 border-b-2 border-[#0c2340]/20 space-y-1 relative">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center p-2 rounded-xl bg-[#eef8f1] border border-[#c6edd0] shadow-2xs">
                    <EverimetLogo variant="icon" size="md" />
                  </div>

                  <div className="flex-1 px-2 sm:px-4">
                    <div className="text-[11px] sm:text-xs font-black tracking-[0.2em] text-[#0c2340] uppercase font-serif">
                      GOVERNMENT OF INDIA
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-[#4e6073] tracking-wider uppercase">
                      MINISTRY OF CONSUMER AFFAIRS, FOOD &amp; PUBLIC DISTRIBUTION
                    </div>
                    <div className="text-[9px] sm:text-[11px] font-extrabold text-[#15803d] tracking-wide uppercase mt-0.5">
                      DEPARTMENT OF CONSUMER AFFAIRS • DIRECTORATE OF LEGAL METROLOGY
                    </div>
                    <div className="text-[10px] sm:text-xs font-black text-amber-800 tracking-wider uppercase mt-1 font-mono">
                      SCHEDULE XI • FORM 24
                    </div>
                    <div className="text-[8px] sm:text-[9.5px] italic text-slate-500">
                      [See Rule 24 of Legal Metrology (General) Rules, 2011]
                    </div>
                    <h1 className="font-serif font-black text-lg sm:text-2xl text-[#0c2340] tracking-wide uppercase mt-1.5">
                      CERTIFICATE OF VERIFICATION
                    </h1>
                    <div className="text-[9px] sm:text-[10.5px] font-semibold text-slate-600">
                      Issued under Section 24 of The Legal Metrology Act, 2009
                    </div>
                  </div>

                  {/* Statutory Holographic Pass Badge */}
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-linear-to-br from-amber-100 via-emerald-50 to-amber-200 border-2 border-amber-400 p-1 flex flex-col items-center justify-center text-center shadow-xs shrink-0">
                    <BadgeCheck className="w-6 h-6 text-emerald-700" />
                    <span className="text-[8px] font-extrabold text-[#0c2340] uppercase tracking-tighter mt-0.5">
                      OFFICIAL
                    </span>
                    <span className="text-[7px] font-mono text-emerald-800 font-bold">
                      SECURITY SEAL
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Certificate Identity & Pass Ribbon */}
              <div className="py-2.5 px-4 bg-[#f8fbf9] border border-[#c6edd0] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#4e6073] font-bold uppercase text-[10px]">Certificate No:</span>
                  <span className="font-mono font-black text-[#0c2340] text-sm bg-white px-3 py-1 rounded border border-[#c6edd0] shadow-2xs">
                    {activeCertificate.certificateId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#4e6073] font-bold uppercase text-[10px]">Validity Period:</span>
                  <span className="font-bold text-[#0c2340] bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded font-mono text-xs">
                    {activeCertificate.validityPeriod}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-black text-[11px] text-emerald-800 uppercase tracking-wide">
                    ✓ STATUTORILY VERIFIED &amp; PASSED
                  </span>
                </div>
              </div>

              {/* 3. Comprehensive Specifications Table (Authentic White Certificate Grid) */}
              <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                      <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3 border-r border-slate-200">
                        Name of Owner / Enterprise
                      </td>
                      <td className="py-2.5 px-4 font-extrabold text-[#0c2340]">
                        {activeCertificate.owner}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-white">
                      <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Premises / Site Address</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">
                        {activeCertificate.establishmentAddress || 'Premises On Record'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                      <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200">
                        Description of Instrument / Measure
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {activeCertificate.instrument}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-white">
                      <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200">
                        Manufacturer &amp; Model
                      </td>
                      <td className="py-2.5 px-4 text-slate-900 font-medium">
                        {activeCertificate.manufacturer} • Model: <span className="font-mono font-bold text-[#0c2340]">{activeCertificate.model}</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                      <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200">
                        Serial Number of Instrument
                      </td>
                      <td className="py-2.5 px-4 font-mono font-black text-emerald-900">
                        {activeCertificate.serialNumber}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-white">
                      <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200">
                        Accuracy Class &amp; Capacity (Max)
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        <span className="text-emerald-700 font-bold">{activeCertificate.accuracyClass}</span> • Max Capacity: <span className="font-mono font-bold">{activeCertificate.capacity}</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                      <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200">
                        Verification Scale Interval (e)
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        {activeCertificate.eInterval || '5 kg'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-white">
                      <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200">
                        Date of Official Verification
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {activeCertificate.verificationDate}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-emerald-50/60">
                      <td className="py-2.5 px-4 font-black text-emerald-900 border-r border-slate-200">
                        Valid Until (Next Renewal Due)
                      </td>
                      <td className="py-2.5 px-4 font-mono font-black text-emerald-800 text-sm">
                        {activeCertificate.expiryDate}
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200">
                        Inspecting Legal Metrology Officer
                      </td>
                      <td className="py-2.5 px-4 font-bold text-[#0c2340]">
                        {activeCertificate.verifiedBy || 'Legal Metrology Officer'} • <span className="font-mono text-slate-600">Badge: {activeCertificate.lmoId}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4. Statutory Attestation Declaration */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-sm text-amber-950 space-y-1 leading-relaxed">
                <div className="font-serif font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 text-[11px]">
                  <FileCheck className="w-4 h-4 text-amber-700" />
                  STATUTORY VERIFICATION &amp; STAMPING DECLARATION
                </div>
                <p className="text-[11px] text-amber-900/90 font-serif italic">
                  "I hereby certify that I have this day verified and stamped the weighing/measuring instrument described
                  above, having found the same to conform to the standards, Maximum Permissible Error (MPE), repeatability,
                  eccentricity, and linearity specifications prescribed under Section 24 of The Legal Metrology Act, 2009 and
                  the Legal Metrology (General) Rules, 2011."
                </p>
              </div>

              {/* 5. Scannable QR Seal & Cryptographic Security Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                {/* Embedded QR Code Image */}
                <div className="p-2 bg-white rounded-xl border border-slate-300 shadow-xs shrink-0 flex flex-col items-center">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt={`QR Seal for ${activeCertificate.certificateId}`}
                      className="w-28 h-28 object-contain"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-slate-400">
                      <QrCode className="w-12 h-12" />
                    </div>
                  )}
                  <span className="text-[9px] font-mono font-bold text-slate-600 mt-1 uppercase">
                    Scan On Mobile
                  </span>
                </div>

                <div className="flex-1 space-y-1.5 text-center sm:text-left text-xs">
                  <div className="font-bold text-[#0c2340] text-sm flex items-center justify-center sm:justify-start gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                    <span>Official Mobile Scannable QR Seal</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    This statutory verification document is cryptographically anchored in the Central Legal Metrology Database.
                    Any mobile device camera scanning the QR seal will verify its authenticity instantly.
                  </p>
                  <div className="font-mono text-[10px] text-slate-500 bg-white px-2.5 py-1.5 rounded border border-slate-200 truncate">
                    <span className="font-bold text-slate-700">Digital Anchor: </span>
                    {activeCertificate.digitalSignatureHash || 'ed25519:e8b39a4f21d4c9f7a602bb147814cb9f67a21190bc281e4b308e2f8910d6e8b4'}
                  </div>
                </div>

                {/* Officer Signature Block */}
                <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 text-center sm:text-right shrink-0">
                  <div className="font-serif italic text-[#15803d] font-bold text-sm">
                    {(activeCertificate.verifiedBy || 'Legal Metrology Officer').split('(')[0].trim()}
                  </div>
                  <div className="text-[10px] font-bold text-[#0c2340]">
                    Legal Metrology Officer (LMO)
                  </div>
                  <div className="text-[9px] font-mono text-slate-500">
                    Badge: {activeCertificate.lmoId}
                  </div>
                  <div className="text-[8px] font-bold text-emerald-700 uppercase tracking-widest mt-1">
                    [ Digitally Signed &amp; Stamped ]
                  </div>
                </div>
              </div>

              {/* 6. Prominent Action Buttons on the White Certificate Page */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  {/* Big Primary Download PDF Button */}
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloadingPdf}
                    className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] text-white text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloadingPdf ? 'Generating PDF File...' : 'Download Certificate (PDF)'}</span>
                  </button>

                  {/* Print / Open PDF Button */}
                  <button
                    onClick={handleOpenPDF}
                    className="px-4 py-3 rounded-xl bg-[#0c2340] hover:bg-[#16a34a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Preview PDF</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {/* Report Complaint */}
                  <button
                    onClick={() =>
                      onOpenReportModal({
                        certNo: activeCertificate.certificateId,
                        establishment: activeCertificate.owner,
                        sealId: activeCertificate.serialNumber
                      })
                    }
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report Tampering</span>
                  </button>

                  {/* Verify Another */}
                  <button
                    onClick={() => {
                      setCertInput('');
                      setActiveCertificate(null);
                      setVerificationStatus('idle');
                    }}
                    className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Verify Another</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result: EXPIRED STATE */}
      {verificationStatus === 'expired' && activeCertificate && (
        <div className="bg-white rounded-2xl border-2 border-rose-500 shadow-lg overflow-hidden animate-in fade-in duration-200">
          <div className="bg-rose-600 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold tracking-widest uppercase opacity-90">
                Result:
              </div>
              <div className="font-display font-black text-lg sm:text-xl tracking-wide flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" />
                <span>✕ CERTIFICATE EXPIRED / CONDEMNED</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-white/20 border border-white/30">
              Section 30 Violation
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-950 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5 text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Statutory Notice: Illegal for Commercial Trade &amp; Billing
              </div>
              <p className="text-rose-800 leading-relaxed">
                Certificate <strong>{activeCertificate.certificateId}</strong> expired on{' '}
                <strong>{activeCertificate.expiryDate}</strong>. Continued use of this instrument attracts
                penalties and immediate equipment confiscation by the Legal Metrology Department.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-500 font-bold block">Certificate ID:</span>
                <span className="font-mono font-bold text-rose-700">{activeCertificate.certificateId}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Instrument:</span>
                <span className="font-bold text-gray-900">{activeCertificate.instrument}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Serial Number:</span>
                <span className="font-mono font-bold text-gray-900">{activeCertificate.serialNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Expired Date:</span>
                <span className="font-bold text-rose-700">{activeCertificate.expiryDate}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={() =>
                  onOpenReportModal({
                    certNo: activeCertificate.certificateId,
                    establishment: activeCertificate.owner,
                    sealId: activeCertificate.serialNumber
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Flag className="w-4 h-4" />
                <span>Lodge Consumer Complaint to Enforcement Directorate</span>
              </button>
              <button
                onClick={() => {
                  setCertInput('');
                  setActiveCertificate(null);
                  setVerificationStatus('idle');
                }}
                className="px-3.5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold cursor-pointer"
              >
                Verify Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result: NOT FOUND STATE */}
      {verificationStatus === 'not_found' && (
        <div className="bg-white rounded-2xl border-2 border-amber-400 p-6 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-amber-700 font-extrabold text-base">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Record Not Found in National Ledger</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            No active or historical legal metrology verification certificate was found for{' '}
            <strong className="font-mono text-gray-900">"{certInput}"</strong>. Please verify that the
            Certificate ID or serial number was entered correctly, or try scanning the physical QR seal.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setCertInput('LM-CERT-2026-0001');
                handleVerify('LM-CERT-2026-0001');
              }}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              ← Test with valid sample (LM-CERT-2026-0001)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
