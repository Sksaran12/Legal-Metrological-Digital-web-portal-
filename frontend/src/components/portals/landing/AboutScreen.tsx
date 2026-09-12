import React from 'react';
import {
  Scale,
  ShieldCheck,
  Award,
  BookOpen,
  Layers,
  Building,
  CheckCircle2
} from 'lucide-react';
import { EverimetLogo } from '../../common/EverimetLogo';

export const AboutScreen: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-2xl bg-[#0c2340] text-white p-8 sm:p-10 border border-[#1b3a61] shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold border border-white/15">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Statutory Legislative Mandate</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            About Legal Metrology in India
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Protecting national consumer rights and standardizing statutory measurement integrity under The Legal Metrology Act, 2009 (Act No. 1 of 2010).
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white border border-[#d8e4f1] p-6 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#eef8f1] text-[#15803d] flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-[#0c2340]">The Legal Metrology Act, 2009</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            The parliamentary statute enforcing standard weights, measures, goods in pre-packaged form, and consumer protection across all interstate and retail commerce.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#d8e4f1] p-6 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#f0f7ff] text-[#0c2340] flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-[#0c2340]">Metrological Traceability Chain</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Unbroken calibration chain beginning at the National Physical Laboratory (NPL India), cascading to Regional Reference Standard Laboratories (RRSL) and District Working Standards.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#d8e4f1] p-6 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-[#0c2340]">OIML International Alignment</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            India is an OIML Issuing Authority (International Organization of Legal Metrology). Pattern approvals issued in India conform to international mutual acceptance arrangements.
          </p>
        </div>
      </div>

      {/* Standards Hierarchy */}
      <div className="rounded-2xl bg-white border border-[#d8e4f1] p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="border-b border-gray-100 pb-4">
          <h3 className="font-display font-extrabold text-xl text-[#0c2340]">
            The 4-Tier Statutory Standards Architecture
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            How physical truth is maintained from national prototypes to commercial retail scales
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#f8f9ff] border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#15803d]">Tier 1: National Prototype</span>
              <h4 className="font-bold text-sm text-[#0c2340]">National Prototype Standards (NPL New Delhi)</h4>
              <p className="text-xs text-gray-600">The primary reference standards of the kilogram and metre traceable to the SI Base Units.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-white text-xs font-mono font-bold text-gray-700 border border-gray-300 shrink-0">
              Uncertainty: ±0.001 mg
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#f8f9ff] border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#15803d]">Tier 2: Regional Reference</span>
              <h4 className="font-bold text-sm text-[#0c2340]">Reference Standard Laboratories (RRSL Ahmedabad, Bengaluru, Bhubaneswar, Faridabad, Guwahati)</h4>
              <p className="text-xs text-gray-600">Calibrates secondary standards used by state governments every 3 years.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-white text-xs font-mono font-bold text-gray-700 border border-gray-300 shrink-0">
              Uncertainty: ±0.01 mg
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#f8f9ff] border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#15803d]">Tier 3: State Laboratories</span>
              <h4 className="font-bold text-sm text-[#0c2340]">Secondary &amp; Working Standard Laboratories</h4>
              <p className="text-xs text-gray-600">District labs maintained by State Legal Metrology Officers for calibrating field inspectors' working standards.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-white text-xs font-mono font-bold text-gray-700 border border-gray-300 shrink-0">
              Uncertainty: ±0.1 mg (F1/F2)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#f8f9ff] border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#15803d]">Tier 4: Commercial Field Enforcement</span>
              <h4 className="font-bold text-sm text-[#0c2340]">Commercial Weights &amp; Measures (Market Instruments)</h4>
              <p className="text-xs text-gray-600">Weighbridges, fuel dispensers, grocery scales verified on-site using certified M1 class working weights.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-xs font-mono font-bold text-emerald-800 border border-emerald-200 shrink-0">
              Permissible MPE: ±1 e to ±3 e
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
