import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Radio,
  Users,
  MapPin,
  Send,
  ShieldAlert
} from 'lucide-react';

interface EmergencyAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatch: (zone: string, teamsCount: number) => void;
}

export const EmergencyAuditModal: React.FC<EmergencyAuditModalProps> = ({
  isOpen,
  onClose,
  onDispatch
}) => {
  const [selectedCluster, setSelectedCluster] = useState('Vashi APMC Agricultural Grain Hub');
  const [teamSize, setTeamSize] = useState(3);
  const [mandateReason, setMandateReason] = useState(
    'Festive surge consumer complaints: Suspected short-delivery and counterfeit holographic seal tampering.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDispatch(selectedCluster, teamSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 text-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-[#d35400] to-[#e67e22] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm">
                Initiate Directorate Emergency Regulatory Audit
              </h3>
              <p className="text-[11px] text-white/80">
                Statutory Special Enforcement Taskforce Dispatch (Legal Metrology Act Section 15)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
            <span className="font-bold block">Enforcement Protocol Priority: ALPHA-1</span>
            <p className="mt-0.5 text-amber-800">
              Enables non-notified surprise inspection of retail markets, industrial silos, and vehicle weighbridges.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Target Geographic Cluster:
            </label>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white"
            >
              <option>Vashi APMC Agricultural Grain Hub (Sector 19)</option>
              <option>Sion-Trombay Petroleum Retail Corridor</option>
              <option>Navi Mumbai Freight Container Terminal</option>
              <option>Andheri East Commercial Electronics Market</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Enforcement Teams to Dispatch:
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={teamSize}
                onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Calibration Van Unit:
              </label>
              <input
                type="text"
                disabled
                value="Unit MH-VAN-04 (M1 Kit Loaded)"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Statutory Mandate &amp; Cause:
            </label>
            <textarea
              rows={2}
              value={mandateReason}
              onChange={(e) => setMandateReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-xs"
              required
            />
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
              className="px-5 py-2 rounded-lg bg-[#e67e22] hover:bg-[#d35400] text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Broadcast Emergency Dispatch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
