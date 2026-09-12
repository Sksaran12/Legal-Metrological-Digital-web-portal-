import React, { useState, useRef, useEffect } from 'react';
import {
  Scale,
  ShieldCheck,
  Lock,
  UserCheck,
  Building2,
  ArrowRight,
  Mail,
  FileCheck2,
  Eye,
  EyeOff,
  ChevronDown,
  X,
  Send,
  CheckCircle2,
  HelpCircle,
  UserPlus,
  Phone,
  Briefcase
} from 'lucide-react';
import { NavigationView, UserRole } from '../../types';
import { EverimetLogo } from '../common/EverimetLogo';
import { apiClient } from '../../services/apiClient';
import { LoginSuccessOverlay } from '../common/LoginSuccessOverlay';
import { AuthErrorModal } from '../common/AuthErrorModal';

interface LoginGatewayProps {
  onLoginSuccess: (view: NavigationView, roleName: string, role: UserRole, sessionData?: any) => void;
  onNavigateToRegister?: () => void;
  onNavigateToHome?: () => void;
  initialEmail?: string;
  initialRole?: UserRole;
  showToast: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const LoginGateway: React.FC<LoginGatewayProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToHome,
  initialEmail = '',
  initialRole,
  showToast
}) => {
  // Designation Dropdown State
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>(initialRole || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form input states
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<{
    title: string;
    message: string;
    hint?: string;
  } | null>(null);
  const [loginSuccessData, setLoginSuccessData] = useState<{
    userName: string;
    userRole: string;
    targetView: NavigationView;
    activeRole: UserRole;
    sessionData: any;
  } | null>(null);
  const loginRedirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update email / role if initial props change
  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
    if (initialRole) setSelectedRole(initialRole);
  }, [initialEmail, initialRole]);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // New user registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('owner');
  const [regOrgId, setRegOrgId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (loginRedirectTimer.current) {
        clearTimeout(loginRedirectTimer.current);
      }
    };
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setIsDropdownOpen(false);
  };

  const handleApplyDemoAccount = (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setSelectedRole(demoRole);
    setPassword('Password123!');
    setAuthError(null);
    showToast('Demo Account Applied', `Loaded credentials for ${demoRole.toUpperCase()}. Click Authenticate to enter.`, 'info');
  };

  const handleSuccessOverlayComplete = () => {
    if (!loginSuccessData) return;
    const { targetView, userName, activeRole, sessionData } = loginSuccessData;
    showToast(
      'Login Completed',
      `Welcome ${userName}. Your secure session is active.`,
      'success'
    );
    onLoginSuccess(targetView, userName, activeRole, sessionData);
  };

  const executeLogin = async (role: UserRole) => {
    if (isAuthenticating) return;

    if (!email.trim() || !password.trim()) {
      setAuthError({
        title: 'Credentials Required',
        message: 'Please provide both your registered email ID and password to proceed.',
        hint: 'Both email and password fields are mandatory for statutory authentication in the National Metrology Gateway.'
      });
      showToast('Credentials Required', 'Please provide both your email ID and password.', 'error');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await apiClient.login({ email, password, role });

      if (!res || res.success === false || !res.userSession) {
        setAuthError({
          title: res?.pendingApproval ? 'Account Awaiting Approval' : 'Authentication Verification Failed',
          message: res?.message || 'Invalid email or password provided.',
          hint: res?.pendingApproval
            ? 'An active administrator must verify this account before it can access the administrator or officer dashboard.'
            : 'The credentials entered do not match any verified record in the National Metrology Database. Verify your selected role and password.'
        });
        showToast('Authentication Error', res?.message || 'Invalid email or password.', 'error');
        setIsAuthenticating(false);
        return;
      }

      let activeRole = (res?.userSession?.role || role) as UserRole;
      if (activeRole === ('admin' as any)) activeRole = 'administrator';

      const userName = res?.userSession?.name || email;
      const targetView: NavigationView =
        activeRole === 'owner' || activeRole === 'business'
          ? 'business-portal'
          : activeRole === 'administrator'
          ? 'admin-command'
          : activeRole === 'officer'
          ? 'lmo-portal'
          : 'public-qr';

      const roleDisplayLabel =
        res?.userSession?.roleLabel ||
        (activeRole === 'administrator'
          ? 'Statutory Administrator'
          : activeRole === 'officer'
          ? 'Legal Metrology Officer'
          : 'Commercial Establishment Owner');

      setIsAuthenticating(false);
      setLoginSuccessData({
        userName,
        userRole: roleDisplayLabel,
        targetView,
        activeRole,
        sessionData: res.userSession
      });
    } catch (err: any) {
      setIsAuthenticating(false);
      setAuthError({
        title: 'Authentication Service Unavailable',
        message: err?.message || 'The authentication service could not be reached.',
        hint: 'Please ensure your network connection is active and the legal metrology server is operational.'
      });
      showToast(
        'Authentication Unavailable',
        'The authentication service could not be reached. Please try again later.',
        'error'
      );
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      setAuthError({
        title: 'Designation Role Required',
        message: 'Please click the dropdown menu and select your designated role before signing in.',
        hint: 'Authentication requires choosing your statutory access level (Owner, Business, Administrator, or Officer).'
      });
      showToast('Designation Required', 'Please click the dropdown menu and select your role.', 'warning');
      setIsDropdownOpen(true);
      return;
    }

    executeLogin(selectedRole);
  };

  const handleSendRecoveryEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      showToast('Email Required', 'Please enter your registered email address.', 'warning');
      return;
    }
    setRecoverySent(true);
    showToast(
      'Password Reset Link Sent',
      `Instructions and a temporary security token have been emailed to ${recoveryEmail}.`,
      'success'
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      showToast('Incomplete Form', 'Please complete all mandatory registration fields.', 'warning');
      return;
    }
    setRegSuccess(true);
    showToast(
      'Registration Enrolled',
      `Profile registered for ${regName}. Your credentials have been staged for portal sign-in.`,
      'success'
    );
  };

  const handleApplyRegisteredCredentials = () => {
    setSelectedRole(regRole);
    setEmail(regEmail);
    setPassword(regPassword);
    setShowRegisterModal(false);
    setRegSuccess(false);
    showToast('Credentials Ready', 'Your newly registered credentials have been applied. Click Authenticate to enter.', 'info');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#eef2f7] via-[#f7f9fb] to-[#e8eef5] flex flex-col justify-center items-center py-10 px-4 sm:px-6 selection:bg-[#ccfbf1] selection:text-[#134e4a]">
      {/* Container Box */}
      <div className="max-w-md w-full space-y-6">
        {onNavigateToHome && (
          <div className="flex items-center justify-between pb-2">
            <button
              onClick={onNavigateToHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0c2340] hover:text-[#0f766e] transition-colors px-3 py-1.5 rounded-xl bg-white border border-[#cbd5e1] shadow-2xs hover:bg-[#edf7f6]"
            >
              <span>← Back to Portal Home</span>
            </button>
            {onNavigateToRegister && (
              <button
                onClick={onNavigateToRegister}
                className="text-xs font-bold text-[#0f766e] hover:underline"
              >
                Register Establishment
              </button>
            )}
          </div>
        )}

        {/* National Crest & Portal Identity */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <EverimetLogo variant="icon" size="xl" className="p-3 bg-white shadow-md border border-[#cbd5e1] rounded-2xl" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#eef8f1] text-[#15803d] border border-[#c6edd0] mb-1.5">
              Government of India • Ministry of Consumer Affairs
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#0c2340] tracking-tight flex items-center justify-center gap-1.5">
              <span className="text-[#0f766e]">e</span>-VeriMet
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#0c2340]/80 uppercase tracking-wider mt-1">
              Legal Metrology Verification &amp; Certification Portal
            </p>
            <p className="text-[11px] text-[#4e6073] max-w-sm mx-auto mt-1">
              Statutory Single Sign-On Gateway under Section 24 of The Legal Metrology Act, 2009
            </p>
          </div>
        </div>

        {/* Auth Main Card */}
        <div className="gov-panel rounded-2xl p-6 sm:p-8 space-y-5">
          {/* Designation Dropdown Menu */}
          <div ref={dropdownRef}>
            <div className="relative">
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer shadow-2xs text-left ${
                  isDropdownOpen
                    ? 'border-[#16a34a] ring-2 ring-[#16a34a]/20 bg-white text-[#0c2340]'
                    : selectedRole
                    ? 'border-[#cbd5e1] bg-[#fdfdfd] hover:bg-white text-[#0c2340]'
                    : 'border-[#cbd5e1] bg-[#fdfdfd] hover:bg-white text-gray-500 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-[#0f766e] shrink-0">
                    {selectedRole === 'owner' ? (
                      <Building2 className="w-4 h-4" />
                    ) : selectedRole === 'business' ? (
                      <Building2 className="w-4 h-4" />
                    ) : selectedRole === 'administrator' ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : selectedRole === 'officer' ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <Scale className="w-4 h-4 text-gray-400" />
                    )}
                  </span>
                  <span className="truncate">
                    {selectedRole === 'owner'
                      ? '1. Owner'
                      : selectedRole === 'business'
                      ? '2. Business'
                      : selectedRole === 'administrator'
                      ? '3. Administrator'
                      : selectedRole === 'officer'
                      ? '4. Officer'
                      : 'Select your role'}
                  </span>
                </div>

                <div
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-[#0f766e] transition-colors"
                  title="Click to display roles"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180 text-[#0f766e]' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Roles Dropdown List: Displayed ONLY after clicking the arrow/button */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-[#cbd5e1] shadow-xl z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    Available Roles
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('owner')}
                    className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-[#edf7f6] hover:text-[#0f766e] transition-colors cursor-pointer ${
                      selectedRole === 'owner'
                        ? 'bg-[#edf7f6] text-[#0f766e] font-bold'
                        : 'text-[#0c2340]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-[#0f766e]" />
                      <span>1. Owner</span>
                    </div>
                    {selectedRole === 'owner' && (
                      <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('business')}
                    className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-[#edf7f6] hover:text-[#0f766e] transition-colors cursor-pointer ${
                      selectedRole === 'business' ? 'bg-[#edf7f6] text-[#0f766e] font-bold' : 'text-[#0c2340]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-[#0f766e]" />
                      <span>2. Business</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('administrator')}
                    className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-[#edf7f6] hover:text-[#0f766e] transition-colors cursor-pointer ${
                      selectedRole === 'administrator'
                        ? 'bg-[#edf7f6] text-[#0f766e] font-bold'
                        : 'text-[#0c2340]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#0f766e]" />
                      <span>3. Administrator</span>
                    </div>
                    {selectedRole === 'administrator' && (
                      <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('officer')}
                    className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-[#edf7f6] hover:text-[#0f766e] transition-colors cursor-pointer ${
                      selectedRole === 'officer'
                        ? 'bg-[#edf7f6] text-[#0f766e] font-bold'
                        : 'text-[#0c2340]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-[#0f766e]" />
                      <span>4. Officer</span>
                    </div>
                    {selectedRole === 'officer' && (
                      <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Form Inputs */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
            {/* Enter Email ID */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-bold text-[#121d26]">
                Enter Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] transition-colors"
                  required
                />
              </div>

              {/* Option of "Not registered? Register Now" on the bottom right under Enter Email ID */}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToRegister) {
                      onNavigateToRegister();
                    } else {
                      setRegSuccess(false);
                      setShowRegisterModal(true);
                    }
                  }}
                  className="text-xs font-bold text-[#0f766e] hover:text-[#115e59] hover:underline transition-colors cursor-pointer"
                >
                  Not registered? Register Now
                </button>
              </div>
            </div>

            {/* Enter Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-bold text-[#0c2340]">
                Enter Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password option on the bottom right */}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryEmail(email);
                    setRecoverySent(false);
                    setShowForgotPassword(true);
                  }}
                  className="text-xs font-bold text-[#0f766e] hover:text-[#115e59] hover:underline transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 px-4 rounded-xl bg-[#0c2340] hover:bg-[#153a66] disabled:bg-[#64748b] disabled:cursor-wait text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-4 active:scale-[0.99] cursor-pointer"
            >
              {isAuthenticating ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer help note */}
        <p className="text-center text-[11px] text-gray-500">
          Need assistance with authentication? Contact National Legal Metrology Helpdesk at{' '}
          <span className="font-semibold text-gray-700">1800-11-4000</span> or{' '}
          <span className="underline cursor-pointer">dlm-support@nic.in</span>
        </p>
      </div>

      {/* New User Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="gov-panel rounded-2xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#eef8f1] text-[#15803d]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#0c2340]">
                    New User Registration
                  </h3>
                  <p className="text-xs text-[#4e6073]">National Legal Metrology Portal (e-Stamping)</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {regSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Registration Request Submitted</span>
                  </div>
                  <p className="leading-relaxed">
                    Account provisioned for <strong className="text-emerald-950">{regName}</strong> as a{' '}
                    <strong className="capitalize">{regRole}</strong>.
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Your verification record has been registered with the Legal Metrology Directorate. You can now use these credentials on the login screen.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleApplyRegisteredCredentials}
                    className="w-full py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#153a66] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Proceed to Login with Credentials</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Designation Selection in Registration */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0c2340]">
                    Select Designation / User Category *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('owner')}
                      className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        regRole === 'owner'
                          ? 'border-[#16a34a] bg-[#eef8f1] text-[#15803d]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Owner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('business')}
                      className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        regRole === 'business'
                          ? 'border-[#16a34a] bg-[#eef8f1] text-[#15803d]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Business</span>
                    </button>
                  </div>
                </div>

                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0c2340]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full px-3 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0c2340]">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0c2340]">
                    Email ID (Username) *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@organization.gov.in"
                      className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      required
                    />
                  </div>
                </div>

                {/* License No / Employee ID */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0c2340]">
                    {regRole === 'owner'
                      ? 'Trade / Manufacturer License No.'
                      : regRole === 'administrator'
                      ? 'Directorate Officer Code'
                      : 'LMO Inspector Badge / Emp ID'}
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={regOrgId}
                      onChange={(e) => setRegOrgId(e.target.value)}
                      placeholder={
                        regRole === 'owner'
                          ? 'e.g. MH-BOM-LIC-4491'
                          : 'e.g. DLM-INSP-2024-99'
                      }
                      className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0c2340]">
                    Create Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 8 characters with numbers"
                      className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      required
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#0c2340] bg-[#f0f7ff] border border-[#d8e4f1] hover:bg-[#e0f0fe] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#153a66] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register Account</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="gov-panel rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#eef8f1] text-[#15803d]">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#0c2340]">
                    Reset Account Password
                  </h3>
                  <p className="text-xs text-[#4e6073]">National Legal Metrology SSO Recovery</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {recoverySent ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Reset Link Dispatched</span>
                  </div>
                  <p className="leading-relaxed">
                    A secure password reset link has been dispatched to{' '}
                    <strong className="font-mono text-emerald-950">{recoveryEmail}</strong>. Please check your inbox and spam folder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#153a66] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendRecoveryEmail} className="space-y-4">
                <p className="text-xs text-[#4e6073] leading-relaxed">
                  Enter your registered email and we will send you a link to reset your password.
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0c2340]">
                    Registered Email ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="e.g. officer@legalmetrology.gov.in"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#0c2340] bg-[#f0f7ff] border border-[#d8e4f1] hover:bg-[#e0f0fe] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#153a66] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reset Link</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Statutory Login Success Overlay (Mirroring Logout Overlay style with step-by-step clearance) */}
      <LoginSuccessOverlay
        isOpen={!!loginSuccessData}
        userName={loginSuccessData?.userName}
        userRole={loginSuccessData?.userRole}
        onComplete={handleSuccessOverlayComplete}
      />

      {/* Prominent Statutory Auth Error Modal with Upper-Side/Center layout, Hover Diagnostics & Quick-Load Demo Accounts */}
      <AuthErrorModal
        isOpen={!!authError}
        errorTitle={authError?.title}
        errorMessage={authError?.message}
        errorHint={authError?.hint}
        onClose={() => setAuthError(null)}
        onApplyDemoAccount={handleApplyDemoAccount}
        onOpenForgotPassword={() => {
          setAuthError(null);
          setShowForgotPassword(true);
        }}
      />
    </div>
  );
};
