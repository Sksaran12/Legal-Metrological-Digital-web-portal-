import React, { useState } from 'react';
import {
  X,
  Flag,
  Camera,
  MapPin,
  Send,
  AlertTriangle
} from 'lucide-react';

interface ReportTamperModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: {
    certNo?: string;
    establishment?: string;
    sealId?: string;
  };
  onSubmitReport: (data: any) => void;
}

export const ReportTamperModal: React.FC<ReportTamperModalProps> = ({
  isOpen,
  onClose,
  details,
  onSubmitReport
}) => {
  const [complaintType, setComplaintType] = useState('broken_seal');
  const [description, setDescription] = useState(
    'Holographic lead seal wire has been cut or altered. The tare setting appears skewed by ~250g.'
  );
  const [isAnonymous, setIsAnonymous] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport({
      certNo: details.certNo,
      establishment: details.establishment,
      complaintType,
      description,
      isAnonymous
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden flex flex-col text-xs">
        <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-amber-950">
                Lodge Seal Tampering Report
              </h3>
              <p className="text-[11px] text-amber-800">
                Confidential grievance sent directly to Enforcement Directorate
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="font-semibold text-gray-700">Target Establishment:</div>
            <div className="font-bold text-[#121d26]">{details.establishment || 'Metro Supermarket Hub'}</div>
            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
              Tag: {details.certNo || 'IN-MH-2024-9982-NAWI-76'}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Violation Type:
            </label>
            <select
              value={complaintType}
              onChange={(e) => setComplaintType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white"
            >
              <option value="broken_seal">Physical Lead Wire Seal Cut / Broken</option>
              <option value="short_weight">Significant Under-weighing / Short Delivery</option>
              <option value="unverified_scale">Unstamped Scale Used for Billing</option>
              <option value="tampered_firmware">Electronic Firmware Tampered</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Observations / Evidence:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-xs"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anon-check"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-gray-300 text-[#16a34a] focus:ring-[#16a34a]"
            />
            <label htmlFor="anon-check" className="text-gray-700 font-medium cursor-pointer text-xs">
              File as Protected Anonymous Consumer Report
            </label>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
