import React from 'react';
import {
  AlertTriangle,
  X,
  KeyRound,
  UserCheck,
  ShieldAlert,
  RotateCcw,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '../../types';

interface AuthErrorModalProps {
  isOpen: boolean;
  errorTitle?: string;
  errorMessage?: string;
  errorHint?: string;
  onClose: () => void;
  onApplyDemoAccount?: (email: string, role: UserRole) => void;
  onOpenForgotPassword?: () => void;
}

export const AuthErrorModal: React.FC<AuthErrorModalProps> = ({
  isOpen,
  errorTitle = 'Authentication Error',
  errorMessage = 'Invalid email or password.',
  errorHint = 'The credentials entered do not match any verified record in the National Metrology Database.',
  onClose,
  onApplyDemoAccount,
  onOpenForgotPassword
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0c2340]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-rose-200 text-center relative overflow-hidden">
        {/* Top glowing crimson/amber security border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-700 animate-pulse" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-[#0c2340] hover:bg-gray-100 transition-all cursor-pointer hover:rotate-90 duration-200"
          title="Dismiss notification"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Badge Icon */}
        <div className="relative mx-auto w-16 h-16 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-rose-200 animate-ping opacity-40" />
          <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-300 flex items-center justify-center shadow-inner">
            <AlertTriangle className="w-8 h-8 text-rose-600 animate-bounce" />
          </div>
        </div>

        {/* Title and details */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Statutory Security Notice</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-[#0c2340] mb-1 tracking-tight">
          {errorTitle}
        </h3>
        <p className="text-xs text-rose-600 font-bold uppercase tracking-wider mb-4">
          Access Denied • Verification Failed
        </p>

        {/* Main Error Box with rich gradient and highlight */}
        <div className="bg-gradient-to-br from-rose-50/90 to-amber-50/50 border border-rose-200 rounded-xl p-4 text-left mb-5 shadow-inner">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-rose-950">{errorMessage}</div>
              <p className="text-xs text-rose-800/90 mt-1 leading-relaxed">
                {errorHint}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Troubleshooting Cards with Hover Effects */}
        <div className="text-left space-y-2 mb-6">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
            <span>Recommended Checks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Hover Card 1 */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#16a34a] hover:shadow-md transition-all duration-200 cursor-default group hover:-translate-y-0.5">
              <div className="font-bold text-[#0c2340] group-hover:text-[#16a34a] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                <span>Password Accuracy</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                Check Caps Lock and ensure password special characters match.
              </p>
            </div>

            {/* Hover Card 2 */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#0f766e] hover:shadow-md transition-all duration-200 cursor-default group hover:-translate-y-0.5">
              <div className="font-bold text-[#0c2340] group-hover:text-[#0f766e] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Role Designation</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                Verify the selected role matches your registered account type.
              </p>
            </div>
          </div>
        </div>

        {/* 1-Click Quick Demo Accounts (Interactive Hover Cards) */}
        {onApplyDemoAccount && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left mb-6">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick-Load Authorized Test Profiles</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Configured seed password</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onApplyDemoAccount('admin@legalmetrology.gov.in', 'administrator');
                  onClose();
                }}
                className="px-2.5 py-2 rounded-lg bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/60 text-[#0c2340] text-[11px] font-bold flex flex-col items-center gap-0.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer hover:scale-[1.02]"
              >
                <span className="text-blue-700 font-extrabold">👑 Admin</span>
                <span className="text-[9px] text-gray-500 truncate w-full text-center">Director</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onApplyDemoAccount('officer.rajesh@legalmetrology.gov.in', 'officer');
                  onClose();
                }}
                className="px-2.5 py-2 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/60 text-[#0c2340] text-[11px] font-bold flex flex-col items-center gap-0.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer hover:scale-[1.02]"
              >
                <span className="text-emerald-700 font-extrabold">⚖️ LMO Officer</span>
                <span className="text-[9px] text-gray-500 truncate w-full text-center">Inspector</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onApplyDemoAccount('owner@apexscale.in', 'owner');
                  onClose();
                }}
                className="px-2.5 py-2 rounded-lg bg-white border border-slate-300 hover:border-purple-500 hover:bg-purple-50/60 text-[#0c2340] text-[11px] font-bold flex flex-col items-center gap-0.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer hover:scale-[1.02]"
              >
                <span className="text-purple-700 font-extrabold">🏢 Trader</span>
                <span className="text-[9px] text-gray-500 truncate w-full text-center">Enterprise</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#0c2340] hover:bg-[#153a66] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          {onOpenForgotPassword && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenForgotPassword();
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#0c2340] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Reset Password</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-mono">
          Security Guard: Failed Login Audit Recorded (IP &amp; Timestamp Logged)
        </div>
      </div>
    </div>
  );
};
