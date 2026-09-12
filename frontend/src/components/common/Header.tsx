import React, { useState } from 'react';
import { NavigationView, UserSession, ActiveScreen } from '../../types';
import { EverimetLogo } from './EverimetLogo';
import { LogoutOverlay } from './LogoutOverlay';
import {
  Scale,
  Search,
  Bell,
  HelpCircle,
  AlertTriangle,
  Menu,
  QrCode,
  ChevronDown,
  LogOut,
  UserCheck,
  Building2,
  Users,
  ShieldCheck,
  UserPlus,
  LogIn,
  FileCheck2,
  Globe,
  X
} from 'lucide-react';

interface HeaderProps {
  // Institutional Landing Page props
  activeScreen?: ActiveScreen;
  onNavigate?: (screen: ActiveScreen) => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onVerifyScroll?: () => void;
  fontScale?: number;
  setFontScale?: (scale: number | ((prev: number) => number)) => void;
  language?: 'en' | 'hi';
  setLanguage?: (lang: 'en' | 'hi') => void;

  // Authenticated App props
  currentView?: NavigationView;
  onSelectView?: (view: NavigationView) => void;
  onToggleSidebar?: () => void;
  onEmergencyAudit?: () => void;
  userSession?: UserSession;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  onNavigate,
  onOpenLogin,
  onOpenRegister,
  onVerifyScroll,
  fontScale = 1,
  setFontScale,
  language = 'en',
  setLanguage,
  currentView,
  onSelectView,
  onToggleSidebar,
  onEmergencyAudit,
  userSession,
  onLogout
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If activeScreen is passed or onOpenLogin/onOpenRegister is passed and no userSession, render Institutional Landing Header
  const isLandingHeader = Boolean(activeScreen || (onOpenLogin && !userSession));

  if (isLandingHeader) {
    return (
      <header className="sticky top-0 z-40 w-full bg-white border-b border-[#cbd5e1] shadow-xs">
        {/* Top Institutional Government Ribbon */}
        <div className="w-full bg-[#0c2340] text-gray-200 text-[11px] py-1.5 border-b border-[#1a385f]">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-white truncate">
                भारत सरकार • Government of India
              </span>
              <span className="hidden md:inline text-gray-400">|</span>
              <span className="hidden md:inline text-gray-300 truncate">
                Ministry of Consumer Affairs, Food &amp; Public Distribution
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-xs">
              {/* Accessibility Font Size Scaling */}
              {setFontScale && (
                <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-[10px]">
                  <button
                    onClick={() => setFontScale((p) => Math.max(0.9, p - 0.05))}
                    className="hover:text-emerald-400 font-bold px-1"
                    title="Decrease Font Size"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontScale(1)}
                    className="hover:text-emerald-400 font-bold px-1"
                    title="Reset Font Size"
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontScale((p) => Math.min(1.15, p + 0.05))}
                    className="hover:text-emerald-400 font-bold px-1"
                    title="Increase Font Size"
                  >
                    A+
                  </button>
                </div>
              )}

