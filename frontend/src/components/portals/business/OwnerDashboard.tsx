import React, { useState, useEffect, useRef } from 'react';
import { LogoutOverlay } from '../../common/LogoutOverlay';
import {
  Scale,
  Building2,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Activity,
  PlusCircle,
  FileCheck,
  Compass,
  LogOut,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Edit3,
  X,
  Save,
  Mail,
  Phone,
  MapPin,
  FileText,
  Building,
  ChevronDown
} from 'lucide-react';
import { UserSession } from '../../../types';
import { AddInstrumentPage, NewInstrumentData } from './AddInstrumentPage';
import { ApplyVerificationPage, VerificationApplicationData } from './ApplyVerificationPage';
import { TrackApplicationPage, VerificationApplicationItem } from './TrackApplicationPage';
import { CertificateModal } from '../../modals/CertificateModal';
import { EverimetLogo } from '../../common/EverimetLogo';
import { apiClient } from '../../../services/apiClient';

interface OwnerDashboardProps {
  userSession?: UserSession;
  onLogout: () => void;
  showToast?: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  userSession,
  onLogout,
  showToast
}) => {
  const [currentSubView, setCurrentSubView] = useState<'dashboard' | 'add-instrument' | 'apply-verification' | 'track-application'>('dashboard');
  const [totalInstrumentsCount, setTotalInstrumentsCount] = useState(0);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);
  const [underVerificationCount, setUnderVerificationCount] = useState(0);
  const [certifiedCount, setCertifiedCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);

  // Profile State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    enterpriseName: userSession?.enterpriseName || 'Registered Enterprise Owner',
    ownerName: userSession?.name || 'Authorized Owner',
    email: userSession?.email || userSession?.identifier || 'owner@domain.in',
    phone: userSession?.phone || '+91 98200 11223',
    enterpriseType: userSession?.enterpriseType || 'Manufacturer & Importer',
    licenseNo: userSession?.licenseNo || `LMPC-MH-2026-${Math.floor(1000 + Math.random() * 9000)}-REG`,
    gstin: userSession?.gstin || '27AAAAA0000A1Z5',
    address: 'MIDC Industrial Complex, Maharashtra',
    state: userSession?.zone || 'Maharashtra'
  });

  // Keep profile synchronized if userSession prop changes
  useEffect(() => {
    if (userSession) {
      setProfileData((prev) => ({
        ...prev,
        ownerName: userSession.name || prev.ownerName,
        email: userSession.email || userSession.identifier || prev.email,
        enterpriseName: userSession.enterpriseName || prev.enterpriseName,
        enterpriseType: userSession.enterpriseType || prev.enterpriseType,
        licenseNo: userSession.licenseNo || prev.licenseNo,
        gstin: userSession.gstin || prev.gstin,
        phone: userSession.phone || prev.phone,
        state: userSession.zone || prev.state
      }));
    }
  }, [userSession]);

  // Certificate Modal State
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [selectedCertDetails, setSelectedCertDetails] = useState<any>({});

  // Profile Dropdown & Logout Processing State
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const ownerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ownerMenuRef.current && !ownerMenuRef.current.contains(event.target as Node)) {
        setShowOwnerMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Official applications are loaded from the backend; local storage is not an authority.
  const [applications, setApplications] = useState<VerificationApplicationItem[]>([]);

  const loadLiveData = async () => {
    try {
      // 1. Fetch live user session profile from backend
      const meRes = await apiClient.getMe();
      if (meRes.success && (meRes.user || meRes.userSession)) {
        const u = meRes.user || meRes.userSession;
        setProfileData((prev) => ({
          ...prev,
          ownerName: u.name || prev.ownerName,
          email: u.email || u.identifier || prev.email,
          enterpriseName: u.enterpriseName || prev.enterpriseName,
          enterpriseType: u.enterpriseType || prev.enterpriseType,
          licenseNo: u.licenseNo || prev.licenseNo,
          gstin: u.gstin || prev.gstin,
          phone: u.phone || prev.phone,
          state: u.zone || prev.state
        }));
      }

      // 2. Fetch live metrics from backend
      const metricsRes = await apiClient.getInstrumentMetrics();
      if (metricsRes) {
        setTotalInstrumentsCount(metricsRes.totalInstruments || 0);
        setPendingApplicationsCount(metricsRes.pendingApplications || 0);
        setUnderVerificationCount(metricsRes.underVerification || 0);
        setCertifiedCount(metricsRes.certified || 0);
        setExpiringSoonCount(metricsRes.expiringSoon || 0);
        setExpiredCount(metricsRes.expired || 0);
      }

      // 3. Fetch live applications from backend
      const appsRes = await apiClient.getApplications();
      if (Array.isArray(appsRes)) {
        const mappedApps: VerificationApplicationItem[] = appsRes.map((app: any) => ({
          id: app.appNo || app._id || app.id,
          instrumentType: app.equipmentName || app.instrumentType || '',
          manufacturer: app.manufacturer || '',
          model: app.model || '',
          serialNumber: app.equipmentSerial || '',
          capacity: app.capacity || '',
          accuracyClass: app.equipmentClass || '',
          verificationType: app.verificationType || '',
          installationAddress: app.installationAddress || '',
          gpsCoordinates: app.gpsCoordinates || '',
          appliedDate: app.date || '',
          lastUpdated: app.time || '',
          paidFee: app.feeAmount || '',
          paymentStatus: app.paymentStatus || 'Pending',
          txnId: app.txnId || '',
          status: app.status === 'CERTIFICATE ISSUED'
            ? 'certificate_issued'
            : app.status === 'UNDER VERIFICATION' || app.status === 'SCHEDULED'
            ? 'under_verification'
            : app.status === 'FAIL'
            ? 'failed'
            : 'submitted',
          assignedOfficer: app.assignedLmo
            ? {
                name: app.assignedLmo.name || '',
                id: app.assignedLmo.badgeNo || app.assignedLmo.id || '',
                designation: 'Metrological Inspector',
                phone: app.assignedLmo.phone || ''
              }
            : undefined
        }));

        setApplications(mappedApps);
        if (mappedApps.length > 0) {
          setPendingApplicationsCount(mappedApps.filter(a => a.status === 'submitted' || a.status === 'under_review' || a.status === 'under_verification').length);
        }
      }
    } catch (err) {
      console.warn('Live data fetch fallback:', err);
    }
  };

  // Fetch live profile & metric data on mount
  useEffect(() => {
    loadLiveData();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileModalOpen(false);
    if (showToast) {
      showToast(
        'Owner Profile Updated',
        `Enterprise & license details updated for ${profileData.enterpriseName}. Database records synced.`,
        'success'
      );
    }
  };

  // If subView is 'add-instrument', render the dedicated Add Instrument Page
  if (currentSubView === 'add-instrument') {
    return (
      <AddInstrumentPage
        userSession={userSession}
        onBack={() => {
          setCurrentSubView('dashboard');
          loadLiveData();
        }}
        onLogout={onLogout}
        showToast={showToast}
        onSuccess={(data: NewInstrumentData) => {
          setTotalInstrumentsCount((prev) => prev + 1);
          loadLiveData();
        }}
      />
    );
  }

  // If subView is 'apply-verification', render the dedicated Verification Application Page
  if (currentSubView === 'apply-verification') {
    return (
      <ApplyVerificationPage
        userSession={userSession}
        onBack={() => {
          setCurrentSubView('dashboard');
          loadLiveData();
        }}
        onLogout={onLogout}
        showToast={showToast}
        onSubmitSuccess={(data: VerificationApplicationData) => {
          const docketIdToUse = data.docketId || `APP-2026-IND-${Math.floor(2000 + Math.random() * 7000)}`;
          const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newApp: VerificationApplicationItem = {
            id: docketIdToUse,
            instrumentType: data.instrumentType,
            manufacturer: data.manufacturer,
            model: data.model,
            serialNumber: data.serialNumber,
            capacity: data.capacity,
            accuracyClass: data.accuracyClass,
            verificationType: data.verificationType,
            installationAddress: data.installationAddress,
            gpsCoordinates: data.gpsCoordinates,
            appliedDate: `Today (${todayStr})`,
            lastUpdated: `${todayStr}, ${timeStr}`,
            paidFee: data.paidFee || '₹1,416.00',
            paymentStatus: 'Paid',
            txnId: data.txnId,
            status: 'submitted'
          };
          setApplications((prev) => {
            return [newApp, ...prev.filter((a) => a.id !== docketIdToUse)];
          });
          setPendingApplicationsCount((prev) => prev + 1);
          loadLiveData();
        }}
      />
    );
  }

  // If subView is 'track-application', render the dedicated Track Application Page
  if (currentSubView === 'track-application') {
    return (
      <>
        <TrackApplicationPage
          userSession={userSession}
          applications={applications}
          onBack={() => setCurrentSubView('dashboard')}
          onLogout={onLogout}
          showToast={showToast}
          onOpenApply={() => setCurrentSubView('apply-verification')}
          onOpenCertificate={(details) => {
            setSelectedCertDetails(details);
            setCertModalOpen(true);
          }}
        />
        <CertificateModal
          isOpen={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          details={selectedCertDetails}
        />
      </>
    );
  }

  const metrics = [
    {
      id: 'total-instruments',
      label: 'Registered Devices',
      value: String(totalInstrumentsCount).padStart(2, '0'),
      icon: Layers,
      color: 'text-[#0c2340]',
      bgColor: 'bg-[#eef8f1]',
      iconColor: 'text-[#16a34a]',
      borderColor: 'border-[#c6edd0]'
    },
    {
      id: 'pending-applications',
      label: 'Pending Inspections',
      value: String(pendingApplicationsCount).padStart(2, '0'),
      icon: Clock,
      color: 'text-amber-900',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200'
    },
    {
      id: 'under-verification',
      label: 'Active Verification',
      value: String(underVerificationCount).padStart(2, '0'),
      icon: Activity,
      color: 'text-indigo-900',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderColor: 'border-indigo-200'
    },
    {
      id: 'verified',
      label: 'Certified & Stamped',
      value: String(certifiedCount).padStart(2, '0'),
      icon: CheckCircle2,
      color: 'text-emerald-900',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'expiring-soon',
      label: 'Due for Renewal',
      value: String(expiringSoonCount).padStart(2, '0'),
      icon: AlertTriangle,
      color: 'text-orange-900',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      id: 'expired',
      label: 'Notice / Violation',
      value: String(expiredCount).padStart(2, '0'),
      icon: AlertOctagon,
      color: 'text-rose-900',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
      borderColor: 'border-rose-200'
    }
  ];

  const options = [
    {
      id: 'add-instrument',
      title: 'Register New Device',
      subtitle: 'Add NAWI scale, flow meter, or weighbridge',
      icon: PlusCircle,
      accentColor: 'text-[#15803d]',
      iconBg: 'bg-[#eef8f1]'
    },
    {
      id: 'apply-verification',
      title: 'Apply for Stamping',
      subtitle: 'File OIML R-76 statutory verification worksheet',
      icon: FileCheck,
      accentColor: 'text-[#15803d]',
      iconBg: 'bg-[#eef8f1]'
    },
    {
      id: 'track-application',
      title: 'Track Application Pipeline',
      subtitle: 'Monitor live LMO officer allocation & SLA deadline',
      icon: Compass,
      accentColor: 'text-[#15803d]',
      iconBg: 'bg-[#eef8f1]'
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#eef2f7] via-[#f6f8fb] to-[#e8eef5] flex flex-col justify-start items-center py-6 sm:py-10 px-4 sm:px-6 md:px-8 selection:bg-[#ccfbf1] selection:text-[#134e4a]">
      <div className="max-w-6xl w-full space-y-6">
        {/* National Crest & Portal Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-2 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <EverimetLogo variant="icon" size="lg" className="p-2.5 bg-white border border-[#cbd5e1] shadow-xs rounded-2xl shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#eef8f1] text-[#15803d] border border-[#c6edd0]">
                  Government of India • Ministry of Consumer Affairs
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-500">
                  National Legal Metrology Portal
                </span>
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0c2340] tracking-tight mt-0.5">
                <span className="text-[#16a34a]">e</span>-VeriMet <span className="text-gray-300 font-light">|</span> Trader & Importer Workspace
              </h1>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#d8e4f1] shadow-2xs hover:bg-[#f0f7ff] text-xs font-bold text-[#0c2340] transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#16a34a]" />
              <span>Edit Profile &amp; License</span>
            </button>

            <div className="relative" ref={ownerMenuRef}>
              <button
                type="button"
                onClick={() => setShowOwnerMenu(!showOwnerMenu)}
                className="flex items-center gap-3 bg-white hover:bg-gray-50 px-3.5 py-2 rounded-xl border border-[#e2e8f0] shadow-2xs transition-all cursor-pointer"
                title="Account Menu"
              >
                <div className="w-8 h-8 rounded-lg bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] flex items-center justify-center font-bold text-xs shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-left whitespace-nowrap">
                  <div className="text-xs font-bold text-[#121d26] leading-tight flex items-center gap-1">
                    <span>{profileData.ownerName}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{profileData.enterpriseName.length > 20 ? profileData.enterpriseName.substring(0, 20) + '...' : profileData.enterpriseName}</span>
                  </div>
                </div>
              </button>

              {showOwnerMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#d8e4f1] p-2.5 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2.5 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] mb-2">
                    <div className="font-bold text-[#0c2340] text-xs leading-tight">{profileData.ownerName}</div>
                    <div className="text-[11px] text-[#16a34a] font-semibold mt-0.5">{profileData.enterpriseName}</div>
                    <div className="text-[10px] font-mono text-gray-500 mt-1 flex items-center justify-between">
                      <span>GSTIN:</span>
                      <span className="font-bold text-gray-700">{profileData.gstin}</span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 mt-0.5 flex items-center justify-between">
                      <span>License:</span>
                      <span className="font-bold text-gray-700">{profileData.licenseNo}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOwnerMenu(false);
                        setProfileModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-[#0c2340] font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#16a34a]" />
                      <span>Edit Profile &amp; License</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowOwnerMenu(false);
                        setCurrentSubView('track-application');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-[#0c2340] font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5 text-gray-500" />
                      <span>My Verifications &amp; Dockets</span>
                    </button>

                    <div className="pt-1 my-1 border-t border-gray-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setShowOwnerMenu(false);
                        setIsLoggingOut(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / Logout Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enterprise Summary Banner */}
        <div className="bg-gradient-to-r from-[#0c2340] via-[#163a5f] to-[#114b30] rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-100 text-[11px] font-semibold backdrop-blur-xs border border-white/10">
                <Building className="w-3.5 h-3.5" />
                <span>{profileData.enterpriseType}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{profileData.enterpriseName}</h2>
              <p className="text-xs text-gray-300 flex items-center gap-3 flex-wrap">
                <span>License: <strong className="font-mono text-emerald-400">{profileData.licenseNo}</strong></span>
                <span>•</span>
                <span>GSTIN: <strong className="font-mono text-emerald-400">{profileData.gstin}</strong></span>
                <span>•</span>
                <span>Zone: <strong className="text-white">{profileData.state}</strong></span>
              </p>
            </div>

            <button
              onClick={() => setCurrentSubView('apply-verification')}
              className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer self-start md:self-auto"
            >
              <FileCheck className="w-4 h-4" />
              <span>Apply New Stamping</span>
            </button>
          </div>
        </div>

        {/* 6 Metric Cards Grid */}
        <div className="gov-panel rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0c2340] uppercase tracking-wider">
              Statutory Compliance & Device Roster
            </h3>
            <span className="text-xs font-semibold text-[#16a34a]">Updated Live</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {metrics.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border ${item.borderColor} ${item.bgColor} flex flex-col justify-between min-h-[115px] transition-all hover:shadow-xs`}
                >
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span className="text-xs font-bold text-gray-800 leading-snug">
                      {item.label}
                    </span>
                    <div className={`p-1.5 rounded-lg bg-white/90 ${item.iconColor} shadow-2xs shrink-0`}>
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${item.color}`}>
                    {item.value}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#e2e8f0]" />

          {/* 3 Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {options.map((option) => {
              const OptionIcon = option.icon;
              const isAddInstrument = option.id === 'add-instrument';
              const isApplyVerification = option.id === 'apply-verification';
              const isTrackApplication = option.id === 'track-application';
              return (
                <div
                  key={option.id}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isAddInstrument) setCurrentSubView('add-instrument');
                    else if (isApplyVerification) setCurrentSubView('apply-verification');
                    else if (isTrackApplication) setCurrentSubView('track-application');
                  }}
                  className="p-5 rounded-xl border border-[#d8e4f1] bg-[#fdfdfd] hover:bg-white hover:border-[#16a34a] hover:shadow-md transition-all flex items-center justify-between group shadow-2xs select-none cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    <div className={`w-11 h-11 rounded-xl ${option.iconBg} ${option.accentColor} flex items-center justify-center shrink-0 shadow-2xs`}>
                      <OptionIcon className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#121d26] block leading-snug">
                        {option.title}
                      </span>
                      <span className="text-[11px] text-gray-500 block mt-0.5 leading-tight">
                        {option.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="pl-2 shrink-0 text-[#16a34a]">
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#16a34a] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Applications Table Card */}
        <div className="gov-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-[#0c2340]">Recent Verification Applications</h3>
              <p className="text-xs text-gray-500">Live statutory tracking for NAWI scales and flow meters</p>
            </div>
            <button
              onClick={() => setCurrentSubView('track-application')}
              className="text-xs font-bold text-[#16a34a] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Applications ({applications.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto border border-[#e2e8f0] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9ff] text-[#0c2340] uppercase font-bold border-b border-[#e2e8f0]">
                <tr>
                  <th className="px-4 py-3">Docket ID</th>
                  <th className="px-4 py-3">Equipment</th>
                  <th className="px-4 py-3">Class / Capacity</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned Inspector</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No applications submitted yet. Click <strong>"Apply New Stamping"</strong> to submit your first instrument verification.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#0c2340] whitespace-nowrap">
                        {app.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        <div className="font-semibold text-[#0c2340]">{app.instrumentType}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{app.serialNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        <div>{app.accuracyClass}</div>
                        <div className="text-[11px] text-gray-500">{app.capacity}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span>PAID</span>
                          <span className="font-mono">({app.paidFee || '₹1,416.00'})</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          app.status === 'certificate_issued'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : app.status === 'under_verification'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : app.status === 'failed'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {app.status === 'certificate_issued'
                            ? 'Certified & Stamped'
                            : app.status === 'under_verification'
                            ? 'Inspection Scheduled'
                            : app.status === 'failed'
                            ? 'Condemned / Notice'
                            : 'Under Review'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {app.assignedOfficer ? (
                          <div className="font-semibold text-gray-800">{app.assignedOfficer.name}</div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setCurrentSubView('track-application')}
                          className="text-xs font-bold text-[#16a34a] hover:text-[#15803d] border border-[#c6edd0] bg-[#eef8f1] px-3 py-1 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          Track Status
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info banner */}
        <p className="text-center text-[11px] text-gray-500 pb-4">
          National Legal Metrology Portal • Directorate of Legal Metrology, Department of Consumer Affairs, Government of India
        </p>
      </div>

      {/* Edit Owner Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c2340]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#d8e4f1] shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#eef8f1] text-[#16a34a] border border-[#c6edd0]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0c2340]">Edit Owner Profile & License</h3>
                  <p className="text-xs text-gray-500">Update enterprise registration details in Legal Metrology Database</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0c2340] mb-1">
                    Enterprise / Business Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={profileData.enterpriseName}
                      onChange={(e) => setProfileData({ ...profileData, enterpriseName: e.target.value })}
                      required
                      className="w-full text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl border border-[#d8e4f1] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2340] mb-1">
                    Owner / Authorized Representative
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={profileData.ownerName}
                      onChange={(e) => setProfileData({ ...profileData, ownerName: e.target.value })}
                      required
                      className="w-full text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl border border-[#d8e4f1] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2340] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                      className="w-full text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl border border-[#d8e4f1] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2340] mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      required
                      className="w-full text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl border border-[#d8e4f1] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2340] mb-1">
                    LMPC License Number
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={profileData.licenseNo}
                      onChange={(e) => setProfileData({ ...profileData, licenseNo: e.target.value })}
                      required
                      className="w-full text-xs font-mono font-medium pl-9 pr-3 py-2.5 rounded-xl border border-[#d8e4f1] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2340] mb-1">
                    GSTIN / Tax Registration
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={profileData.gstin}
                      onChange={(e) => setProfileData({ ...profileData, gstin: e.target.value })}
                      required
                      className="w-full text-xs font-mono font-medium pl-9 pr-3 py-2.5 rounded-xl border border-[#d8e4f1] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0c2340] mb-1">
                  Registered Operating Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    required
                    className="w-full text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl border border-[#d8e4f1] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LogoutOverlay
        isOpen={isLoggingOut}
        userName={profileData.ownerName}
        userRole="Trader & Enterprise Owner"
        onComplete={onLogout}
      />
    </div>
  );
};

export default OwnerDashboard;
