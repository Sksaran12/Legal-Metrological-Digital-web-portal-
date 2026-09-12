import React from 'react';
import {
  Scale,
  FileCheck,
  PackageCheck,
  ShieldCheck,
  RotateCw,
  QrCode,
  ArrowRight,
  ExternalLink,
  Award,
  Layers
} from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (serviceKey?: string) => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
}

const SERVICES = [
  {
    id: 'weights-verification',
    icon: Scale,
    title: 'Verification & Stamping of Instruments',
    statute: 'Section 24 of The Legal Metrology Act, 2009',
    description: 'Mandatory statutory initial verification and annual re-verification for commercial scales, electronic weighbridges, and retail fuel dispensers.',
    features: ['Standard Test Weights (M1 Class)', 'OIML R 76-1 Error Delta Test', 'Holographic Tamper Seal']
  },
  {
    id: 'licensing',
    icon: Award,
    title: 'Manufacturer, Dealer & Repairer Licensing',
    statute: 'Section 23 & State Legal Metrology Rules',
    description: 'Issuance and periodic renewal of statutory licenses for manufacturing, repairing, and dealing in commercial weights and measuring instruments.',
    features: ['Form LM-1, LM-2, LM-3 Processing', 'Workshop Competence Verification', 'District-wide Jurisdiction']
  },
  {
    id: 'packaged-commodities',
    icon: PackageCheck,
    title: 'Packaged Commodities Rules (PCR) Registration',
    statute: 'Rule 27 of Legal Metrology (Packaged Commodities) Rules, 2011',
    description: 'Mandatory online registration for manufacturers, packers, and importers of pre-packaged goods ensuring mandatory consumer declarations.',
    features: ['Net Quantity Compliance', 'Max Retail Price (MRP) & Unit Sale Price', 'Country of Origin Declaration']
  },
  {
    id: 'model-approval',
    icon: Layers,
    title: 'Model Approval & Type Approval',
    statute: 'Section 19 of The Legal Metrology Act, 2009',
    description: 'National central repository of approved models tested by accredited laboratories (RRSL, NPL India) prior to commercial market distribution.',
    features: ['Pattern Evaluation Reports', 'Central Certificate of Approval', 'Digital Model Dossiers']
  },
  {
    id: 'renewal-fee',
    icon: RotateCw,
    title: 'Automated Re-verification & Stamping Renewal',
    statute: 'Rule 14 & 16 of Central Rules, 2011',
    description: 'Seamless periodic re-verification tracking, automatic statutory notification alerts, and instant online fee payment through BharatKosh.',
    features: ['Due Date SMS/Email Alerts', 'Instant Stamping Slot Booking', 'Direct Receipt Generation']
  },
  {
    id: 'public-verification',
    icon: QrCode,
    title: 'Public Holographic Seal & QR Authenticator',
    statute: 'Consumer Protection Statutory Mandate',
    description: 'Citizen-facing public verification portal for scanning holographic labels on grocery scales, fuel dispensers, and hospital weighers.',
    features: ['Instant QR Scan', 'Officer Ed25519 DSC Verification', 'Report Tampering / Short Measure']
  }
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectService,
  onOpenLogin,
  onOpenRegister
}) => {
  return (
    <div className="w-full mb-14 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d8e4f1] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#eef8f1] text-[#15803d] border border-[#c6edd0] mb-1.5">
            Statutory Architecture
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0c2340] tracking-tight">
            Core Regulatory &amp; Online Services
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            End-to-end statutory workflows delivered under The Legal Metrology Act, 2009
          </p>
        </div>

        <button
          onClick={() => onSelectService()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16a34a] hover:text-[#15803d] transition-colors shrink-0"
        >
          <span>View Detailed Statutory Directory</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SERVICES.map((srv) => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.id}
              className="rounded-2xl bg-white border border-[#d8e4f1] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-[#b4d3f5]"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#f0f7ff] border border-[#d8e4f1] flex items-center justify-center text-[#0c2340] group-hover:bg-[#0c2340] group-hover:text-white transition-all shadow-2xs">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#16a34a] block uppercase tracking-wide">
                    {srv.statute}
                  </span>
                  <h3 className="font-display font-extrabold text-base text-[#0c2340] leading-snug">
                    {srv.title}
                  </h3>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {srv.description}
                </p>

                {/* Features Pills */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {srv.features.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#f8f9ff] text-gray-700 border border-gray-200"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectService(srv.id)}
                  className="text-xs font-bold text-[#0c2340] group-hover:text-[#16a34a] transition-colors inline-flex items-center gap-1"
                >
                  <span>Access Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {onOpenRegister && (
                  <button
                    onClick={onOpenRegister}
                    className="text-[11px] font-semibold text-gray-500 hover:text-[#0c2340] transition-colors"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
