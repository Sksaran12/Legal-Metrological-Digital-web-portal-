import React from 'react';
import { X } from 'lucide-react';
import { Registration } from './registration';

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess?: (data: any) => void;
  showToast?: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
  showToast = () => {}
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-gray-100 text-gray-700 shadow-xs transition-colors"
          aria-label="Close Register Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Embedded Registration Form */}
        <div className="overflow-y-auto flex-1 p-2 sm:p-4">
          <Registration
            onNavigateToLogin={() => {
              onClose();
              onSwitchToLogin();
            }}
            onNavigateToHome={onClose}
            onRegisterSuccess={(data) => {
              if (onRegisterSuccess) onRegisterSuccess(data);
              onClose();
              onSwitchToLogin();
            }}
            showToast={showToast}
          />
        </div>
      </div>
    </div>
  );
};
