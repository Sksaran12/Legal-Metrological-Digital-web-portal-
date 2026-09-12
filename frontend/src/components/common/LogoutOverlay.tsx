import React, { useEffect, useState } from 'react';
import { Lock, CheckCircle2, Loader2, KeyRound, ShieldCheck } from 'lucide-react';

interface LogoutOverlayProps {
  isOpen: boolean;
  userRole?: string;
  userName?: string;
  onComplete: () => void;
}

export const LogoutOverlay: React.FC<LogoutOverlayProps> = ({
  isOpen,
  userRole = 'Authorized User',
  userName = 'User',
  onComplete
}) => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const timer1 = setTimeout(() => setStep(2), 400);
      const timer2 = setTimeout(() => setStep(3), 850);
      const timer3 = setTimeout(() => {
        onComplete();
      }, 1300);

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
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#d8e4f1] text-center relative overflow-hidden">
        {/* Top glowing statutory gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#16a34a] via-[#059669] to-[#0c2340] animate-pulse" />

        {/* Animated Badge Icon */}
        <div className="relative mx-auto w-16 h-16 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
          <div className="w-16 h-16 rounded-full bg-[#eef8f1] border-2 border-[#c6edd0] flex items-center justify-center shadow-inner">
            <Lock className="w-7 h-7 text-[#16a34a] animate-bounce" />
          </div>
        </div>

        {/* Title and details */}
        <h3 className="text-xl font-extrabold text-[#0c2340] mb-1 tracking-tight">
          Terminating Statutory Session
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Safely signing out <span className="font-semibold text-gray-800">{userName}</span> ({userRole})
        </p>

        {/* Animated Step Progress Box */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-left space-y-3 text-xs mb-6">
          <div className="flex items-center gap-2.5">
            {step >= 1 ? (
              <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />
            )}
            <span className={step >= 1 ? 'font-bold text-[#0c2340]' : 'text-gray-400'}>
              Validating active dockets & session locks
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {step >= 2 ? (
              <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
            ) : step === 1 ? (
              <Loader2 className="w-4 h-4 text-[#16a34a] animate-spin shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
            )}
            <span className={step >= 2 ? 'font-bold text-[#0c2340]' : 'text-gray-400'}>
              Clearing cryptographic JWT bearer tokens
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {step >= 3 ? (
              <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
            ) : step === 2 ? (
              <Loader2 className="w-4 h-4 text-[#16a34a] animate-spin shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
            )}
            <span className={step >= 3 ? 'font-bold text-[#0c2340]' : 'text-gray-400'}>
              Redirecting to National Metrology Portal Gateway...
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[#16a34a] h-1.5 transition-all duration-500 ease-out"
            style={{ width: step === 1 ? '35%' : step === 2 ? '75%' : '100%' }}
          />
        </div>
      </div>
    </div>
  );
};
