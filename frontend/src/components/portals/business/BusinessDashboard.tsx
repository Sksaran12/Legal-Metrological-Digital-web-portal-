import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  Building,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  Layers,
  ChevronRight,
  Check
} from 'lucide-react';

interface BusinessDashboardProps {
  showToast: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  onOpenCertificate: (details: any) => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  showToast,
  onOpenCertificate
}) => {
  const [activeTab, setActiveTab] = useState<'apply' | 'certificates' | 'tracker'>('apply');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrCompleted, setOcrCompleted] = useState(false);

  // Form states
  const [instrumentName, setInstrumentName] = useState('Mettler-Toledo BC-60 Commercial Scale');
  const [accuracyClass, setAccuracyClass] = useState('Class III (Medium)');
  const [maxCapacity, setMaxCapacity] = useState('30 kg');
  const [scaleInterval, setScaleInterval] = useState('e = 5 g, d = 1 g');
  const [modelApproval, setModelApproval] = useState('IND-IND231-IND');
  const [premises, setPremises] = useState('Apex Central Warehouse, Andheri East, Mumbai');
  const [verifCategory, setVerifCategory] = useState('initial');
  const [prefDate, setPrefDate] = useState('2024-10-22');

  const handleSimulateOcrUpload = () => {
    setIsOcrProcessing(true);
    setTimeout(() => {
      setIsOcrProcessing(false);
      setOcrCompleted(true);
      setInstrumentName('Mettler-Toledo BC-60 Commercial Scale');
      setMaxCapacity('30 kg');
      setScaleInterval('e = 5 g, d = 1 g');
      setModelApproval('IND-IND231-IND (Approved by RRSL)');
      showToast(
        'AI OCR Extraction Complete',
        'Extracted Class III specifications, model approval number, and capacity parameters from invoice.',
        'success'
      );
    }, 1100);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      'Application Submitted',
      'Docket #LM-2024-9182 generated. Forwarded to Mumbai Central II LMO inspection roster.',
      'success'
    );
    setActiveTab('tracker');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Importer / Business Header Banner */}
      <div className="gov-panel rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#edf7f6] border border-[#bfe3df] flex items-center justify-center text-[#0f766e] font-bold text-base shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg text-[#0c2340]">
                Apex Retail Weighing Solutions Ltd.
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Verified Business Profile
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#4e6073] mt-1">
              <span>LMPC Importer License: <strong className="font-mono text-[#0c2340]">MH-BOM-2023-4410</strong></span>
              <span>•</span>
              <span>Authorized Commercial NAWI Dealer</span>
              <span>•</span>
              <span className="font-mono text-[#0c2340]">OIML-R76-Ed25519</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('apply')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
              activeTab === 'apply'
                ? 'bg-[#16a34a] text-white shadow-xs'
                : 'bg-[#eef8f1] text-[#15803d] hover:bg-[#dcfce7] border border-[#c6edd0]'
            }`}
          >
            + New Application
          </button>
        </div>
      </div>

      {/* 3 Primary Action Cards Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('apply')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'apply'
              ? 'bg-[#edf7f6] border-[#bfe3df] shadow-xs'
              : 'bg-white border-[#e2e8f0] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#edf7f6] text-[#0f766e] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f766e]">
            Optional AI Assist
            </span>
          </div>
          <div className="mt-3 font-bold text-sm text-[#0c2340]">New Verification Application</div>
          <p className="text-xs text-[#4e6073] mt-0.5">
            Initial stamping for imported lots or annual re-verification
          </p>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'certificates'
              ? 'bg-[#eef8f1] border-[#c6edd0] shadow-xs'
              : 'bg-white border-[#e2e8f0] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              4 Active
            </span>
          </div>
          <div className="mt-3 font-bold text-sm text-[#0c2340]">My Stamped Certificates</div>
          <p className="text-xs text-[#4e6073] mt-0.5">
          Digital certificates and downloadable receipts
          </p>
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'tracker'
              ? 'bg-[#eef8f1] border-[#c6edd0] shadow-xs'
              : 'bg-white border-[#e2e8f0] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Live Tracker
            </span>
          </div>
          <div className="mt-3 font-bold text-sm text-[#0c2340]">Application Tracker</div>
          <p className="text-xs text-[#4e6073] mt-0.5">
          Track application status, inspection, and certificate release
          </p>
        </button>
      </div>

      {/* Tab View 1: New Verification Application Form */}
      {activeTab === 'apply' && (
        <div className="gov-panel rounded-2xl p-5 sm:p-6 space-y-6">
          <div>
            <h2 className="font-display font-bold text-base sm:text-lg text-[#0c2340]">
              Application for Initial Stamping &amp; Verification (Rule 14)
            </h2>
            <p className="text-xs text-[#4e6073] mt-0.5">
              Upload import bill of entry / manufacturer declaration or complete parameters manually.
            </p>
          </div>

          {/* AI OCR Document Extraction Zone */}
          <div className="p-4 sm:p-5 rounded-xl border-2 border-dashed border-[#cbd5e1] bg-[#f8fafc] text-center space-y-3">
            <UploadCloud className="w-10 h-10 text-[#0f766e] mx-auto opacity-80" />
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#0c2340]">
                Upload Invoice, Bill of Entry, or Model Approval Certificate
              </div>
              <p className="text-xs text-[#4e6073] mt-0.5">
                Supports PDF, PNG, JPG up to 15MB. AI automatically populates technical parameters.
              </p>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSimulateOcrUpload}
                disabled={isOcrProcessing}
              className="px-4 py-2 rounded-xl bg-[#edf7f6] hover:bg-[#dff5f1] text-[#0f766e] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98] border border-[#bfe3df]"
              >
                <Sparkles className="w-3.5 h-3.5" />
              <span>{isOcrProcessing ? 'Reading document fields...' : 'Use Optional Document Assist'}</span>
              </button>
            </div>

            {ocrCompleted && (
              <div className="p-2.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Document fields captured and ready for review</span>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#121d26] mb-1">
                  Instrument Model &amp; Description
                </label>
                <input
                  type="text"
                  value={instrumentName}
                  onChange={(e) => setInstrumentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8e4f1] bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#121d26] mb-1">
                  Model Approval Number (RRSL / GoI)
                </label>
                <input
                  type="text"
                  value={modelApproval}
                  onChange={(e) => setModelApproval(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8e4f1] bg-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#121d26] mb-1">
                  Max Capacity (Max)
                </label>
                <input
                  type="text"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8e4f1] bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#121d26] mb-1">
                  Verification Scale Interval (e)
                </label>
                <input
                  type="text"
                  value={scaleInterval}
                  onChange={(e) => setScaleInterval(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8e4f1] bg-white text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#121d26] mb-1">
                  Premises for On-site Verification Inspection
                </label>
                <select
                  value={premises}
                  onChange={(e) => setPremises(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8e4f1] bg-white text-xs"
                >
                  <option>Apex Central Warehouse, Andheri East, Mumbai</option>
                  <option>Apex Retail Flagship Hub, Bandra Kurla Complex</option>
                  <option>Navi Mumbai Cold Chain Terminal, Sector 24</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#121d26] mb-1">
                  Verification Category
                </label>
                <select
                  value={verifCategory}
                  onChange={(e) => setVerifCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8e4f1] bg-white text-xs"
                >
                  <option value="initial">Initial Stamping (Newly Imported / Manufactured)</option>
                  <option value="periodic">Periodic Annual Re-Verification</option>
                  <option value="retest">Re-Verification Post-Repair</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#121d26] mb-1">
                  Preferred Inspection Date
                </label>
                <input
                  type="date"
                  value={prefDate}
                  onChange={(e) => setPrefDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8e4f1] bg-white text-xs"
                />
              </div>
            </div>

            {/* Fee Computation Box */}
            <div className="p-4 bg-[#f8f9fa] rounded-xl border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-[#121d26]">Statutory Bharatkosh Fee Breakdown</div>
                <div className="text-[#4e6073] mt-0.5">
                  ₹850 (Class III NAWI ≤ 50kg Stamping Fee) + ₹150 (Statutory Portal Charge)
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 uppercase block">Total Payable</span>
                <span className="text-lg font-bold text-[#15803d]">₹1,000.00</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Proceed to Bharatkosh &amp; Submit Docket</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab View 2: My Certificates */}
      {activeTab === 'certificates' && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#e2e8f0] bg-[#fafbfc]">
            <h2 className="font-display font-bold text-base text-[#0c2340]">
              Authorized Verification Certificates (Apex Retail)
            </h2>
            <p className="text-xs text-[#4e6073] mt-0.5">
              Statutory verification certificates issued by Maharashtra Legal Metrology Directorate
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9fa] text-[#4e6073] font-semibold border-b border-[#e2e8f0]">
                <tr>
                  <th className="py-3 px-4">Certificate ID</th>
                  <th className="py-3 px-4">Instrument Specification</th>
                  <th className="py-3 px-4">Premises Installed</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Seal Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-[#0c2340]">
                    IN-MH-2024-9982-NAWI-76
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#121d26]">Essae-Teraoka DS-215</div>
                    <div className="text-[11px] text-gray-500">Class III • Max 30kg • e=5g</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">Central Warehouse, Bay 2</td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">13 Oct 2025</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                      Active &amp; Sealed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() =>
                        onOpenCertificate({
                          certNo: 'IN-MH-2024-9982-NAWI-76',
                          establishment: 'Apex Retail Solutions (Bay 2)',
                          model: 'Essae-Teraoka DS-215 (Class III)',
                          officer: 'Rajesh Sharma, LMO (MH-LM-2041)'
                        })
                      }
                      className="px-3 py-1 rounded-lg bg-[#eef8f1] hover:bg-[#dcfce7] text-[#15803d] font-semibold text-xs border border-[#c6edd0] cursor-pointer transition-colors"
                    >
                      View Certificate
                    </button>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-[#0c2340]">
                    IN-MH-2023-8821-NAWI-44
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#121d26]">Mettler-Toledo BC-60</div>
                    <div className="text-[11px] text-gray-500">Class III • Max 60kg • e=10g</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">BKC Flagship Dispatch Hub</td>
                  <td className="py-3 px-4 text-amber-700 font-semibold">18 Nov 2024 (Due soon)</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[10px]">
                      Re-Verification Due
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveTab('apply')}
                      className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 cursor-pointer transition-colors"
                    >
                      Renew License
                    </button>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-[#0c2340]">
                    IN-MH-2024-7712-NAWI-02
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#121d26]">Avery Berkel FX-120</div>
                    <div className="text-[11px] text-gray-500">Class II • Max 15kg • e=2g</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">Quality Calibration Lab</td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">28 Feb 2025</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                      Active &amp; Sealed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() =>
                        onOpenCertificate({
                          certNo: 'IN-MH-2024-7712-NAWI-02',
                          establishment: 'Apex Quality Calibration Lab',
                          model: 'Avery Berkel FX-120 (Class II)',
                          officer: 'Anand Verma, LMO'
                        })
                      }
                      className="px-3 py-1 rounded-lg bg-[#eef8f1] hover:bg-[#dcfce7] text-[#15803d] font-semibold text-xs border border-[#c6edd0] cursor-pointer transition-colors"
                    >
                      View Certificate
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab View 3: Application Tracker */}
      {activeTab === 'tracker' && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e2e8f0]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#15803d] bg-[#eef8f1] border border-[#c6edd0] px-2 py-0.5 rounded">
                Docket #LM-2024-9182
              </span>
              <h2 className="font-display font-bold text-base sm:text-lg text-[#0c2340] mt-1">
                Initial Stamping &amp; Verification Progress Tracker
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              Stage 3: In Field Inspection
            </span>
          </div>

          {/* 4-Step Visual Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div className="p-3 bg-[#f8f9fa] rounded-xl border border-emerald-200 space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>1. Scrutiny Passed</span>
              </div>
              <p className="text-[11px] text-gray-600">Model approval validated against RRSL records</p>
              <span className="text-[10px] font-mono text-gray-400 block">10 Oct, 11:20 AM</span>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-[#f8f9fa] rounded-xl border border-emerald-200 space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>2. Fee Paid</span>
              </div>
              <p className="text-[11px] text-gray-600">₹1,000 settled via Bharatkosh TXN #88219</p>
              <span className="text-[10px] font-mono text-gray-400 block">10 Oct, 02:45 PM</span>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-[#eef8f1] rounded-xl border border-[#c6edd0] space-y-1">
              <div className="flex items-center gap-2 text-[#16a34a] font-bold text-xs">
                <Clock className="w-4 h-4 animate-spin" />
                <span>3. In Field Inspection</span>
              </div>
              <p className="text-[11px] text-gray-700">
                Assigned to Rajesh Sharma, LMO (MH-LM-2041)
              </p>
              <span className="text-[10px] font-mono text-[#15803d] font-bold block">
                Scheduled for Today, 03:00 PM
              </span>
            </div>

            {/* Step 4 */}
            <div className="p-3 bg-[#f8f9fa] rounded-xl border border-gray-200 space-y-1 opacity-70">
              <div className="flex items-center gap-2 text-gray-600 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>4. Physical Stamping</span>
              </div>
              <p className="text-[11px] text-gray-500">Lead seal attachment &amp; Ed25519 issuance</p>
              <span className="text-[10px] font-mono text-gray-400 block">Pending Inspection</span>
            </div>
          </div>

          {/* Inspection Venue & Checklist */}
          <div className="p-4 bg-[#f8f9fa] rounded-xl border border-[#e2e8f0] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-[#121d26] block mb-1">Inspection Venue &amp; Officer</span>
              <p className="text-gray-600">
                Apex Central Warehouse, Bay 2, Andheri East, Mumbai
              </p>
              <p className="text-gray-600 mt-1">
                LMO Contact: <strong>Rajesh Sharma (+91 98200 XXXXX)</strong>
              </p>
            </div>
            <div>
              <span className="font-bold text-[#121d26] block mb-1">Premises Readiness Checklist</span>
              <div className="space-y-1 text-gray-700">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>M1 standard test weights available on-site</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Uninterrupted 230V AC regulated power</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Vibration-free level concrete surface</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
