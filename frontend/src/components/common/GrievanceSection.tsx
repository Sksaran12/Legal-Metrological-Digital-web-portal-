import React from 'react';
import {
  AlertCircle,
  PhoneCall,
  ShieldAlert,
  FileText,
  HelpCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface GrievanceSectionProps {
  onOpenGrievance: () => void;
}

export const GrievanceSection: React.FC<GrievanceSectionProps> = ({ onOpenGrievance }) => {
  return (
    <div className="w-full mb-8 rounded-2xl bg-linear-to-r from-[#0c2340] via-[#10325a] to-[#0c2340] text-white p-6 sm:p-8 shadow-md border border-[#1d4270]">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Info */}
        <div className="space-y-3 text-center lg:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>National Consumer Protection Taskforce</span>
          </div>

          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white">
            Suspect Inaccurate Weights or Broken Holographic Seals?
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Report unverified commercial scales, short fuel delivery, or tampered verification stamps directly to the Directorate of Legal Metrology. Action initiated within 24 hours under Section 15 of The Legal Metrology Act, 2009.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-gray-300">
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>National Consumer Helpline: <strong className="text-white font-mono">1915 / 1800-11-4000</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>24/7 Portal Grievance Tracking</span>
            </div>
          </div>
        </div>

        {/* Right Action */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 shrink-0">
          <button
            onClick={onOpenGrievance}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-slate-950" />
            <span>Lodge Statutory Grievance</span>
          </button>

          <a
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              onOpenGrievance();
            }}
            className="text-xs text-gray-300 hover:text-white underline transition-colors"
          >
            Check Grievance Status with Docket ID
          </a>
        </div>
      </div>
    </div>
  );
};
