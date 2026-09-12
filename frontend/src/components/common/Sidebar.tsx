import React, { useState } from 'react';
import { NavigationView, UserSession } from '../../types';
import { EverimetLogo } from './EverimetLogo';
import { LogoutOverlay } from './LogoutOverlay';
import {
  Scale,
  PlusCircle,
  LayoutDashboard,
  ClipboardList,
  Calculator,
  Users,
  BookOpen,
  Settings,
  X,
  Wifi,
  Sparkles,
  LogOut,
  UserCheck,
  Building2
} from 'lucide-react';

interface SidebarProps {
  currentView: NavigationView;
  onSelectView: (view: NavigationView) => void;
  isOpen: boolean;
  onClose: () => void;
  onNewVerification: () => void;
  userSession?: UserSession;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose,
  onNewVerification,
  userSession,
  onLogout
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[280px] bg-white border-r border-[#e2e8f0] flex flex-col justify-between p-4 shadow-sm transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Header Brand */}
          <div className="flex items-center justify-between px-2 py-2 mb-4">
            <EverimetLogo variant="brand" size="sm" />
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 rounded-lg"
              title="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Session Quick Badge */}
          {userSession && (
            <div className="mb-4 p-3 rounded-xl bg-[#f8f9fa] border border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] flex items-center justify-center font-bold text-xs shrink-0">
                  {userSession.role === 'officer' ? (
                    <UserCheck className="w-4 h-4" />
                  ) : userSession.role === 'owner' || userSession.role === 'business' ? (
                    <Building2 className="w-4 h-4" />
                  ) : (
                    <Scale className="w-4 h-4" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#121d26] leading-none truncate">
                    {userSession.name}
                  </span>
                  <span className="text-[10px] text-[#4e6073] mt-0.5 capitalize truncate">
                    {userSession.roleLabel || userSession.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Action CTA */}
          <button
            onClick={() => {
              onNewVerification();
              onClose();
            }}
            className="w-full mb-4 h-10 px-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:bg-[#166534] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Verification</span>
          </button>

          {/* Main Navigation Items */}
          <nav className="space-y-1 text-xs">
            <button
              onClick={() => {
                onSelectView('lmo-portal');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                currentView === 'lmo-portal'
                  ? 'bg-[#eef8f1] text-[#15803d] font-bold border-l-4 border-[#16a34a]'
                  : 'text-[#4e6073] hover:text-[#121d26] hover:bg-[#f8f9fa]'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Inspection Queue (LMO)</span>
            </button>

            <button
              onClick={() => {
                onSelectView('public-qr');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                currentView === 'public-qr'
                  ? 'bg-[#eef8f1] text-[#15803d] font-bold border-l-4 border-[#16a34a]'
                  : 'text-[#4e6073] hover:text-[#121d26] hover:bg-[#f8f9fa]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#16a34a]" />
              <span>Public QR Check (Citizen)</span>
            </button>

            <button
              onClick={() => {
                onSelectView('business-portal');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                currentView === 'business-portal'
                  ? 'bg-[#eef8f1] text-[#15803d] font-bold border-l-4 border-[#16a34a]'
                  : 'text-[#4e6073] hover:text-[#121d26] hover:bg-[#f8f9fa]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Stakeholders &amp; Business</span>
            </button>

            <button
              onClick={() => {
                onSelectView('admin-command');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                currentView === 'admin-command'
                  ? 'bg-[#eef8f1] text-[#15803d] font-bold border-l-4 border-[#16a34a]'
                  : 'text-[#4e6073] hover:text-[#121d26] hover:bg-[#f8f9fa]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview &amp; Analytics</span>
            </button>
          </nav>
        </div>

        {/* Footer Meta & System Status */}
        <div className="pt-3 border-t border-[#e2e8f0] space-y-1.5 text-xs">
          <button
            onClick={() => onSelectView('public-qr')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[#4e6073] hover:text-[#121d26] hover:bg-[#f8f9fa] transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>OIML Standards Docs</span>
          </button>

          {onLogout && (
            <button
              onClick={() => {
                onClose();
                setIsLoggingOut(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out / Switch Role</span>
            </button>
          )}

          {/* Node Status Badge */}
          <div className="mt-2 p-2.5 rounded-lg bg-[#f8f9fa] border border-[#e2e8f0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#27ae60] animate-pulse"></span>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-[#121d26]">Offline Sync Ready</span>
                <span className="text-[9px] text-[#4e6073]">SIH-26036 Standard Node</span>
              </div>
            </div>
            <span className="font-mono text-[10px] text-[#4e6073] bg-white px-1.5 py-0.5 rounded border border-gray-200">
              v2.4.8
            </span>
          </div>
        </div>
      </aside>

      <LogoutOverlay
        isOpen={isLoggingOut}
        userName={userSession?.name || 'Authorized User'}
        userRole={userSession?.roleLabel || 'Statutory Official'}
        onComplete={() => {
          setIsLoggingOut(false);
          if (onLogout) onLogout();
        }}
      />
    </>
  );
};
