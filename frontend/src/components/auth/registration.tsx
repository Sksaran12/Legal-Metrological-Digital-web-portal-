import React, { useState, useRef, useEffect } from 'react';
import {
  Scale,
  ShieldCheck,
  Lock,
  UserCheck,
  Building2,
  ArrowRight,
  Mail,
  User,
  Phone,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  ChevronDown,
  CheckCircle2,
  LogIn,
  Briefcase
} from 'lucide-react';
import { UserRole } from '../../types';
import { EverimetLogo } from '../common/EverimetLogo';
import { apiClient } from '../../services/apiClient';

interface RegistrationProps {
  onRegisterSuccess?: (registeredData: {
    name: string;
    email: string;
    role: UserRole;
    branch?: string;
    phone: string;
    state: string;
    dob: string;
    gender: string;
  }) => void;
  onNavigateToLogin?: () => void;
  onNavigateToHome?: () => void;
  showToast: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

// 28 States and 8 Union Territories of India
const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

export const Registration: React.FC<RegistrationProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
  onNavigateToHome,
  showToast
}) => {
  // Role Menu State
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Form Field States
  const [fullName, setFullName] = useState('');
  const [enterpriseName, setEnterpriseName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // Date of Birth 3 Dropdowns
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  // Gender Dropdown
  const [gender, setGender] = useState('');

  // Security Credentials
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Post-registration confirmation view
  const [isRegistered, setIsRegistered] = useState(false);

  // Close role dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setIsRoleDropdownOpen(false);
    if (role !== 'officer') {
      setSelectedBranch('');
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      showToast('Role Required', 'Please select your role from the dropdown menu.', 'warning');
      setIsRoleDropdownOpen(true);
      return;
    }

    if (selectedRole === 'officer' && !selectedBranch) {
      showToast('Branch Required', 'Please select your branch for the Officer designation.', 'warning');
      return;
    }

    if (!fullName.trim()) {
      showToast('Name Required', 'Please enter your full name.', 'warning');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      showToast('Valid Email Required', 'Please enter a valid email address.', 'warning');
      return;
    }

    if (!selectedState) {
      showToast('State Required', 'Please select your Indian State or Union Territory.', 'warning');
      return;
    }

    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, '').length < 10) {
      showToast('Mobile Number Required', 'Please enter a valid 10-digit mobile number.', 'warning');
      return;
    }

    if (!dobDay || !dobMonth || !dobYear) {
      showToast('DOB Incomplete', 'Please select Day, Month, and Year for Date of Birth.', 'warning');
      return;
    }

    if (!gender) {
      showToast('Gender Required', 'Please select your gender (Male or Female).', 'warning');
      return;
    }

    if (!password || password.length < 8) {
      showToast('Password Short', 'Password must be at least 8 characters in length.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Password Mismatch', 'Password and Confirm Password do not match.', 'error');
      return;
    }

    const formattedDob = `${dobDay}/${dobMonth}/${dobYear}`;

    const computedEnterprise = enterpriseName.trim() || `${fullName} Enterprise & Scales Ltd.`;

    try {
      const res = await apiClient.register({
        name: fullName,
        email: email,
        password: password,
        role: selectedRole,
        phone: mobileNumber,
        state: selectedState,
        dob: formattedDob,
        gender: gender,
        enterpriseName: computedEnterprise,
        branch: selectedRole === 'officer' ? selectedBranch : undefined
      });

      if (res && res.success === false) {
        showToast('Registration Error', res.message || 'Registration failed.', 'error');
        return;
      }

      if (res?.pendingApproval) {
        setIsRegistered(true);
        showToast(
          'Registration Pending Verification',
          res.message || 'An administrator must verify and activate this account before login.',
          'info'
        );
        return;
      }

      // Registration succeeded
      setIsRegistered(true);
      showToast(
        'Account Created & Persisted to Database',
        `Welcome ${fullName}. Registered as ${selectedRole.toUpperCase()} under Legal Metrology Portal. Secure session created.`,
        'success'
      );

      if (onRegisterSuccess) {
        onRegisterSuccess({
          name: fullName,
          email: email,
          role: selectedRole,
          branch: selectedRole === 'officer' ? selectedBranch : undefined,
          phone: mobileNumber,
          state: selectedState,
          dob: formattedDob,
          gender: gender
        });
      }
    } catch (err: any) {
      const message = err instanceof TypeError && err.message === 'Failed to fetch'
        ? 'Backend connection failed. Check the Render service URL, CORS_ORIGIN, and that the Render service is running.'
        : err?.message || 'Could not connect to backend server.';
      showToast('Registration Exception', message, 'error');
    }
  };

  // Generate Day options 1 to 31
  const days = Array.from({ length: 31 }, (_, i) => {
    const dayVal = (i + 1).toString().padStart(2, '0');
    return dayVal;
  });

  // Generate Year options from current year minus 16 down to 1940
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 75 }, (_, i) => (currentYear - 16 - i).toString());

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center items-center py-10 px-4 sm:px-6 selection:bg-emerald-100 selection:text-emerald-950">
      <div className="max-w-xl w-full space-y-6">
        {onNavigateToHome && (
          <div className="flex items-center justify-between pb-2">
            <button
              onClick={onNavigateToHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0c2340] hover:text-[#16a34a] transition-colors px-3 py-1.5 rounded-xl bg-white border border-[#d8e4f1] shadow-2xs hover:bg-[#f0f7ff]"
            >
              <span>← Back to Portal Home</span>
            </button>
            {onNavigateToLogin && (
              <button
                onClick={onNavigateToLogin}
                className="text-xs font-bold text-[#16a34a] hover:underline"
              >
                Sign In Instead
              </button>
            )}
          </div>
        )}

        {/* National Crest & Portal Identity */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <EverimetLogo variant="icon" size="lg" className="p-2.5 bg-white shadow-md border border-[#d8e4f1] rounded-2xl" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#eef8f1] text-[#15803d] border border-[#c6edd0] mb-1.5">
              Government of India • Ministry of Consumer Affairs
            </span>
            <div className="text-xs font-bold text-[#0c2340]/70 uppercase tracking-widest mb-0.5">
              <span className="text-[#16a34a]">e</span>-VeriMet Portal Registration
            </div>
            {/* Top requested title */}
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0c2340] tracking-tight">
              Create your account
            </h1>
            {/* Top requested subtitle */}
            <p className="text-xs sm:text-sm text-[#4e6073] max-w-sm mx-auto mt-1">
              register with email id and mobile number
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-[#d8e4f1] p-6 sm:p-8 shadow-sm">
          {isRegistered ? (
            <div className="space-y-5 py-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-[#0c2340]">Registration Successful!</h2>
                <p className="text-xs text-[#4e6073] max-w-md mx-auto">
                  Your profile has been registered in the National Legal Metrology portal for{' '}
                  <strong className="text-[#0c2340]">{fullName}</strong> ({email}) as a{' '}
                  <strong className="capitalize text-[#16a34a]">{selectedRole}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#d8e4f1] text-left text-xs space-y-1.5 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-gray-500">Designation:</span>
                  <span className="font-bold capitalize text-[#0c2340]">{selectedRole}</span>
                </div>
                {selectedRole === 'officer' && selectedBranch && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Branch:</span>
                    <span className="font-semibold uppercase text-[#16a34a]">{selectedBranch}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">State / UT:</span>
                  <span className="font-semibold text-[#0c2340]">{selectedState}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mobile:</span>
                  <span className="font-semibold text-[#0c2340]">{mobileNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gender:</span>
                  <span className="font-semibold text-[#0c2340]">{gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">DOB:</span>
                  <span className="font-semibold text-[#0c2340]">{`${dobDay}/${dobMonth}/${dobYear}`}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="w-full py-3 px-4 rounded-xl bg-[#0c2340] hover:bg-[#153a66] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Proceed to Login</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
              {/* 1. Select Your Role Menu */}
              <div className="space-y-1" ref={roleDropdownRef}>
                <label className="block text-xs font-bold text-[#0c2340]">
                  Role Designation *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer shadow-2xs text-left ${
                      isRoleDropdownOpen
                        ? 'border-[#16a34a] ring-2 ring-[#16a34a]/20 bg-white text-[#0c2340]'
                        : selectedRole
                        ? 'border-[#d8e4f1] bg-[#fdfdfd] hover:bg-white text-[#0c2340]'
                        : 'border-[#d8e4f1] bg-[#fdfdfd] hover:bg-white text-gray-500 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-[#16a34a] shrink-0">
                        {selectedRole === 'owner' ? (
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
                          : selectedRole === 'administrator'
                          ? '2. Administrator'
                          : selectedRole === 'officer'
                          ? '3. Officer'
                          : 'Select your role'}
                      </span>
                    </div>

                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-500">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isRoleDropdownOpen ? 'rotate-180 text-[#16a34a]' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Dropdown list appearing on click */}
                  {isRoleDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-[#d8e4f1] shadow-xl z-30 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                        Available Roles
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRoleSelect('owner')}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-[#eef8f1] hover:text-[#16a34a] transition-colors cursor-pointer ${
                          selectedRole === 'owner'
                            ? 'bg-[#eef8f1] text-[#15803d] font-bold'
                            : 'text-[#0c2340]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-[#16a34a]" />
                          <span>1. Owner</span>
                        </div>
                        {selectedRole === 'owner' && (
                          <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleSelect('administrator')}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-[#eef8f1] hover:text-[#16a34a] transition-colors cursor-pointer ${
                          selectedRole === 'administrator' ? 'bg-[#eef8f1] text-[#15803d] font-bold' : 'text-[#0c2340]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                          <span>2. Administrator (Approval Required)</span>
                        </div>
                        {selectedRole === 'administrator' && <span className="w-2 h-2 rounded-full bg-[#16a34a]" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleSelect('officer')}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-[#eef8f1] hover:text-[#16a34a] transition-colors cursor-pointer ${
                          selectedRole === 'officer' ? 'bg-[#eef8f1] text-[#15803d] font-bold' : 'text-[#0c2340]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <UserCheck className="w-4 h-4 text-[#16a34a]" />
                          <span>3. Officer / LMO (Approval Required)</span>
                        </div>
                        {selectedRole === 'officer' && <span className="w-2 h-2 rounded-full bg-[#16a34a]" />}
                      </button>

                      <div className="px-4 py-2 text-[11px] text-amber-700 bg-amber-50 border-t border-amber-100">
                        Administrator and LMO registrations remain pending until verified and activated by an existing administrator.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Branch Dropdown for Officer Role */}
              {selectedRole === 'officer' && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <label htmlFor="reg-branch" className="block text-xs font-bold text-[#0c2340]">
                    Select Branch *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16a34a] pointer-events-none" />
                    <select
                      id="reg-branch"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>
                        Select Branch
                      </option>
                      <option value="manufacturer">Manufacturer</option>
                      <option value="dealer">Dealer</option>
                      <option value="repairer">Repairer</option>
                      <option value="importer">Importer</option>
                      <option value="lmo">LMO</option>
                      <option value="gatc">GATC</option>
                    </select>
                    <ChevronDown className="w-4 h-4 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
              )}

              {/* 2. Details of Full Name */}
              <div className="space-y-1">
                <label htmlFor="reg-full-name" className="block text-xs font-bold text-[#0c2340]">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reg-full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name as per official ID"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Enterprise / Manufacturer Business Name */}
              <div className="space-y-1">
                <label htmlFor="reg-enterprise-name" className="block text-xs font-bold text-[#0c2340]">
                  Enterprise / Manufacturer Name (Optional)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16a34a]" />
                  <input
                    id="reg-enterprise-name"
                    type="text"
                    value={enterpriseName}
                    onChange={(e) => setEnterpriseName(e.target.value)}
                    placeholder="e.g. Sharma Scale Works & Metrology Solutions"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors"
                  />
                </div>
              </div>

              {/* 3. Details of Email */}
              <div className="space-y-1">
                <label htmlFor="reg-email" className="block text-xs font-bold text-[#0c2340]">
                  Email ID *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@domain.com"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* 4. Drop Down Menu to Select Indian States */}
              <div className="space-y-1">
                <label htmlFor="reg-state" className="block text-xs font-bold text-[#0c2340]">
                  State / Union Territory *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    id="reg-state"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>
                      Select your Indian State / UT
                    </option>
                    {INDIAN_STATES_AND_UTS.map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              {/* 5. Mobile Number */}
              <div className="space-y-1">
                <label htmlFor="reg-mobile" className="block text-xs font-bold text-[#0c2340]">
                  Mobile Number *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-gray-600 pointer-events-none">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>+91</span>
                  </div>
                  <input
                    id="reg-mobile"
                    type="tel"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-16 pr-3.5 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* 6. Three Drop Down Menus Side by Side to Select DOB */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0c2340]">
                  Date of Birth (DOB) *
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {/* Dropdown 1: Day */}
                  <div className="relative">
                    <select
                      value={dobDay}
                      onChange={(e) => setDobDay(e.target.value)}
                      className="w-full pl-3 pr-7 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>
                        Day
                      </option>
                      {days.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>

                  {/* Dropdown 2: Month */}
                  <div className="relative">
                    <select
                      value={dobMonth}
                      onChange={(e) => setDobMonth(e.target.value)}
                      className="w-full pl-3 pr-7 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>
                        Month
                      </option>
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>

                  {/* Dropdown 3: Year */}
                  <div className="relative">
                    <select
                      value={dobYear}
                      onChange={(e) => setDobYear(e.target.value)}
                      className="w-full pl-3 pr-7 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>
                        Year
                      </option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* 7. Drop Down Menu to Select Genders: Male and Female */}
              <div className="space-y-1">
                <label htmlFor="reg-gender" className="block text-xs font-bold text-[#0c2340]">
                  Gender *
                </label>
                <div className="relative">
                  <select
                    id="reg-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Transgender</option>
                  </select>
                  <ChevronDown className="w-4 h-4 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              {/* 8. Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label htmlFor="reg-password" className="block text-xs font-bold text-[#0c2340]">
                    Create Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-confirm-password" className="block text-xs font-bold text-[#0c2340]">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#0c2340] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-4 active:scale-[0.99] cursor-pointer"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Switch to Login Link */}
              {onNavigateToLogin && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="text-xs font-semibold text-[#4e6073] hover:text-[#16a34a] transition-colors cursor-pointer"
                  >
                    Already have an account? <span className="text-[#16a34a] font-bold underline">Login here</span>
                  </button>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer help note */}
        <p className="text-center text-[11px] text-gray-500">
          Need assistance with registration? Contact National Legal Metrology Helpdesk at{' '}
          <span className="font-semibold text-gray-700">1800-11-4000</span> or{' '}
          <span className="underline cursor-pointer">dlm-support@nic.in</span>
        </p>
      </div>
    </div>
  );
};

export default Registration;
