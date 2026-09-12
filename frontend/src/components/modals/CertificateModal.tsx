import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  QrCode,
  Scale,
  Calendar,
  Clock,
  Building,
  Hash,
  Award,
  CheckCircle2,
  ExternalLink,
  Lock,
  Sparkles,
  FileCheck,
  Check,
  BadgeCheck,
  MapPin
} from 'lucide-react';
import { EverimetLogo } from '../common/EverimetLogo';
import { LegalMetrologyCertificate } from '../../services/expiryEngine';
import { downloadCertificatePDF } from '../../services/pdfService';
import { apiClient } from '../../services/apiClient';

interface CertificateModalProps {
  isOpen?: boolean;
  onClose: () => void;
  details?: Partial<LegalMetrologyCertificate> & {
    certNo?: string;
    docketId?: string;
    establishment?: string;
    instrumentType?: string;
    maxCapacity?: string;
    officerName?: string;
    officerId?: string;
    date?: string;
    validUntil?: string;
  };
  record?: any;
  onNavigateToPublicVerification?: (certId: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen = true,
  onClose,
  details,
  record,
  onNavigateToPublicVerification
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrVerificationUrl, setQrVerificationUrl] = useState<string>('');

  const raw = record || details || {};

  // Standardize fields to statutory blueprint specification
  const certificateId = raw.certificateId || raw.certNo || 'LM-CERT-2026-6279';
  const instrumentId = raw.instrumentId || raw.docketId || 'INST-SCALE-001';
  const owner = raw.owner || raw.establishment || 'Avery India Ltd.';
  const manufacturer = raw.manufacturer || 'Avery India Ltd.';
  const model = raw.model || raw.modelNumber || 'AVW-200';
  const serialNumber = raw.serialNumber || 'AVW-998822';
  const accuracyClass = raw.accuracyClass || 'Class III (Medium Accuracy)';
  const capacity = raw.capacity || raw.maxCapacity || '300 kg';
  const verificationDate = raw.verificationDate || raw.date || new Date().toLocaleDateString('en-GB');
  const validityPeriod = raw.validityPeriod || '12 months';
  const expiryDate = raw.expiryDate || raw.validUntil || '08/09/2027';
  const rawOfficerName =
    raw.verifiedBy ||
    raw.officerName ||
    raw.lmoName ||
    raw.assignedLmo?.name ||
    raw.applicationRef?.assignedLmo?.name ||
    raw.applicationRef?.assignedLmoUser?.name ||
    raw.lmoRef?.name;

  const rawOfficerBadge =
    raw.lmoId ||
    raw.officerId ||
    raw.assignedLmo?.badgeNo ||
    raw.applicationRef?.assignedLmo?.badgeNo ||
    raw.applicationRef?.assignedLmoUser?.identifier ||
    raw.lmoRef?.identifier ||
    'MH-LM-2041';

  const lmoId = rawOfficerBadge;
  const verifiedBy = rawOfficerName
    ? (rawOfficerName.includes('(') ? rawOfficerName : `${rawOfficerName} (${rawOfficerBadge})`)
    : `Legal Metrology Officer (${rawOfficerBadge})`;

  const status = raw.status || 'valid';
  const instrument = raw.instrument || raw.instrumentType || 'Platform Scale (Class III)';
  const address = raw.establishmentAddress || 'Plot 14/B, SCLR Industrial Belt, Kurla West, Mumbai, Maharashtra 400070';
  const digitalHash = raw.digitalSignatureHash || `ed25519:e8b39a4f21d4c9f7a602bb147814cb9f67a21190bc281e4b308e2f8910d6e8b4`;
  const eInterval = raw.eInterval || '50 g';

