import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  FileWarning,
  ShieldAlert,
  Calendar,
  Send
} from 'lucide-react';

interface RejectionNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: {
    docketId?: string;
    establishment?: string;
    reason?: string;
  };
  onConfirmRejection: (docketId: string, reason: string) => void;
}

export const RejectionNoticeModal: React.FC<RejectionNoticeModalProps> = ({
  isOpen,
  onClose,
  details,
  onConfirmRejection
}) => {
  const [reason, setReason] = useState(
    details.reason || 'Repeatability error delta exceeded allowable OIML Table 6 tolerance (Max Delta +6.8 kg > ±5.0 kg)'
  );
  const [rectificationDays, setRectificationDays] = useState('7');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmRejection(details.docketId || 'LM-VER-8821', reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-red-50 p-4 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-red-900">
                Statutory Rejection / Condemnation Notice
              </h3>
              <p className="text-[11px] text-red-700">
                Under Section 24(2) of The Legal Metrology Act, 2009
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-red-800 space-y-1">
            <div className="font-bold">Notice of Metrological Non-Compliance:</div>
            <p>
              The weighing instrument at{' '}
              <strong className="text-red-950">{details.establishment || 'Bharat Petroleum Retail Hub #104'}</strong> (Docket{' '}
              <span className="font-mono font-bold">{details.docketId || 'LM-VER-8821'}</span>) has failed mandatory statutory tolerances. Continued commercial use is strictly prohibited.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Metrological Non-Compliance Reason:
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-xs text-gray-800"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Mandated Rectification Window:
            </label>
            <select
              value={rectificationDays}
              onChange={(e) => setRectificationDays(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white"
            >
              <option value="7">7 Days (Standard calibration overhaul)</option>
              <option value="14">14 Days (Requires authorized factory replacement)</option>
              <option value="0">Immediate Condemnation / Seizure (Section 30)</option>
            </select>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <FileWarning className="w-3.5 h-3.5" />
              <span>Issue Official Notice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
