import React from 'react';
import {
  ClipboardCheck,
  CreditCard,
  Scale,
  Award,
  CheckCircle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Digital Application & Enrollment',
    icon: ClipboardCheck,
    statute: 'Rule 14(1)',
    description: 'Establishment files instrument particulars, model approval code, capacity rating, and GPS installation site via e-VeriMet.'
  },
  {
    step: '02',
    title: 'BharatKosh Fee Settlement',
    icon: CreditCard,
    statute: 'Central Fee Schedule',
    description: 'Statutory verification fee calculated automatically as per Schedule XII and settled instantly through BharatKosh payment gateway.'
  },
  {
    step: '03',
    title: 'Physical Testing with Standard Weights',
    icon: Scale,
    statute: 'OIML R 76-1:2006',
    description: 'Jurisdictional Legal Metrology Officer inspects device with certified M1 test weights, verifying error within Maximum Permissible Error (MPE).'
  },
  {
    step: '04',
    title: 'Holographic Stamping & Digital Form VII',
    icon: Award,
    statute: 'Section 24(1)',
    description: 'Physical tamper-proof holographic seal affixed to calibration housing; cryptographic Form VII certificate issued to owner registry.'
  }
];

export const ProcessSection: React.FC = () => {
  return (
    <div className="w-full mb-14 space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#eef8f1] text-[#15803d] border border-[#c6edd0]">
          Statutory Verification Workflow
        </div>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0c2340] tracking-tight">
          4-Step Regulatory Verification Lifecycle
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Standardized statutory compliance protocol mandated by the Directorate of Legal Metrology
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="relative rounded-2xl bg-white border border-[#d8e4f1] p-5 shadow-2xs flex flex-col justify-between"
            >
              {/* Step indicator top */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-display font-black text-2xl text-[#16a34a]/80">
                  {s.step}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f8f9ff] text-gray-600 border border-gray-200">
                  {s.statute}
                </span>
              </div>

              <div className="py-4 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#eef8f1] text-[#15803d] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-[#0c2340] leading-snug">
                  {s.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="pt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Statutory Compliance Point</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