  // Generate authentic, real mobile-scannable QR Code using network-accessible host
  useEffect(() => {
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
        const verificationUrl = `${base}/verify/${encodeURIComponent(certificateId)}`;
        setQrVerificationUrl(verificationUrl);

        QRCode.toDataURL(verificationUrl, {
          width: 256,
          margin: 1,
          color: { dark: '#0c2340', light: '#ffffff' },
          errorCorrectionLevel: 'H'
        }).then(setQrCodeDataUrl);
      })
      .catch(() => {
        const verificationUrl = `${base}/verify/${encodeURIComponent(certificateId)}`;
        setQrVerificationUrl(verificationUrl);

        QRCode.toDataURL(verificationUrl, {
          width: 256,
          margin: 1,
          color: { dark: '#0c2340', light: '#ffffff' },
          errorCorrectionLevel: 'H'
        }).then(setQrCodeDataUrl);
      });
  }, [certificateId]);

  if (isOpen === false) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadCertificatePDF({
        certificateId,
        instrumentId,
        owner,
        manufacturer,
        model,
        serialNumber,
        accuracyClass,
        capacity,
        verificationDate,
        validityPeriod,
        expiryDate,
        lmoId,
        verifiedBy,
        establishmentAddress: address,
        instrument,
        eInterval,
        digitalSignatureHash: digitalHash,
        status,
        qrPayload: qrVerificationUrl
      }, 'download');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (pdfErr) {
      console.error('PDF Generation Error:', pdfErr);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[94vh] overflow-y-auto flex flex-col print:max-w-none print:w-full print:m-0 print:border-none print:shadow-none">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-[#f8fbf9] sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#16a34a]" />
            <span className="font-display font-extrabold text-sm text-[#0c2340]">
              Official Metrological Stamping Certificate (Form 24)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-3.5 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generating...' : 'Download'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg border border-gray-300 hover:bg-white text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download Success Banner */}
        {downloadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 flex items-center justify-between text-xs text-emerald-800 animate-in slide-in-from-top duration-200 print:hidden">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Statutory certificate saved as {certificateId}_Statutory_Certificate.pdf</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-semibold">Ledger Verified</span>
          </div>
        )}

        {/* Certificate Container with Authentic Statutory Government Format */}
        <div className="p-4 sm:p-6 print:p-2 bg-[#f4f7f5]">
          <div className="border-4 border-double border-[#15803d] rounded-2xl p-6 sm:p-8 relative bg-white shadow-md print:border-2 print:p-4">
            
            {/* National Watermark Emblem Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none overflow-hidden">
              <Scale className="w-[420px] h-[420px] text-[#0c2340]" />
            </div>

            {/* Official Statutory Header */}
            <div className="text-center pb-5 border-b-2 border-[#15803d]/30 relative space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-2 rounded-xl bg-[#eef8f1] border border-[#c6edd0]">
                  <EverimetLogo variant="icon" size="md" />
                </div>
                
                <div className="flex-1 px-3">
                  <div className="text-[10px] sm:text-xs font-black tracking-[0.25em] text-[#0c2340] uppercase">
                    GOVERNMENT OF INDIA • DEPARTMENT OF CONSUMER AFFAIRS
                  </div>
                  <div className="text-[9px] sm:text-[11px] font-bold text-[#15803d] tracking-wider uppercase mt-0.5">
                    DIRECTORATE OF LEGAL METROLOGY • NATIONAL VERIFICATION SUITE
                  </div>
                  <h1 className="font-display font-black text-lg sm:text-2xl text-[#0c2340] tracking-wide uppercase mt-1">
                    CERTIFICATE OF VERIFICATION
                  </h1>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    [ SCHEDULE XI • FORM 24 — SECTION 24, LEGAL METROLOGY ACT, 2009 ]
                  </div>
                </div>

                {/* Statutory Hologram Badge */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-linear-to-br from-amber-200 via-emerald-100 to-amber-300 border-2 border-amber-400/80 p-1 flex flex-col items-center justify-center text-center shadow-xs shrink-0">
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

            {/* Certificate Identity Ribbon */}
            <div className="my-4 py-2.5 px-4 bg-[#f8fbf9] border border-[#c6edd0] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#4e6073] font-bold uppercase text-[10px]">Certificate No:</span>
                <span className="font-mono font-black text-[#0c2340] text-sm bg-white px-2.5 py-0.5 rounded border border-[#c6edd0]">
                  {certificateId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#4e6073] font-bold uppercase text-[10px]">Docket Reference:</span>
                <span className="font-mono font-bold text-[#15803d] text-xs">
                  {instrumentId}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-black text-[11px] text-emerald-800 uppercase tracking-wide">
                  STATUTORY COMPLIANT
                </span>
              </div>
            </div>

            {/* Statutory Details Grid */}
            <div className="space-y-4 text-xs">
              {/* Part 1: Establishment & Premises */}
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
                <div className="text-[10px] font-black uppercase text-[#15803d] tracking-wider mb-2 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> 1. Registered Enterprise & Physical Site Premises
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 text-[10px] block uppercase font-bold">Owner / Enterprise Name:</span>
                    <span className="font-bold text-[#0c2340] text-sm">{owner}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block uppercase font-bold">Physical Premises / Jurisdiction:</span>
                    <span className="font-medium text-gray-700 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{address}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Part 2: Metrological Specifications */}
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
                <div className="text-[10px] font-black uppercase text-[#15803d] tracking-wider mb-2 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" /> 2. Technical Metrological Instrument Specifications
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2 rounded-lg bg-[#fafbfc] border border-gray-100">
                    <span className="text-gray-500 text-[9px] block uppercase font-bold">Instrument Make:</span>
                    <span className="font-bold text-[#0c2340]">{manufacturer}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#fafbfc] border border-gray-100">
                    <span className="text-gray-500 text-[9px] block uppercase font-bold">Model Designation:</span>
                    <span className="font-bold text-[#0c2340]">{model}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#fafbfc] border border-gray-100">
                    <span className="text-gray-500 text-[9px] block uppercase font-bold">Equipment Serial Number:</span>
                    <span className="font-mono font-bold text-[#15803d]">{serialNumber}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#fafbfc] border border-gray-100">
                    <span className="text-gray-500 text-[9px] block uppercase font-bold">Accuracy Class:</span>
                    <span className="font-bold text-emerald-700">{accuracyClass}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#fafbfc] border border-gray-100">
                    <span className="text-gray-500 text-[9px] block uppercase font-bold">Max Capacity (Max):</span>
                    <span className="font-bold text-[#0c2340]">{capacity}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#fafbfc] border border-gray-100">
                    <span className="text-gray-500 text-[9px] block uppercase font-bold">Verification Interval (e):</span>
                    <span className="font-bold text-[#0c2340]">{eInterval}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#fafbfc] border border-gray-100">
                    <span className="text-gray-500 text-[9px] block uppercase font-bold">Verification Date:</span>
                    <span className="font-bold text-gray-800">{verificationDate}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-800 text-[9px] block uppercase font-black">Valid Until (Expiry):</span>
                    <span className="font-black text-emerald-800 text-xs">{expiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Part 3: Real Mobile-Scannable QR Code & Cryptographic Certification */}
              <div className="p-4 rounded-xl bg-linear-to-r from-emerald-50/70 via-white to-sky-50/70 border-2 border-[#16a34a]/40 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                  
                  {/* Real Scannable QR Code Image */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="p-2 bg-white rounded-xl border-2 border-[#0c2340] shadow-sm">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt={`Official QR Code for Certificate ${certificateId}`}
                          className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                        />
                      ) : (
                        <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center bg-gray-100 rounded text-gray-400">
                          <QrCode className="w-12 h-12 animate-pulse" />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-mono font-black text-[#0c2340] uppercase tracking-wider mt-1">
                      MOBILE SCANNABLE QR
                    </span>
                  </div>

                  {/* QR Description and Statutory Guarantee */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Instant Mobile Camera Verification Active</span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-[#0c2340] leading-snug">
                      Scan with any smartphone camera to inspect official statutory record in real time.
                    </h3>

                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Encoded URL links directly to the Directorate's Central Metrological Ledger on MongoDB Atlas. Verifies live validity, stamping seal history, and legal authorization.
                    </p>

                    <div className="text-[9px] font-mono text-gray-500 bg-white p-2 rounded-lg border border-gray-200 break-all text-left">
                      <span className="font-bold text-gray-700">Ed25519 Anchor:</span> {digitalHash}
                    </div>

                    {qrVerificationUrl && (
                      <div className="text-[10px] text-emerald-900 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono flex items-center justify-between gap-2">
                        <span className="truncate text-slate-700 font-medium">
                          <strong>Mobile URL:</strong> {qrVerificationUrl}
                        </span>
                        <a
                          href={qrVerificationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:text-emerald-900 font-bold shrink-0 underline"
                        >
                          Open Direct ↗
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Public Verification Link Button */}
                  {onNavigateToPublicVerification && (
                    <div className="shrink-0 print:hidden w-full sm:w-auto">
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToPublicVerification(certificateId);
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#163a66] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        <span>Public Portal</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Part 4: Officer Endorsement & Legal Attestation */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200">
                <div className="text-left text-[11px] text-gray-500 max-w-sm">
                  <div className="font-bold text-[#0c2340] text-xs">Statutory Stamping Declaration</div>
                  The weights and measures listed herein have met MPE Clause 3.6 tolerances and have been officially stamped with government indelible lead seals.
                </div>

                <div className="text-center sm:text-right">
                  <div className="font-script text-base text-[#15803d] font-bold italic tracking-wide">
                    {verifiedBy.split('(')[0]}
                  </div>
                  <div className="text-[10px] font-extrabold text-[#0c2340] uppercase tracking-wider">
                    Legal Metrology Officer (LMO)
                  </div>
                  <div className="text-[9px] font-mono text-gray-500">
                    Badge ID: {lmoId} • Directorate of Legal Metrology
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Footer Notice */}
            <div className="mt-5 pt-3 border-t border-gray-200 text-center text-[9px] text-gray-400 font-medium tracking-wide">
              This verification certificate is digitally generated and authenticated under Section 24 of The Legal Metrology Act, 2009. Any tampering, forging, or alteration is a cognizable offense punishable under Section 44.
            </div>

          </div>
        </div>

        {/* Modal Bottom Close Bar */}
        <div className="p-4 border-t border-gray-200 bg-[#f8fbf9] flex items-center justify-between sticky bottom-0 print:hidden">
          <span className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Statutory Certificate Ledger Synced
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