              {/* Language Selector */}
              {setLanguage && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-1 text-[11px] font-bold ${
                      language === 'en' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <span>/</span>
                  <button
                    onClick={() => setLanguage('hi')}
                    className={`px-1 text-[11px] font-bold ${
                      language === 'hi' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation Bar - Perfect 1:1 Aspect Ratio Alignment */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 lg:gap-4 xl:gap-6">
          {/* Brand Emblem - Slid to Left Corner */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className="text-left flex items-center gap-2 focus:outline-none"
            >
              <EverimetLogo variant="brand" size="md" />
            </button>
          </div>

          {/* Desktop Nav Links with Proportional Responsive Spacing */}
          <nav className="hidden lg:flex items-center gap-2 lg:gap-3 xl:gap-6 2xl:gap-8 text-xs xl:text-sm font-semibold text-[#0c2340]">
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className={`transition-all duration-200 px-2.5 py-1.5 rounded-lg hover:text-[#0f766e] hover:bg-[#edf7f6] whitespace-nowrap ${
                activeScreen === 'home'
                  ? 'text-[#0f766e] font-bold bg-[#edf7f6] border-b-2 border-[#0f766e]'
                  : 'text-[#0c2340]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate && onNavigate('about-legal-metrology')}
              className={`transition-all duration-200 px-2.5 py-1.5 rounded-lg hover:text-[#0f766e] hover:bg-[#edf7f6] whitespace-nowrap ${
                activeScreen === 'about-legal-metrology'
                  ? 'text-[#0f766e] font-bold bg-[#edf7f6] border-b-2 border-[#0f766e]'
                  : 'text-[#0c2340]'
              }`}
            >
              About Legal Metrology
            </button>
            <button
              onClick={() => onNavigate && onNavigate('services-and-licenses')}
              className={`transition-all duration-200 px-2.5 py-1.5 rounded-lg hover:text-[#0f766e] hover:bg-[#edf7f6] whitespace-nowrap ${
                activeScreen === 'services-and-licenses'
                  ? 'text-[#0f766e] font-bold bg-[#edf7f6] border-b-2 border-[#0f766e]'
                  : 'text-[#0c2340]'
              }`}
            >
              Services &amp; Licenses
            </button>
            <button
              onClick={() => onNavigate && onNavigate('verification-process')}
              className={`transition-all duration-200 px-2.5 py-1.5 rounded-lg hover:text-[#0f766e] hover:bg-[#edf7f6] whitespace-nowrap ${
                activeScreen === 'verification-process'
                  ? 'text-[#0f766e] font-bold bg-[#edf7f6] border-b-2 border-[#0f766e]'
                  : 'text-[#0c2340]'
              }`}
            >
              Verification Process
            </button>
            <button
              onClick={() => onNavigate && onNavigate('contact-and-helpdesk')}
              className={`transition-all duration-200 px-2.5 py-1.5 rounded-lg hover:text-[#0f766e] hover:bg-[#edf7f6] whitespace-nowrap ${
                activeScreen === 'contact-and-helpdesk'
                  ? 'text-[#0f766e] font-bold bg-[#edf7f6] border-b-2 border-[#0f766e]'
                  : 'text-[#0c2340]'
              }`}
            >
              Contact &amp; Helpdesk
            </button>
          </nav>

          {/* Action CTAs: Compact, perfectly aligned with right corner ratio */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {onVerifyScroll && (
              <button
                onClick={onVerifyScroll}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#0c2340] bg-[#f0f7ff] border border-[#cbd5e1] hover:bg-[#e0f0fe] transition-colors whitespace-nowrap"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify Certificate</span>
              </button>
            )}

            {/* Register Button */}
            {onOpenRegister && (
              <button
                onClick={onOpenRegister}
                className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] transition-all shadow-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                title="Open Registration Page"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            )}

            {/* Login Button */}
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-bold text-white bg-[#0c2340] hover:bg-[#153a66] transition-all shadow-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                title="Open Login Page"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Login</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2 text-xs font-semibold text-[#0c2340]">
            <button
              onClick={() => {
                if (onNavigate) onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 border-b border-gray-100"
            >
              Home
            </button>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('about-legal-metrology');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 border-b border-gray-100"
            >
              About Legal Metrology
            </button>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('services-and-licenses');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 border-b border-gray-100"
            >
              Services &amp; Licenses
            </button>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('verification-process');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 border-b border-gray-100"
            >
              Verification Process
            </button>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('contact-and-helpdesk');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 border-b border-gray-100"
            >
              Contact &amp; Helpdesk
            </button>
            {onVerifyScroll && (
              <button
                onClick={() => {
                  onVerifyScroll();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-emerald-700 font-bold"
              >
                Verify Certificate
              </button>
            )}
          </div>
        )}
      </header>
    );
  }

  // Dashboard Authenticated Header
  const getRoleIcon = () => {
    if (userSession?.role === 'officer') return <UserCheck className="w-3.5 h-3.5 text-[#16a34a]" />;
    if (userSession?.role === 'business') return <Building2 className="w-3.5 h-3.5 text-[#16a34a]" />;
    return <Users className="w-3.5 h-3.5 text-[#16a34a]" />;
  };

  const getRoleInitials = () => {
    if (!userSession?.name) {
      if (userSession?.role === 'officer') return 'LM';
      if (userSession?.role === 'business') return 'AP';
      return 'CZ';
    }
    const parts = userSession.name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/96 backdrop-blur-md border-b border-[#cbd5e1] shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
        {/* Left: Mobile Toggle & Brand Identity (Visible on mobile only; desktop branding is in the fixed Sidebar) */}
        <div className="flex items-center gap-3 md:gap-6 min-w-0 lg:hidden">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-[#4e6073] hover:text-[#0c2340] hover:bg-[#f0f7ff] rounded-lg transition-colors"
              title="Toggle Menu"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <EverimetLogo variant="brand" size="md" />
        </div>
        <div className="hidden lg:block" />

        {/* Right Action Rail */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency Audit Button */}
          {onEmergencyAudit && (
            <button
              onClick={onEmergencyAudit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#a16207] hover:bg-[#854d0e] transition-colors shadow-2xs active:scale-95"
              title="Trigger Emergency Regulatory Audit"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Emergency Audit</span>
            </button>
          )}

          {/* User Account / Sign Out Section */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#cbd5e1] text-left hover:opacity-90 transition-opacity"
              title="User Account Menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#eef8f1] border border-[#c6edd0] flex items-center justify-center font-bold text-xs text-[#15803d]">
                {getRoleInitials()}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#0c2340] leading-none truncate max-w-[130px]">
                  {userSession?.name || 'Authorized User'}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 capitalize">
                  {userSession?.role === 'officer'
                    ? 'Metrology Officer'
                    : userSession?.role === 'business'
                    ? 'Trader / Importer'
                    : 'Citizen (Consumer)'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-500 hidden md:block" />
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#d8e4f1] p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="font-bold text-[#0c2340] leading-tight">
                    {userSession?.name || 'Current User'}
                  </div>
                  <div className="text-[10px] font-mono text-[#16a34a] mt-0.5">
                    {userSession?.identifier || 'STATUTORY-ID'}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 capitalize flex items-center gap-1">
                    {getRoleIcon()}
                    <span>{userSession?.roleLabel || 'Standard Access'}</span>
                  </div>
                </div>

                {onSelectView && (
                  <div className="py-1">
                    <button
                      onClick={() => onSelectView('public-qr')}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 rounded-lg text-gray-700 flex items-center gap-2"
                    >
                      <QrCode className="w-3.5 h-3.5 text-gray-500" />
                      <span>Public Verification</span>
                    </button>
                  </div>
                )}

                {onLogout && (
                  <div className="pt-1 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsLoggingOut(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-red-600 hover:bg-red-50 font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / Return to Home</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <LogoutOverlay
        isOpen={isLoggingOut}
        userName={userSession?.name || 'Authorized User'}
        userRole={userSession?.roleLabel || 'Statutory Official'}
        onComplete={() => {
          setIsLoggingOut(false);
          if (onLogout) onLogout();
        }}
      />
    </header>
  );
};
