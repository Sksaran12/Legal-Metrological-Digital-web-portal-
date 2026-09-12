import React, { useState } from 'react';
import { LogoutOverlay } from '../../common/LogoutOverlay';
import {
  Scale,
  Building2,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Search,
  Filter,
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  FileCheck,
  Download,
  Printer,
  ExternalLink,
  ChevronRight,
  X,
  MapPin,
  Calendar,
  UserCheck,
  Hash,
  Layers,
  FileText,
  BadgeAlert,
  ArrowUpRight,
  ShieldAlert,
  RotateCcw,
  Plus
} from 'lucide-react';
import { UserSession } from '../../../types';
import { EverimetLogo } from '../../common/EverimetLogo';

export type VerificationStage =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'scheduled'
  | 'under_verification'
  | 'verified'
  | 'certificate_issued'
  | 'failed';

export interface VerificationApplicationItem {
  id: string;
  instrumentType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  capacity: string;
  accuracyClass: string;
  verificationType: string;
  installationAddress: string;
  gpsCoordinates?: string;
  appliedDate: string;
  lastUpdated: string;
  status: VerificationStage;
  paidFee?: string;
  paymentStatus?: string;
  txnId?: string;
  // Dynamic details
  assignedOfficer?: {
    name: string;
    id: string;
    designation: string;
    phone?: string;
  };
  scheduledDate?: string;
  scheduledTime?: string;
  inspectionLocation?: string;
  testResults?: {
    standardWeightUsed?: string;
    observedError?: string;
    maxPermissibleError?: string;
    sealNumber?: string;
    result: 'passed' | 'failed' | 'pending';
    failureReason?: string;
    rejectionFormNo?: string;
  };
  certificateDetails?: {
    certNo: string;
    validUntil: string;
    issuedDate: string;
    officerName: string;
    officerId: string;
  };
  timelineNotes?: {
    stage: string;
    note: string;
    date: string;
  }[];
}

interface TrackApplicationPageProps {
  userSession?: UserSession;
  applications: VerificationApplicationItem[];
  onBack: () => void;
  onLogout: () => void;
  showToast?: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  onOpenApply?: () => void;
  onOpenCertificate?: (details: any) => void;
}

