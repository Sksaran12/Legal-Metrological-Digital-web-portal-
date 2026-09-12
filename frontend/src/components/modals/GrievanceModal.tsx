import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  FileText,
  UploadCloud,
  Lock
} from 'lucide-react';
import { EverimetLogo } from '../common/EverimetLogo';

interface GrievanceModalProps {
  onClose: () => void;
}

export const GrievanceModal: React.FC<GrievanceModalProps> = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [docketNo, setDocketNo] = useState('');
  const [formData, setFormData] = useState({
    establishmentName: '',
    city: '',
    state: 'Maharashtra',
    infractionType: 'short_measure',
    description: '',
    complainantName: '',
    complainantPhone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedDocket = `GRV-${Math.floor(100000 + Math.random() * 900000)}`;
    setDocketNo(generatedDocket);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-[#f8f9ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-[#0c2340]">
                Statutory Consumer Grievance Portal
              </h3>
              <p className="text-[11px] text-gray-500">
                Lodge complaint under Section 15 of The Legal Metrology Act, 2009
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-black text-xl text-[#0c2340]">
                  Grievance Registered Successfully
                </h4>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  Your complaint has been forwarded to the Jurisdictional Legal Metrology Officer. Inspection will be initiated within 48 statutory hours.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#d8e4f1] inline-block text-left space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  Statutory Grievance Docket Number
                </span>
                <span className="font-mono font-black text-lg text-[#16a34a]">
                  {docketNo}
                </span>
                <p className="text-[11px] text-gray-500">
                  SMS tracking alert dispatched to {formData.complainantPhone || 'registered phone'}.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-bold hover:bg-[#133763] transition-colors"
                >
                  Close &amp; Return to Portal
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Complaints filed here trigger statutory surprise audits by regional verification taskforces. False complaints are subject to legal penalties under Section 53.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">
                  Commercial Establishment / Trader / Petrol Pump Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.establishmentName}
                  onChange={(e) => setFormData({ ...formData, establishmentName: e.target.value })}
                  placeholder="e.g. Quick Mart Grocery Store / Highway Fuel Pump #12"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">City / Town / Market Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Andheri East, Mumbai"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">Nature of Infraction *</label>
                  <select
                    value={formData.infractionType}
                    onChange={(e) => setFormData({ ...formData, infractionType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-xs"
                  >
                    <option value="short_measure">Short Weight / Under-Measurement</option>
                    <option value="broken_seal">Missing or Broken Holographic Wire Seal</option>
                    <option value="fuel_nozzle">Fuel Dispenser Inaccurate Delivery</option>
                    <option value="expired_cert">Expired or Absent Form VII Certificate</option>
                    <option value="pcr_violation">Packaged Commodity MRP / Weight Defect</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Incident Particulars &amp; Details *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what occurred, date/time, receipt bill details, or observed scale discrepancy..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-gray-100">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">Complainant Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.complainantName}
                    onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                    placeholder="Your legal name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">Mobile Number (For SMS Tracking) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.complainantPhone}
                    onChange={(e) => setFormData({ ...formData, complainantPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-gray-100">
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Whistleblower Identity Protected</span>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#0c2340] hover:bg-[#133763] text-white font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Submit Grievance</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
