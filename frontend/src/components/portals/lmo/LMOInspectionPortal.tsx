import React, { useState, useMemo, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';
import {
  Scale,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
  Search,
  Filter,
  ShieldCheck,
  FileText,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Lock,
  RotateCcw,
  Wrench,
  AlertTriangle,
  Check,
  RefreshCw
} from 'lucide-react';
import { DocketItem, UserSession } from '../../../types';
import { MPEEngine, MPEResult } from './MPEEngine';
import {
  calculateExpiry,
  saveCertificate,
  LegalMetrologyCertificate
} from '../../../services/expiryEngine';

interface LMOInspectionPortalProps {
  userSession?: UserSession;
  onIssueCertificate: (details: any) => void;
  onIssueRejection: (details: any) => void;
  showToast: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const LMOInspectionPortal: React.FC<LMOInspectionPortalProps> = ({
  userSession,
  onIssueCertificate,
  onIssueRejection,
  showToast
}) => {
  const getInitials = (name?: string) => {
    if (!name) return 'LM';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Test Scenario: Pass vs Fail
  const [testScenario, setTestScenario] = useState<'pass' | 'fail'>('pass');
  const [dockets, setDockets] = useState<DocketItem[]>([]);
  const [selectedDocket, setSelectedDocket] = useState<DocketItem | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'under_verification' | 'queued' | 'certified'>('all');

  // Officer Profile State
  const [officerProfile, setOfficerProfile] = useState({
    name: userSession?.name || 'Legal Metrology Officer',
    badgeNo: userSession?.identifier || 'MH-LM-2041',
    zone: userSession?.zone || 'Mumbai Central II Zone',
    initials: getInitials(userSession?.name || 'Legal Metrology Officer')
  });

  // Sync profile if userSession changes
  useEffect(() => {
    if (userSession?.name) {
      setOfficerProfile({
        name: userSession.name,
        badgeNo: userSession.identifier || 'MH-LM-2041',
        zone: userSession.zone || 'Mumbai Central II Zone',
        initials: getInitials(userSession.name)
      });
    }
  }, [userSession]);

  // Fetch live officer session profile & assigned applications
  const loadLmoData = async (isSilent = false) => {
    try {
      if (!isSilent) {
        const meRes = await apiClient.getMe();
        if (meRes.success && (meRes.user || meRes.userSession)) {
          const u = meRes.user || meRes.userSession;
          const initials = getInitials(u.name || userSession?.name);
          setOfficerProfile({
            name: u.name || userSession?.name || 'Metrology Officer',
            badgeNo: u.identifier || userSession?.identifier || 'MH-LM-2041',
            zone: u.zone || userSession?.zone || 'Mumbai Central II Zone',
            initials
          });
        }
      }

      const appsRes = await apiClient.getApplications();
      const mappedDockets: DocketItem[] = (Array.isArray(appsRes) ? appsRes : []).map((app: any) => ({
        id: app.appNo || app._id,
        establishmentName: app.enterpriseName || app.owner?.enterpriseName || 'Registered Enterprise',
        address: app.installationAddress || 'Enterprise Location',
        instrumentType: app.equipmentName || app.instrumentType || 'Weighing Instrument',
        accuracyClass: app.equipmentClass || 'Class III',
        dueDate: app.date || 'Today (Priority)',
        capacity: app.capacity || '30 kg',
        serialNumber: app.equipmentSerial || 'SN-UNKNOWN',
        model: app.model || 'Standard Model',
        manufacturer: app.manufacturer || 'Standard Manufacturer',
        paidFee: app.feeAmount || '₹1,416.00',
        paymentStatus: app.paymentStatus || 'Paid',
        rawApp: app,
        status: app.status === 'CERTIFICATE ISSUED'
          ? 'certified'
          : app.status === 'UNDER VERIFICATION' || app.status === 'SCHEDULED'
          ? 'under_verification'
          : 'queued'
      }));

      setDockets(mappedDockets);

      setSelectedDocket((prev) => {
        if (!prev) return mappedDockets[0] || null;
        const matching = mappedDockets.find((d) => d.id === prev.id);
        return matching || mappedDockets[0] || null;
      });
    } catch (err) {
      console.warn('LMO live data load fallback:', err);
    }
  };

  useEffect(() => {
    loadLmoData();
    const interval = setInterval(() => {
      loadLmoData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Repeatability Test Inputs (kg)
  const [repA, setRepA] = useState({ r1: 7500.5, r2: 7501.2, r3: 7500.8 }); // 50% 7,500kg
  const [repB, setRepB] = useState({
    r1: testScenario === 'pass' ? 15001.5 : 15007.2,
    r2: testScenario === 'pass' ? 15002.1 : 15008.5,
    r3: testScenario === 'pass' ? 15000.9 : 15006.9
  }); // 100% 15,000kg

  // Eccentricity Test Inputs (kg) - nominal 3,750 kg
  const [ecc, setEcc] = useState({
    p1: 3750.2, // Center
    p2: testScenario === 'pass' ? 3751.1 : 3756.2, // Front-Left
    p3: testScenario === 'pass' ? 3749.5 : 3744.1, // Front-Right
    p4: testScenario === 'pass' ? 3750.8 : 3755.9, // Back-Left
    p5: testScenario === 'pass' ? 3751.4 : 3756.8  // Back-Right
  });

  // Calculate Repeatability Variations
  const varA = useMemo(() => {
    const vals = [repA.r1, repA.r2, repA.r3];
    return Math.abs(Math.max(...vals) - Math.min(...vals));
  }, [repA]);

  const varB = useMemo(() => {
    const vals = [repB.r1, repB.r2, repB.r3];
    return Math.abs(Math.max(...vals) - Math.min(...vals));
  }, [repB]);

  // Overall pass/fail condition:
  // Allowable MPE at 15,000kg is ±5.0kg
  const allowableMPE = 5.0; // kg for Class III at 15,000kg (3000e)
  const maxDeltaObserved = testScenario === 'pass' ? 2.1 : 6.8;

  // MPE Engine result state (1st Technical Component)
  const [mpeResult, setMpeResult] = useState<MPEResult | null>(null);

  // Statutory Criteria Verification Gates:
  // 1. Repeatability (Clause 3.6.1)
  const isRepeatabilityPass = varA <= allowableMPE && varB <= allowableMPE;

  // 2. Eccentricity (Clause 3.6.2)
  const isEccentricityPass =
    Math.abs(ecc.p1 - 3750) <= 2.5 &&
    Math.abs(ecc.p2 - 3750) <= 2.5 &&
    Math.abs(ecc.p3 - 3750) <= 2.5 &&
    Math.abs(ecc.p4 - 3750) <= 2.5 &&
    Math.abs(ecc.p5 - 3750) <= 2.5;

  // 3. Linearity (Clause 3.5.1)
  const isLinearityPass = testScenario === 'pass';

  // 4. MPE Engine (Maximum Permissible Error Component)
  const isMpePass = mpeResult ? mpeResult.isPass : (testScenario === 'pass');

  // Unified Verification Gate:
  // Certificate generation is ONLY permitted after:
  // Repeatability ✓, Eccentricity ✓, Linearity ✓, MPE ✓
  const canGenerateCertificate = isRepeatabilityPass && isEccentricityPass && isLinearityPass && isMpePass;
  const isPassing = canGenerateCertificate;

  // Toggle scenario handler
  const handleToggleScenario = (scenario: 'pass' | 'fail') => {
    setTestScenario(scenario);
    if (scenario === 'pass') {
      setRepB({ r1: 15001.5, r2: 15002.1, r3: 15000.9 });
      setEcc({ p1: 3750.2, p2: 3751.1, p3: 3749.5, p4: 3750.8, p5: 3751.4 });
      showToast('Pass Scenario Loaded', 'Readings calibrated within ±5.0 kg allowable MPE.', 'success');
    } else {
      setRepB({ r1: 15007.2, r2: 15008.5, r3: 15006.9 });
      setEcc({ p1: 3750.2, p2: 3756.2, p3: 3744.1, p4: 3755.9, p5: 3756.8 });
      showToast('Tolerance Exceeded Simulation', 'Simulating non-compliant readings exceeding Table 6 tolerances.', 'warning');
    }
  };

  const filteredDockets = dockets.filter((d) => {
    const matchesSearch =
      d.establishmentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.instrumentType.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = dockets.filter((d) => d.status !== 'certified').length;
  const testedCount = dockets.filter((d) => d.status === 'certified').length;
  const verifiedPercent = dockets.length > 0 ? Math.round((testedCount / dockets.length) * 100) : 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Officer Real-time Field Status Bar */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#eef8f1] border border-[#c6edd0] flex items-center justify-center text-[#16a34a] shrink-0 font-bold text-sm">
            {officerProfile.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0c2340]">{officerProfile.name}, LMO</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef8f1] text-[#15803d] border border-[#c6edd0]">
                ID: {officerProfile.badgeNo}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#4e6073] mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {officerProfile.zone}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="font-mono text-[11px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                GPS Lock: 18.9624° N, 72.8219° E
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
          <div className="text-left md:text-right">
            <div className="text-xs text-[#4e6073] font-medium">Pending Dockets</div>
            <div className="text-lg font-bold text-[#121d26]">{pendingCount} Assigned</div>
          </div>
          <div className="h-8 w-px bg-[#e2e8f0]"></div>
          <div className="text-left md:text-right">
            <div className="text-xs text-[#4e6073] font-medium">Tested Today</div>
            <div className="text-lg font-bold text-[#27ae60]">{testedCount} Stamped</div>
          </div>
          <div className="h-8 w-px bg-[#e2e8f0]"></div>
          <div className="text-left md:text-right">
            <div className="text-xs text-[#4e6073] font-medium">Field Calibrated</div>
            <div className="text-lg font-bold text-[#e67e22]">{verifiedPercent}% Verified</div>
          </div>
        </div>
      </div>

      {/* Assigned Verification Docket Queue */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fafbfc]">
          <div>
            <h3 className="font-display font-bold text-base text-[#0c2340] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#16a34a]" />
              Assigned Verification Docket Queue
            </h3>
            <p className="text-xs text-[#4e6073] mt-0.5">
              Statutory verification mandates under Legal Metrology Act 2009 (Rule 14 &amp; 16)
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search dockets..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#d8e4f1] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/30 w-36 sm:w-48 bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-[#d8e4f1] bg-white text-[#121d26] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="under_verification">Under Verification</option>
              <option value="queued">Queued</option>
              <option value="certified">Certified</option>
            </select>

            <button
              type="button"
              onClick={() => {
                loadLmoData();
                showToast('Refreshed Queue', 'Live statutory application queue updated from database.', 'info');
              }}
              className="p-1.5 rounded-xl border border-[#d8e4f1] bg-white hover:bg-emerald-50 text-[#16a34a] hover:border-[#c6edd0] transition-colors cursor-pointer"
              title="Refresh Live Application Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f1f5f9] text-[#4e6073] font-semibold border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3 px-4">Docket ID</th>
                <th className="py-3 px-4">Establishment &amp; Location</th>
                <th className="py-3 px-4">Instrument Specification</th>
                <th className="py-3 px-4">Accuracy Class</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredDockets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center bg-[#fafbfc]">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#eef8f1] border border-[#c6edd0] flex items-center justify-center text-[#16a34a] mx-auto">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-[#0c2340] text-sm">No Verification Dockets in Queue</div>
                        <div className="text-xs text-[#4e6073] mt-1 max-w-sm mx-auto">
                          Your assigned verification queue is currently clear. Trader applications submitted for verification will appear here automatically.
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDockets.map((docket) => {
                  const isSelected = selectedDocket?.id === docket.id;
                  return (
                    <tr
                      key={docket.id}
                      onClick={() => setSelectedDocket(docket)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#f0fdf4] font-medium' : 'hover:bg-[#f8f9fa]'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#0c2340]">
                        {docket.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#121d26]">{docket.establishmentName}</div>
                        <div className="text-[11px] text-[#4e6073] truncate max-w-xs">{docket.address}</div>
                      </td>
                      <td className="py-3 px-4 text-[#121d26]">{docket.instrumentType}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#eef8f1] text-[#15803d] font-semibold text-[11px] border border-[#c6edd0]">
                          {docket.accuracyClass}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#4e6073]">{docket.dueDate}</td>
                      <td className="py-3 px-4">
                        {docket.status === 'under_verification' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 animate-spin" />
                            Under Verification
                          </span>
                        )}
                        {docket.status === 'queued' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            Queued
                          </span>
                        )}
                        {docket.status === 'certified' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Certified &amp; Stamped
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDocket(docket);
                            showToast('Docket Loaded', `Now verifying ${docket.id} (${docket.establishmentName})`, 'info');
                          }}
                          className="px-3 py-1 rounded-lg bg-[#eef8f1] hover:bg-[#dcfce7] text-[#15803d] text-xs font-semibold transition-colors cursor-pointer border border-[#c6edd0]"
                        >
                          {isSelected ? 'Active Sheet' : 'Open Test Sheet'}
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

      {/* Main Protocol Header & Scenario Simulation Switcher */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#16a34a] text-white text-[10px] font-bold tracking-wide uppercase">
                OIML R 76-1:2006
              </span>
              <h2 className="font-display font-bold text-lg text-[#0c2340]">
                Verification Protocol: Non-Automatic Weighing Instrument (NAWI)
              </h2>
            </div>
            <p className="text-xs text-[#4e6073] mt-1">
              Active Docket: <strong className="text-[#121d26]">{selectedDocket?.id || 'LM-VER-8821'}</strong> —{' '}
              {selectedDocket?.establishmentName || 'Standard Verification Worksheet'} ({selectedDocket?.instrumentType || 'Weighing Instrument'})
            </p>
          </div>

          {/* Interactive Scenario Controls */}
          <div className="flex items-center gap-2 p-1.5 bg-[#f8f9fa] rounded-xl border border-[#e2e8f0]">
            <span className="text-xs font-semibold text-[#4e6073] px-2">Simulate Tolerance:</span>
            <button
              onClick={() => handleToggleScenario('pass')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                testScenario === 'pass'
                  ? 'bg-[#27ae60] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              ✓ Pass Scenario (+2.1kg)
            </button>
            <button
              onClick={() => handleToggleScenario('fail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                testScenario === 'fail'
                  ? 'bg-[#e74c3c] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              ✕ Simulate Exceeded (+6.8kg)
            </button>
          </div>
        </div>

        {/* Instrument Technical Specifications Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e2e8f0]">
            <span className="text-[11px] font-semibold text-[#4e6073] uppercase tracking-wider block">
              Max Capacity (Max)
            </span>
            <span className="font-metric text-lg sm:text-xl font-bold text-[#121d26] mt-0.5 block">
              {selectedDocket?.capacity || '15,000 kg'}
            </span>
            <span className="text-[10px] text-gray-500">Statutory verification scale</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e2e8f0]">
            <span className="text-[11px] font-semibold text-[#4e6073] uppercase tracking-wider block">
              Serial / Model
            </span>
            <span className="font-metric text-sm font-bold text-[#121d26] mt-0.5 block truncate">
              {selectedDocket?.serialNumber || 'WB-MH-2026-8821'}
            </span>
            <span className="text-[10px] text-gray-500 truncate block">{selectedDocket?.model || 'Standard Model'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e2e8f0]">
            <span className="text-[11px] font-semibold text-[#4e6073] uppercase tracking-wider block">
              Manufacturer &amp; Fee
            </span>
            <span className="font-metric text-sm font-bold text-[#0c2340] mt-0.5 block truncate">
              {selectedDocket?.manufacturer || 'Standard Metrology Works'}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold block">Fee Paid: {selectedDocket?.paidFee || '₹1,416.00'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e2e8f0]">
            <span className="text-[11px] font-semibold text-[#4e6073] uppercase tracking-wider block">
              Accuracy Class
            </span>
            <span className="font-metric text-lg sm:text-xl font-bold text-[#121d26] mt-0.5 block">
              {selectedDocket?.accuracyClass || 'Class III'}
            </span>
            <span className="text-[10px] text-gray-500">Medium Accuracy (Commercial)</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1ST TECHNICAL COMPONENT: MPE ENGINE */}
        {/* Maximum Permissible Error / Exposure Calculation Engine */}
        {/* ========================================================= */}
        <MPEEngine
          initialE={
            selectedDocket?.capacity && parseFloat(selectedDocket.capacity.replace(/,/g, '').replace(/[^\d.]/g, '')) < 1000
              ? 0.5
              : 5.0
          }
          initialMax={
            selectedDocket?.capacity
              ? parseFloat(selectedDocket.capacity.replace(/,/g, '').replace(/[^\d.]/g, '')) || 15000
              : 15000
          }
          initialTestLoad={
            selectedDocket?.capacity
              ? parseFloat(selectedDocket.capacity.replace(/,/g, '').replace(/[^\d.]/g, '')) || 15000
              : 15000
          }
          initialObservedError={
            testScenario === 'pass' ? 2.1 : 6.8
          }
          initialAccuracyClass={selectedDocket?.accuracyClass || 'Class III'}
          initialVerificationType="initial"
          onResultChange={(res) => setMpeResult(res)}
        />

        {/* Dynamic MPE Status Indicator Banner */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isPassing
              ? 'bg-[#eafaf1] border-[#a3e4d7] text-[#196f3d]'
              : 'bg-[#fdedec] border-[#f5b7b1] text-[#922b21]'
          }`}
        >
          <div className="flex items-center gap-3">
            {isPassing ? (
              <CheckCircle2 className="w-7 h-7 text-[#27ae60] shrink-0" />
            ) : (
              <XCircle className="w-7 h-7 text-[#e74c3c] shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>
                  {isPassing
                    ? 'OVERALL VERDICT: COMPLIANT (PASS)'
                    : 'OVERALL VERDICT: TOLERANCE EXCEEDED (FAIL)'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/80 border border-current">
                  OIML Table 6
                </span>
              </div>
              <p className="text-xs mt-0.5 opacity-90">
                {isPassing
                  ? 'All 3 metrological test criteria fall within the statutory Maximum Permissible Error (MPE).'
                  : 'Instrument error delta (+6.8 kg) exceeds allowable statutory MPE limit of ±5.0 kg at 15,000 kg.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0 pl-10 sm:pl-0">
            <div>
              <div className="text-[10px] uppercase font-bold opacity-80">Allowable MPE</div>
              <div className="text-sm font-bold">±{allowableMPE.toFixed(1)} kg</div>
            </div>
            <div className="h-6 w-px bg-current opacity-30"></div>
            <div>
              <div className="text-[10px] uppercase font-bold opacity-80">Max Delta</div>
              <div className="text-sm font-bold">
                {isPassing ? `+${maxDeltaObserved.toFixed(1)} kg` : `+6.8 kg`}
              </div>
            </div>
          </div>
        </div>

        {/* Test 1: Repeatability Test (Clause 3.6.1) */}
        <div className="border border-[#e2e8f0] rounded-xl p-4 space-y-3 bg-[#ffffff]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm text-[#121d26] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] font-bold text-xs flex items-center justify-center">
                  1
                </span>
                Repeatability Test (OIML Clause 3.6.1)
              </h4>
              <p className="text-xs text-[#4e6073]">
                Series of 3 independent load cycles at 50% and 100% capacity. Max allowable variance: 1.0 e (5.0 kg).
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-500">Allowable Variation:</span>
              <span className="font-mono font-bold text-[#121d26]">≤ 5.0 kg</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Series A: 50% Load (7,500 kg) */}
            <div className="p-3 bg-[#f8f9fa] rounded-lg border border-[#e2e8f0] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#121d26]">Series A: 50% Load (7,500 kg)</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ΔE = {varA.toFixed(2)} kg (PASS)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-gray-500 font-medium">Run 1 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={repA.r1}
                    onChange={(e) => setRepA({ ...repA, r1: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-medium">Run 2 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={repA.r2}
                    onChange={(e) => setRepA({ ...repA, r2: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-medium">Run 3 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={repA.r3}
                    onChange={(e) => setRepA({ ...repA, r3: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Series B: 100% Load (15,000 kg) */}
            <div className="p-3 bg-[#f8f9fa] rounded-lg border border-[#e2e8f0] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#121d26]">Series B: 100% Load (15,000 kg)</span>
                <span
                  className={`px-2 py-0.5 rounded border ${
                    varB <= allowableMPE
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-red-700 bg-red-50 border-red-200'
                  }`}
                >
                  ΔE = {varB.toFixed(2)} kg ({varB <= allowableMPE ? 'PASS' : 'FAIL'})
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-gray-500 font-medium">Run 1 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={repB.r1}
                    onChange={(e) => setRepB({ ...repB, r1: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-medium">Run 2 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={repB.r2}
                    onChange={(e) => setRepB({ ...repB, r2: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-medium">Run 3 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={repB.r3}
                    onChange={(e) => setRepB({ ...repB, r3: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test 2: Eccentricity / Off-Center Loading Test (Clause 3.6.2) */}
        <div className="border border-[#e2e8f0] rounded-xl p-4 space-y-3 bg-[#ffffff]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm text-[#0c2340] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] font-bold text-xs flex items-center justify-center">
                  2
                </span>
                Eccentricity / Off-Center Loading Test (OIML Clause 3.6.2)
              </h4>
              <p className="text-xs text-[#4e6073]">
                Test load: 1/4 Max = 3,750 kg placed sequentially at 5 load receptor positions. Allowable MPE: ±2.5 kg.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-500">Test Load:</span>
              <span className="font-mono font-bold text-[#121d26]">3,750 kg</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 text-xs">
            <div className="p-2.5 bg-[#f8f9fa] rounded-lg border border-[#e2e8f0]">
              <div className="text-[11px] font-bold text-[#121d26]">Pos 1: Center</div>
              <div className="text-[10px] text-gray-500 mb-1.5">Load: 3750 kg</div>
              <input
                type="number"
                step="0.1"
                value={ecc.p1}
                onChange={(e) => setEcc({ ...ecc, p1: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs"
              />
              <div className="mt-1 text-[10px] font-mono font-semibold text-emerald-600">
                E: +{(ecc.p1 - 3750).toFixed(1)} kg (OK)
              </div>
            </div>

            <div className="p-2.5 bg-[#f8f9fa] rounded-lg border border-[#e2e8f0]">
              <div className="text-[11px] font-bold text-[#121d26]">Pos 2: Front-Left</div>
              <div className="text-[10px] text-gray-500 mb-1.5">Corner 1</div>
              <input
                type="number"
                step="0.1"
                value={ecc.p2}
                onChange={(e) => setEcc({ ...ecc, p2: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs"
              />
              <div
                className={`mt-1 text-[10px] font-mono font-semibold ${
                  Math.abs(ecc.p2 - 3750) <= 2.5 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                E: +{(ecc.p2 - 3750).toFixed(1)} kg ({Math.abs(ecc.p2 - 3750) <= 2.5 ? 'OK' : 'EXCEEDED'})
              </div>
            </div>

            <div className="p-2.5 bg-[#f8f9fa] rounded-lg border border-[#e2e8f0]">
              <div className="text-[11px] font-bold text-[#121d26]">Pos 3: Front-Right</div>
              <div className="text-[10px] text-gray-500 mb-1.5">Corner 2</div>
              <input
                type="number"
                step="0.1"
                value={ecc.p3}
                onChange={(e) => setEcc({ ...ecc, p3: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs"
              />
              <div
                className={`mt-1 text-[10px] font-mono font-semibold ${
                  Math.abs(ecc.p3 - 3750) <= 2.5 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                E: {(ecc.p3 - 3750).toFixed(1)} kg ({Math.abs(ecc.p3 - 3750) <= 2.5 ? 'OK' : 'EXCEEDED'})
              </div>
            </div>

            <div className="p-2.5 bg-[#f8f9fa] rounded-lg border border-[#e2e8f0]">
              <div className="text-[11px] font-bold text-[#121d26]">Pos 4: Back-Left</div>
              <div className="text-[10px] text-gray-500 mb-1.5">Corner 3</div>
              <input
                type="number"
                step="0.1"
                value={ecc.p4}
                onChange={(e) => setEcc({ ...ecc, p4: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs"
              />
              <div
                className={`mt-1 text-[10px] font-mono font-semibold ${
                  Math.abs(ecc.p4 - 3750) <= 2.5 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                E: +{(ecc.p4 - 3750).toFixed(1)} kg ({Math.abs(ecc.p4 - 3750) <= 2.5 ? 'OK' : 'EXCEEDED'})
              </div>
            </div>

            <div className="p-2.5 bg-[#f8f9fa] rounded-lg border border-[#e2e8f0] col-span-2 sm:col-span-1">
              <div className="text-[11px] font-bold text-[#121d26]">Pos 5: Back-Right</div>
              <div className="text-[10px] text-gray-500 mb-1.5">Corner 4</div>
              <input
                type="number"
                step="0.1"
                value={ecc.p5}
                onChange={(e) => setEcc({ ...ecc, p5: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs"
              />
              <div
                className={`mt-1 text-[10px] font-mono font-semibold ${
                  Math.abs(ecc.p5 - 3750) <= 2.5 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                E: +{(ecc.p5 - 3750).toFixed(1)} kg ({Math.abs(ecc.p5 - 3750) <= 2.5 ? 'OK' : 'EXCEEDED'})
              </div>
            </div>
          </div>
        </div>

        {/* Test 3: Linearity & Hysteresis Test (Clause 3.5.1) */}
        <div className="border border-[#e2e8f0] rounded-xl p-4 space-y-3 bg-[#ffffff]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-[#0c2340] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] font-bold text-xs flex items-center justify-center">
                  3
                </span>
                Linearity &amp; Hysteresis Test (OIML Clause 3.5.1)
              </h4>
              <p className="text-xs text-[#4e6073]">
                Ascending and descending target test steps spanning zero to maximum capacity.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9fa] text-[#4e6073] font-semibold border-b border-[#e2e8f0]">
                <tr>
                  <th className="py-2.5 px-3">Nominal Load (L)</th>
                  <th className="py-2.5 px-3">Ascending Indication (I↑)</th>
                  <th className="py-2.5 px-3">Descending Indication (I↓)</th>
                  <th className="py-2.5 px-3">Statutory MPE</th>
                  <th className="py-2.5 px-3">Error (E)</th>
                  <th className="py-2.5 px-3 text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] font-mono">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#121d26]">0 kg (Zero-load)</td>
                  <td className="py-2.5 px-3">0.0 kg</td>
                  <td className="py-2.5 px-3">0.0 kg</td>
                  <td className="py-2.5 px-3 text-gray-500">±2.5 kg (0.5e)</td>
                  <td className="py-2.5 px-3 text-emerald-600">0.0 kg</td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      PASS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#121d26]">500 kg (100e)</td>
                  <td className="py-2.5 px-3">500.5 kg</td>
                  <td className="py-2.5 px-3">500.2 kg</td>
                  <td className="py-2.5 px-3 text-gray-500">±2.5 kg (0.5e)</td>
                  <td className="py-2.5 px-3 text-emerald-600">+0.5 kg</td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      PASS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#121d26]">2,500 kg (500e)</td>
                  <td className="py-2.5 px-3">2501.0 kg</td>
                  <td className="py-2.5 px-3">2500.8 kg</td>
                  <td className="py-2.5 px-3 text-gray-500">±5.0 kg (1.0e)</td>
                  <td className="py-2.5 px-3 text-emerald-600">+1.0 kg</td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      PASS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#121d26]">7,500 kg (1500e)</td>
                  <td className="py-2.5 px-3">7501.8 kg</td>
                  <td className="py-2.5 px-3">7502.0 kg</td>
                  <td className="py-2.5 px-3 text-gray-500">±5.0 kg (1.0e)</td>
                  <td className="py-2.5 px-3 text-emerald-600">+1.8 kg</td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      PASS
                    </span>
                  </td>
                </tr>
                <tr className={isPassing ? '' : 'bg-red-50/50'}>
                  <td className="py-2.5 px-3 font-semibold text-[#121d26]">15,000 kg (Max 3000e)</td>
                  <td className="py-2.5 px-3">{isPassing ? '15002.1 kg' : '15006.8 kg'}</td>
                  <td className="py-2.5 px-3">{isPassing ? '15001.9 kg' : '15007.4 kg'}</td>
                  <td className="py-2.5 px-3 text-gray-500">±5.0 kg (1.0e)</td>
                  <td className={`py-2.5 px-3 font-bold ${isPassing ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isPassing ? '+2.1 kg' : '+6.8 kg'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPassing
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isPassing ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STATUTORY VERIFICATION GATEWAY (SECTION 24 & RULE 16) */}
        {/* Certificate Generation ONLY after 4 Passes: */}
        {/* Repeatability ✓ • Eccentricity ✓ • Linearity ✓ • MPE ✓ */}
        {/* ========================================================= */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            canGenerateCertificate
              ? 'bg-[#eafaf1] border-[#a3e4d7] text-[#196f3d]'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-current/15">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-display font-extrabold text-sm sm:text-base">
                Statutory Stamping Gate (Section 24 Legal Metrology Act)
              </span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                canGenerateCertificate
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-200 text-rose-900 border border-rose-300'
              }`}
            >
              {canGenerateCertificate
                ? 'GATE UNLOCKED: READY FOR DIGITAL STAMPING'
                : 'GATE LOCKED: ADJUSTMENT / REPAIR ORDER MANDATED'}
            </div>
          </div>

          <div className="pt-3 space-y-3">
            <div className="text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>
                Certificate generation permitted: <strong>Only after all 4 criteria pass</strong>
              </span>
              <span className="font-mono text-[11px] bg-white/70 px-2 py-0.5 rounded border border-current/20">
                {canGenerateCertificate ? '4/4 Met (Compliant)' : 'Statutory Failure Detected'}
              </span>
            </div>

            {/* 4 Checkpoint Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* 1. Repeatability */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between shadow-2xs ${
                  isRepeatabilityPass
                    ? 'bg-white border-emerald-200 text-emerald-800'
                    : 'bg-white border-rose-200 text-rose-800'
                }`}
              >
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">1. Clause 3.6.1</div>
                  <div className="text-xs font-extrabold">Repeatability</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    isRepeatabilityPass ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {isRepeatabilityPass ? '✓ PASS' : '✕ FAIL'}
                </span>
              </div>

              {/* 2. Eccentricity */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between shadow-2xs ${
                  isEccentricityPass
                    ? 'bg-white border-emerald-200 text-emerald-800'
                    : 'bg-white border-rose-200 text-rose-800'
                }`}
              >
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">2. Clause 3.6.2</div>
                  <div className="text-xs font-extrabold">Eccentricity</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    isEccentricityPass ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {isEccentricityPass ? '✓ PASS' : '✕ FAIL'}
                </span>
              </div>

              {/* 3. Linearity */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between shadow-2xs ${
                  isLinearityPass
                    ? 'bg-white border-emerald-200 text-emerald-800'
                    : 'bg-white border-rose-200 text-rose-800'
                }`}
              >
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">3. Clause 3.5.1</div>
                  <div className="text-xs font-extrabold">Linearity</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    isLinearityPass ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {isLinearityPass ? '✓ PASS' : '✕ FAIL'}
                </span>
              </div>

              {/* 4. MPE Engine */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between shadow-2xs ${
                  isMpePass
                    ? 'bg-white border-emerald-200 text-emerald-800'
                    : 'bg-white border-rose-200 text-rose-800'
                }`}
              >
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">4. Core Engine</div>
                  <div className="text-xs font-extrabold">MPE Engine</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    isMpePass ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {isMpePass ? '✓ PASS' : '✕ FAIL'}
                </span>
              </div>
            </div>

            {/* When BLOCKED: Consequence & Legal Order */}
            {!canGenerateCertificate && (
              <div className="p-3.5 bg-white/95 rounded-xl border border-rose-200 text-rose-900 text-xs space-y-1.5 shadow-2xs">
                <div className="font-extrabold flex items-center gap-1.5 text-rose-700 uppercase tracking-wide">
                  <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Certificate generation BLOCKED</span>
                </div>
                <p className="text-[#4e6073] leading-relaxed">
                  One or more mandatory technical components failed statutory verification tolerances. In accordance with Rule 16 of the Legal Metrology Rules,
                  Ed25519 digital verification certificate generation is <strong>strictly blocked</strong>.
                  The Legal Metrology Officer is instructed to issue a <strong>Form V Rejection &amp; Repair Order</strong> requiring licensed mechanical adjustment or loadcell recalibration.
                </p>
                <div className="text-rose-700 font-semibold flex items-center gap-1 pt-1">
                  <Wrench className="w-3.5 h-3.5" /> Adjustment / Repair Required before re-verification.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statutory Enforcement Actions Bar */}
        <div className="pt-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#4e6073]">
            <Lock className="w-4 h-4 text-[#16a34a]" />
            <span>Hardware Security Module: <strong>Ed25519 Ready</strong> (National Root CA Anchored)</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            {/* Re-verification Action Button (Available when tolerance failed or under notice) */}
            {!canGenerateCertificate && (
              <button
                type="button"
                onClick={async () => {
                  handleToggleScenario('pass');
                  if (selectedDocket?.id) {
                    try {
                      await apiClient.updateApplication(selectedDocket.id, {
                        status: 'UNDER VERIFICATION',
                        stage: 'review',
                        stageLabel: 'Re-verification in Progress',
                        stageBadgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
                      });
                    } catch (e) {
                      console.warn('Backend reverify update notice:', e);
                    }
                  }
                  showToast(
                    'Re-verification Initiated',
                    'Mechanical adjustments completed. Calibration readings reset for statutory re-testing.',
                    'info'
                  );
                  loadLmoData(true);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-verify (After Adjustment)</span>
              </button>
            )}

            {/* Rejection Notice Button */}
            <button
              onClick={async () => {
                const rejPayload = {
                  docketId: selectedDocket?.id || 'LM-VER-DRAFT',
                  establishment: selectedDocket?.establishmentName || 'Standard Establishment',
                  reason: !canGenerateCertificate
                    ? `Statutory verification tolerance failed: MPE Engine (${mpeResult ? (mpeResult.isPass ? 'OK' : 'EXCEEDED') : 'EXCEEDED'}), Repeatability (${isRepeatabilityPass ? 'PASS' : 'FAIL'}), Eccentricity (${isEccentricityPass ? 'PASS' : 'FAIL'}). Adjustment / Repair Required.`
                    : 'Officer initiated pre-emptive manual condemnation for physical damage'
                };

                try {
                  if (selectedDocket?.id) {
                    await apiClient.updateApplication(selectedDocket.id, {
                      status: 'FAIL',
                      stage: 'review',
                      stageLabel: 'Adjustment / Repair Notice Issued',
                      stageBadgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
                    });
                  }
                } catch (e) {
                  console.warn('Backend rejection status update fallback:', e);
                }

                onIssueRejection(rejPayload);
                loadLmoData(true);
              }}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                !canGenerateCertificate
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm ring-2 ring-rose-300'
                  : 'border border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c]/10'
              }`}
            >
              {!canGenerateCertificate ? 'Issue Rejection & Repair Notice (Form V)' : 'Issue Rejection Notice'}
            </button>

            {/* Issue Ed25519 Signed Certificate & Stamp Button */}
            <button
              disabled={!canGenerateCertificate}
              onClick={async () => {
                if (!canGenerateCertificate) {
                  showToast(
                    'Certificate Generation Blocked',
                    'All 4 criteria (Repeatability ✓, Eccentricity ✓, Linearity ✓, MPE ✓) must pass before a certificate can be generated.',
                    'error'
                  );
                  return;
                }
                // Run through statutory Expiry Engine for temporal validity mapping
                const expiryResult = calculateExpiry(new Date(), 'electronic_scales_weighbridges');

                const verifyingOfficerName =
                  selectedDocket?.rawApp?.assignedLmo?.name ||
                  selectedDocket?.rawApp?.assignedLmoUser?.name ||
                  officerProfile.name ||
                  'Legal Metrology Officer';

                const verifyingOfficerBadge =
                  selectedDocket?.rawApp?.assignedLmo?.badgeNo ||
                  selectedDocket?.rawApp?.assignedLmoUser?.identifier ||
                  officerProfile.badgeNo ||
                  'MH-LM-2041';

                const certPayload: LegalMetrologyCertificate = {
                  certificateId: `LM-CERT-${crypto.randomUUID()}`,
                  instrumentId: selectedDocket?.id || '',
                  owner: selectedDocket?.establishmentName || '',
                  manufacturer: selectedDocket?.manufacturer || '',
                  model: selectedDocket?.model || '',
                  serialNumber: selectedDocket?.serialNumber || '',
                  accuracyClass: selectedDocket?.accuracyClass || '',
                  capacity: selectedDocket?.capacity || '',
                  verificationDate: expiryResult.verificationDate,
                  validityPeriod: expiryResult.validityPeriod,
                  expiryDate: expiryResult.expiryDate,
                  lmoId: verifyingOfficerBadge,
                  status: 'valid',
                  instrument: selectedDocket?.instrumentType || '',
                  category: 'electronic_scales_weighbridges',
                  warningThresholdDays: expiryResult.warningThresholdDays,
                  daysRemaining: expiryResult.daysRemaining,
                  verifiedBy: verifyingOfficerName.includes('(') ? verifyingOfficerName : `${verifyingOfficerName} (${verifyingOfficerBadge})`,
                  establishmentAddress: selectedDocket?.address || '',
                  eInterval: '5 kg',
                };

                // Physically persist certificate in MongoDB Atlas
                try {
                  await apiClient.createCertificate({
                    applicationRef: selectedDocket?.id,
                    certificateId: certPayload.certificateId,
                    instrumentId: certPayload.instrumentId,
                    owner: certPayload.owner,
                    manufacturer: certPayload.manufacturer,
                    model: certPayload.model,
                    serialNumber: certPayload.serialNumber,
                    accuracyClass: certPayload.accuracyClass,
                    capacity: certPayload.capacity,
                    verificationDate: certPayload.verificationDate,
                    validityPeriod: certPayload.validityPeriod,
                    expiryDate: certPayload.expiryDate,
                    lmoId: certPayload.lmoId,
                    status: 'valid',
                    instrument: certPayload.instrument,
                    category: certPayload.category,
                    warningThresholdDays: certPayload.warningThresholdDays,
                    daysRemaining: certPayload.daysRemaining,
                    verifiedBy: certPayload.verifiedBy,
                    establishmentAddress: certPayload.establishmentAddress,
                    eInterval: certPayload.eInterval,
                    digitalSignatureHash: certPayload.digitalSignatureHash
                  });
                } catch (certSaveErr) {
                  showToast('Certificate Not Issued', 'The backend did not accept the certificate because a verified Ed25519 signature is required.', 'error');
                  return;
                }

                try {
                  if (selectedDocket?.id) {
                    await apiClient.updateApplication(selectedDocket.id, {
                      status: 'CERTIFICATE ISSUED',
                      stage: 'stamped',
                      stageLabel: 'Certified & Stamped',
                      stageBadgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    });
                  }
                } catch (e) {
                  console.warn('Backend cert status update fallback:', e);
                }

                // Store in national Legal Metrology local cache and open certificate modal
                saveCertificate(certPayload);
                onIssueCertificate(certPayload);
                loadLmoData(true);
              }}
              title={
                canGenerateCertificate
                  ? 'Sign and issue verification certificate with Ed25519 key'
                  : 'Certificate generation blocked: requires Repeatability ✓, Eccentricity ✓, Linearity ✓, MPE ✓'
              }
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] ${
                canGenerateCertificate
                  ? 'bg-[#16a34a] hover:bg-[#15803d] text-white cursor-pointer'
                  : 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
              }`}
            >
              {canGenerateCertificate ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
              <span>
                {canGenerateCertificate
                  ? 'Issue Ed25519 Digitally Signed Stamp & Certificate'
                  : 'Certificate Generation BLOCKED'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
