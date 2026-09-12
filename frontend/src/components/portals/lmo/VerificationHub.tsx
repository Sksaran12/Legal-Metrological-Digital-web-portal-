import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  QrCode,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  Building2,
  Scale,
  Lock,
  UserCheck,
  Sparkles,
  ExternalLink,
  Zap,
  Activity,
  Cpu,
  Check,
  FileText
} from 'lucide-react';
import { VerificationRecord } from '../../../types';
import { EverimetLogo } from '../../common/EverimetLogo';
import { findCertificate } from '../../../services/expiryEngine';

interface VerificationHubProps {
  onViewCertificate: (record: VerificationRecord) => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
}

const SAMPLE_RECORDS: Record<string, VerificationRecord> = {
  'IN-MH-2024-9982-NAWI-76': {
    certNo: 'IN-MH-2024-9982-NAWI-76',
    docketId: 'MH-DOC-88912',
    establishment: 'Bharat Petroleum Retail Hub #104',
    instrumentType: 'Vehicle Weighbridge (Electronic, 60 Ton)',
    accuracyClass: 'Class III (Medium Accuracy)',
    maxCapacity: '60,000 kg',
    e: '10 kg',
    officerName: 'Rajesh Sharma (Senior LMO)',
    officerId: 'MH-LM-2041',
    date: '14 October 2024',
    validUntil: '13 October 2025',
    status: 'valid',
    location: 'Plot 42, Turbhe MIDC, Navi Mumbai, Maharashtra',
    hologramNo: 'SEAL-WIRE-2041-998',
    manufacturer: 'Avery Weigh-Tronix India',
    modelNumber: 'BridgeMaster Pro-60',
    serialNumber: 'AW-2022-7712'
  },
  'DL-VER-2024-1092': {
    certNo: 'DL-VER-2024-1092',
    docketId: 'DL-DOC-44102',
    establishment: 'Apex Agro Terminal & Cold Storage',
    instrumentType: 'Electronic Platform Scale (Bench)',
    accuracyClass: 'Class II (High Precision)',
    maxCapacity: '500 kg',
    e: '50 g',
    officerName: 'Suman Verma (LMO South Delhi)',
    officerId: 'DL-LM-1088',
    date: '02 November 2024',
    validUntil: '01 November 2025',
    status: 'valid',
    location: 'Okhla Industrial Area Phase-III, New Delhi',
    hologramNo: 'SEAL-HOL-DL-4412',
    manufacturer: 'Essae-Teraoka Ltd',
    modelNumber: 'DS-215 Platform',
    serialNumber: 'ES-2023-9041'
  },
  'KA-VER-2024-5519': {
    certNo: 'KA-VER-2024-5519',
    docketId: 'KA-DOC-90812',
    establishment: 'Hindustan Petroleum Highway Outlet 18',
    instrumentType: 'Multi-Nozzle Fuel Dispenser (MS/HSD)',
    accuracyClass: 'Class 0.5 (Volumetric Liquid)',
    maxCapacity: '80 L/min',
    e: '±0.1% tolerance',
    officerName: 'Venkatesh Rao (LMO Bengaluru East)',
    officerId: 'KA-LM-3019',
    date: '18 January 2025',
    validUntil: '17 January 2026',
    status: 'valid',
    location: 'NH-44 Hosur Road, Electronic City, Bengaluru',
    hologramNo: 'SEAL-SEC-KA-9912',
    manufacturer: 'Tokheim India Pvt Ltd',
    modelNumber: 'Quantium 510',
    serialNumber: 'TK-2021-3381'
  }
};

