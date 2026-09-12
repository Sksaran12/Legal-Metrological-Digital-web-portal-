import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { apiClient } from '../../../services/apiClient';

interface ContactScreenProps {
  onOpenGrievance?: () => void;
}

export const ContactScreen: React.FC<ContactScreenProps> = ({ onOpenGrievance }) => {
  const [inquirySent, setInquirySent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketNo, setTicketNo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Verification Docket Status Inquiry');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await apiClient.submitInquiry({
        name,
        email,
        topic,
        message
      });

      if (res.success) {
        setTicketNo(res.ticketNo || `INQ-2026-${Math.floor(1000 + Math.random() * 9000)}`);
        setInquirySent(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setErrorMessage(res.message || 'Failed to submit inquiry to statutory database.');
      }
    } catch (err: any) {
      setErrorMessage('Network or server connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="rounded-2xl bg-[#0c2340] text-white p-8 sm:p-10 border border-[#1b3a61] shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold border border-white/15">
            <Phone className="w-3.5 h-3.5" />
            <span>National Regulatory Helpdesk</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Contact &amp; Regulatory Helpdesk
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Direct communication channels for commercial stakeholders, traders, legal metrology officers, and consumer grievance redressal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-[#d8e4f1] p-6 shadow-2xs space-y-4">
            <h3 className="font-display font-extrabold text-base text-[#0c2340]">
              Directorate Headquarters
            </h3>

            <div className="space-y-3.5 text-xs text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 block">Ministry of Consumer Affairs</strong>
                  <span>Directorate of Legal Metrology, 4th Floor, Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-gray-900 block">Toll-Free National Helpline</strong>
                  <span className="font-mono text-emerald-700 font-bold">1915 / 1800-11-4000</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-gray-900 block">Official Support Email</strong>
                  <span className="font-mono">helpdesk-lm@nic.in / dir-lm-ca@nic.in</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-gray-900 block">Working Hours</strong>
                  <span>Monday – Friday: 09:30 AM to 06:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grievance Quick CTA */}
          {onOpenGrievance && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>Consumer Dispute or Tampering?</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                If you have experienced short weight at a merchant scale or detected tampered fuel dispenser seals, file a formal complaint.
              </p>
              <button
                onClick={onOpenGrievance}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                LODGE GRIEVANCE NOW
              </button>
            </div>
          )}
        </div>

        {/* Inquiry Form */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#d8e4f1] p-6 sm:p-8 shadow-2xs">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h3 className="font-display font-extrabold text-lg text-[#0c2340]">
              Statutory Helpdesk Inquiry
            </h3>
            <p className="text-xs text-gray-500">
              Submit questions regarding OIML specifications, model approval, or verification dockets
            </p>
          </div>

          {inquirySent ? (
            <div className="text-center py-10 space-y-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-300">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-black text-xl text-[#0c2340]">
                  Inquiry Saved to Statutory Database
                </h4>
                <p className="text-xs font-mono font-bold text-[#16a34a]">
                  Ticket Reference ID: {ticketNo}
                </p>
              </div>
              <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                Your statutory inquiry has been recorded into MongoDB Atlas. A Legal Metrology officer will review your ticket within 24 business hours.
              </p>
              <button
                onClick={() => setInquirySent(false)}
                className="px-5 py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#16a34a] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">Your Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Topic / Subject *</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 text-xs font-medium bg-white cursor-pointer"
                >
                  <option value="Verification Docket Status Inquiry">Verification Docket Status Inquiry</option>
                  <option value="Model Approval & Pattern Evaluation (Section 19)">Model Approval &amp; Pattern Evaluation (Section 19)</option>
                  <option value="Packaged Commodities Registration (PCR Rule 27)">Packaged Commodities Registration (PCR Rule 27)</option>
                  <option value="Manufacturer or Repairer License Renewal">Manufacturer or Repairer License Renewal</option>
                  <option value="BharatKosh Fee Settlement Assistance">BharatKosh Fee Settlement Assistance</option>
                  <option value="General Statutory Clarification">General Statutory Clarification</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Message Particulars *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide docket number, device serial number, or statutory query details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#16a34a] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Submit Statutory Inquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