export const TrackApplicationPage: React.FC<TrackApplicationPageProps> = ({
  userSession,
  applications,
  onBack,
  onLogout,
  showToast,
  onOpenApply,
  onOpenCertificate
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [activeTrackingApp, setActiveTrackingApp] = useState<VerificationApplicationItem | null>(null);

  // Status badge styling helper
  const getStatusBadge = (status: VerificationStage) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft (Incomplete)',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300',
          icon: Clock
        };
      case 'submitted':
        return {
          label: 'Submitted',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          icon: FileText
        };
      case 'under_review':
        return {
          label: 'Under Review',
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-700',
          borderColor: 'border-indigo-200',
          icon: ShieldCheck
        };
      case 'assigned':
        return {
          label: 'Assigned',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
          icon: UserCheck
        };
      case 'scheduled':
        return {
          label: 'Scheduled',
          bgColor: 'bg-sky-50',
          textColor: 'text-sky-700',
          borderColor: 'border-sky-200',
          icon: Calendar
        };
      case 'under_verification':
        return {
          label: 'Under Verification',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-300',
          icon: Clock
        };
      case 'verified':
        return {
          label: 'Verified',
          bgColor: 'bg-teal-50',
          textColor: 'text-teal-700',
          borderColor: 'border-teal-300',
          icon: CheckCircle2
        };
      case 'certificate_issued':
        return {
          label: 'Certificate Issued',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-300',
          icon: CheckCircle2
        };
      case 'failed':
        return {
          label: 'Verification Failed',
          bgColor: 'bg-rose-50',
          textColor: 'text-rose-700',
          borderColor: 'border-rose-300',
          icon: AlertOctagon
        };
      default:
        return {
          label: status,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: Clock
        };
    }
  };

  // Filter applications by search and status tab
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.instrumentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.installationAddress.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedStatusFilter === 'all') return true;
    if (selectedStatusFilter === 'in_progress') {
      return ['submitted', 'under_review', 'assigned', 'scheduled', 'under_verification'].includes(app.status);
    }
    if (selectedStatusFilter === 'certified') {
      return ['verified', 'certificate_issued'].includes(app.status);
    }
    if (selectedStatusFilter === 'failed') {
      return app.status === 'failed';
    }
    if (selectedStatusFilter === 'draft') {
      return app.status === 'draft';
    }

    return app.status === selectedStatusFilter;
  });

  // Calculate stats
  const totalCount = applications.length;
  const certifiedCount = applications.filter((a) => a.status === 'certificate_issued' || a.status === 'verified').length;
  const inProgressCount = applications.filter((a) =>
    ['submitted', 'under_review', 'assigned', 'scheduled', 'under_verification'].includes(a.status)
  ).length;
  const failedCount = applications.filter((a) => a.status === 'failed').length;
  const draftCount = applications.filter((a) => a.status === 'draft').length;

  // Trigger certificate download / modal
  const handleDownloadCertificate = (app: VerificationApplicationItem) => {
    const certDetails = {
      certNo: app.certificateDetails?.certNo || `IN-MH-2026-${app.id.slice(-4)}-VER`,
      docketId: app.id,
      establishment: userSession?.name || 'M/S Metro Weighment & Trading Co.',
      instrumentType: `${app.manufacturer} ${app.model} (${app.instrumentType})`,
      accuracyClass: app.accuracyClass,
      maxCapacity: app.capacity,
      e: 'e = 5 g / d = 1 g',
      officerName: app.certificateDetails?.officerName || app.assignedOfficer?.name || (app as any).assignedLmo?.name || 'Legal Metrology Officer',
      officerId: app.certificateDetails?.officerId || app.assignedOfficer?.id || (app as any).assignedLmo?.badgeNo || 'MH-LM-2041',
      date: app.certificateDetails?.issuedDate || '04 Sep 2026',
      validUntil: app.certificateDetails?.validUntil || '03 Sep 2027',
      status: 'VERIFIED & STAMPED'
    };

    if (onOpenCertificate) {
      onOpenCertificate(certDetails);
    } else {
      // Fallback direct printable download
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Certificate of Verification - ${certDetails.certNo}</title>
              <style>
                body { font-family: sans-serif; padding: 40px; color: #111; line-height: 1.6; }
                .border { border: 4px double #16a34a; padding: 30px; border-radius: 8px; }
                h1, h2, h3 { text-align: center; margin: 5px 0; color: #0c2340; }
                .badge { text-align: center; font-weight: bold; color: #16a34a; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 13px; }
                th { background: #f8f9fa; }
                .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="border">
                <div class="badge">GOVERNMENT OF INDIA • DIRECTORATE OF LEGAL METROLOGY</div>
                <h2>CERTIFICATE OF VERIFICATION (FORM VII)</h2>
                <h3>[See Rule 24 of The Legal Metrology (General) Rules, 2011]</h3>
                <p style="text-align: center; font-size: 12px; color: #666;">Certificate No: <b>${certDetails.certNo}</b> | Docket ID: <b>${certDetails.docketId}</b></p>
                <table>
                  <tr><th>Owner / Establishment</th><td>${certDetails.establishment}</td></tr>
                  <tr><th>Instrument & Make</th><td>${certDetails.instrumentType}</td></tr>
                  <tr><th>Serial Number</th><td>${app.serialNumber}</td></tr>
                  <tr><th>Accuracy Class & Capacity</th><td>${certDetails.accuracyClass} - ${certDetails.maxCapacity}</td></tr>
                  <tr><th>Premises / Location</th><td>${app.installationAddress}</td></tr>
                  <tr><th>Verification Status</th><td><b>PASSED & STAMPED (Lead Holographic Seal Affixed)</b></td></tr>
                  <tr><th>Date of Verification</th><td>${certDetails.date}</td></tr>
                  <tr><th>Next Periodic Verification Due</th><td><b>${certDetails.validUntil}</b></td></tr>
                  <tr><th>Verifying Metrology Officer</th><td>${certDetails.officerName} (${certDetails.officerId})</td></tr>
                </table>
                <div class="footer">
                  <div>Date: ${certDetails.date}</div>
                  <div>Signature & Statutory Seal of Legal Metrology Officer</div>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }

    if (showToast) {
      showToast(
        'Certificate Ready',
        `Verification Certificate ${app.certificateDetails?.certNo || app.id} downloaded successfully.`,
        'success'
      );
    }
  };

  // Generate Stage Progression Data for an application
  const getStageProgression = (app: VerificationApplicationItem) => {
    // If application is draft
    if (app.status === 'draft') {
      return {
        isDraft: true,
        stages: [
          {
            key: 'draft',
            name: 'Draft',
            status: 'current' as const,
            title: 'Draft Incomplete',
            description: 'Application details saved. Pending document upload or final submission.',
            date: app.lastUpdated,
            badge: 'Incomplete'
          }
        ]
      };
    }

    // Fully submitted pipeline
    const pipelineOrder = [
      'submitted',
      'under_review',
      'assigned',
      'scheduled',
      'under_verification'
    ];

    const currentStatus = app.status;

    // Determine state for each step in normal chain
    const stages: Array<{
      key: string;
      name: string;
      title: string;
      description: string;
      state: 'completed' | 'current' | 'pending' | 'failed';
      date?: string;
      details?: string;
    }> = [];

    // Helper to check index
    const getStageState = (stageKey: string) => {
      if (currentStatus === 'failed') {
        if (stageKey === 'submitted' || stageKey === 'under_review' || stageKey === 'assigned' || stageKey === 'scheduled' || stageKey === 'under_verification') {
          return 'completed';
        }
      }

      if (currentStatus === 'certificate_issued' || currentStatus === 'verified') {
        return 'completed';
      }

      const currentIndex = pipelineOrder.indexOf(currentStatus);
      const thisIndex = pipelineOrder.indexOf(stageKey);

      if (thisIndex < currentIndex) return 'completed';
      if (thisIndex === currentIndex) return 'current';
      return 'pending';
    };

    // 1. Submitted
    stages.push({
      key: 'submitted',
      name: 'Submitted',
      title: 'Application Docket Submitted',
      description: 'Application received and registered in the National Metrology System. Statutory inspection fee verified.',
      state: getStageState('submitted'),
      date: app.appliedDate,
      details: 'Fee TXN: BH-2026-98124 | Receipt Settled'
    });

    // 2. Under Review
    stages.push({
      key: 'under_review',
      name: 'Under Review',
      title: 'Scrutiny & Document Verification',
      description: 'Legal Metrology Officer verifying Model Approval certificate, manufacturer credentials, and capacity tolerances.',
      state: getStageState('under_review'),
      date: app.status === 'submitted' ? 'Pending officer queue' : '02 Sep 2026, 02:15 PM',
      details: 'Model Approval Certificate matched with Central Metrology Database'
    });

    // 3. Assigned
    stages.push({
      key: 'assigned',
      name: 'Assigned',
      title: 'Allocated to Inspecting Officer',
      description: app.assignedOfficer
        ? `Application assigned to ${app.assignedOfficer.name} (${app.assignedOfficer.id}), ${app.assignedOfficer.designation}.`
        : 'Jurisdictional roster allocation in progress.',
      state: getStageState('assigned'),
      date: app.assignedOfficer ? '03 Sep 2026, 10:00 AM' : undefined,
      details: app.assignedOfficer ? `Officer ID: ${app.assignedOfficer.id} • Phone: ${app.assignedOfficer.phone || '+91 98200 11223'}` : undefined
    });

    // 4. Scheduled
    stages.push({
      key: 'scheduled',
      name: 'Scheduled',
      title: 'Inspection Slot Scheduled',
      description: app.scheduledDate
        ? `Field verification visit confirmed for ${app.scheduledDate} (${app.scheduledTime || '11:00 AM'}).`
        : 'Inspection date being confirmed with local testing team.',
      state: getStageState('scheduled'),
      date: app.scheduledDate,
      details: `Premises: ${app.installationAddress}`
    });

    // 5. Under Verification
    stages.push({
      key: 'under_verification',
      name: 'Under Verification',
      title: 'Physical Testing & Stamping In Progress',
      description: 'Physical inspection with certified standard test weights, sensitivity tests, and error determination against MPE tolerances.',
      state: getStageState('under_verification'),
      date: app.status === 'under_verification' ? 'Active On-Site Inspection' : undefined,
      details: app.testResults?.standardWeightUsed ? `Standard Weights: ${app.testResults.standardWeightUsed}` : 'Working standards: Class M1/F2 Weights applied'
    });

    // Branching after Under Verification:
    // If failed:
    if (currentStatus === 'failed') {
      stages.push({
        key: 'failed',
        name: 'Failed',
        title: 'Verification Failed (Rejection Notice Issued)',
        description: app.testResults?.failureReason || 'Error exceeded Maximum Permissible Error (MPE) tolerance limits. Lead seal could not be affixed.',
        state: 'failed',
        date: app.lastUpdated,
        details: `Rejection Form VIII Issued (${app.testResults?.rejectionFormNo || 'FORM-VIII-MH-9102'}). 14-day statutory rectification window granted for recalibration.`
      });
    } else {
      // Normal flow: Verified -> Certificate Issued
      const isVerifiedOrCert = currentStatus === 'verified' || currentStatus === 'certificate_issued';
      const isCertIssued = currentStatus === 'certificate_issued';

      stages.push({
        key: 'verified',
        name: 'Verified',
        title: 'Standards Verified & Seal Affixed',
        description: 'Instrument passed all statutory calibration tests within legal MPE tolerances. Official tamper-proof seal affixed.',
        state: isCertIssued ? 'completed' : currentStatus === 'verified' ? 'current' : 'pending',
        date: isVerifiedOrCert ? (app.certificateDetails?.issuedDate || '04 Sep 2026') : undefined,
        details: app.testResults?.sealNumber ? `Holographic Seal No: ${app.testResults.sealNumber}` : 'Lead wire holographic seal applied'
      });

      stages.push({
        key: 'certificate_issued',
        name: 'Certificate Issued',
        title: 'Statutory Verification Certificate Issued',
        description: 'Official Certificate of Verification (Form VII) digitally signed and registered. Valid for 12 months.',
        state: isCertIssued ? 'completed' : 'pending',
        date: isCertIssued ? (app.certificateDetails?.issuedDate || '04 Sep 2026') : undefined,
        details: isCertIssued ? `Certificate No: ${app.certificateDetails?.certNo} • Valid Until: ${app.certificateDetails?.validUntil}` : 'Pending final officer digital signature'
      });
    }

    return {
      isDraft: false,
      stages
    };
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#eef2f7] via-[#f7f9fb] to-[#e8eef5] flex flex-col justify-start items-center py-8 sm:py-12 px-4 sm:px-6 md:px-8 selection:bg-[#ccfbf1] selection:text-[#134e4a]">
      <div className="max-w-6xl w-full space-y-6">
        {/* National Crest & Portal Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <EverimetLogo variant="icon" size="lg" className="p-2.5 bg-white border border-[#cbd5e1] shadow-sm rounded-2xl shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#edf7f6] text-[#0f766e] border border-[#bfe3df]">
                  Government of India • Legal Metrology
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-500">
                  e-VeriMet
                </span>
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0c2340] tracking-tight mt-0.5">
                <span className="text-[#0f766e]">e</span>-VeriMet <span className="text-gray-300 font-light">|</span> Track Applications
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">
                Real-time statutory tracking of applied weights and measures verification dockets
              </p>
            </div>
          </div>

          {/* User Session & Back to Dashboard */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl border border-[#d8e4f1] bg-white text-xs font-bold text-[#121d26] hover:bg-[#f0f4f9] hover:border-[#16a34a] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>Back to Dashboard</span>
            </button>

            <button
              onClick={() => setIsLoggingOut(true)}
              className="p-2 text-gray-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl border border-[#d8e4f1] bg-white shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-500 block">Total Applied</span>
            <div className="text-xl font-extrabold text-[#121d26] mt-0.5">{totalCount}</div>
          </div>
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-blue-700 block">In Progress</span>
            <div className="text-xl font-extrabold text-blue-900 mt-0.5">{inProgressCount}</div>
          </div>
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-700 block">Certified / Issued</span>
            <div className="text-xl font-extrabold text-emerald-900 mt-0.5">{certifiedCount}</div>
          </div>
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-rose-700 block">Verification Failed</span>
            <div className="text-xl font-extrabold text-rose-900 mt-0.5">{failedCount}</div>
          </div>
          <div className="p-3.5 rounded-xl border border-gray-300 bg-gray-50 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-gray-600 block">Draft Applications</span>
            <div className="text-xl font-extrabold text-gray-800 mt-0.5">{draftCount}</div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="gov-panel rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Docket #, Serial, Model, Make..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#cbd5e1] text-sm font-medium text-[#121d26] placeholder-gray-400 bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Apply New Verification Quick Link */}
            {onOpenApply && (
              <button
                onClick={onOpenApply}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0f766e] text-white text-sm font-bold hover:bg-[#115e59] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply for New Verification</span>
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0">
              Filter:
            </span>
            {[
              { id: 'all', label: `All (${totalCount})` },
              { id: 'in_progress', label: `In Progress (${inProgressCount})` },
              { id: 'certified', label: `Certificate Issued (${certifiedCount})` },
              { id: 'failed', label: `Failed (${failedCount})` },
              { id: 'draft', label: `Drafts (${draftCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedStatusFilter === tab.id
                    ? 'bg-[#16a34a] text-white shadow-xs'
                    : 'bg-[#f0f4f9] hover:bg-[#e2e8f0] text-[#4e6073]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List Table / Card View */}
        <div className="gov-panel rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#e2e8f0] bg-[#f8fafc] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-extrabold text-base text-[#121d26]">
                Applied Verification Applications
              </h2>
              <p className="text-xs text-gray-500">
                Click <span className="font-bold text-[#16a34a]">"Track"</span> beside any application to open its detailed progress menu
              </p>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Showing {filteredApplications.length} of {applications.length} applications
            </span>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#121d26]">No verification applications found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No applications matched your search or filter. You can submit a new verification application anytime.
              </p>
              {onOpenApply && (
                <button
                  onClick={onOpenApply}
                  className="px-4 py-2 rounded-xl bg-[#16a34a] text-white text-xs font-bold hover:bg-[#15803d] transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Apply for Verification</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#e2e8f0]">
              {filteredApplications.map((app) => {
                const badge = getStatusBadge(app.status);
                const BadgeIcon = badge.icon;
                const isCertified = app.status === 'certificate_issued';

                return (
                  <div
                    key={app.id}
                    id={`app-card-${app.id}`}
                    className="p-4 sm:p-5 hover:bg-[#fafcff] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left & Center: Application Summary Details */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#eef8f1] text-[#15803d] border border-[#c6edd0]">
                          {app.id}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bgColor} ${badge.textColor} ${badge.borderColor}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>

                        <span className="text-[11px] text-gray-400 font-medium">
                          Applied on {app.appliedDate}
                        </span>
                      </div>

                      {/* Instrument Information */}
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-bold text-sm text-[#121d26]">
                          {app.manufacturer} {app.model}
                        </span>
                        <span className="text-xs text-gray-600">
                          ({app.instrumentType})
                        </span>
                        <span className="text-xs font-mono text-gray-500">
                          S/N: <b>{app.serialNumber}</b>
                        </span>
                      </div>

                      {/* Specifications & Location */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-[#16a34a]" />
                          <span>Capacity: <b>{app.capacity}</b> ({app.accuracyClass})</span>
                        </div>

                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-md">{app.installationAddress}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions Column (Track button prominently displayed beside each application) */}
                    <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                      {/* Download Certificate Option if Certificate is Issued */}
                      {isCertified && (
                        <button
                          type="button"
                          onClick={() => handleDownloadCertificate(app)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          title="Download Official Verification Certificate (Form VII)"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Download Certificate</span>
                        </button>
                      )}

                      {/* Track Button beside each application */}
                      <button
                        type="button"
                        id={`btn-track-${app.id}`}
                        onClick={() => setActiveTrackingApp(app)}
                        className="px-4 py-2 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer group"
                      >
                        <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                        <span>Track</span>
                        <ChevronRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info matching portal standards */}
        <p className="text-center text-[11px] text-gray-500 pb-4">
          National Legal Metrology Portal • Directorate of Legal Metrology, Department of Consumer Affairs, Government of India
        </p>
      </div>

      {/* =========================================================================
          SLIDING TRACK MENU DRAWER / MODAL
          Opens when user clicks "Track" beside any applied verification application
          Displays exact progress stage:
          - If incomplete: displays Draft
          - If submitted: submitted -> under review -> assigned -> scheduled -> under verification
            -> verified -> certificate issued (with download certificate option)
            OR after under verification: failed (if failed to verify)
      ========================================================================= */}
      {activeTrackingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 bg-[#f8fafc] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] flex items-center justify-center font-bold shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#15803d] uppercase tracking-wider bg-[#eef8f1] border border-[#c6edd0] px-2 py-0.5 rounded">
                      Docket {activeTrackingApp.id}
                    </span>
                    {(() => {
                      const badge = getStatusBadge(activeTrackingApp.status);
                      const Icon = badge.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bgColor} ${badge.textColor} ${badge.borderColor}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      );
                    })()}
                  </div>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-[#0c2340] mt-0.5">
                    {activeTrackingApp.manufacturer} {activeTrackingApp.model}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveTrackingApp(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Close tracking menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Tracking Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* Application Details Summary Grid */}
              <div className="p-4 rounded-xl border border-[#d8e4f1] bg-[#fdfdfd] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block text-[11px]">Instrument Type</span>
                  <span className="font-bold text-[#121d26]">{activeTrackingApp.instrumentType}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Serial Number</span>
                  <span className="font-mono font-bold text-[#121d26]">{activeTrackingApp.serialNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Capacity & Accuracy</span>
                  <span className="font-bold text-[#121d26]">{activeTrackingApp.capacity} ({activeTrackingApp.accuracyClass})</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500 block text-[11px]">Installation Address</span>
                  <span className="font-medium text-[#121d26]">{activeTrackingApp.installationAddress}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">GPS Coordinates</span>
                  <span className="font-mono text-gray-700">{activeTrackingApp.gpsCoordinates || '19.07600° N, 72.87770° E'}</span>
                </div>
              </div>

              {/* Progress Menu & Stage Stepper */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h4 className="font-bold text-sm text-[#0c2340] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#16a34a]" />
                    <span>Application Lifecycle Progress</span>
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    Live Tracking as of Today
                  </span>
                </div>

                {/* Stepper Display */}
                {(() => {
                  const progression = getStageProgression(activeTrackingApp);

                  // 1. If Draft (Incomplete)
                  if (progression.isDraft) {
                    return (
                      <div className="mt-4 p-5 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                              Status: DRAFT
                            </span>
                            <h5 className="font-bold text-sm text-[#121d26] mt-1">
                              Application Incomplete — Draft Saved
                            </h5>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          This verification application was saved as a draft on <b>{activeTrackingApp.appliedDate}</b>.
                          It has not been fully submitted to the Legal Metrology Officer queue. Please upload remaining documentation and complete the application to initiate verification.
                        </p>
                        <div className="pt-2 flex items-center gap-2">
                          {onOpenApply && (
                            <button
                              onClick={() => {
                                setActiveTrackingApp(null);
                                onOpenApply();
                              }}
                              className="px-4 py-2 rounded-xl bg-[#16a34a] text-white text-xs font-bold hover:bg-[#15803d] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Complete & Submit Application</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // 2. Fully Submitted Progression:
                  // submitted -> under_review -> assigned -> scheduled -> under_verification -> verified -> certificate_issued OR failed
                  return (
                    <div className="mt-4 space-y-4">
                      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#e2e8f0]">
                        {progression.stages.map((stage, idx) => {
                          const isCompleted = stage.state === 'completed';
                          const isCurrent = stage.state === 'current';
                          const isFailed = stage.state === 'failed';
                          const isPending = stage.state === 'pending';

                          return (
                            <div key={stage.key} className="relative">
                              {/* Step Node Marker */}
                              <div
                                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                                  isCompleted
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                                    : isFailed
                                    ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                                    : isCurrent
                                    ? 'bg-[#16a34a] border-[#16a34a] text-white ring-4 ring-[#bbf7d0] shadow-xs'
                                    : 'bg-white border-gray-300 text-gray-400'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                ) : isFailed ? (
                                  <AlertOctagon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                ) : isCurrent ? (
                                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>

                              {/* Stage Content Card */}
                              <div
                                className={`p-4 rounded-xl border transition-all ${
                                  isCurrent
                                    ? 'border-[#16a34a] bg-[#f0fdf4] shadow-xs ring-1 ring-[#16a34a]/20'
                                    : isFailed
                                    ? 'border-rose-300 bg-rose-50/50 shadow-xs'
                                    : isCompleted
                                    ? 'border-emerald-200 bg-[#f9fdfa]'
                                    : 'border-gray-200 bg-gray-50/50 opacity-60'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-xs font-bold uppercase tracking-wider ${
                                        isFailed
                                          ? 'text-rose-700'
                                          : isCompleted
                                          ? 'text-emerald-700'
                                          : isCurrent
                                          ? 'text-[#16a34a]'
                                          : 'text-gray-500'
                                      }`}
                                    >
                                      {stage.name}
                                    </span>

                                    {isCurrent && (
                                      <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#14532d] text-[10px] font-bold animate-pulse">
                                        Current Step
                                      </span>
                                    )}

                                    {isFailed && (
                                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                                        Action Required
                                      </span>
                                    )}
                                  </div>

                                  {stage.date && (
                                    <span className="text-[11px] font-mono text-gray-500">
                                      {stage.date}
                                    </span>
                                  )}
                                </div>

                                <h5 className="font-bold text-xs sm:text-sm text-[#121d26] mt-1">
                                  {stage.title}
                                </h5>

                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                  {stage.description}
                                </p>

                                {stage.details && (
                                  <div className="mt-2 text-[11px] font-mono text-gray-700 bg-white/80 p-2 rounded-lg border border-gray-200">
                                    {stage.details}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Special Action Block: If Certificate is Issued, give Download Certificate Option */}
              {activeTrackingApp.status === 'certificate_issued' && (
                <div className="p-4 sm:p-5 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-[#f3fbf6] to-emerald-50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold uppercase tracking-wider">
                          Statutory Verification Passed
                        </span>
                        <h4 className="font-display font-extrabold text-sm sm:text-base text-[#121d26] mt-0.5">
                          Verification Certificate is Ready for Download
                        </h4>
                        <p className="text-xs text-gray-600">
                          Form VII Certificate No: <b className="font-mono">{activeTrackingApp.certificateDetails?.certNo}</b> • Valid until <b className="font-mono">{activeTrackingApp.certificateDetails?.validUntil}</b>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadCertificate(activeTrackingApp)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Certificate</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Special Action Block: If Failed, give Remediation notice info */}
              {activeTrackingApp.status === 'failed' && (
                <div className="p-4 sm:p-5 rounded-2xl border border-rose-300 bg-rose-50/70 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-bold uppercase tracking-wider">
                        Rejection Notice Form VIII
                      </span>
                      <h4 className="font-bold text-sm text-rose-950 mt-0.5">
                        Verification Failed — Mandatory Rectification Notice
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    This instrument was inspected under Rule 18 and found not compliant with statutory Maximum Permissible Error (MPE) limits.
                    A 14-day statutory rectification window is granted. You may engage a licensed Legal Metrology repairer to recalibrate the instrument and request re-verification without penalty.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-[#f8fafc] flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500 font-medium">
                National Legal Metrology Verification System
              </span>

              <div className="flex items-center gap-2">
                {activeTrackingApp.status === 'certificate_issued' && (
                  <button
                    type="button"
                    onClick={() => handleDownloadCertificate(activeTrackingApp)}
                    className="px-4 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Certificate</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTrackingApp(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <LogoutOverlay
        isOpen={isLoggingOut}
        userName={userSession?.name || 'Trader'}
        userRole="Enterprise Owner"
        onComplete={onLogout}
      />
    </div>
  );
};
