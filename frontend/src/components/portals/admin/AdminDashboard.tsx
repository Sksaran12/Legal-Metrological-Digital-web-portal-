import React, { useState, useMemo, useEffect, useRef } from 'react';
import { apiClient } from '../../../services/apiClient';
import { LogoutOverlay } from '../../common/LogoutOverlay';
import {
  NavScreen,
  SubPartItem,
  PipelineStage,
  ApplicationItem,
  LmoOfficer,
  GatcCentre,
  OwnerRegistrationItem,
  InstrumentItem,
  CertificateItem,
  AlertViolation
} from '../../../adminTypes';
import {
  ADMIN_SUBPARTS
} from '../../../data/adminMockData';
import { UserSession } from '../../../types';
import { EverimetLogo } from '../../common/EverimetLogo';
import { CertificateModal } from '../../modals/CertificateModal';
import { EmergencyAuditModal } from '../../modals/EmergencyAuditModal';
import { GatcSecondScheduleModal } from '../../modals/GatcSecondScheduleModal';
import { evaluateGatcEligibility, GATC_FIRST_SCHEDULE } from '../../../types/gatcTypes';
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Building,
  Scale,
  ClipboardCheck,
  Award,
  BarChart3,
  AlertOctagon,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  UserPlus,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  Shield,
  User,
  Settings,
  LogOut,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  X,
  ExternalLink,
  SlidersHorizontal,
  Flame,
  Check,
  TrendingUp,
  Cpu,
  Menu,
  Zap,
  Lock,
  Wrench,
  RotateCcw,
  FileCheck
} from 'lucide-react';

