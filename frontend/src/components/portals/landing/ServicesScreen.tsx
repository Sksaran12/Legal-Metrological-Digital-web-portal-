import React, { useState } from 'react';
import {
  Scale,
  Award,
  PackageCheck,
  Layers,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Search
} from 'lucide-react';

interface ServicesScreenProps {
  onOpenRegister?: () => void;
}

export const ServicesScreen: React.FC<ServicesScreenProps> = ({ onOpenRegister }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'verification' | 'licenses' | 'pcr' | 'model'>('all');
  const [filterQuery, setFilterQuery] = useState('');

  const services = [
    {
      category: 'verification',
      title: 'Verification of Non-Automatic Weighing Instruments (NAWI)',
      section: 'Section 24, Rule 14',
      fee: '₹200 - ₹5,000 depending on capacity',
      validity: '12 Months (Annual renewal)',
      sla: '48 Working Hours',
      docs: ['OEM Model Approval Certificate', 'Installation Site Photos', 'Previous Year Stamping Certificate (if renewal)']
    },
    {
      category: 'verification',
      title: 'Electronic Weighbridge Verification (Up to 100 Ton)',
      section: 'Section 24, OIML R 76 Class III',
      fee: '₹4,000 - ₹8,000',
      validity: '12 Months',
      sla: '3 Working Days',
      docs: ['Civil Foundation Stability Certificate', 'Weighbridge Test Certificate from Licensed Repairer', 'Corner load test reports']
    },
    {
      category: 'verification',
      title: 'Dispensing Pump / Retail Fuel Dispenser Verification',
      section: 'Section 24, Petroleum Delivery Protocol',
      fee: '₹2,000 per nozzle',
      validity: '12 Months',
      sla: '24 Hours',
      docs: ['PESO Explosives License', '5-Litre Standard Measure Test Certificate', 'Totalizer Readings Log']
    },
    {
      category: 'licenses',
      title: 'Manufacturer License for Weights & Measures (Form LM-1)',
      section: 'Section 23, Central Rules',
      fee: '₹5,000 Initial / ₹2,500 Renewal',
      validity: '5 Calendar Years',
      sla: '15 Working Days',
      docs: ['Factory Registration & Machinery List', 'Technical Staff Qualifications', 'Pattern Approval Dossier']
    },
    {
      category: 'licenses',
      title: 'Repairer License for Weights & Measures (Form LM-2)',
      section: 'Section 23, Central Rules',
      fee: '₹2,000 Initial / ₹1,000 Renewal',
      validity: '5 Calendar Years',
      sla: '7 Working Days',
      docs: ['Workshop Testing Equipment (Standard Weights)', 'Technical Experience Certificate', 'Electricity Bill / Premises Lease']
    },
    {
      category: 'pcr',
      title: 'Packaged Commodities Importer/Packer Registration (Rule 27)',
      section: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      fee: '₹500 One-time statutory fee',
      validity: 'Perpetual (until business modification)',
      sla: '7 Working Days',
      docs: ['IEC Code (For Importers)', 'Sample Label Proof with Mandatory Declarations', 'GST Registration Certificate']
    },
    {
      category: 'model',
      title: 'Central Model Approval for Weighing Instruments',
      section: 'Section 19, The Legal Metrology Act, 2009',
      fee: '₹10,000 + Testing charges (RRSL/NPL)',
      validity: '10 Years',
      sla: '30 Working Days',
      docs: ['General Arrangement Drawings', 'Circuit Schematics & Firmware Hashes', 'RRSL Prototype Evaluation Report']
    }
  ];

  const filtered = services.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (filterQuery && !s.title.toLowerCase().includes(filterQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="rounded-2xl bg-[#0c2340] text-white p-8 sm:p-10 border border-[#1b3a61] shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-100 text-xs font-semibold border border-white/15">
            <Scale className="w-3.5 h-3.5" />
            <span>Official Government Service Catalog</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Services &amp; Licensing Directory
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Statutory fee schedules, document checklists, and online application protocols under The Legal Metrology Act, 2009.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#d8e4f1] shadow-2xs">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { key: 'all', label: 'All Services' },
            { key: 'verification', label: 'Weights & Verification' },
            { key: 'licenses', label: 'Statutory Licenses' },
            { key: 'pcr', label: 'Packaged Commodities (PCR)' },
            { key: 'model', label: 'Model Approval' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedCategory(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedCategory === tab.key
                  ? 'bg-[#0f766e] text-white shadow-xs'
                  : 'bg-[#f8fafc] text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search service name..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
          />
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filtered.map((srv, idx) => (
          <div
            key={idx}
            className="gov-panel rounded-2xl p-6 hover:shadow-sm transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#16a34a] block">
                  {srv.section}
                </span>
                <h3 className="font-display font-bold text-base text-[#0c2340]">
                  {srv.title}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#15803d] border border-emerald-200 font-bold">
                  SLA: {srv.sla}
                </span>
                <span className="font-mono font-semibold text-gray-800">
                  {srv.fee}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-bold text-gray-800 block mb-1">Mandatory Prerequisites &amp; Documents:</span>
                <ul className="space-y-1">
                  {srv.docs.map((doc, dIdx) => (
                    <li key={dIdx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <span className="font-bold text-gray-800 block mb-1">Validity &amp; Stamping Interval:</span>
                  <p>{srv.validity}</p>
                </div>
                {onOpenRegister && (
                  <div className="pt-3">
                    <button
                      onClick={onOpenRegister}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2340] hover:bg-[#143763] text-white font-bold text-xs transition-colors shadow-2xs"
                    >
                      <span>Apply Online on e-VeriMet</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
