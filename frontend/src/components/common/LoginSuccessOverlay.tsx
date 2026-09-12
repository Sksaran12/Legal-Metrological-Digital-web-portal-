import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, Loader2, KeyRound, Sparkles } from 'lucide-react';

interface LoginSuccessOverlayProps {
  isOpen: boolean;
  userRole?: string;
  userName?: string;
  onComplete: () => void;
}

export const LoginSuccessOverlay: React.FC<LoginSuccessOverlayProps> = ({
  isOpen,
  userRole = 'Authorized User',
  userName = 'User',
  onComplete
}) => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const timer1 = setTimeout(() => setStep(2), 450);
      const timer2 = setTimeout(() => setStep(3), 950);
      const timer3 = setTimeout(() => {
        onComplete();
      }, 1500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0c2340]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#c6edd0] text-center relative overflow-hidden">
        {/* Top glowing statutory gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#16a34a] via-[#10b981] to-[#0c2340] animate-pulse" />

        {/* Animated Badge Icon */}
        <div className="relative mx-auto w-16 h-16 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-200 animate-ping opacity-40" />
          <div className="w-16 h-16 rounded-full bg-[#eef8f1] border-2 border-[#86efac] flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-8 h-8 text-[#16a34a] animate-pulse" />
          </div>
        </div>

        {/* Title and details */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 mb-2">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Statutory Clearance Granted</span>
        </div>

        <h3 className="text-xl font-extrabold text-[#0c2340] mb-1 tracking-tight">
          Authenticated Successfully
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Welcome back, <span className="font-bold text-[#0c2340]">{userName}</span>{' '}
          <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700 ml-1">
            {userRole}
          </span>
        </p>

        {/* Animated Step Progress Box */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-left space-y-3 text-xs mb-6 shadow-inner">
          <div className="flex items-center gap-2.5">
            {step >= 1 ? (
              <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0 animate-in zoom-in-50 duration-150" />
            ) : (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />
            )}
            <span className={step >= 1 ? 'font-bold text-[#0c2340]' : 'text-gray-400'}>
              Verifying National Metrology biometric & SSO credentials
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {step >= 2 ? (
              <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0 animate-in zoom-in-50 duration-150" />
            ) : step === 1 ? (
              <Loader2 className="w-4 h-4 text-[#16a34a] animate-spin shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
            )}
            <span className={step >= 2 ? 'font-bold text-[#0c2340]' : 'text-gray-400'}>
              Issuing cryptographic JWT Bearer clearance keys
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {step >= 3 ? (
              <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0 animate-in zoom-in-50 duration-150" />
            ) : step === 2 ? (
              <Loader2 className="w-4 h-4 text-[#16a34a] animate-spin shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
            )}
            <span className={step >= 3 ? 'font-bold text-[#0c2340]' : 'text-gray-400'}>
              Loading role-based statutory command dashboard...
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div
              className="h-full bg-gradient-to-r from-[#16a34a] via-[#10b981] to-[#0f766e] transition-all duration-300 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>Security Anchor: Ed25519</span>
            <span>{Math.round((step / 3) * 100)}% Synchronized</span>
          </div>
        </div>

        {/* Safe statutory notice footer */}
        <div className="mt-5 pt-3 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-center gap-1.5 font-mono">
          <KeyRound className="w-3.5 h-3.5 text-[#16a34a]" />
          <span>Statutory Audit Logging Active • Legal Metrology Act 2009</span>
        </div>
      </div>
    </div>
  );
};
