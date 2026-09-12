import React from 'react';
import {
  X,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  MapPin,
  Scale
} from 'lucide-react';
import { StakeholderItem } from '../../types';

interface StakeholderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stakeholder: StakeholderItem | null;
  onApprove: (id: string) => void;
  onFlag: (id: string) => void;
}

export const StakeholderDetailModal: React.FC<StakeholderDetailModalProps> = ({
  isOpen,
  onClose,
  stakeholder,
  onApprove,
  onFlag
}) => {
  if (!isOpen || !stakeholder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 text-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-[#fafbfc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[#0c2340]">
                Stakeholder Statutory Dossier
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">
                {stakeholder.licenseNo}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-base font-bold text-[#121d26]">{stakeholder.name}</h4>
            <p className="text-gray-600 mt-0.5">{stakeholder.subtext}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-[#f8f9fa] rounded-xl border border-gray-200">
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">License Type</span>
              <span className="font-semibold text-[#121d26]">{stakeholder.role}</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Status</span>
              <span className="capitalize font-semibold text-[#121d26]">{stakeholder.status}</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Compliance Score</span>
              <span className="font-bold text-emerald-700 font-mono">{stakeholder.complianceScore}%</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Last Verified Audit</span>
              <span className="text-gray-700">12 Sep 2024</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-[#121d26]">Registered Instruments under Jurisdiction:</div>
            <div className="p-2.5 rounded-lg border border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#16a34a]" />
                <span>Heavy Vehicle Pitless Weighbridge (50T)</span>
              </div>
              <span className="font-mono text-emerald-600 font-bold">PASS (±0.0kg)</span>
            </div>
            <div className="p-2.5 rounded-lg border border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#16a34a]" />
                <span>Platform Scale 1,500kg (Receiving Dock)</span>
              </div>
              <span className="font-mono text-emerald-600 font-bold">PASS</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => {
                onFlag(stakeholder.id);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 font-semibold transition-colors"
            >
              Flag for Immediate Audit
            </button>
            <button
              onClick={() => {
                onApprove(stakeholder.id);
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-2xs"
            >
              Renew Regulatory License
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
