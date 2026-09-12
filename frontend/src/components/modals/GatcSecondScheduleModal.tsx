import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Check,
  Award,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Scale,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  GATC_FIRST_SCHEDULE,
  SecondScheduleApplication,
  FirstScheduleItem
} from '../../types/gatcTypes';
import { apiClient } from '../../services/apiClient';

interface GatcSecondScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationApproved?: () => void;
  showToast: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const GatcSecondScheduleModal: React.FC<GatcSecondScheduleModalProps> = ({
  isOpen,
  onClose,
  onApplicationApproved,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'schedules' | 'applications' | 'new_application'>('schedules');
  const [applications, setApplications] = useState<SecondScheduleApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<SecondScheduleApplication | null>(null);

  // New Application Form State (Clauses 1 to 17)
  const [formData, setFormData] = useState<Partial<SecondScheduleApplication>>({
    applicantFullName: '',
    applicantAddress: '',
    contactEmail: '',
    contactPhone: '',
    appliedFirstScheduleItems: ['water_meter', 'nawi_class_3_4_upto_150kg', 'weights_all_categories'],
    applicantFunctionDetails: 'Commercial Metrology Calibration & Verification Laboratory',
    nablCertificateNo: 'NABL-TC-2026-LM',
    nablIssueDate: '2024-01-15',
    nablValidUntil: '2028-01-14',
    accreditationBody: 'NABL',
    relevantExperienceYears: 8,
    relevantExperienceSummary: 'Over 8 years experience in precision mass calibration and fluid flow metering.',
    totalEmployeesCount: 14,
    technicalStaffParticulars: '4 Senior Metrologists (M.Tech Instrumentation), 6 Verification Officers, 4 Quality Analysts.',
    totalOrganizationAreaSqMeters: 450,
    proposedGatcLabAreaSqMeters: 280,
    principalOfficerName: 'Dr. Suresh Chandra',
    principalOfficerQualification: 'Ph.D. Metrology & Measurement Standards',
    deputyOfficerName: 'K. V. Ramanathan',
    deputyOfficerQualification: 'B.Tech Mechanical & NABL Certified Assessor',
    referenceStandardsAvailable: 'Class E2 & F1 Working Mass Standards, Volumetric Bell Prover, Digital Pressure Calibrator',
    testingFacilitiesSummary: 'Temperature controlled environment (20°C ± 0.5°C), vibration-isolated marble foundation tables',
    iso17025Trained: true,
    trainingInstituteName: 'National Physical Laboratory (NPL) New Delhi',
    trainingDetails: 'ISO/IEC 17025:2017 Laboratory Management and Measurement Uncertainty Estimation',
    qmsManualRefNo: 'QMS/GATC/DOC/2026/V2.1',
    qmsManualAvailable: true,
    weightsMeasuresTestingExperience: 'Extensive verification of retail NAWI scales, weights and municipal water meters',
    additionalPerformanceInfo: 'Inter-laboratory PT comparison conducted with RRSL Bengaluru with En score < 0.2',
    demandDraftNo: 'DD-SBI-991823',
    demandDraftDate: new Date().toISOString().split('T')[0],
    demandDraftBank: 'State Bank of India, Fort Branch',
    demandDraftAmount: '₹25,000.00',
    proposedJurisdictionArea: 'Mumbai Metropolitan Region & Navi Mumbai Corridor',
    statutoryUndertakingAgreed: true,
    undertakingDate: new Date().toISOString().split('T')[0],
    consumerComplaintNumber: '1800-22-4915',
    grievanceRedressalOfficer: 'Anjali Sharma, Grievance Officer'
  });

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getGatcApplications();
      if (Array.isArray(data)) {
        setApplications(data);
        if (data.length > 0 && !selectedApp) {
          setSelectedApp(data[0]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load GATC applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleScheduleItem = (itemId: string) => {
    const current = formData.appliedFirstScheduleItems || [];
    if (current.includes(itemId)) {
      setFormData({
        ...formData,
        appliedFirstScheduleItems: current.filter((id) => id !== itemId)
      });
    } else {
      setFormData({
        ...formData,
        appliedFirstScheduleItems: [...current, itemId]
      });
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicantFullName || !formData.applicantAddress || !formData.contactEmail) {
      showToast('Validation Error', 'Please fill in applicant full name, address, and email.', 'error');
      return;
    }
    if (!formData.appliedFirstScheduleItems || formData.appliedFirstScheduleItems.length === 0) {
      showToast('Validation Error', 'Please select at least one First Schedule weight/measure category.', 'error');
      return;
    }
    if (!formData.statutoryUndertakingAgreed) {
      showToast('Validation Error', 'You must agree to the statutory undertaking under the Legal Metrology Act, 2009.', 'error');
      return;
    }

    try {
      const res = await apiClient.submitGatcApplication(formData);
      if (res.success) {
        showToast('Application Submitted', res.message || 'Second Schedule GATC Application submitted.', 'success');
        await loadApplications();
        setActiveTab('applications');
      } else {
        showToast('Submission Failed', res.message || 'Error submitting application.', 'error');
      }
    } catch (err: any) {
      showToast('Submission Error', err.message || 'Failed to submit application.', 'error');
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await apiClient.updateGatcApplicationStatus(
        appId,
        newStatus,
        `Statutory review completed under Legal Metrology (GATC) Rules, 2013 on ${new Date().toLocaleDateString()}.`
      );
      if (res.success) {
        showToast(
          'Status Updated',
          `Application ${newStatus === 'APPROVED' ? 'approved & GATC registered' : newStatus}.`,
          'success'
        );
        await loadApplications();
        if (onApplicationApproved) onApplicationApproved();
      } else {
        showToast('Update Failed', res.message || 'Failed to update status.', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update status.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#0c2340] px-6 py-4 text-white flex items-center justify-between border-b border-[#1e3a5f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Building2 className="w-5 h-5 text-[#4ade80]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-[#16a34a] text-white px-2 py-0.5 rounded tracking-wider uppercase">
                  Statutory Rule 2013
                </span>
                <span className="text-xs text-gray-300">G.S.R. 593(E) Notification</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold">
                Legal Metrology (Government Approved Test Centre) Rules, 2013
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'schedules'
                ? 'border-[#16a34a] bg-white text-[#0c2340] shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Scale className="w-4 h-4 text-[#16a34a]" />
            First Schedule [Rule 3(1)]: 10 Authorized Weights &amp; Measures
          </button>
          <button
            onClick={() => {
              setActiveTab('applications');
              loadApplications();
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'applications'
                ? 'border-[#16a34a] bg-white text-[#0c2340] shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 text-[#16a34a]" />
            Second Schedule [Rule 5(1)]: Accreditation Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('new_application')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'new_application'
                ? 'border-[#16a34a] bg-white text-[#0c2340] shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Plus className="w-4 h-4 text-[#16a34a]" />
            New 17-Point Accreditation Form
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(92vh-130px)] space-y-6">
          {/* TAB 1: FIRST SCHEDULE */}
          {activeTab === 'schedules' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
                <div className="text-xs text-[#0c2340]">
                  <p className="font-bold text-sm text-[#15803d]">
                    First Schedule [See sub-rule (1) of rule 3] Statutory Enforcement
                  </p>
                  <p className="text-gray-700 mt-1 leading-relaxed">
                    Under the Legal Metrology (Government Approved Test Centre) Rules, 2013, GATCs are legally restricted to verifying <strong>only</strong> the 10 categories of weights and measures listed below. Any instrument outside this scope (e.g. road weighbridges &gt;150 kg, fuel dispensers, bulk flow meters) <strong>must</strong> be inspected directly by Government Legal Metrology Officers (LMO).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {GATC_FIRST_SCHEDULE.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-4 bg-white hover:border-[#16a34a] transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-[#eef8f1] text-[#15803d] font-mono font-bold text-xs flex items-center justify-center border border-[#c6edd0]">
                        #{item.itemNumber}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {item.testStandard}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0c2340]">{item.name}</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.legalDescription}</p>
                    </div>
                    {item.maxScope && (
                      <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                        Capacity Limit: {item.maxScope} ({item.accuracyClass})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SECOND SCHEDULE APPLICATIONS REVIEW */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0c2340]">
                    Second Schedule [Rule 5(1)] Accreditation Review
                  </h3>
                  <p className="text-xs text-gray-500">
                    Comprehensive 17-parameter statutory audit for approval of private testing centres
                  </p>
                </div>
                <button
                  onClick={loadApplications}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                  <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-600">No Accreditation Applications Submitted</p>
                  <p className="text-xs text-gray-500 mt-1">Submit a 17-point application using the form tab.</p>
                  <button
                    onClick={() => setActiveTab('new_application')}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#16a34a] text-white text-xs font-bold cursor-pointer"
                  >
                    Open Second Schedule Form
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Left: Application list */}
                  <div className="lg:col-span-1 space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {applications.map((app) => (
                      <div
                        key={app.id || (app as any)._id}
                        onClick={() => setSelectedApp(app)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedApp && (selectedApp.id === app.id || (selectedApp as any)._id === (app as any)._id)
                            ? 'border-2 border-[#16a34a] bg-[#eef8f1] shadow-xs'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#15803d]">{app.applicationNo}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <div className="font-bold text-[#0c2340] mt-1">{app.applicantFullName}</div>
                        <div className="text-[11px] text-gray-500 truncate">{app.applicantAddress}</div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          Applied: {app.appliedFirstScheduleItems?.length || 0} First Schedule scopes
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: Detailed 17-Clause Audit Inspector */}
                  {selectedApp && (
                    <div className="lg:col-span-2 border border-gray-200 rounded-2xl p-5 bg-white space-y-4 max-h-[500px] overflow-y-auto">
                      <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                              {selectedApp.applicationNo}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                selectedApp.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : selectedApp.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {selectedApp.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-[#0c2340] mt-1">{selectedApp.applicantFullName}</h4>
                          <p className="text-xs text-gray-500">{selectedApp.applicantAddress}</p>
                        </div>

                        {selectedApp.status !== 'APPROVED' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateStatus(String(selectedApp.id || (selectedApp as any)._id), 'APPROVED')}
                              className="px-3 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve &amp; Register GATC
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(String(selectedApp.id || (selectedApp as any)._id), 'REJECTED')}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 17 Clauses Checklist */}
                      <div className="space-y-3 text-xs">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                          <span className="font-bold text-[#0c2340] block mb-1">
                            Clause 2: Applied Weights &amp; Measures (First Schedule)
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedApp.appliedFirstScheduleItems?.map((scopeId) => (
                              <span
                                key={scopeId}
                                className="bg-[#eef8f1] text-[#15803d] border border-[#c6edd0] px-2 py-0.5 rounded text-[10px] font-semibold"
                              >
                                {GATC_FIRST_SCHEDULE.find((s) => s.id === scopeId)?.name || scopeId}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="border border-gray-200 p-2.5 rounded-xl">
                            <span className="text-gray-500 block text-[10px] uppercase font-bold">Clause 4: NABL Accreditation</span>
                            <span className="font-mono font-bold text-[#0c2340]">{selectedApp.nablCertificateNo}</span>
                            <div className="text-[11px] text-gray-600">Valid till: {selectedApp.nablValidUntil}</div>
                          </div>
                          <div className="border border-gray-200 p-2.5 rounded-xl">
                            <span className="text-gray-500 block text-[10px] uppercase font-bold">Clause 10: ISO/IEC 17025 QMS Trained</span>
                            <span className="font-bold text-[#16a34a]">
                              {selectedApp.iso17025Trained ? '✓ Verified Trained' : '✕ Not Trained'}
                            </span>
                            <div className="text-[11px] text-gray-600 truncate">{selectedApp.trainingInstituteName}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="border border-gray-200 p-2.5 rounded-xl">
                            <span className="text-gray-500 block text-[10px] uppercase font-bold">Clause 7: Lab Area</span>
                            <span className="font-bold text-[#0c2340]">{selectedApp.proposedGatcLabAreaSqMeters} m²</span>
                            <div className="text-[11px] text-gray-500">Total Org: {selectedApp.totalOrganizationAreaSqMeters} m²</div>
                          </div>
                          <div className="border border-gray-200 p-2.5 rounded-xl">
                            <span className="text-gray-500 block text-[10px] uppercase font-bold">Clause 8: Principal Officer</span>
                            <span className="font-bold text-[#0c2340]">{selectedApp.principalOfficerName}</span>
                            <div className="text-[11px] text-gray-500 truncate">{selectedApp.principalOfficerQualification}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="border border-gray-200 p-2.5 rounded-xl">
                            <span className="text-gray-500 block text-[10px] uppercase font-bold">Clause 14: Demand Draft</span>
                            <span className="font-mono font-bold text-[#0c2340]">{selectedApp.demandDraftNo}</span>
                            <div className="text-[11px] text-gray-600">{selectedApp.demandDraftBank} ({selectedApp.demandDraftAmount})</div>
                          </div>
                          <div className="border border-gray-200 p-2.5 rounded-xl">
                            <span className="text-gray-500 block text-[10px] uppercase font-bold">Clause 17: Consumer Complaints</span>
                            <span className="font-bold text-[#0c2340]">{selectedApp.consumerComplaintNumber}</span>
                            <div className="text-[11px] text-gray-600 truncate">{selectedApp.grievanceRedressalOfficer}</div>
                          </div>
                        </div>

                        <div className="border border-gray-200 p-3 rounded-xl bg-gray-50">
                          <span className="text-gray-500 block text-[10px] uppercase font-bold">Clause 9: Reference Standards Available</span>
                          <p className="text-gray-700 mt-0.5">{selectedApp.referenceStandardsAvailable}</p>
                        </div>

                        <div className="border border-gray-200 p-3 rounded-xl bg-gray-50">
                          <span className="text-gray-500 block text-[10px] uppercase font-bold">Clause 16: Statutory Undertaking</span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                            <Check className="w-3.5 h-3.5" /> Agreed to abide by Legal Metrology Act, 2009 &amp; Rules
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NEW SECOND SCHEDULE APPLICATION FORM */}
          {activeTab === 'new_application' && (
            <form onSubmit={handleSubmitApplication} className="space-y-5">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="font-bold text-sm text-[#0c2340]">
                  Form for Approval of Government Approved Test Centre [Rule 5(1)]
                </h3>
                <p className="text-xs text-gray-500">
                  Fill in all 17 statutory parameters as required by the Legal Metrology (GATC) Rules, 2013
                </p>
              </div>

              {/* Clause 1: Name & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    (1) Full Name of Applicant / Laboratory *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.applicantFullName || ''}
                    onChange={(e) => setFormData({ ...formData, applicantFullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16a34a] focus:outline-none"
                    placeholder="e.g. Maharashtra Precision Metrology Labs Ltd."
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    (1) Complete Address of the Laboratory *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.applicantAddress || ''}
                    onChange={(e) => setFormData({ ...formData, applicantAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16a34a] focus:outline-none"
                    placeholder="Plot 44, MIDC Industrial Area, Navi Mumbai 400705"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Official Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail || ''}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16a34a] focus:outline-none"
                    placeholder="lab@metrology.in"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.contactPhone || ''}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16a34a] focus:outline-none"
                    placeholder="+91 98200 44122"
                  />
                </div>
              </div>

              {/* Clause 2: Weight or Measure Applied */}
              <div className="border border-gray-200 p-4 rounded-xl space-y-2 bg-gray-50">
                <label className="font-bold text-xs text-[#0c2340] block">
                  (2) Weights or Measures Applied for GATC Verification (First Schedule items) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {GATC_FIRST_SCHEDULE.map((item) => {
                    const isChecked = (formData.appliedFirstScheduleItems || []).includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-[#eef8f1] border-[#16a34a] text-[#15803d]'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleScheduleItem(item.id)}
                          className="mt-0.5 rounded text-[#16a34a] focus:ring-[#16a34a]"
                        />
                        <div>
                          <span className="font-semibold block">
                            #{item.itemNumber}. {item.name}
                          </span>
                          <span className="text-[10px] text-gray-500">{item.testStandard}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Clause 3 & 4: Function & NABL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    (4) NABL Accreditation Certificate No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nablCertificateNo || ''}
                    onChange={(e) => setFormData({ ...formData, nablCertificateNo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                    placeholder="NABL-TC-8891"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">NABL Validity Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.nablValidUntil || ''}
                    onChange={(e) => setFormData({ ...formData, nablValidUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">(10) ISO/IEC 17025 Training *</label>
                  <select
                    value={formData.iso17025Trained ? 'yes' : 'no'}
                    onChange={(e) => setFormData({ ...formData, iso17025Trained: e.target.value === 'yes' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white"
                  >
                    <option value="yes">Yes - Officers Trained in ISO/IEC 17025</option>
                    <option value="no">No - Not Trained</option>
                  </select>
                </div>
              </div>

              {/* Clause 7 & 8: Area & Principal Officer */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">(7) Total Area (sq.m) *</label>
                  <input
                    type="number"
                    required
                    value={formData.totalOrganizationAreaSqMeters || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, totalOrganizationAreaSqMeters: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">(7) GATC Lab Area (sq.m) *</label>
                  <input
                    type="number"
                    required
                    value={formData.proposedGatcLabAreaSqMeters || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, proposedGatcLabAreaSqMeters: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">(8) Principal Officer *</label>
                  <input
                    type="text"
                    required
                    value={formData.principalOfficerName || ''}
                    onChange={(e) => setFormData({ ...formData, principalOfficerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                    placeholder="Dr. A. K. Banerjee"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">(8) Qualification *</label>
                  <input
                    type="text"
                    required
                    value={formData.principalOfficerQualification || ''}
                    onChange={(e) => setFormData({ ...formData, principalOfficerQualification: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                    placeholder="M.Sc. Metrology, 15 yrs exp"
                  />
                </div>
              </div>

              {/* Clause 9: Reference Standards */}
              <div className="text-xs">
                <label className="font-bold text-gray-700 block mb-1">
                  (9) Detail of reference standards available with the laboratory *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.referenceStandardsAvailable || ''}
                  onChange={(e) => setFormData({ ...formData, referenceStandardsAvailable: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  placeholder="Class M1, F1 standard weights traceable to NPL, electronic bell prover, digital micrometers..."
                />
              </div>

              {/* Clause 14 & 17: Demand Draft & Complaint Number */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">(14) Demand Draft No. *</label>
                  <input
                    type="text"
                    required
                    value={formData.demandDraftNo || ''}
                    onChange={(e) => setFormData({ ...formData, demandDraftNo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                    placeholder="DD-SBI-991823"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">(15) Proposed Jurisdiction *</label>
                  <input
                    type="text"
                    required
                    value={formData.proposedJurisdictionArea || ''}
                    onChange={(e) => setFormData({ ...formData, proposedJurisdictionArea: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                    placeholder="Mumbai Metropolitan Area"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">(17) Consumer Complaint No. *</label>
                  <input
                    type="text"
                    required
                    value={formData.consumerComplaintNumber || ''}
                    onChange={(e) => setFormData({ ...formData, consumerComplaintNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                    placeholder="1800-22-4911"
                  />
                </div>
              </div>

              {/* Clause 16: Statutory Undertaking */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.statutoryUndertakingAgreed || false}
                    onChange={(e) =>
                      setFormData({ ...formData, statutoryUndertakingAgreed: e.target.checked })
                    }
                    className="mt-0.5 rounded text-[#16a34a] focus:ring-[#16a34a]"
                  />
                  <span className="text-gray-800 leading-relaxed font-medium">
                    <strong>(16) Statutory Undertaking:</strong> I / We hereby solemnly declare and undertake that our organization and personnel shall strictly abide by all the provisions of the <strong>Legal Metrology Act, 2009</strong>, the <strong>Legal Metrology (Government Approved Test Centre) Rules, 2013</strong>, and any directives or guidelines issued by the Director of Legal Metrology.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('applications')}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Submit Statutory Second Schedule Application
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