interface AdminDashboardProps {
  userSession?: UserSession;
  onLogout: () => void;
  showToast: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  userSession,
  onLogout,
  showToast
}) => {
  // Master Navigation Screen
  const [activeScreen, setActiveScreen] = useState<NavScreen>('dashboard-overview');
  const [activeSubPart, setActiveSubPart] = useState<string>('all');

  // Core Data Collections (Dynamically populated from backend MongoDB)
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [officers, setOfficers] = useState<LmoOfficer[]>([]);
  const [gatcCentres, setGatcCentres] = useState<GatcCentre[]>([]);
  const [ownerRegistrations, setOwnerRegistrations] = useState<OwnerRegistrationItem[]>([]);
  const [instruments, setInstruments] = useState<InstrumentItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [alerts, setAlerts] = useState<AlertViolation[]>([]);

  // Admin Profile State & Initials Helper
  const [adminProfile, setAdminProfile] = useState({
    name: userSession?.name || 'Administrator',
    roleLabel: userSession?.roleLabel || 'System Administrator',
    zone: userSession?.zone || 'State HQ',
    id: userSession?.identifier || 'DIR-ADMIN-01',
    email: 'admin@legalmetrology.gov.in'
  });

  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Fetch live backend data on mount
  useEffect(() => {
    async function loadAdminData() {
      try {
        const meRes = await apiClient.getMe();
        if (meRes.success && (meRes.user || meRes.userSession)) {
          const u = meRes.user || meRes.userSession;
          setAdminProfile((prev) => ({
            ...prev,
            name: u.name || userSession?.name || prev.name,
            roleLabel: u.roleLabel || userSession?.roleLabel || prev.roleLabel,
            zone: u.zone || userSession?.zone || prev.zone,
            id: u.identifier || u.id || prev.id,
            email: u.email || prev.email
          }));
        }

        const results = await Promise.allSettled([
          apiClient.getApplications(),
          apiClient.getOfficers(),
          apiClient.getGatcCentres(),
          apiClient.getCertificates(),
          apiClient.getAlerts(),
          apiClient.getStakeholders()
        ]);

        const [appsRes, officersRes, gatcRes, certsRes, alertsRes, stakeholdersRes] = results;
        if (appsRes.status === 'fulfilled' && Array.isArray(appsRes.value)) {
          setApplications(appsRes.value);
        }
        if (officersRes.status === 'fulfilled' && Array.isArray(officersRes.value)) {
          setOfficers(officersRes.value);
        }
        if (gatcRes.status === 'fulfilled' && Array.isArray(gatcRes.value)) {
          setGatcCentres(gatcRes.value);
        }
        if (certsRes.status === 'fulfilled' && Array.isArray(certsRes.value)) {
          setCertificates(certsRes.value as any);
        }
        if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value)) {
          setAlerts(alertsRes.value);
        }
        if (stakeholdersRes.status === 'fulfilled' && Array.isArray(stakeholdersRes.value)) {
          setOwnerRegistrations(stakeholdersRes.value);
        }
      } catch (err) {
        console.warn('Admin live data load fallback:', err);
      }
    }
    loadAdminData();
  }, []);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [selectedStageFilter, setSelectedStageFilter] = useState<PipelineStage | 'all'>('all');

  // Modals state
  const [emergencyAuditOpen, setEmergencyAuditOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [selectedCertData, setSelectedCertData] = useState<any>({});
  
  // Assign LMO / GATC modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [showGatcStatutoryModal, setShowGatcStatutoryModal] = useState(false);
  const [selectedAppForAssignment, setSelectedAppForAssignment] = useState<ApplicationItem | null>(null);
  const [assignTargetType, setAssignTargetType] = useState<'lmo' | 'gatc'>('lmo');
  const [selectedLmoId, setSelectedLmoId] = useState<string>('');
  const [selectedGatcId, setSelectedGatcId] = useState<string>('');
  const [scheduledInspectionDate, setScheduledInspectionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scheduledInspectionTime, setScheduledInspectionTime] = useState<string>('11:00 AM');

  // Application Details Drawer state
  const [detailModalApp, setDetailModalApp] = useState<ApplicationItem | null>(null);

  // Add New Inspector modal state
  const [addInspectorModalOpen, setAddInspectorModalOpen] = useState(false);
  const [newInspectorData, setNewInspectorData] = useState<{
    name: string;
    badgeNo: string;
    phone: string;
    email: string;
    zoneCode: string;
    status: 'Available' | 'On Site' | 'Transit';
  }>({
    name: '',
    badgeNo: '',
    phone: '+91 98200 ',
    email: '',
    zoneCode: 'Zone I - South Mumbai',
    status: 'Available'
  });

  const handleCreateInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInspectorData.name || !newInspectorData.badgeNo) {
      showToast('Validation Error', 'Inspector Name and Statutory Badge Number are required.', 'error');
      return;
    }

    try {
      const payload: LmoOfficer = {
        id: 'LMO-' + Date.now(),
        name: newInspectorData.name,
        badgeNo: newInspectorData.badgeNo,
        phone: newInspectorData.phone,
        email: newInspectorData.email,
        zoneCode: newInspectorData.zoneCode,
        zone: newInspectorData.zoneCode.split('-')[1]?.trim() || newInspectorData.zoneCode,
        status: newInspectorData.status,
        statusClass: newInspectorData.status === 'On Site' ? 'bg-[#eef8f1] text-[#15803d] border-[#c6edd0]' : 'bg-blue-50 text-blue-700 border-blue-200',
        avatar: newInspectorData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'LM',
        inspectionsToday: 0,
        completedThisMonth: 0,
        stampingCertsIssued: 0,
        currentLocation: newInspectorData.zoneCode
      };

      const res = await apiClient.createOfficer(payload as any);
      if (res.success && res.data) {
        const savedOfficer = { ...res.data, id: String(res.data.id || res.data._id || payload.badgeNo) };
        setOfficers(prev => [...prev, savedOfficer]);
        setSelectedLmoId(String(savedOfficer.id));
        showToast('Inspector Registered', `Officer ${newInspectorData.name} (${newInspectorData.badgeNo}) saved to database.`, 'success');
      } else {
        setOfficers(prev => [...prev, payload]);
        setSelectedLmoId(payload.id);
        showToast('Inspector Registered', `Officer ${newInspectorData.name} (${newInspectorData.badgeNo}) added to roster.`, 'success');
      }

      setAddInspectorModalOpen(false);
      setNewInspectorData({
        name: '',
        badgeNo: '',
        phone: '+91 98200 ',
        email: '',
        zoneCode: 'Zone I - South Mumbai',
        status: 'Available'
      });
    } catch (err: any) {
      showToast('Error Registering Inspector', err?.message || 'Failed to register officer.', 'error');
    }
  };

  // Search filter for LMO Officers in Assignment Modal
  const [officerSearchQuery, setOfficerSearchQuery] = useState('');

  // Regulated Commercial Owners Directory State & Actions
  const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
  const [ownerStatusFilter, setOwnerStatusFilter] = useState<string>('all');
  const [ownerCategoryFilter, setOwnerCategoryFilter] = useState<string>('all');
  const [selectedOwnerForDossier, setSelectedOwnerForDossier] = useState<OwnerRegistrationItem | null>(null);
  const [addOwnerModalOpen, setAddOwnerModalOpen] = useState(false);
  const [newOwnerData, setNewOwnerData] = useState<{
    enterpriseName: string;
    ownerName: string;
    enterpriseType: 'Manufacturer' | 'Importer' | 'Trader / Retailer' | 'Repairer' | 'Bulk Weighbridge Depot';
    licenseNo: string;
    zone: string;
    contactPhone: string;
    contactEmail: string;
    status: 'Active' | 'Pending Verification' | 'Notice Issued';
  }>({
    enterpriseName: '',
    ownerName: '',
    enterpriseType: 'Trader / Retailer',
    licenseNo: '',
    zone: 'Zone II (Mumbai Central)',
    contactPhone: '+91 98201 ',
    contactEmail: '',
    status: 'Pending Verification'
  });

  const handleApproveOwnerLicense = async (owner: OwnerRegistrationItem) => {
    try {
      const res = await apiClient.updateStakeholderStatus(owner.id, 'Active');
      if (res.success) {
        setOwnerRegistrations(prev =>
          prev.map(o => o.id === owner.id ? { ...o, status: 'Active', complianceScore: Math.max(o.complianceScore || 0, 95) } : o)
        );
        showToast('License Approved', `LMPC License for ${owner.enterpriseName} (${owner.licenseNo}) has been approved and issued.`, 'success');
        if (selectedOwnerForDossier && selectedOwnerForDossier.id === owner.id) {
          setSelectedOwnerForDossier(prev => prev ? { ...prev, status: 'Active' } : null);
        }
      } else {
        showToast('Approval Failed', res.message || 'Could not update status.', 'error');
      }
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to approve license.', 'error');
    }
  };

  const handleIssueNoticeToOwner = async (owner: OwnerRegistrationItem) => {
    try {
      const res = await apiClient.updateStakeholderStatus(owner.id, 'Notice Issued');
      if (res.success) {
        setOwnerRegistrations(prev =>
          prev.map(o => o.id === owner.id ? { ...o, status: 'Notice Issued' } : o)
        );
        showToast('Notice Served', `Regulatory statutory notice served to ${owner.enterpriseName}.`, 'warning');
        if (selectedOwnerForDossier && selectedOwnerForDossier.id === owner.id) {
          setSelectedOwnerForDossier(prev => prev ? { ...prev, status: 'Notice Issued' } : null);
        }
      }
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to issue notice.', 'error');
    }
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerData.enterpriseName || !newOwnerData.ownerName) {
      showToast('Validation Error', 'Enterprise Name and Owner Contact are required.', 'error');
      return;
    }
    const license = newOwnerData.licenseNo || `LMPC-MH-2026-${Math.floor(1000 + Math.random() * 9000)}-REG`;
    const payload: OwnerRegistrationItem = {
      id: 'OWN-' + Date.now(),
      registrationNo: `REG-MH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      enterpriseName: newOwnerData.enterpriseName,
      ownerName: newOwnerData.ownerName,
      enterpriseType: newOwnerData.enterpriseType,
      licenseNo: license,
      zone: newOwnerData.zone,
      registeredDevices: 0,
      complianceScore: 100,
      status: newOwnerData.status,
      contactPhone: newOwnerData.contactPhone,
      contactEmail: newOwnerData.contactEmail
    };

    try {
      const res = await apiClient.createStakeholder(payload);
      const saved = res.data ? { ...res.data, id: String(res.data.id || res.data._id || payload.id) } : payload;
      setOwnerRegistrations(prev => [saved, ...prev]);
      setAddOwnerModalOpen(false);
      showToast('Entity Registered', `${newOwnerData.enterpriseName} added with license ${license}.`, 'success');
      setNewOwnerData({
        enterpriseName: '',
        ownerName: '',
        enterpriseType: 'Trader / Retailer',
        licenseNo: '',
        zone: 'Zone II (Mumbai Central)',
        contactPhone: '+91 98201 ',
        contactEmail: '',
        status: 'Pending Verification'
      });
    } catch (err: any) {
      showToast('Registration Error', err?.message || 'Failed to register entity.', 'error');
    }
  };

  // Verification & Certificate Generation State
  const [activeCertTab, setActiveCertTab] = useState<'issued' | 'pending-verification'>('issued');
  const [certSearchQuery, setCertSearchQuery] = useState('');
  const [certStatusFilter, setCertStatusFilter] = useState('all');
  const [verificationModalApp, setVerificationModalApp] = useState<ApplicationItem | null>(null);
  const [verificationTestScenario, setVerificationTestScenario] = useState<'pass' | 'fail'>('pass');
  const [isSubmittingCert, setIsSubmittingCert] = useState(false);

  // Test Readings State
  const [repA, setRepA] = useState({ r1: 7500.5, r2: 7501.2, r3: 7500.8 });
  const [repB, setRepB] = useState({ r1: 15001.5, r2: 15002.1, r3: 15000.9 });
  const [ecc, setEcc] = useState({ p1: 3750.2, p2: 3751.1, p3: 3749.5, p4: 3750.8, p5: 3751.4 });

  const allowableMPE = 5.0; // kg for Class III
  const varA = useMemo(() => {
    const vals = [repA.r1, repA.r2, repA.r3];
    return Math.abs(Math.max(...vals) - Math.min(...vals));
  }, [repA]);

  const varB = useMemo(() => {
    const vals = [repB.r1, repB.r2, repB.r3];
    return Math.abs(Math.max(...vals) - Math.min(...vals));
  }, [repB]);

  const isRepeatabilityPass = varA <= allowableMPE && varB <= allowableMPE && (verificationTestScenario === 'pass' || varB <= allowableMPE);
  const isEccentricityPass = verificationTestScenario === 'pass';
  const isLinearityPass = verificationTestScenario === 'pass';
  const isMpePass = verificationTestScenario === 'pass';
  const canGenerateCert = isRepeatabilityPass && isEccentricityPass && isLinearityPass && isMpePass;

  const handleToggleVerificationScenario = (scenario: 'pass' | 'fail') => {
    setVerificationTestScenario(scenario);
    if (scenario === 'pass') {
      setRepA({ r1: 7500.5, r2: 7501.2, r3: 7500.8 });
      setRepB({ r1: 15001.5, r2: 15002.1, r3: 15000.9 });
      setEcc({ p1: 3750.2, p2: 3751.1, p3: 3749.5, p4: 3750.8, p5: 3751.4 });
      showToast('Pass Scenario Loaded', 'Readings calibrated within ±5.0 kg statutory tolerance.', 'success');
    } else {
      setRepB({ r1: 15007.2, r2: 15008.5, r3: 15006.9 });
      setEcc({ p1: 3750.2, p2: 3756.2, p3: 3744.1, p4: 3755.9, p5: 3756.8 });
      showToast('Tolerance Exceeded Simulation', 'Simulating non-compliant readings exceeding Table 6 tolerances.', 'warning');
    }
  };

  const handleOpenVerificationForApp = (app: ApplicationItem) => {
    setVerificationModalApp(app);
    handleToggleVerificationScenario('pass');
  };

  // Applications assigned and pending certificate generation
  const pendingVerificationApps = useMemo(() => {
    return applications.filter((app) => app.stage !== 'stamped');
  }, [applications]);

  // SubParts relevant to current screen
  const currentSubParts = useMemo(() => {
    return ADMIN_SUBPARTS.filter((sub) => sub.parentScreen === activeScreen);
  }, [activeScreen]);

  // Aggregate counts for quick dashboard stats
  const metrics = useMemo(() => {
    const totalApps = applications.length;
    const pendingReviewOrAssign = applications.filter(
      (a) => a.stage === 'intake' || a.stage === 'review' || a.stage === 'assign_lmo'
    ).length;
    const activeLmosCount = officers.filter((o) => o.status === 'On Site' || o.status === 'Transit' || o.status === 'Available').length;
    const criticalAlertsCount = alerts.filter((a) => a.severity === 'Critical' && a.status !== 'Resolved').length;
    const totalCerts = certificates.length;

    return {
      totalApps,
      pendingReviewOrAssign,
      activeLmosCount,
      criticalAlertsCount,
      totalCerts
    };
  }, [applications, officers, alerts, certificates]);

  // Sidebar Drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 10 Master Screens Navigation Definitions
  const navTabs = useMemo(() => [
    { id: 'dashboard-overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'applications', label: 'Verification Applications', icon: FileText, badge: metrics.pendingReviewOrAssign },
    { id: 'legal-metrology-officers', label: 'Legal Metrology Officers', icon: Users, badge: metrics.activeLmosCount },
    { id: 'government-approved-test-centres', label: 'Govt Approved Test Centres', icon: Building2 },
    { id: 'owners-registrations', label: 'Owners & Registrations', icon: Building },
    { id: 'instruments-devices', label: 'Instruments & Devices', icon: Scale },
    { id: 'inspections-verifications', label: 'Inspections & Routing', icon: ClipboardCheck },
    { id: 'verification-certificates', label: 'Verification Certificates', icon: Award, badge: metrics.totalCerts },
    { id: 'reports-audit-logs', label: 'Reports & Audit Logs', icon: BarChart3 },
    { id: 'compliance-alerts', label: 'Compliance Alerts', icon: AlertOctagon, badge: metrics.criticalAlertsCount, badgeColor: 'bg-rose-500 text-white' }
  ], [metrics]);

  const currentTab = useMemo(() => {
    return navTabs.find((t) => t.id === activeScreen) || navTabs[0];
  }, [navTabs, activeScreen]);

  // Open Assign Modal with clean state initialization
  const handleOpenAssignModal = (app: ApplicationItem) => {
    setSelectedAppForAssignment(app);
    const existingLmoId = app.assignedLmo?.id || (app as any).assignedLmoUser || '';
    const existingGatcId = (app as any).assignedGatc?.id || (app as any).assignedGatcUser || '';
    if (existingGatcId && !existingLmoId) {
      setAssignTargetType('gatc');
      setSelectedGatcId(String(existingGatcId));
      setSelectedLmoId('');
    } else if (existingLmoId) {
      setAssignTargetType('lmo');
      setSelectedLmoId(String(existingLmoId));
      setSelectedGatcId('');
    } else {
      setAssignTargetType('lmo');
      setSelectedLmoId('');
      setSelectedGatcId('');
    }
    setAssignModalOpen(true);
  };

  // Handle LMO or GATC Assignment
  const handleConfirmAssignment = async () => {
    if (!selectedAppForAssignment) return;
    const targetAppId = selectedAppForAssignment.id || (selectedAppForAssignment as any)._id || selectedAppForAssignment.appNo;

    if (assignTargetType === 'lmo') {
      if (!selectedLmoId) {
        showToast('Selection Required', 'Please select an inspecting Legal Metrology Officer.', 'warning');
        return;
      }
      const targetOfficer = officers.find(
        (o) =>
          String((o as any)._id) === selectedLmoId ||
          String(o.id) === selectedLmoId ||
          String(o.badgeNo) === selectedLmoId
      );
      if (!targetOfficer) {
        showToast('Selection Required', 'Please select an inspecting Legal Metrology Officer from the list.', 'warning');
        return;
      }
      const officerKey = String((targetOfficer as any)._id || targetOfficer.id || targetOfficer.badgeNo);

      try {
        await apiClient.assignOfficer(targetAppId, {
          assignedLmoUser: officerKey,
          assignedLmo: {
            id: officerKey,
            name: targetOfficer.name,
            badgeNo: targetOfficer.badgeNo,
            avatar: targetOfficer.avatar || targetOfficer.name.slice(0, 2).toUpperCase(),
            phone: targetOfficer.phone,
            zone: targetOfficer.zoneCode || targetOfficer.zone
          },
          notes: `Inspection scheduled for ${scheduledInspectionDate} at ${scheduledInspectionTime} by ${targetOfficer.name} (${targetOfficer.badgeNo}).`
        });

        setApplications((prev) =>
          prev.map((app) => {
            const currentId = app.id || (app as any)._id || app.appNo;
            if (currentId === targetAppId || app.appNo === selectedAppForAssignment.appNo) {
              return {
                ...app,
                status: 'SCHEDULED',
                stage: 'scheduled',
                stageLabel: 'Field Inspection Scheduled',
                stageBadgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
                assignedLmo: {
                  id: officerKey,
                  name: targetOfficer.name,
                  badgeNo: targetOfficer.badgeNo,
                  avatar: targetOfficer.avatar || targetOfficer.name.slice(0, 2).toUpperCase(),
                  phone: targetOfficer.phone,
                  zone: targetOfficer.zoneCode || targetOfficer.zone
                }
              };
            }
            return app;
          })
        );

        showToast(
          'Officer Assigned & Scheduled',
          `${targetOfficer.name} (${targetOfficer.badgeNo}) deployed for ${selectedAppForAssignment.appNo} on ${scheduledInspectionDate} at ${scheduledInspectionTime}.`,
          'success'
        );
      } catch (err: any) {
        showToast('Assignment Error', err?.message || 'Failed to persist officer assignment.', 'error');
      }
    } else {
      // Statutory Check under Rule 3(1) of GATC Rules, 2013
      const gatcEligibility = evaluateGatcEligibility(selectedAppForAssignment);
      if (!gatcEligibility.eligible) {
        showToast(
          'Statutory Restriction [Rule 3(1)]',
          gatcEligibility.reason,
          'error'
        );
        return;
      }

      if (!selectedGatcId) {
        showToast('Selection Required', 'Please select a Government Approved Test Centre.', 'warning');
        return;
      }
      const targetGatc = gatcCentres.find(
        (g) =>
          String((g as any)._id) === selectedGatcId ||
          String(g.id) === selectedGatcId ||
          String(g.code) === selectedGatcId
      );
      if (!targetGatc) {
        showToast('Selection Required', 'Please select a Government Approved Test Centre from the list.', 'warning');
        return;
      }
      const gatcKey = String((targetGatc as any)._id || targetGatc.id || targetGatc.code);

      try {
        await apiClient.assignOfficer(targetAppId, {
          assignedGatcUser: gatcKey,
          assignedGatc: {
            id: gatcKey,
            name: targetGatc.name,
            code: targetGatc.code,
            location: targetGatc.location,
            phone: (targetGatc as any).contactPhone || targetGatc.contactPerson
          },
          notes: `Referred to ${targetGatc.name} (${targetGatc.code}) for bench testing on ${scheduledInspectionDate}.`
        });

        setApplications((prev) =>
          prev.map((app) => {
            const currentId = app.id || (app as any)._id || app.appNo;
            if (currentId === targetAppId || app.appNo === selectedAppForAssignment.appNo) {
              return {
                ...app,
                status: 'SCHEDULED',
                stage: 'scheduled',
                stageLabel: 'GATC Testing Scheduled',
                stageBadgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
                assignedGatc: {
                  id: gatcKey,
                  name: targetGatc.name,
                  code: targetGatc.code,
                  location: targetGatc.location,
                  phone: (targetGatc as any).contactPhone || targetGatc.contactPerson
                }
              };
            }
            return app;
          })
        );

        showToast(
          'GATC Scheduled',
          `Application ${selectedAppForAssignment.appNo} dispatched to ${targetGatc.name}.`,
          'success'
        );
      } catch (err: any) {
        showToast('Assignment Error', err?.message || 'Failed to schedule GATC.', 'error');
      }
    }

    setAssignModalOpen(false);
    setSelectedAppForAssignment(null);
    setSelectedLmoId('');
    setSelectedGatcId('');
  };

  // Handle Alert Resolution
  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'Resolved', actionTaken: 'Resolved by Directorate Command' } : a))
    );
    showToast('Enforcement Dossier Updated', `Alert #${alertId} marked as resolved following field compliance verification.`, 'success');
  };

  // Open Certificate Modal
  const handleViewCertificate = (cert: CertificateItem | any) => {
    const certNum = cert.certificateNo || cert.certificateId || 'LM-CERT-2026-0001';
    const est = cert.entityName || cert.owner || 'Authorized Commercial Establishment';
    const equip = cert.equipment || cert.instrument || 'Commercial Weighing Instrument';
    const isDate = cert.issueDate || cert.verificationDate || '08 Sep 2026';
    const valDate = cert.validTill || cert.expiryDate || '08 Sep 2027';
    const offName = cert.officerName || cert.verifiedBy || 'Senior Legal Metrology Officer';
    const offBadge = cert.officerBadge || cert.lmoId || 'MH-LM-2041';
    const hash = cert.sha256Hash || cert.digitalSignatureHash || 'ed25519:7a8b9c0d1e2f3a4b';
    const certIdStr = String(cert.id || cert.certificateId || cert.certificateNo || '1001');

    setSelectedCertData({
      certificateId: certNum,
      certNo: certNum,
      establishment: est,
      owner: est,
      instrumentType: equip,
      instrument: equip,
      accuracyClass: cert.accuracyClass || 'Class III (Commercial / Industrial Standard)',
      capacity: cert.capacity || '15,000 kg',
      serialNumber: cert.serialNumber || 'SN-VER-8821',
      date: isDate,
      verificationDate: isDate,
      validUntil: valDate,
      expiryDate: valDate,
      officerName: offName,
      verifiedBy: offName,
      officerId: offBadge,
      lmoId: offBadge,
      establishmentAddress: cert.establishmentAddress || `${cert.zone || 'Zone II (Mumbai Central)'}, Maharashtra`,
      hologramNo: 'MH-HOL-2026-' + certIdStr.slice(-4),
      digitalSignatureHash: hash,
      sha256Hash: hash,
      qrPayload: `e-VeriMet Digital Seal | ${certNum} | Valid till: ${valDate} | SHA256: ${hash.slice(0, 16)}...`
    });
    setCertModalOpen(true);
  };

  const handleGenerateCertificate = async (app: ApplicationItem, isFastStamp = false) => {
    setIsSubmittingCert(true);
    try {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const certId = `LM-CERT-2026-${randomNum}`;
      const now = new Date();
      const issueDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const expDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      const assignedOfficerName =
        app.assignedLmo?.name ||
        (app as any).assignedLmoUser?.name ||
        (app as any).assignedGatc?.name ||
        'Legal Metrology Officer';
      const assignedBadge =
        app.assignedLmo?.badgeNo ||
        (app as any).assignedLmoUser?.identifier ||
        (app as any).assignedGatc?.code ||
        'MH-LM-2041';
      const sigHash = `ed25519:${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      const targetAppId = app.id || (app as any)._id || app.appNo;

      let networkBase = typeof window !== 'undefined' ? window.location.origin : 'http://10.55.234.119:3000';
      if (typeof window !== 'undefined') {
        const cachedLan = window.sessionStorage.getItem('everimet_lan_url');
        if (cachedLan) {
          networkBase = cachedLan;
        } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          networkBase = 'http://10.55.234.119:3000';
        }
      }
      const mobileVerifyUrl = `${networkBase}/verify/${encodeURIComponent(certId)}`;

      const certPayload: any = {
        certificateId: certId,
        certificateNo: certId,
        instrumentId: app.equipmentSerial || app.appNo,
        owner: app.enterpriseName,
        entityName: app.enterpriseName,
        manufacturer: (app as any).manufacturer || 'Standard Metrological Instruments Ltd.',
        model: app.equipmentName,
        equipment: app.equipmentName,
        instrument: app.equipmentName,
        serialNumber: app.equipmentSerial || `SN-${randomNum}`,
        accuracyClass: app.equipmentClass || 'Class III (Medium Accuracy)',
        capacity: (app as any).capacity || '15,000 kg',
        verificationDate: issueDate,
        issueDate: issueDate,
        validityPeriod: '12 months',
        expiryDate: expDate,
        validTill: expDate,
        lmoId: assignedBadge,
        officerBadge: assignedBadge,
        verifiedBy: `${assignedOfficerName} (${assignedBadge})`,
        officerName: assignedOfficerName,
        zone: app.zone || 'Zone II (Mumbai Central)',
        status: 'valid',
        category: 'electronic_scales_weighbridges',
        warningThresholdDays: 30,
        daysRemaining: 365,
        establishmentAddress: (app as any).installationAddress || `${app.zone}, Maharashtra`,
        eInterval: '5 kg',
        digitalSignatureHash: sigHash,
        sha256Hash: sigHash,
        feePaid: app.feeAmount || '₹1,500.00',
        qrPayload: mobileVerifyUrl
      };

      // 1. Create in MongoDB Atlas
      await apiClient.createCertificate(certPayload);

      // 2. Update Application Status to 'stamped'
      await apiClient.updateApplication(targetAppId, {
        status: 'CERTIFIED',
        stage: 'stamped',
        stageLabel: 'Verification Certified & Stamped',
        stageBadgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        certificateNo: certId,
        certificateId: certId
      });

      // 3. Update frontend state
      setApplications((prev) =>
        prev.map((a) => {
          const aId = a.id || (a as any)._id || a.appNo;
          if (aId === targetAppId || a.appNo === app.appNo) {
            return {
              ...a,
              stage: 'stamped',
              stageLabel: 'Verification Certified & Stamped',
              stageBadgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              certificateNo: certId,
              certificateId: certId
            };
          }
          return a;
        })
      );

      setCertificates((prev) => [certPayload, ...prev]);

      showToast(
        isFastStamp ? 'Instant Certificate Stamped' : 'Statutory Certificate Generated',
        `Form 24 Certificate #${certId} successfully issued and recorded in the National Metrology Ledger.`,
        'success'
      );

      setVerificationModalApp(null);

      // 4. Trigger View Certificate
      handleViewCertificate(certPayload);
    } catch (err: any) {
      showToast('Certificate Issuance Error', err?.message || 'Failed to issue certificate.', 'error');
    } finally {
      setIsSubmittingCert(false);
    }
  };

  // Filtered Certificates for Registry
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const certNo = cert.certificateNo || cert.certificateId || '';
      const entity = cert.entityName || cert.owner || '';
      const equip = cert.equipment || cert.instrument || '';
      const officer = cert.officerName || cert.verifiedBy || '';
      const serial = cert.serialNumber || '';

      const matchesSearch =
        certSearchQuery === '' ||
        certNo.toLowerCase().includes(certSearchQuery.toLowerCase()) ||
        entity.toLowerCase().includes(certSearchQuery.toLowerCase()) ||
        equip.toLowerCase().includes(certSearchQuery.toLowerCase()) ||
        officer.toLowerCase().includes(certSearchQuery.toLowerCase()) ||
        serial.toLowerCase().includes(certSearchQuery.toLowerCase());

      const matchesStatus =
        certStatusFilter === 'all' ||
        (certStatusFilter === 'Active' && (cert.status === 'Active' || cert.status === 'valid')) ||
        (certStatusFilter === 'Expiring Soon' && cert.status === 'Expiring Soon') ||
        (certStatusFilter === 'Revoked' && (cert.status === 'Revoked' || cert.status === 'expired'));

      return matchesSearch && matchesStatus;
    });
  }, [certificates, certSearchQuery, certStatusFilter]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchQuery === '' ||
        app.appNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.enterpriseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.equipmentSerial.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage = selectedStageFilter === 'all' || app.stage === selectedStageFilter;
      const matchesZone = selectedZoneFilter === 'all' || app.zone.includes(selectedZoneFilter);

      return matchesSearch && matchesStage && matchesZone;
    });
  }, [applications, searchQuery, selectedStageFilter, selectedZoneFilter]);

  // Filtered Regulated Commercial Owners
  const filteredOwners = useMemo(() => {
    return ownerRegistrations.filter((owner) => {
      const q = ownerSearchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        owner.enterpriseName.toLowerCase().includes(q) ||
        owner.ownerName.toLowerCase().includes(q) ||
        owner.licenseNo.toLowerCase().includes(q) ||
        owner.zone.toLowerCase().includes(q);

      const matchesStatus = ownerStatusFilter === 'all' || owner.status === ownerStatusFilter;
      const matchesCategory = ownerCategoryFilter === 'all' || owner.enterpriseType === ownerCategoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [ownerRegistrations, ownerSearchQuery, ownerStatusFilter, ownerCategoryFilter]);

  // Filtered LMO Officers for Assignment Modal
  const filteredOfficers = useMemo(() => {
    return officers.filter((off) => {
      const q = officerSearchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        off.name.toLowerCase().includes(q) ||
        off.badgeNo.toLowerCase().includes(q) ||
        (off.zoneCode && off.zoneCode.toLowerCase().includes(q)) ||
        (off.zone && off.zone.toLowerCase().includes(q))
      );
    });
  }, [officers, officerSearchQuery]);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f0f4f9] via-[#f7f9ff] to-[#edf3fa] text-[#121d26] flex flex-col font-sans">
      {/* Top Directorate Command Header */}
      <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Three-dash Menu Button to toggle sidebar */}
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Navigation Sidebar"
              title="Open Navigation Menu"
              className="p-2 rounded-xl bg-white hover:bg-[#eef8f1] text-[#0c2340] hover:text-[#15803d] border border-[#d8e4f1] hover:border-[#c6edd0] transition-all cursor-pointer shadow-xs active:scale-[0.95] flex items-center justify-center group"
            >
              <Menu className="w-5 h-5 text-[#0c2340] group-hover:text-[#16a34a] transition-colors" />
            </button>

            <EverimetLogo variant="icon" size="md" className="p-1 bg-[#eef8f1] border border-[#c6edd0] rounded-xl" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#15803d] bg-[#eef8f1] px-2 py-0.5 rounded-md border border-[#c6edd0]">
                  Directorate General • Legal Metrology
                </span>
                <span className="text-[11px] font-mono text-[#4e6073] hidden sm:inline">HSM Ed25519 Active</span>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-[#0c2340] tracking-tight">
                  National Metrology Command &amp; Governance Center
                </h1>
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#fafbfc] border border-[#e2e8f0] text-xs font-bold text-[#0c2340]">
                  <currentTab.icon className="w-3.5 h-3.5 text-[#16a34a]" />
                  {currentTab.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setEmergencyAuditOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Deploy Emergency Squad</span>
            </button>

            <button
              onClick={() => {
                showToast('Dossier Exported', 'Statutory metrology audit log compiled and saved to local reports folder.', 'info');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-[#0c2340] border border-[#d8e4f1] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>Export Audit Dossier</span>
            </button>

            <div className="h-6 w-px bg-[#e2e8f0] hidden sm:block mx-1" />

            <div className="relative" ref={adminMenuRef}>
              <button
                type="button"
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="flex items-center gap-2 bg-[#fafbfc] hover:bg-[#f0f4f9] border border-[#e2e8f0] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                title="Admin Options Menu"
              >
                <div className="w-7 h-7 rounded-lg bg-[#0c2340] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  {getInitials(adminProfile.name)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-[#0c2340] leading-tight flex items-center gap-1">
                    <span>{adminProfile.name}</span>
                    <ChevronDown className="w-3 h-3 text-[#4e6073]" />
                  </div>
                  <div className="text-[10px] text-[#4e6073] font-medium">{adminProfile.roleLabel}</div>
                </div>
              </button>

              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#d8e4f1] p-2.5 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2.5 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-[#0c2340] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {getInitials(adminProfile.name)}
                      </div>
                      <div>
                        <div className="font-bold text-[#0c2340] text-xs leading-tight">{adminProfile.name}</div>
                        <div className="text-[10px] text-[#16a34a] font-mono font-semibold">{adminProfile.id}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#4e6073] mt-1 pt-1 border-t border-[#e2e8f0]/80 flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-[#16a34a]" />
                      <span>{adminProfile.roleLabel}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminMenu(false);
                        showToast('Admin Dossier Active', `Directorate Officer: ${adminProfile.name} (${adminProfile.email})`, 'info');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-[#0c2340] font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-gray-500" />
                      <span>Admin Profile Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminMenu(false);
                        setActiveScreen('dashboard-overview');
                        showToast('System Control Center', 'Directorate configuration active.', 'info');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-[#0c2340] font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-gray-500" />
                      <span>System Control Center</span>
                    </button>

                    <div className="pt-1 my-1 border-t border-gray-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminMenu(false);
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

        {/* SubParts Strip if applicable for the active screen */}
        {currentSubParts.length > 0 && (
          <div className="bg-white border-t border-[#e2e8f0] px-4 sm:px-6 py-2 overflow-x-auto no-scrollbar">
            <div className="max-w-[1520px] mx-auto flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#4e6073] flex items-center gap-1 shrink-0 mr-1">
                <SlidersHorizontal className="w-3 h-3 text-[#16a34a]" /> Sub-Directories:
              </span>
              <button
                onClick={() => setActiveSubPart('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeSubPart === 'all'
                    ? 'bg-[#0c2340] text-white'
                    : 'bg-[#fafbfc] text-[#4e6073] hover:bg-gray-100 border border-[#e2e8f0]'
                }`}
              >
                All Records
              </button>
              {currentSubParts.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubPart(sub.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeSubPart === sub.id
                      ? 'bg-[#16a34a] text-white'
                      : 'bg-[#fafbfc] text-[#4e6073] hover:bg-gray-100 border border-[#e2e8f0]'
                  }`}
                  title={sub.description}
                >
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* SIDEBAR DRAWER (TRIGGERED BY THREE DASH BUTTON) */}
      {/* ========================================================= */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <aside className="w-80 max-w-[85vw] bg-white border-r border-[#e2e8f0] shadow-2xl flex flex-col h-full z-50">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#fafbfc]">
                <div className="flex items-center gap-2.5">
                  <EverimetLogo variant="icon" size="sm" className="p-1 bg-[#eef8f1] border border-[#c6edd0] rounded-xl" />
                  <div>
                    <div className="font-extrabold text-sm text-[#0c2340] leading-tight">e-VeriMet Command</div>
                    <div className="text-[10px] font-bold text-[#15803d]">Directorate General</div>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
                  title="Close Navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Administrator Identity Badge in Sidebar */}
              <div className="p-3.5 m-3 bg-[#f0f4f9] rounded-xl border border-[#d8e4f1] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0c2340] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  {getInitials(adminProfile.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#0c2340] truncate" title={adminProfile.name}>
                    {adminProfile.name}
                  </div>
                  <div className="text-[10px] text-[#4e6073] flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                    <span className="truncate">{adminProfile.roleLabel}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Section Title */}
              <div className="px-4 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#4e6073]">
                Directorate Registry Modules
              </div>

              {/* 10 Navigation Items */}
              <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar pb-4">
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeScreen === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveScreen(tab.id as NavScreen);
                        setActiveSubPart('all');
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#16a34a] text-white shadow-xs'
                          : 'text-[#4e6073] hover:text-[#0c2340] hover:bg-[#eef8f1]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#16a34a]'}`} />
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && (
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ml-2 shrink-0 ${
                            isActive
                              ? 'bg-white text-[#16a34a]'
                              : tab.badgeColor || 'bg-[#eef8f1] text-[#15803d] border border-[#c6edd0]'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Sidebar Footer Actions */}
              <div className="p-3.5 border-t border-[#e2e8f0] bg-[#fafbfc] space-y-2">
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    setEmergencyAuditOpen(true);
                  }}
                  className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  <span>Deploy Emergency Squad</span>
                </button>

                <button
                  onClick={() => setIsLoggingOut(true)}
                  className="w-full py-2 rounded-xl bg-white hover:bg-gray-100 text-[#4e6073] hover:text-rose-600 border border-[#e2e8f0] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout Session</span>
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* Main Screen Content Viewport */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">

        {/* ========================================================= */}
        {/* 1. DASHBOARD OVERVIEW SCREEN */}
        {/* ========================================================= */}
        {activeScreen === 'dashboard-overview' && (
          <div className="space-y-6">
            {/* National Statutory KPI Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4e6073]">Total Statutory Filings</span>
                  <div className="w-8 h-8 rounded-lg bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display font-extrabold text-2xl sm:text-3xl text-[#0c2340]">{applications.length.toLocaleString()}</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> Live Sync
                  </span>
                </div>
                <p className="text-[11px] text-[#4e6073] mt-1">Rule 14 Initial &amp; Periodic verification dockets</p>
              </div>

              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4e6073]">Field Inspectors (LMO)</span>
                  <div className="w-8 h-8 rounded-lg bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display font-extrabold text-2xl sm:text-3xl text-[#0c2340]">{officers.length}</span>
                  <button
                    onClick={() => setAddInspectorModalOpen(true)}
                    className="text-xs font-bold text-[#16a34a] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    + Add Inspector
                  </button>
                </div>
                <p className="text-[11px] text-[#4e6073] mt-1">
                  {officers.filter(o => o.status === 'On Site').length} On Site • {officers.filter(o => o.status === 'Transit').length} In Transit
                </p>
              </div>

              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4e6073]">NABL Accredited GATC</span>
                  <div className="w-8 h-8 rounded-lg bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display font-extrabold text-2xl sm:text-3xl text-[#0c2340]">{gatcCentres.length}</span>
                  <span className="text-xs font-bold text-emerald-600">100% Calibrated</span>
                </div>
                <p className="text-[11px] text-[#4e6073] mt-1">Government Approved Testing Labs</p>
              </div>

              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4e6073]">Active Compliance Rate</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display font-extrabold text-2xl sm:text-3xl text-[#0c2340]">
                    {applications.length > 0 ? ((applications.filter(a => a.stage === 'stamped').length / applications.length) * 100).toFixed(1) + '%' : '100%'}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">National Benchmark</span>
                </div>
                <p className="text-[11px] text-[#4e6073] mt-1">Statutory MPE Pass Ratio</p>
              </div>
            </div>

            {/* Verification Pipeline Funnel */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f0] pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-[#0c2340] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#16a34a]" />
                    Verification Pipeline Flow &amp; Statutory Stages
                  </h3>
                  <p className="text-xs text-[#4e6073]">Real-time queue tracking from digital intake to Ed25519 stamping</p>
                </div>
                <button
                  onClick={() => setActiveScreen('applications')}
                  className="text-xs font-bold text-[#16a34a] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All Applications <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { stage: 'intake', label: '1. Document Intake', count: applications.filter(a => a.stage === 'intake').length, desc: 'OCR Bill of Entry verification' },
                  { stage: 'review', label: '2. Model Review', count: applications.filter(a => a.stage === 'review').length, desc: 'Pattern approval matching' },
                  { stage: 'assign_lmo', label: '3. LMO Allocation', count: applications.filter(a => a.stage === 'assign_lmo').length, desc: 'Zone & officer dispatch' },
                  { stage: 'scheduled', label: '4. Testing Scheduled', count: applications.filter(a => a.stage === 'scheduled').length, desc: 'Field inspection in progress' },
                  { stage: 'stamped', label: '5. Certified & Stamped', count: applications.filter(a => a.stage === 'stamped').length, desc: 'Holographic seal issued' }
                ].map((step, idx) => (
                  <div
                    key={step.stage}
                    onClick={() => {
                      setSelectedStageFilter(step.stage as PipelineStage);
                      setActiveScreen('applications');
                    }}
                    className="p-3.5 rounded-xl border border-[#e2e8f0] bg-[#fafbfc] hover:border-[#16a34a] hover:bg-[#eef8f1]/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#4e6073] group-hover:text-[#0c2340]">{step.label}</span>
                      <span className="w-5 h-5 rounded-full bg-white border border-[#e2e8f0] text-[10px] font-bold flex items-center justify-center text-[#16a34a]">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-[#0c2340]">{step.count}</div>
                    <div className="text-[10px] text-[#4e6073] mt-0.5">{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Compliance Alerts & Zonal Command Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Critical Alerts Banner (2 Cols) */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-[#e2e8f0] bg-[#fafbfc] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-rose-600" />
                    <div>
                      <h3 className="font-bold text-sm text-[#0c2340]">Critical Enforcement Alerts</h3>
                      <p className="text-[11px] text-[#4e6073]">Immediate statutory action or field seizure required</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveScreen('compliance-alerts')}
                    className="text-xs font-bold text-[#16a34a] hover:underline cursor-pointer"
                  >
                    Full Incident Registry
                  </button>
                </div>

                <div className="divide-y divide-[#e2e8f0]">
                  {alerts.length > 0 ? (
                    alerts.slice(0, 3).map((alt) => (
                      <div key={alt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fafbfc] transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              alt.severity === 'Critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                              {alt.type}
                            </span>
                            <span className="font-mono text-xs font-bold text-[#0c2340]">{alt.alertNo}</span>
                            <span className="text-[11px] text-gray-500">• {alt.zone}</span>
                          </div>
                          <div className="text-xs font-bold text-[#121d26]">{alt.entityName}</div>
                          <div className="text-[11px] text-[#4e6073]">{alt.actionTaken}</div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {alt.status !== 'Resolved' ? (
                            <button
                              onClick={() => handleResolveAlert(alt.id)}
                              className="px-3 py-1.5 rounded-xl bg-[#eef8f1] hover:bg-[#dcfce7] text-[#15803d] border border-[#c6edd0] text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
                            >
                              Mark Resolved
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500 space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="font-bold text-sm text-[#0c2340]">No Critical Enforcement Alerts</p>
                      <p className="text-xs text-gray-400">All registered zonal facilities are currently compliant with MPE tolerances.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Zonal Readiness Quick Widget */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
                  <h3 className="font-bold text-sm text-[#0c2340] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#16a34a]" />
                    Jurisdiction Zonal Operations
                  </h3>
                  <span className="text-[10px] font-mono text-[#15803d] font-bold bg-[#eef8f1] px-2 py-0.5 rounded">6 Active</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { zone: 'Zone I - South Mumbai', lmos: 2, status: 'Normal', color: 'text-emerald-600' },
                    { zone: 'Zone II - Central & Port', lmos: 3, status: 'High Load', color: 'text-amber-600' },
                    { zone: 'Zone III - Western Suburbs', lmos: 2, status: 'Normal', color: 'text-emerald-600' },
                    { zone: 'Zone IV - Chembur Industrial', lmos: 2, status: 'Normal', color: 'text-emerald-600' },
                    { zone: 'Zone V - Bhiwandi Logistics', lmos: 2, status: 'Audit Mode', color: 'text-blue-600' },
                    { zone: 'Zone VI - Navi Mumbai Belt', lmos: 2, status: 'Normal', color: 'text-emerald-600' }
                  ].map((z, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#fafbfc] border border-[#e2e8f0]">
                      <span className="font-medium text-[#121d26]">{z.zone}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#4e6073]">{z.lmos} LMOs</span>
                        <span className={`text-[10px] font-bold ${z.color}`}>• {z.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveScreen('legal-metrology-officers')}
                  className="w-full py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  Manage Field Deployment Roster <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. APPLICATIONS SCREEN (PIPELINE & FILINGS) */}
        {/* ========================================================= */}
        {activeScreen === 'applications' && (
          <div className="space-y-5">
            {/* Filters Bar */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search App #, Enterprise, Serial..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#d8e4f1] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/30 w-56 sm:w-72 bg-white"
                  />
                </div>

                <select
                  value={selectedStageFilter}
                  onChange={(e) => setSelectedStageFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-[#d8e4f1] bg-white text-[#121d26] focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="all">All Stages</option>
                  <option value="intake">1. Intake &amp; OCR</option>
                  <option value="review">2. Model Review</option>
                  <option value="assign_lmo">3. Assign LMO</option>
                  <option value="scheduled">4. Scheduled</option>
                  <option value="stamped">5. Stamped</option>
                </select>

                <select
                  value={selectedZoneFilter}
                  onChange={(e) => setSelectedZoneFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-[#d8e4f1] bg-white text-[#121d26] focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="all">All Zones</option>
                  <option value="Zone I">Zone I (South Mumbai)</option>
                  <option value="Zone II">Zone II (Central &amp; Port)</option>
                  <option value="Zone III">Zone III (Western Suburbs)</option>
                  <option value="Zone IV">Zone IV (Chembur Industrial)</option>
                  <option value="Zone V">Zone V (Bhiwandi Hub)</option>
                  <option value="Zone VI">Zone VI (Navi Mumbai MIDC)</option>
                </select>
              </div>

              <div className="text-xs text-[#4e6073] font-medium">
                Showing <strong className="text-[#0c2340]">{filteredApplications.length}</strong> of {applications.length} applications
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fafbfc] border-b border-[#e2e8f0] text-[#4e6073] font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Application Details</th>
                      <th className="py-3 px-4">Enterprise &amp; Jurisdiction</th>
                      <th className="py-3 px-4">Instrument &amp; Class</th>
                      <th className="py-3 px-4">Stage / Pipeline</th>
                      <th className="py-3 px-4">Assigned LMO</th>
                      <th className="py-3 px-4">SLA Deadline</th>
                      <th className="py-3 px-4 text-right">Statutory Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#fafbfc] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-[#0c2340]">{app.appNo}</div>
                          <div className="text-[11px] text-[#4e6073] mt-0.5">
                            {app.date} • {app.time}
                          </div>
                          {app.isHighPriority && (
                            <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Priority SLA
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#121d26]">{app.enterpriseName}</div>
                          <div className="text-[11px] text-[#4e6073]">{app.enterpriseType}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{app.zone}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#121d26]">{app.equipmentName}</div>
                          <div className="font-mono text-[11px] text-[#4e6073]">S/N: {app.equipmentSerial}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#eef8f1] text-[#15803d] border border-[#c6edd0]">
                            {app.equipmentClass}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${app.stageBadgeClass}`}>
                            {app.stageLabel}
                          </span>
                          <div className="text-[10px] text-gray-500 mt-1">Fee: {app.feeAmount} ({app.paymentStatus})</div>
                        </td>

                        <td className="py-3.5 px-4">
                          {app.assignedLmo ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] font-bold text-[10px] flex items-center justify-center">
                                {app.assignedLmo.avatar}
                              </div>
                              <div>
                                <div className="font-bold text-[#0c2340]">{app.assignedLmo.name}</div>
                                <div className="text-[10px] font-mono text-[#4e6073]">{app.assignedLmo.badgeNo}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-amber-700 font-semibold text-[11px] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending Assignment
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-[11px] font-semibold text-[#121d26]">{app.slaDeadline}</div>
                          <div className="text-[10px] text-gray-500">MPE: {app.accuracyTolerance}</div>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setDetailModalApp(app)}
                            className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#0c2340] font-bold text-xs transition-all cursor-pointer"
                          >
                            Review Details
                          </button>
                          {app.stage === 'stamped' ? (
                            <button
                              onClick={() => {
                                const cert = certificates.find(c => (c.certificateNo === (app as any).certificateNo || c.certificateId === (app as any).certificateId || c.entityName === app.enterpriseName));
                                if (cert) handleViewCertificate(cert);
                                else handleGenerateCertificate(app, true);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-[#eef8f1] hover:bg-[#dcfce7] text-[#15803d] border border-[#c6edd0] font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>View Certificate</span>
                            </button>
                          ) : (app.assignedLmo || (app as any).assignedGatc) ? (
                            <button
                              onClick={() => handleOpenVerificationForApp(app)}
                              className="px-2.5 py-1.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-1 active:scale-[0.98]"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>Verify &amp; Certify</span>
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleOpenAssignModal(app)}
                            className="px-3 py-1.5 rounded-xl bg-[#0c2340] hover:bg-[#1a365d] text-white font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                          >
                            {app.assignedLmo || (app as any).assignedGatc ? 'Reassign' : 'Assign LMO / GATC'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. LEGAL METROLOGY OFFICERS (LMO) SCREEN */}
        {/* ========================================================= */}
        {activeScreen === 'legal-metrology-officers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-base text-[#0c2340] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#16a34a]" />
                  Statutory Legal Metrology Officer (LMO) Deployment Roster
                </h3>
                <p className="text-xs text-[#4e6073]">Field inspectors with authorized seal kits &amp; OIML R-76 test equipment</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#4e6073]">Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#eef8f1] text-[#15803d] border border-[#c6edd0]">
                  {officers.filter(o => o.status === 'On Site').length} Deployed On-Site
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {officers.map((officer) => (
                <div key={officer.id} className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs space-y-4 hover:border-[#16a34a] transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] font-extrabold text-sm flex items-center justify-center shrink-0">
                        {officer.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0c2340]">{officer.name}</h4>
                        <div className="font-mono text-xs font-semibold text-[#15803d]">{officer.badgeNo}</div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${officer.statusClass}`}>
                      {officer.status}
                    </span>
                  </div>

                  <div className="p-3 bg-[#fafbfc] rounded-xl border border-[#e2e8f0] space-y-1 text-xs">
                    <div className="text-[11px] text-[#4e6073]">
                      Jurisdiction: <strong className="text-[#0c2340]">{officer.zoneCode}</strong> ({officer.zone})
                    </div>
                    <div className="text-[11px] text-[#4e6073] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#16a34a]" />
                      <span>{officer.currentLocation}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-[#e2e8f0]">
                    <div>
                      <div className="font-extrabold text-base text-[#0c2340]">{officer.inspectionsToday}</div>
                      <div className="text-[10px] text-[#4e6073]">Today</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-base text-[#0c2340]">{officer.completedThisMonth}</div>
                      <div className="text-[10px] text-[#4e6073]">This Month</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-base text-[#15803d]">{officer.stampingCertsIssued}</div>
                      <div className="text-[10px] text-[#4e6073]">Certs Stamped</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs border-t border-[#e2e8f0]">
                    <div className="flex items-center gap-2 text-[#4e6073] text-[11px]">
                      <Phone className="w-3 h-3 text-[#16a34a]" />
                      <span>{officer.phone}</span>
                    </div>
                    <button
                      onClick={() => {
                        showToast('Dispatch Triggered', `Routing prompt transmitted to ${officer.name} (${officer.badgeNo}).`, 'info');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#eef8f1] hover:bg-[#dcfce7] text-[#15803d] border border-[#c6edd0] text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Assign Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. GOVERNMENT APPROVED TEST CENTRES (GATC) SCREEN */}
        {/* ========================================================= */}
        {activeScreen === 'government-approved-test-centres' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#16a34a] text-white px-2 py-0.5 rounded">
                    Statutory Rules 2013
                  </span>
                  <span className="text-xs text-gray-500">Legal Metrology Act, 2009</span>
                </div>
                <h3 className="font-display font-bold text-base text-[#0c2340] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#16a34a]" />
                  Government Approved Test Centres (GATC) &amp; NABL Accredited Labs
                </h3>
                <p className="text-xs text-[#4e6073]">
                  Authorized under Rule 3(1) First Schedule (10 categories) &amp; Audited under Rule 5(1) Second Schedule
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowGatcStatutoryModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#0c2340] hover:bg-[#1a365d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <Award className="w-3.5 h-3.5 text-[#4ade80]" />
                  <span>Statutory Schedules &amp; Lab Accreditation</span>
                </button>
                <button
                  onClick={() => {
                    showToast('GATC Audit Requested', 'Statutory surveillance scheduled for all active testing capacities.', 'info');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Trigger Annual Surveillance Audit</span>
                </button>
              </div>
            </div>

            {/* Statutory Gazette Notice Banner */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 flex items-start gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#15803d] text-sm block">
                  Mandatory Scope Compliance (Legal Metrology GATC Rules, 2013)
                </strong>
                <p className="text-gray-700 mt-1 leading-relaxed">
                  GATC verification is restricted exclusively to the <strong>10 categories</strong> specified in the First Schedule [Rule 3(1)], including NAWI Class III/IIII up to 150 kg, water meters, blood pressure instruments, clinical thermometers, rail weighbridges, and standard weights. Instruments exceeding 150 kg or unlisted equipment require mandatory direct Government LMO inspection.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {gatcCentres.map((centre) => (
                <div key={centre.id} className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs space-y-4 hover:border-[#16a34a] transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#15803d] bg-[#eef8f1] px-2 py-0.5 rounded border border-[#c6edd0]">
                          {centre.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          centre.status === 'Operational'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : centre.status === 'High Capacity'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {centre.status}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-[#0c2340] mt-1.5">{centre.name}</h4>
                      <p className="text-xs text-[#4e6073] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#16a34a]" /> {centre.location}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">Active Queue</span>
                      <span className="text-lg font-extrabold text-[#0c2340]">{centre.activeTestQueue} units</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#fafbfc] rounded-xl border border-[#e2e8f0] space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#4e6073]">NABL Accreditation:</span>
                      <span className="font-mono font-bold text-[#0c2340]">{centre.nablAccreditationNo}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#4e6073]">Accreditation Valid Till:</span>
                      <span className="font-semibold text-emerald-700">{centre.validUntil}</span>
                    </div>
                    {centre.jurisdictionArea && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#4e6073]">Jurisdiction:</span>
                        <span className="font-medium text-[#121d26]">{centre.jurisdictionArea}</span>
                      </div>
                    )}
                    {centre.consumerComplaintNumber && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#4e6073]">Consumer Grievance Helpline:</span>
                        <span className="font-mono font-bold text-[#15803d]">{centre.consumerComplaintNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#4e6073]">Authorized Lead:</span>
                      <span className="font-medium text-[#121d26]">{centre.contactPerson}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#4e6073] uppercase tracking-wider block">
                      First Schedule [Rule 3(1)] Scopes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {centre.testingCapacities.map((cap, ci) => (
                        <span key={ci} className="text-[10px] font-medium bg-[#eef8f1] text-[#15803d] border border-[#c6edd0] px-2 py-0.5 rounded-md">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. OWNERS & REGISTRATIONS SCREEN */}
        {/* ========================================================= */}
        {activeScreen === 'owners-registrations' && (
          <div className="space-y-5">
            {/* Header & Metric Summary */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-base text-[#0c2340] flex items-center gap-2">
                    <Building className="w-5 h-5 text-[#16a34a]" />
                    Regulated Commercial Owners &amp; LMPC License Directory
                  </h3>
                  <p className="text-xs text-[#4e6073]">
                    Manufacturers, Importers, Dealers (Rule 27/28), and Commercial Users under Legal Metrology Act, 2009
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAddOwnerModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Register Commercial Owner</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#f1f5f9]">
                <div className="p-3 bg-[#fafbfc] rounded-xl border border-[#e2e8f0]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4e6073] block">
                    Total Registered Entities
                  </span>
                  <span className="font-display font-extrabold text-xl sm:text-2xl text-[#0c2340] mt-0.5 block">
                    {ownerRegistrations.length}
                  </span>
                  <span className="text-[10px] text-gray-500">Live in Cloud Database</span>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Active LMPC Licenses
                  </span>
                  <span className="font-display font-extrabold text-xl sm:text-2xl text-[#15803d] mt-0.5 block">
                    {ownerRegistrations.filter((r) => r.status === 'Active').length}
                  </span>
                  <span className="text-[10px] text-emerald-700">Verified &amp; Certified</span>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Awaiting License Approval
                  </span>
                  <span className="font-display font-extrabold text-xl sm:text-2xl text-amber-700 mt-0.5 block">
                    {ownerRegistrations.filter((r) => r.status === 'Pending Verification').length}
                  </span>
                  <span className="text-[10px] text-amber-700">Needs Directorate Review</span>
                </div>

                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                    Regulatory Notices
                  </span>
                  <span className="font-display font-extrabold text-xl sm:text-2xl text-rose-700 mt-0.5 block">
                    {ownerRegistrations.filter((r) => r.status === 'Notice Issued').length}
                  </span>
                  <span className="text-[10px] text-rose-700">Compliance Deficits</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full md:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search enterprise, owner, or license #..."
                  value={ownerSearchQuery}
                  onChange={(e) => setOwnerSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16a34a] font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={ownerStatusFilter}
                  onChange={(e) => setOwnerStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
                >
                  <option value="all">All Statuses ({ownerRegistrations.length})</option>
                  <option value="Active">Active ({ownerRegistrations.filter((r) => r.status === 'Active').length})</option>
                  <option value="Pending Verification">Pending Approval ({ownerRegistrations.filter((r) => r.status === 'Pending Verification').length})</option>
                  <option value="Notice Issued">Notice Issued ({ownerRegistrations.filter((r) => r.status === 'Notice Issued').length})</option>
                </select>

                <select
                  value={ownerCategoryFilter}
                  onChange={(e) => setOwnerCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
                >
                  <option value="all">All Categories</option>
                  <option value="Trader / Retailer">Trader / Retailer</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Importer">Importer</option>
                  <option value="Repairer">Repairer</option>
                  <option value="Bulk Weighbridge Depot">Bulk Weighbridge Depot</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fafbfc] border-b border-[#e2e8f0] text-[#4e6073] font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Enterprise &amp; Owner</th>
                      <th className="py-3 px-4">LMPC License #</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Jurisdiction</th>
                      <th className="py-3 px-4">Registered Instruments</th>
                      <th className="py-3 px-4">Compliance Score</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredOwners.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-gray-500">
                          <Building className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="font-semibold">No regulated commercial owners found</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">Try clearing your search query or status filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOwners.map((reg) => (
                        <tr key={reg.id} className="hover:bg-[#fafbfc] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#0c2340]">{reg.enterpriseName}</div>
                            <div className="text-[11px] text-[#4e6073]">Contact: {reg.ownerName} • {reg.contactPhone}</div>
                            <div className="text-[10px] text-gray-500">{reg.contactEmail}</div>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-[#15803d]">
                            {reg.licenseNo}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#eef8f1] text-[#15803d] border border-[#c6edd0]">
                              {reg.enterpriseType}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-[#4e6073]">
                            {reg.zone}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-[#0c2340]">{reg.registeredDevices}</span>{' '}
                            <span className="text-[10px] text-gray-500">verified units</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#16a34a] h-full rounded-full"
                                  style={{ width: `${reg.complianceScore}%` }}
                                />
                              </div>
                              <span className="font-bold text-[#0c2340] text-[11px]">{reg.complianceScore}%</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                reg.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : reg.status === 'Pending Verification'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {reg.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {reg.status === 'Pending Verification' && (
                                <button
                                  onClick={() => handleApproveOwnerLicense(reg)}
                                  className="px-2.5 py-1 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs cursor-pointer transition-all shadow-xs flex items-center gap-1"
                                  title="Approve LMPC License"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve License</span>
                                </button>
                              )}

                              {reg.status === 'Active' && (
                                <button
                                  onClick={() => handleIssueNoticeToOwner(reg)}
                                  className="px-2 py-1 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold text-xs cursor-pointer transition-colors"
                                  title="Issue Statutory Notice"
                                >
                                  Notice
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedOwnerForDossier(reg)}
                                className="px-2.5 py-1 rounded-lg bg-[#eef8f1] hover:bg-[#dcfce7] text-[#15803d] border border-[#c6edd0] font-bold text-xs cursor-pointer transition-colors"
                              >
                                Inspect Dossier
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. INSTRUMENTS & DEVICES SCREEN */}
        {/* ========================================================= */}
        {activeScreen === 'instruments-devices' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-base text-[#0c2340] flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#16a34a]" />
                  Regulated Instruments &amp; Stamped Devices Inventory
                </h3>
                <p className="text-xs text-[#4e6073]">Central registry of all commercial weights, measures, dispensers, and weighbridges</p>
              </div>
              <button
                onClick={() => {
                  showToast('Batch QR Verifier', 'Scanning simulated batches against National Ed25519 Central Ledger.', 'info');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verify All Hardware QR Hashes</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {instruments.map((device) => (
                <div key={device.id} className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs space-y-3 hover:border-[#16a34a] transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#15803d] bg-[#eef8f1] px-2 py-0.5 rounded border border-[#c6edd0]">
                        {device.serialNo}
                      </span>
                      <h4 className="font-bold text-sm text-[#0c2340] mt-1.5">{device.name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      device.status === 'Compliant'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : device.status === 'Due for Renewal'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {device.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-[#4e6073]">
                    <div>Category: <strong className="text-[#0c2340]">{device.category}</strong> ({device.accuracyClass})</div>
                    <div>Owner: <span className="text-[#121d26]">{device.ownerName}</span></div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-[#16a34a]" /> {device.location}
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#fafbfc] rounded-lg border border-[#e2e8f0] text-[11px] space-y-1 font-mono">
                    <div className="text-gray-500 text-[10px] uppercase font-sans font-bold">Anchored Hash</div>
                    <div className="truncate text-gray-700">{device.qrHash}</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#e2e8f0]">
                    <span className="text-[#4e6073]">Next Due: <strong className="text-[#0c2340]">{device.nextVerificationDue}</strong></span>
                    <button
                      onClick={() => {
                        showToast('QR Verified', `Cryptographic signature for ${device.serialNo} is valid and anchored.`, 'success');
                      }}
                      className="text-xs font-bold text-[#16a34a] hover:underline cursor-pointer"
                    >
                      Authenticate Seal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. INSPECTIONS & VERIFICATIONS ROUTING SCREEN */}
        {/* ========================================================= */}
        {activeScreen === 'inspections-verifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-base text-[#0c2340] flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-[#16a34a]" />
                  Field Inspection &amp; TSP Route Optimization Engine
                </h3>
                <p className="text-xs text-[#4e6073]">Algorithmic tour generation reducing officer travel distance and transit latency</p>
              </div>

              <button
                onClick={() => {
                  showToast('TSP Recalculated', 'Optimal multi-depot vehicle routing solution calculated. Total transit reduced by 34.8 km.', 'success');
                }}
                className="px-4 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Calculate Optimal Tour</span>
              </button>
            </div>

            {/* Active Tour Card */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f0] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#15803d] bg-[#eef8f1] px-2 py-0.5 rounded border border-[#c6edd0]">
                    Active Itinerary: Mumbai Central &amp; Thane Logistics (Tour #MH-TSP-441)
                  </span>
                  <h4 className="font-bold text-sm text-[#0c2340] mt-1">
                    Assigned Unit: Senior Inspector Rajesh Sharma (MH-LM-2041) + Mobile Calibration Van #02
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#4e6073]">Projected Fuel &amp; Time Efficiency</div>
                  <div className="text-sm font-extrabold text-[#15803d]">34.8 km saved (84 min faster)</div>
                </div>
              </div>

              {/* Waypoints Sequence */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  { step: 'Waypoint 1', title: 'APMC Market Sector 19', target: 'Apex Retail Scale (NAWI 30kg)', time: '10:00 AM - 11:30 AM', status: 'Completed' },
                  { step: 'Waypoint 2', title: 'Mahul Petroleum Corridor', target: 'BPCL Master Flow Prover #02', time: '01:00 PM - 02:30 PM', status: 'In Progress' },
                  { step: 'Waypoint 3', title: 'Infiniti Mall Malad', target: 'Retail Counter Scales Batch (x8)', time: '03:15 PM - 04:30 PM', status: 'Scheduled' },
                  { step: 'Waypoint 4', title: 'Bhiwandi Hub Hub 4', target: 'Godrej 80T Truck Weighbridge', time: '05:00 PM - 06:30 PM', status: 'Scheduled' }
                ].map((wp, wIdx) => (
                  <div key={wIdx} className="p-3.5 rounded-xl border border-[#e2e8f0] bg-[#fafbfc] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{wp.step}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        wp.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : wp.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {wp.status}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-[#0c2340]">{wp.title}</div>
                    <div className="text-[11px] text-[#4e6073]">{wp.target}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{wp.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. VERIFICATION CERTIFICATES SCREEN */}
        {/* ========================================================= */}
        {activeScreen === 'verification-certificates' && (
          <div className="space-y-5">
            {/* Header & Quick Action */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-base text-[#0c2340] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#16a34a]" />
                  Statutory Verification Certificates &amp; Digital Stamping Registry
                </h3>
                <p className="text-xs text-[#4e6073]">
                  Authentic certificates generated under Section 24 of the Legal Metrology Act, 2009 with Ed25519 verification hashes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCertTab('pending-verification');
                    const firstApp = pendingVerificationApps[0];
                    if (firstApp) handleOpenVerificationForApp(firstApp);
                    else showToast('All Certified', 'No pending applications require verification.', 'info');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>+ Verify &amp; Issue New Certificate</span>
                </button>
              </div>
            </div>

            {/* Dual Sub-Tab Switcher */}
            <div className="flex border-b border-[#e2e8f0] gap-2">
              <button
                type="button"
                onClick={() => setActiveCertTab('issued')}
                className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeCertTab === 'issued'
                    ? 'border-[#16a34a] text-[#16a34a]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Active Issued Certificates</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                  {certificates.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCertTab('pending-verification')}
                className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeCertTab === 'pending-verification'
                    ? 'border-[#16a34a] text-[#16a34a]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Assigned Applications Pending Certificate Generation</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold animate-pulse">
                  {pendingVerificationApps.length}
                </span>
              </button>
            </div>

            {/* TAB 1: ACTIVE ISSUED CERTIFICATES */}
            {activeCertTab === 'issued' && (
              <div className="space-y-4">
                {/* 4 Metric KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Active Seals</span>
                    <div className="text-xl font-black text-[#0c2340]">{certificates.length}</div>
                    <span className="text-[10px] text-emerald-700 font-bold">✓ Form 24 Certified</span>
                  </div>
                  <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Commercial Scales (Class III)</span>
                    <div className="text-xl font-black text-[#15803d]">
                      {certificates.filter(c => (c.equipment || c.instrument || '').toLowerCase().includes('scale') || (c.accuracyClass || '').includes('Class III')).length}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Retail &amp; Markets</span>
                  </div>
                  <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Industrial Weighbridges</span>
                    <div className="text-xl font-black text-[#0c2340]">
                      {certificates.filter(c => (c.equipment || c.instrument || '').toLowerCase().includes('weighbridge') || (c.equipment || c.instrument || '').toLowerCase().includes('tank')).length}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Logistics &amp; Port Hubs</span>
                  </div>
                  <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Anchored Ledger Seals</span>
                    <div className="text-xl font-black text-blue-700 font-mono">{certificates.length}</div>
                    <span className="text-[10px] text-blue-600 font-medium">Ed25519 Cryptographic</span>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search certificate, enterprise, serial, or officer..."
                      value={certSearchQuery}
                      onChange={(e) => setCertSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#d8e4f1] focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-gray-500 font-semibold">Status:</span>
                    <select
                      value={certStatusFilter}
                      onChange={(e) => setCertStatusFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-[#d8e4f1] bg-white text-gray-700 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Statuses ({certificates.length})</option>
                      <option value="Active">Active / Valid</option>
                      <option value="Expiring Soon">Expiring Soon</option>
                      <option value="Revoked">Expired / Revoked</option>
                    </select>
                  </div>
                </div>

                {/* Table of Issued Certificates */}
                <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#fafbfc] border-b border-[#e2e8f0] text-[#4e6073] font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Certificate Serial Number</th>
                          <th className="py-3 px-4">Certified Enterprise &amp; Equipment</th>
                          <th className="py-3 px-4">Validity Period</th>
                          <th className="py-3 px-4">Stamping Officer</th>
                          <th className="py-3 px-4">SHA-256 Ledger Hash</th>
                          <th className="py-3 px-4">Status &amp; Fee</th>
                          <th className="py-3 px-4 text-right">Certificate Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e8f0]">
                        {filteredCertificates.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-xs text-gray-500">
                              No certificates match your search query.
                            </td>
                          </tr>
                        ) : (
                          filteredCertificates.map((cert) => {
                            const certNo = cert.certificateNo || cert.certificateId || 'LM-CERT-2026-0001';
                            const est = cert.entityName || cert.owner || 'Commercial Enterprise';
                            const equip = cert.equipment || cert.instrument || 'Weighing Instrument';
                            const isDate = cert.issueDate || cert.verificationDate || '08 Sep 2026';
                            const valDate = cert.validTill || cert.expiryDate || '08 Sep 2027';
                            const offName = cert.officerName || cert.verifiedBy || 'Senior LMO';
                            const offBadge = cert.officerBadge || cert.lmoId || 'MH-LM-2041';
                            const hash = cert.sha256Hash || cert.digitalSignatureHash || 'ed25519:7a8b9c0d1e2f3a4b';

                            return (
                              <tr key={cert.id} className="hover:bg-[#fafbfc] transition-colors">
                                <td className="py-3.5 px-4 font-mono font-bold text-[#0c2340]">
                                  <div className="flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                                    <span>{certNo}</span>
                                  </div>
                                  <span className="text-[10px] text-gray-400 font-sans font-normal block mt-0.5">
                                    {cert.serialNumber ? `S/N: ${cert.serialNumber}` : 'Form 24 Seal'}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-[#121d26]">{est}</div>
                                  <div className="text-[11px] text-[#4e6073]">{equip}</div>
                                  {cert.capacity && (
                                    <span className="text-[10px] text-gray-500">Cap: {cert.capacity}</span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="text-xs text-[#121d26]">Issued: {isDate}</div>
                                  <div className="text-[11px] font-semibold text-emerald-700">Valid Till: {valDate}</div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-[#0c2340]">{offName}</div>
                                  <div className="font-mono text-[10px] text-[#4e6073]">{offBadge} • {cert.zone || 'Zone II'}</div>
                                </td>

                                <td className="py-3.5 px-4 font-mono text-[10px] text-gray-500">
                                  <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                    {hash.slice(0, 16)}...
                                  </span>
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
                                    {cert.status || 'Active'}
                                  </span>
                                  <div className="font-bold text-[#15803d] text-[11px]">{cert.feePaid || '₹1,500.00'}</div>
                                </td>

                                <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                                  <button
                                    onClick={() => handleViewCertificate(cert)}
                                    className="px-3 py-1.5 rounded-xl bg-[#eef8f1] hover:bg-[#dcfce7] text-[#15803d] border border-[#c6edd0] font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>View / Print</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleViewCertificate(cert);
                                      showToast('Form 24 Certificate Loaded', `Certificate ${certNo} opened. Click Download PDF inside preview.`, 'success');
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#0c2340] border border-gray-300 font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>PDF</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ASSIGNED APPLICATIONS PENDING CERTIFICATE GENERATION */}
            {activeCertTab === 'pending-verification' && (
              <div className="space-y-4">
                {/* Notice Banner */}
                <div className="bg-[#eef8f1] border border-[#c6edd0] rounded-xl p-4 flex items-start gap-3 text-xs">
                  <Sparkles className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-[#15803d] text-sm block">
                      Assigned Commercial Verification Dockets Ready for Stamping ({pendingVerificationApps.length} Applications)
                    </strong>
                    <p className="text-gray-700 leading-relaxed">
                      These applications have been filed by commercial enterprises and assigned to Legal Metrology Officers (LMO) or Govt Approved Test Centres (GATC).
                      Administrators can launch the statutory <strong>OIML R-76 Field Verification Protocol</strong> (Repeatability, Eccentricity, Linearity, and MPE Engine) to verify tolerances and stamp Form 24 Certificates, or trigger <strong>Instant Fast Stamping</strong>.
                    </p>
                  </div>
                </div>

                {/* Table of Assigned Applications */}
                <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#fafbfc] border-b border-[#e2e8f0] text-[#4e6073] font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Application Docket</th>
                          <th className="py-3 px-4">Commercial Enterprise</th>
                          <th className="py-3 px-4">Instrument Specifications</th>
                          <th className="py-3 px-4">Assigned Inspector / GATC</th>
                          <th className="py-3 px-4">Pipeline Status</th>
                          <th className="py-3 px-4">Stamping Fee</th>
                          <th className="py-3 px-4 text-right">Verification Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e8f0]">
                        {pendingVerificationApps.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-xs text-gray-500">
                              All assigned applications have been certified and stamped! No pending verification dockets.
                            </td>
                          </tr>
                        ) : (
                          pendingVerificationApps.map((app) => (
                            <tr key={app.id} className="hover:bg-[#fafbfc] transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-[#0c2340]">
                                <div className="font-mono text-[#0c2340] text-xs font-bold">{app.appNo}</div>
                                <span className="text-[10px] text-gray-400 font-sans block mt-0.5">
                                  Filing Date: {app.date} • {app.time}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-bold text-[#121d26]">{app.enterpriseName}</div>
                                <div className="text-[11px] text-[#4e6073]">{app.enterpriseType}</div>
                                <span className="text-[10px] text-gray-500 font-semibold">{app.zone}</span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-[#121d26]">{app.equipmentName}</div>
                                <div className="font-mono text-[10px] text-gray-500">S/N: {app.equipmentSerial}</div>
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#eef8f1] text-[#15803d] border border-[#c6edd0]">
                                  {app.equipmentClass}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                {app.assignedLmo ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] font-bold text-[10px] flex items-center justify-center">
                                      {app.assignedLmo.avatar || app.assignedLmo.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-bold text-[#0c2340]">{app.assignedLmo.name}</div>
                                      <div className="text-[10px] font-mono text-gray-500">{app.assignedLmo.badgeNo}</div>
                                    </div>
                                  </div>
                                ) : (app as any).assignedGatc ? (
                                  <div>
                                    <div className="font-bold text-[#0c2340]">{(app as any).assignedGatc.name}</div>
                                    <div className="text-[10px] font-mono text-purple-700">{(app as any).assignedGatc.code}</div>
                                  </div>
                                ) : (
                                  <span className="text-amber-700 font-semibold text-[11px] flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Unassigned
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${app.stageBadgeClass || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                  {app.stageLabel || app.stage}
                                </span>
                                <div className="text-[10px] text-gray-400 mt-0.5">SLA: {app.slaDeadline}</div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-bold text-[#15803d]">{app.feeAmount || '₹1,500.00'}</div>
                                <span className="text-[10px] text-emerald-600 font-semibold">{app.paymentStatus || 'Paid'}</span>
                              </td>

                              <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                                <button
                                  onClick={() => handleOpenVerificationForApp(app)}
                                  className="px-3 py-1.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-1 active:scale-[0.98]"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>Verify &amp; Generate Certificate</span>
                                </button>
                                <button
                                  onClick={() => handleGenerateCertificate(app, true)}
                                  className="px-3 py-1.5 rounded-xl bg-[#0c2340] hover:bg-[#1a365d] text-white font-bold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-1 active:scale-[0.98]"
                                >
                                  <Award className="w-3.5 h-3.5 text-[#4ade80]" />
                                  <span>Fast Stamp</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 9. REPORTS & AUDIT LOGS SCREEN */}
        {/* ========================================================= */}
        {activeScreen === 'reports-audit-logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-base text-[#0c2340] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#16a34a]" />
                  Directorate Regulatory Compliance &amp; Revenue Reports
                </h3>
                <p className="text-xs text-[#4e6073]">Consolidated audit logs, Bharatkosh fee reconciliations, and enforcement metrics</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    showToast('PDF Exported', 'Comprehensive Statutory Annual Audit Report downloaded as PDF.', 'success');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Annual PDF Report</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4e6073]">Total Bharatkosh Revenue</span>
                <div className="text-2xl font-extrabold text-[#0c2340]">₹42,85,250.00</div>
                <p className="text-xs text-emerald-600 font-semibold">+8.2% vs previous quarter</p>
              </div>

              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4e6073]">SLA Turnaround Adherence</span>
                <div className="text-2xl font-extrabold text-[#15803d]">97.4%</div>
                <p className="text-xs text-[#4e6073]">Average verification completion in 31.2 hrs</p>
              </div>

              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4e6073]">Enforcement Actions Executed</span>
                <div className="text-2xl font-extrabold text-rose-600">18 Warrants</div>
                <p className="text-xs text-[#4e6073]">Illegal tampering / unverified scale seizures</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 10. COMPLIANCE ALERTS SCREEN */}
        {/* ========================================================= */}
        {activeScreen === 'compliance-alerts' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-base text-[#0c2340] flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                  Statutory Non-Compliance &amp; Tampering Alerts
                </h3>
                <p className="text-xs text-[#4e6073]">Live enforcement warrants, seal breaks, and MPE deviation incidents</p>
              </div>

              <button
                onClick={() => setEmergencyAuditOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Dispatch Zonal Raid Squad</span>
              </button>
            </div>

            <div className="space-y-3">
              {alerts.map((alt) => (
                <div key={alt.id} className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-rose-300 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        alt.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : alt.severity === 'High'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {alt.severity} Severity
                      </span>
                      <span className="font-mono font-bold text-xs text-[#0c2340]">{alt.alertNo}</span>
                      <span className="text-xs text-[#4e6073]">• Reported: {alt.reportedAt}</span>
                    </div>

                    <h4 className="font-bold text-sm text-[#0c2340]">{alt.type}: {alt.entityName}</h4>
                    <p className="text-xs text-[#4e6073] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#16a34a]" /> {alt.location} ({alt.zone})
                    </p>
                    <div className="text-xs font-medium text-gray-700 bg-[#fafbfc] p-2.5 rounded-lg border border-[#e2e8f0]">
                      Statutory Action: {alt.actionTaken}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      alt.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {alt.status}
                    </span>

                    {alt.status !== 'Resolved' && (
                      <button
                        onClick={() => handleResolveAlert(alt.id)}
                        className="px-4 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                      >
                        Resolve &amp; Close Case
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: ASSIGN LMO OFFICER MODAL */}
      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* MODAL: ASSIGN LMO OFFICER OR GATC TEST CENTRE */}
      {/* ========================================================= */}
      {assignModalOpen && selectedAppForAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#16a34a]" />
                <div>
                  <h3 className="font-display font-bold text-base text-[#0c2340]">Assign Inspection &amp; Testing</h3>
                  <p className="text-[11px] text-gray-500">Dispatch field LMO or assign approved testing laboratory</p>
                </div>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#fafbfc] rounded-xl border border-[#e2e8f0] text-xs space-y-1">
              <div>Application No: <strong className="font-mono text-[#0c2340]">{selectedAppForAssignment.appNo}</strong></div>
              <div>Enterprise: <span className="font-semibold text-[#121d26]">{selectedAppForAssignment.enterpriseName}</span></div>
              <div>Equipment: <span className="font-bold text-[#15803d]">{selectedAppForAssignment.equipmentName}</span> (S/N: {selectedAppForAssignment.equipmentSerial})</div>
              <div>Jurisdiction Zone: <span className="text-[#0c2340] font-semibold">{selectedAppForAssignment.zone}</span></div>
            </div>

            {/* GATC Rules 2013 Statutory Scope Eligibility Notice */}
            {(() => {
              const eligibility = evaluateGatcEligibility(selectedAppForAssignment);
              return (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  eligibility.eligible ? 'bg-emerald-50/80 border-emerald-200' : 'bg-amber-50/80 border-amber-200'
                }`}>
                  {eligibility.eligible ? (
                    <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span className={eligibility.eligible ? 'text-[#15803d]' : 'text-amber-800'}>
                        {eligibility.eligible
                          ? `Statutory GATC Eligible [First Schedule Item #${eligibility.matchedScheduleItem?.itemNumber}: ${eligibility.matchedScheduleItem?.name}]`
                          : 'Direct Government LMO Inspection Required [Rule 3(1)]'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-700 mt-0.5 leading-relaxed">
                      {eligibility.reason}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Target Switcher: LMO vs GATC */}
            <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
              <button
                type="button"
                onClick={() => setAssignTargetType('lmo')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  assignTargetType === 'lmo' ? 'bg-[#16a34a] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Field Officer (LMO)
              </button>
              <button
                type="button"
                onClick={() => setAssignTargetType('gatc')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  assignTargetType === 'gatc' ? 'bg-[#0c2340] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>Govt Approved Test Centre (GATC)</span>
                {!evaluateGatcEligibility(selectedAppForAssignment).eligible && (
                  <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">
                    Prohibited
                  </span>
                )}
              </button>
            </div>

            {/* Inspection Date & Time Slot Scheduling */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Scheduled Date *</label>
                <input
                  type="date"
                  value={scheduledInspectionDate}
                  onChange={(e) => setScheduledInspectionDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Scheduled Slot *</label>
                <select
                  value={scheduledInspectionTime}
                  onChange={(e) => setScheduledInspectionTime(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                >
                  <option value="10:00 AM">10:00 AM - Morning Slot</option>
                  <option value="11:30 AM">11:30 AM - Noon Slot</option>
                  <option value="02:30 PM">02:30 PM - Afternoon Slot</option>
                  <option value="04:00 PM">04:00 PM - Evening Slot</option>
                </select>
              </div>
            </div>

            {/* List Selection */}
            {assignTargetType === 'lmo' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#4e6073] uppercase tracking-wider block">
                    Select Inspecting LMO Officer ({filteredOfficers.length} available)
                  </label>
                  <button
                    type="button"
                    onClick={() => setAddInspectorModalOpen(true)}
                    className="text-[11px] font-bold text-[#16a34a] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" /> + Add Inspector
                  </button>
                </div>

                {/* Real-time Officer Filter Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search officer by name, badge # or district..."
                    value={officerSearchQuery}
                    onChange={(e) => setOfficerSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  {selectedLmoId ? (
                    <span className="text-[11px] font-bold text-[#16a34a] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✓ 1 Officer Selected
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Choose an officer below
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {filteredOfficers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                      No officers match "{officerSearchQuery}".
                      <button
                        type="button"
                        onClick={() => setAddInspectorModalOpen(true)}
                        className="block mx-auto mt-1.5 text-[#16a34a] font-bold text-xs hover:underline cursor-pointer"
                      >
                        + Register New Field Inspector
                      </button>
                    </div>
                  ) : (
                    filteredOfficers.map((officer) => {
                    const officerKey = String((officer as any)._id || officer.id || officer.badgeNo);
                    const isSelected = Boolean(selectedLmoId && selectedLmoId === officerKey);
                    return (
                      <div
                        key={officerKey}
                        onClick={() => setSelectedLmoId(officerKey)}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-[#16a34a] bg-[#eef8f1] font-semibold ring-2 ring-[#16a34a]/30 shadow-xs'
                            : 'border-[#e2e8f0] bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Radio Selection Indicator */}
                          <div className="shrink-0">
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300 hover:border-gray-400" />
                            )}
                          </div>

                          <div className={`w-8 h-8 rounded-full border text-xs flex items-center justify-center font-bold shrink-0 ${
                            isSelected ? 'bg-[#16a34a] text-white border-[#16a34a]' : 'bg-white border-[#e2e8f0] text-[#16a34a]'
                          }`}>
                            {officer.avatar || officer.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[#0c2340] flex items-center gap-1.5">
                              <span>{officer.name}</span>
                              {isSelected && (
                                <span className="text-[9px] bg-[#16a34a] text-white px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                                  Selected
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#4e6073]">{officer.badgeNo} • {officer.zoneCode || officer.zone}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${officer.statusClass || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {officer.status}
                          </span>
                          <div className="text-[10px] text-gray-500 mt-0.5">{officer.inspectionsToday || 0} today</div>
                        </div>
                      </div>
                    );
                  }))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {!evaluateGatcEligibility(selectedAppForAssignment).eligible ? (
                  <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-800 space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-red-900">
                      <AlertOctagon className="w-4 h-4 text-red-600" />
                      Statutory Scope Restriction [Rule 3(1) of GATC Rules, 2013]
                    </div>
                    <p className="text-[11px] leading-relaxed text-red-700">
                      Under the 2013 Statutory Rules, GATCs are prohibited from verifying this instrument class. Verification requires mandatory direct Government Legal Metrology Officer (LMO) field inspection.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAssignTargetType('lmo')}
                      className="px-3 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs cursor-pointer inline-flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Switch to Field Officer (LMO)
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#4e6073] uppercase tracking-wider block">
                      Select Govt Approved Test Centre ({gatcCentres.length} available)
                    </label>
                    {selectedGatcId ? (
                      <span className="text-[11px] font-bold text-[#0c2340] bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full">
                        ✓ 1 Centre Selected
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Choose a centre below
                      </span>
                    )}
                  </div>
                )}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {gatcCentres.map((gatc) => {
                    const gatcKey = String((gatc as any)._id || gatc.id || gatc.code);
                    const isSelected = Boolean(selectedGatcId && selectedGatcId === gatcKey);
                    return (
                      <div
                        key={gatcKey}
                        onClick={() => setSelectedGatcId(gatcKey)}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-[#0c2340] bg-[#f0f4f9] font-semibold ring-2 ring-[#0c2340]/30 shadow-xs'
                            : 'border-[#e2e8f0] bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Radio Selection Indicator */}
                          <div className="shrink-0">
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-[#0c2340]" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300 hover:border-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[#0c2340] flex items-center gap-1.5">
                              <span>{gatc.name}</span>
                              {isSelected && (
                                <span className="text-[9px] bg-[#0c2340] text-white px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                                  Selected
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#4e6073]">{gatc.code} • {gatc.location}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {gatc.accreditationStandard || (gatc as any).nablAccreditationNo}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#d8e4f1] text-xs font-bold text-[#4e6073] hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                className="px-5 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                Confirm Dispatch &amp; Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: APPLICATION DETAILS DOCKET DRAWER */}
      {/* ========================================================= */}
      {detailModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#15803d] bg-[#eef8f1] px-2 py-0.5 rounded border border-[#c6edd0]">
                  {detailModalApp.appNo}
                </span>
                <h3 className="font-display font-bold text-base text-[#0c2340] mt-1">
                  Statutory Filing Docket Details
                </h3>
              </div>
              <button
                onClick={() => setDetailModalApp(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#fafbfc] rounded-xl border border-[#e2e8f0]">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Applicant Enterprise</span>
                  <span className="font-bold text-[#0c2340] text-sm">{detailModalApp.enterpriseName}</span>
                  <span className="text-[#4e6073] block text-[11px]">{detailModalApp.enterpriseType}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Jurisdiction Zone</span>
                  <span className="font-bold text-[#0c2340]">{detailModalApp.zone}</span>
                  <span className="text-[#4e6073] block text-[11px]">{detailModalApp.jurisdiction}</span>
                </div>
              </div>

              <div className="p-3 bg-[#fafbfc] rounded-xl border border-[#e2e8f0] space-y-1.5">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Equipment Specifications</span>
                <div className="flex justify-between">
                  <span className="text-[#4e6073]">Equipment Name:</span>
                  <span className="font-semibold text-[#121d26]">{detailModalApp.equipmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4e6073]">Serial Number:</span>
                  <span className="font-mono font-bold text-[#0c2340]">{detailModalApp.equipmentSerial}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4e6073]">Accuracy Class:</span>
                  <span className="font-semibold text-[#15803d]">{detailModalApp.equipmentClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4e6073]">Max Permissible Tolerance:</span>
                  <span className="font-mono">{detailModalApp.accuracyTolerance}</span>
                </div>
              </div>

              <div className="p-3 bg-[#fafbfc] rounded-xl border border-[#e2e8f0] space-y-1.5">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Assigned Inspection Details</span>
                <div className="flex justify-between">
                  <span className="text-[#4e6073]">Statutory Stage:</span>
                  <span className="font-bold text-[#15803d]">{detailModalApp.stageLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4e6073]">Assigned Officer:</span>
                  <span className="font-semibold text-[#0c2340]">
                    {detailModalApp.assignedLmo ? `${detailModalApp.assignedLmo.name} (${detailModalApp.assignedLmo.badgeNo})` : 'Unassigned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4e6073]">SLA Target Deadline:</span>
                  <span className="font-semibold">{detailModalApp.slaDeadline}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
              <button
                onClick={() => setDetailModalApp(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer"
              >
                Close Docket
              </button>
              {(detailModalApp.assignedLmo || (detailModalApp as any).assignedGatc) && detailModalApp.stage !== 'stamped' && (
                <button
                  onClick={() => {
                    const target = detailModalApp;
                    setDetailModalApp(null);
                    if (target) handleOpenVerificationForApp(target);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Statutory Verification &amp; Issue Certificate</span>
                </button>
              )}
              <button
                onClick={() => {
                  const target = detailModalApp;
                  setDetailModalApp(null);
                  if (target) handleOpenAssignModal(target);
                }}
                className="px-4 py-2 rounded-xl bg-[#0c2340] hover:bg-[#1a365d] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Dispatch / Schedule Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STATUTORY FIELD VERIFICATION & CERTIFICATE STAMPING MODAL */}
      {/* ========================================================= */}
      {verificationModalApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-2xl max-w-2xl w-full p-6 space-y-4 text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-[#0c2340]">
                      Statutory Field Verification &amp; Form 24 Stamping
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-[#16a34a] text-white text-[10px] font-bold uppercase tracking-wider">
                      OIML R 76-1
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4e6073]">
                    Section 24 of Legal Metrology Act, 2009 &bull; Rule 16 Mandatory Field Verification Protocol
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVerificationModalApp(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Instrument & Enterprise Card */}
            <div className="p-3.5 bg-[#fafbfc] rounded-xl border border-[#e2e8f0] text-xs space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#e2e8f0] pb-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Docket Application</span>
                  <div className="font-mono font-bold text-sm text-[#0c2340]">{verificationModalApp.appNo}</div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Commercial Applicant</span>
                  <div className="font-bold text-[#121d26]">{verificationModalApp.enterpriseName}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-gray-500 text-[10px] block font-semibold">Instrument:</span>
                  <strong className="text-[#0c2340] truncate block">{verificationModalApp.equipmentName}</strong>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block font-semibold">Serial Number:</span>
                  <span className="font-mono font-bold text-[#15803d]">{verificationModalApp.equipmentSerial}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block font-semibold">Accuracy Class:</span>
                  <span className="font-bold text-[#0c2340]">{verificationModalApp.equipmentClass}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block font-semibold">Assigned Inspector:</span>
                  <span className="font-bold text-[#0c2340]">
                    {verificationModalApp.assignedLmo?.name || (verificationModalApp as any).assignedGatc?.name || 'Senior LMO'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Tolerance Simulation Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-[#f8f9fa] rounded-xl border border-[#e2e8f0]">
              <span className="text-xs font-bold text-[#4e6073]">Field Reading Calibration Simulator:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleVerificationScenario('pass')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    verificationTestScenario === 'pass'
                      ? 'bg-[#16a34a] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ✓ Pass Calibration (+2.1 kg)
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleVerificationScenario('fail')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    verificationTestScenario === 'fail'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ✕ Exceeds Tolerance (+6.8 kg)
                </button>
              </div>
            </div>

            {/* 4 Checkpoint Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* 1. Repeatability */}
              <div className={`p-2.5 rounded-xl border ${isRepeatabilityPass ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
                <div className="text-[10px] text-gray-500 font-bold uppercase">1. Clause 3.6.1</div>
                <div className="text-xs font-extrabold text-[#0c2340] mt-0.5">Repeatability</div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="font-mono text-gray-600">&Delta;E: {varB.toFixed(1)}kg</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${isRepeatabilityPass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                    {isRepeatabilityPass ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>

              {/* 2. Eccentricity */}
              <div className={`p-2.5 rounded-xl border ${isEccentricityPass ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
                <div className="text-[10px] text-gray-500 font-bold uppercase">2. Clause 3.6.2</div>
                <div className="text-xs font-extrabold text-[#0c2340] mt-0.5">Eccentricity</div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="font-mono text-gray-600">5 Corners</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${isEccentricityPass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                    {isEccentricityPass ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>

              {/* 3. Linearity */}
              <div className={`p-2.5 rounded-xl border ${isLinearityPass ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
                <div className="text-[10px] text-gray-500 font-bold uppercase">3. Clause 3.5.1</div>
                <div className="text-xs font-extrabold text-[#0c2340] mt-0.5">Linearity Test</div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="font-mono text-gray-600">Hysteresis</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${isLinearityPass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                    {isLinearityPass ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>

              {/* 4. MPE Engine */}
              <div className={`p-2.5 rounded-xl border ${isMpePass ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
                <div className="text-[10px] text-gray-500 font-bold uppercase">4. Core Engine</div>
                <div className="text-xs font-extrabold text-[#0c2340] mt-0.5">MPE Engine</div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="font-mono text-gray-600">&plusmn;5.0kg MPE</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${isMpePass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                    {isMpePass ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>
            </div>

            {/* Statutory Stamping Gate Alert Banner */}
            <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              canGenerateCert ? 'bg-[#eef8f1] border-[#c6edd0] text-[#15803d]' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2">
                {canGenerateCert ? (
                  <ShieldCheck className="w-5 h-5 text-[#16a34a] shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <div className="font-bold">
                    {canGenerateCert
                      ? 'GATE UNLOCKED: ALL 4 STATUTORY TOLERANCE CRITERIA COMPLIANT'
                      : 'GATE LOCKED: READINGS EXCEED STATUTORY MPE (REPAIR ORDER MANDATED)'}
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    {canGenerateCert
                      ? 'Device calibrated within statutory limits. Ready for digital Form 24 certificate stamping.'
                      : 'Non-compliant observed error. Form V rejection order must be issued under Rule 16.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0] gap-2">
              <button
                type="button"
                onClick={() => setVerificationModalApp(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 cursor-pointer"
              >
                Close Window
              </button>

              <div className="flex items-center gap-2">
                {!canGenerateCert ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleToggleVerificationScenario('pass')}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-Verify (After Adjustment)</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const targetAppId = verificationModalApp.id || (verificationModalApp as any)._id || verificationModalApp.appNo;
                          await apiClient.updateApplication(targetAppId, {
                            status: 'FAIL',
                            stage: 'review',
                            stageLabel: 'Adjustment / Repair Notice Issued',
                            stageBadgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
                          });
                          setApplications(prev => prev.map(a => {
                            const aId = a.id || (a as any)._id || a.appNo;
                            return (aId === targetAppId || a.appNo === verificationModalApp.appNo)
                              ? { ...a, status: 'FAIL', stage: 'review', stageLabel: 'Adjustment / Repair Notice Issued', stageBadgeClass: 'bg-rose-50 text-rose-700 border-rose-200' }
                              : a;
                          }));
                          showToast('Rejection Notice Issued', `Form V Statutory Repair Notice issued for ${verificationModalApp.enterpriseName}.`, 'warning');
                          setVerificationModalApp(null);
                        } catch (err: any) {
                          showToast('Error', err?.message || 'Failed to issue notice.', 'error');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Issue Form V Rejection Notice
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmittingCert}
                    onClick={() => handleGenerateCertificate(verificationModalApp)}
                    className="px-5 py-2.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmittingCert ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Anchoring on Ledger...</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 text-[#4ade80]" />
                        <span>Generate &amp; Stamp Form 24 Certificate</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      <CertificateModal
        isOpen={certModalOpen}
        details={selectedCertData}
        onClose={() => setCertModalOpen(false)}
      />

      {/* Emergency Audit Modal */}
      <EmergencyAuditModal
        isOpen={emergencyAuditOpen}
        onClose={() => setEmergencyAuditOpen(false)}
        onDispatch={(zone, count) => {
          showToast(
            'Emergency Taskforce Deployed',
            `${count} enforcement teams dispatched with M1 calibration units to ${zone}.`,
            'warning'
          );
        }}
      />

      {/* ========================================================= */}
      {/* MODAL: REGISTER NEW INSPECTOR (LMO) */}
      {/* ========================================================= */}
      {addInspectorModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#d8e4f1] shadow-2xl max-w-lg w-full p-6 space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-[#0c2340]">
                    Register New Field Inspector (LMO)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Add authorized Legal Metrology Officer to zonal roster
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddInspectorModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInspector} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Inspector Full Name *</label>
                <input
                  type="text"
                  required
                  value={newInspectorData.name}
                  onChange={(e) => setNewInspectorData({ ...newInspectorData, name: e.target.value })}
                  placeholder="e.g. Rajesh Kumar Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Statutory Badge No *</label>
                  <input
                    type="text"
                    required
                    value={newInspectorData.badgeNo}
                    onChange={(e) => setNewInspectorData({ ...newInspectorData, badgeNo: e.target.value })}
                    placeholder="e.g. MH-LM-2026-09"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newInspectorData.phone}
                    onChange={(e) => setNewInspectorData({ ...newInspectorData, phone: e.target.value })}
                    placeholder="+91 98200 11223"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Official Email Address</label>
                <input
                  type="email"
                  value={newInspectorData.email}
                  onChange={(e) => setNewInspectorData({ ...newInspectorData, email: e.target.value })}
                  placeholder="inspector.name@legalmetrology.gov.in"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Zone / District</label>
                  <select
                    value={newInspectorData.zoneCode}
                    onChange={(e) => setNewInspectorData({ ...newInspectorData, zoneCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] bg-white font-medium"
                  >
                    <option value="Zone I - South Mumbai">Zone I - South Mumbai</option>
                    <option value="Zone II - Central & Port">Zone II - Central &amp; Port</option>
                    <option value="Zone III - Western Suburbs">Zone III - Western Suburbs</option>
                    <option value="Zone IV - Chembur Industrial">Zone IV - Chembur Industrial</option>
                    <option value="Zone V - Bhiwandi Logistics">Zone V - Bhiwandi Logistics</option>
                    <option value="Zone VI - Navi Mumbai Belt">Zone VI - Navi Mumbai Belt</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Initial Status</label>
                  <select
                    value={newInspectorData.status}
                    onChange={(e) => setNewInspectorData({ ...newInspectorData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] bg-white font-medium"
                  >
                    <option value="Available">Available for Dispatch</option>
                    <option value="On Site">Deployed On Site</option>
                    <option value="Transit">In Transit</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddInspectorModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Save &amp; Deploy Inspector</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GATC Second Schedule [Rule 5(1)] Accreditation & First Schedule Modal */}
      <GatcSecondScheduleModal
        isOpen={showGatcStatutoryModal}
        onClose={() => setShowGatcStatutoryModal(false)}
        onApplicationApproved={async () => {
          try {
            const freshCentres = await apiClient.getGatcCentres();
            if (Array.isArray(freshCentres)) setGatcCentres(freshCentres);
          } catch (e) {
            console.error('Failed to reload GATC centres after approval', e);
          }
        }}
        showToast={showToast}
      />

      {/* OWNER DOSSIER & REGULATORY APPROVAL MODAL */}
      {selectedOwnerForDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#0c2340]">
                    Regulated Entity Statutory Dossier
                  </h3>
                  <p className="text-[11px] text-gray-500 font-mono">
                    {selectedOwnerForDossier.licenseNo} • {selectedOwnerForDossier.registrationNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOwnerForDossier(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-bold text-[#0c2340]">{selectedOwnerForDossier.enterpriseName}</h4>
                <p className="text-gray-600 mt-0.5 font-medium">Authorized Legal Representative: {selectedOwnerForDossier.ownerName}</p>
                <p className="text-gray-500 text-[11px]">Contact: {selectedOwnerForDossier.contactPhone} • {selectedOwnerForDossier.contactEmail}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px]">
                <div>
                  <span className="text-gray-500 uppercase font-bold text-[10px] block">Enterprise Type</span>
                  <span className="font-semibold text-[#0c2340]">{selectedOwnerForDossier.enterpriseType}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase font-bold text-[10px] block">Jurisdiction Zone</span>
                  <span className="font-semibold text-[#0c2340]">{selectedOwnerForDossier.zone}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase font-bold text-[10px] block">Compliance Score</span>
                  <span className="font-bold text-[#16a34a] font-mono">{selectedOwnerForDossier.complianceScore}%</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase font-bold text-[10px] block">License Status</span>
                  <span className={`font-bold ${
                    selectedOwnerForDossier.status === 'Active'
                      ? 'text-emerald-700'
                      : selectedOwnerForDossier.status === 'Pending Verification'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}>
                    {selectedOwnerForDossier.status}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#e2e8f0] bg-[#fafbfc] space-y-1.5">
                <span className="font-bold text-[#0c2340] block">Regulatory LMPC License Details</span>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">Statutory License Number:</span>
                  <span className="font-mono font-bold text-[#15803d]">{selectedOwnerForDossier.licenseNo}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">Registered Devices Count:</span>
                  <span className="font-bold text-[#0c2340]">{selectedOwnerForDossier.registeredDevices} devices</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
              <button
                type="button"
                onClick={() => setSelectedOwnerForDossier(null)}
                className="px-3.5 py-1.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedOwnerForDossier.status !== 'Notice Issued' && (
                  <button
                    type="button"
                    onClick={() => handleIssueNoticeToOwner(selectedOwnerForDossier)}
                    className="px-3 py-1.5 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 font-bold cursor-pointer"
                  >
                    Issue Notice
                  </button>
                )}

                {selectedOwnerForDossier.status !== 'Active' && (
                  <button
                    type="button"
                    onClick={() => handleApproveOwnerLicense(selectedOwnerForDossier)}
                    className="px-4 py-1.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve LMPC License</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW COMMERCIAL OWNER MODAL */}
      {addOwnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#16a34a]" />
                <div>
                  <h3 className="font-display font-bold text-base text-[#0c2340]">
                    Register Regulated Commercial Owner
                  </h3>
                  <p className="text-xs text-gray-500">
                    Add manufacturer, importer, dealer, or bulk weighbridge owner
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddOwnerModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOwner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Enterprise / Commercial Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai Precision Scales & Calibrations Ltd."
                  value={newOwnerData.enterpriseName}
                  onChange={(e) => setNewOwnerData({ ...newOwnerData, enterpriseName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Primary Owner / Director Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ratan Shinde"
                    value={newOwnerData.ownerName}
                    onChange={(e) => setNewOwnerData({ ...newOwnerData, ownerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Regulated Category *</label>
                  <select
                    value={newOwnerData.enterpriseType}
                    onChange={(e) => setNewOwnerData({ ...newOwnerData, enterpriseType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] bg-white font-medium"
                  >
                    <option value="Trader / Retailer">Trader / Retailer</option>
                    <option value="Manufacturer">Manufacturer (Rule 27)</option>
                    <option value="Importer">Importer (Rule 28)</option>
                    <option value="Repairer">Repairer</option>
                    <option value="Bulk Weighbridge Depot">Bulk Weighbridge Depot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98200 12345"
                    value={newOwnerData.contactPhone}
                    onChange={(e) => setNewOwnerData({ ...newOwnerData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="owner@enterprise.in"
                    value={newOwnerData.contactEmail}
                    onChange={(e) => setNewOwnerData({ ...newOwnerData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Jurisdiction / Zone</label>
                  <select
                    value={newOwnerData.zone}
                    onChange={(e) => setNewOwnerData({ ...newOwnerData, zone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] bg-white font-medium"
                  >
                    <option value="Zone I (South Mumbai)">Zone I (South Mumbai)</option>
                    <option value="Zone II (Mumbai Central)">Zone II (Mumbai Central)</option>
                    <option value="Zone III (Western Suburbs)">Zone III (Western Suburbs)</option>
                    <option value="Zone IV (Chembur Eastern)">Zone IV (Chembur Eastern)</option>
                    <option value="Zone V (Bhiwandi Hub)">Zone V (Bhiwandi Hub)</option>
                    <option value="Zone VI (Navi Mumbai MIDC)">Zone VI (Navi Mumbai MIDC)</option>
                    <option value="Zone VII (Pune Urban)">Zone VII (Pune Urban)</option>
                    <option value="Zone VIII (Nashik Agro)">Zone VIII (Nashik Agro)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">License Status</label>
                  <select
                    value={newOwnerData.status}
                    onChange={(e) => setNewOwnerData({ ...newOwnerData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16a34a] bg-white font-medium"
                  >
                    <option value="Pending Verification">Pending Verification (Needs Approval)</option>
                    <option value="Active">Active &amp; Approved</option>
                    <option value="Notice Issued">Notice Issued</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddOwnerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save &amp; Register Entity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LogoutOverlay
        isOpen={isLoggingOut}
        userName={adminProfile.name}
        userRole="Directorate Administrator"
        onComplete={onLogout}
      />
    </div>
  );
};