export const VerificationHub: React.FC<VerificationHubProps> = ({
  onViewCertificate,
  onOpenLogin,
  onOpenRegister
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<VerificationRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTab, setSearchTab] = useState<'cert' | 'docket' | 'hologram'>('cert');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) {
      setErrorMessage('Please enter a certificate number, docket ID, or serial number.');
      return;
    }

    setErrorMessage('');
    setHasSearched(true);

    // Look for exact match in Expiry Engine certificate database store
    const dbMatch = findCertificate(query);
    if (dbMatch) {
      setSearchResult({
        certNo: dbMatch.certificateId,
        docketId: dbMatch.instrumentId,
        establishment: dbMatch.owner,
        instrumentType: dbMatch.instrument,
        accuracyClass: dbMatch.accuracyClass,
        maxCapacity: dbMatch.capacity,
        e: dbMatch.eInterval || '5 g',
        officerName: dbMatch.verifiedBy || (dbMatch.lmoId ? `Legal Metrology Officer (${dbMatch.lmoId})` : 'Legal Metrology Officer'),
        officerId: dbMatch.lmoId,
        date: dbMatch.verificationDate,
        validUntil: dbMatch.expiryDate,
        status: dbMatch.status === 'expired' ? 'expired' : 'valid',
        location: dbMatch.establishmentAddress || 'Verified National Installation Site',
        hologramNo: dbMatch.serialNumber,
        manufacturer: dbMatch.manufacturer,
        modelNumber: dbMatch.model,
        serialNumber: dbMatch.serialNumber
      });
      return;
    }

    // Look for exact or partial match in sample records
    const match = Object.values(SAMPLE_RECORDS).find(
      (r) =>
        r.certNo.toUpperCase().includes(query) ||
        r.docketId.toUpperCase().includes(query) ||
        (r.serialNumber && r.serialNumber.toUpperCase().includes(query)) ||
        (r.hologramNo && r.hologramNo.toUpperCase().includes(query))
    );

    if (match) {
      setSearchResult(match);
    } else {
      // Dynamic generated valid match for user inquiry simulation
      if (query.length >= 4) {
        setSearchResult({
          certNo: `IN-NAT-${query}-VER`,
          docketId: `DOC-${query}`,
          establishment: 'Registered Commercial Establishment',
          instrumentType: 'Non-Automatic Weighing Instrument (Class III)',
          accuracyClass: 'Class III (Commercial Standard)',
          maxCapacity: '50 kg',
          e: '10 g',
          officerName: 'Statutory Metrology Officer',
          officerId: 'NAT-LM-9900',
          date: '10 January 2025',
          validUntil: '09 January 2026',
          status: 'valid',
          location: 'National Registry Verified Installation Site',
          hologramNo: `SEAL-${query}`,
          manufacturer: 'Certified OEM Partner',
          modelNumber: 'Electronic Scale Model-V',
          serialNumber: query
        });
      } else {
        setSearchResult(null);
        setErrorMessage('No statutory verification certificate found with this identifier. Please check and try again.');
      }
    }
  };

  const handleQuickLookup = (certNo: string) => {
    setSearchQuery(certNo);
    const rec = SAMPLE_RECORDS[certNo];
    if (rec) {
      setSearchResult(rec);
      setHasSearched(true);
      setErrorMessage('');
    }
  };

  return (
    <div id="verification-hub" className="w-full space-y-8 mb-12 scroll-mt-28">
      {/* Modern Flagship Hero Card Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#06152b] via-[#0c2340] to-[#0f2d52] text-white p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl border border-white/20 ring-1 ring-white/10">
        {/* Futuristic Ambient Lighting Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column (7 Cols): Headline, Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Institutional Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Government of India • Directorate of Legal Metrology</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
                National Digital Metrology &amp;{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                  Verification Command Engine
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl">
                Instant statutory verification of commercial weighing instruments, fuel dispensers, and legal metrology dockets under Section 24 of The Legal Metrology Act, 2009.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-lg font-black text-white font-mono">4.8M+</div>
                <div className="text-[11px] text-emerald-400 font-semibold">Verified Ledger</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-lg font-black text-white font-mono">OIML R76</div>
                <div className="text-[11px] text-teal-300 font-semibold">Standard Class</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-lg font-black text-white font-mono">Ed25519</div>
                <div className="text-[11px] text-emerald-400 font-semibold">Signed Seals</div>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {onOpenRegister && (
                <button
                  onClick={onOpenRegister}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#16a34a] to-[#15803d] hover:from-[#15803d] hover:to-[#166534] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg hover:shadow-emerald-900/40 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Register Business / Instruments</span>
                </button>
              )}
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm tracking-wide border border-white/25 backdrop-blur-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Officer &amp; Portal Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column (5 Cols): Glassmorphic Interactive Search Command Deck */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-5 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <EverimetLogo variant="icon" size="lg" />
              </div>

              {/* Card Title & Search Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <Zap className="w-4 h-4" />
                    <span>Real-Time Statutory Verifier</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ONLINE
                  </span>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/20 border border-white/10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSearchTab('cert')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
                      searchTab === 'cert'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Certificate No
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchTab('docket')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
                      searchTab === 'docket'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Docket ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchTab('hologram')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
                      searchTab === 'hologram'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Wire Seal
                  </button>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchTab === 'cert'
                        ? 'e.g. IN-MH-2024-9982-NAWI-76'
                        : searchTab === 'docket'
                        ? 'e.g. MH-DOC-88912'
                        : 'e.g. SEAL-WIRE-2041-998'
                    }
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-white text-[#0b1c30] text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Record Authenticity</span>
                </button>
              </form>

              {/* Interactive Quick Presets */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-gray-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Quick Test Queries:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => handleQuickLookup('IN-MH-2024-9982-NAWI-76')}
                    className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-emerald-300 border border-white/15 transition-colors"
                  >
                    IN-MH-2024-9982
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLookup('DL-VER-2024-1092')}
                    className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-emerald-300 border border-white/15 transition-colors"
                  >
                    DL-VER-2024-1092
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLookup('KA-VER-2024-5519')}
                    className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-emerald-300 border border-white/15 transition-colors"
                  >
                    KA-VER-2024-5519
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Result Card */}
      {errorMessage && (
        <div className="max-w-3xl mx-auto p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-left">
            <p className="font-bold">Record Verification Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {hasSearched && searchResult && (
        <div className="max-w-4xl mx-auto rounded-2xl bg-white border border-[#d8e4f1] shadow-xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#eef8f1] border border-[#c6edd0] text-[#15803d] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    Statutory Verified • Active
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    Hologram: {searchResult.hologramNo}
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-lg text-[#0c2340] mt-0.5">
                  {searchResult.establishment}
                </h3>
              </div>
            </div>

            <button
              onClick={() => onViewCertificate(searchResult)}
              className="px-4 py-2 rounded-xl bg-[#0c2340] hover:bg-[#153a66] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>View Form VII Certificate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 text-xs">
            <div>
              <span className="text-gray-500 block text-[11px]">Certificate Number</span>
              <span className="font-mono font-bold text-[#0c2340]">{searchResult.certNo}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Instrument Category</span>
              <span className="font-semibold text-gray-900">{searchResult.instrumentType}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Accuracy Class</span>
              <span className="font-semibold text-emerald-700">{searchResult.accuracyClass}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Max Capacity / Interval (e)</span>
              <span className="font-mono text-gray-900">{searchResult.maxCapacity} (e={searchResult.e})</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Inspecting Officer</span>
              <span className="font-semibold text-gray-900">{searchResult.officerName}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Valid Until</span>
              <span className="font-bold text-emerald-700">{searchResult.validUntil}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Key Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#d8e4f1] text-center space-y-1 shadow-xs hover:shadow-md transition-shadow">
          <div className="font-display font-black text-2xl sm:text-3xl text-[#0c2340]">
            4.8M+
          </div>
          <div className="text-xs font-semibold text-gray-600">Instruments Verified</div>
          <div className="text-[10px] text-[#16a34a] font-bold">● Active in National Ledger</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#d8e4f1] text-center space-y-1 shadow-xs hover:shadow-md transition-shadow">
          <div className="font-display font-black text-2xl sm:text-3xl text-[#0c2340]">
            36
          </div>
          <div className="text-xs font-semibold text-gray-600">States &amp; UTs Connected</div>
          <div className="text-[10px] text-[#16a34a] font-bold">● Single Statutory Registry</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#d8e4f1] text-center space-y-1 shadow-xs hover:shadow-md transition-shadow">
          <div className="font-display font-black text-2xl sm:text-3xl text-[#0c2340]">
            100%
          </div>
          <div className="text-xs font-semibold text-gray-600">OIML R 76 Compliance</div>
          <div className="text-[10px] text-[#16a34a] font-bold">● Traceable to NPL India</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#d8e4f1] text-center space-y-1 shadow-xs hover:shadow-md transition-shadow">
          <div className="font-display font-black text-2xl sm:text-3xl text-[#0c2340]">
            &lt; 48 Hrs
          </div>
          <div className="text-xs font-semibold text-gray-600">Verification SLA Turnaround</div>
          <div className="text-[10px] text-[#16a34a] font-bold">● BharatKosh Integrated</div>
        </div>
      </div>
    </div>
  );
};
