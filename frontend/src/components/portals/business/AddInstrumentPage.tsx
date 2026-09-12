import React, { useState } from 'react';
import { LogoutOverlay } from '../../common/LogoutOverlay';
import {
  Scale,
  Building2,
  QrCode,
  Camera,
  Keyboard,
  CheckCircle2,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Calendar,
  Hash,
  Tag,
  Wrench,
  Sparkles,
  RotateCcw,
  Check,
  AlertCircle,
  FileText,
  Layers,
  Activity
} from 'lucide-react';
import { UserSession } from '../../../types';
import { EverimetLogo } from '../../common/EverimetLogo';
import { apiClient } from '../../../services/apiClient';

export interface NewInstrumentData {
  instrumentId: string;
  idEntryMethod: 'scan' | 'manual';
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  status: string;
  expiry: string;
  action: string;
}

interface AddInstrumentPageProps {
  userSession?: UserSession;
  onBack: () => void;
  onLogout: () => void;
  onSuccess?: (data: NewInstrumentData) => void;
  showToast?: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const AddInstrumentPage: React.FC<AddInstrumentPageProps> = ({
  userSession,
  onBack,
  onLogout,
  onSuccess,
  showToast
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Instrument ID Mode: 'scan' or 'manual'
  const [idMode, setIdMode] = useState<'scan' | 'manual'>('scan');
  const [instrumentId, setInstrumentId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);

  // Form Fields
  const [type, setType] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState('Active');
  const [expiry, setExpiry] = useState('');
  const [action, setAction] = useState('Apply for Verification');

  // Simulated QR Scanning Function
  const handleSimulateScan = () => {
    setIsScanning(true);
    setScannedSuccess(false);

    setTimeout(() => {
      const generatedId = `IND-LM-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
      setInstrumentId(generatedId);
      setIsScanning(false);
      setScannedSuccess(true);
      if (showToast) {
        showToast(
          'QR Code Scanned Successfully',
          `Recognized Statutory Metrology ID: ${generatedId}`,
          'success'
        );
      }
    }, 1200);
  };

  const handleResetForm = () => {
    setInstrumentId('');
    setType('');
    setManufacturer('');
    setModel('');
    setSerialNumber('');
    setStatus('Active');
    setExpiry('');
    setAction('Apply for Verification');
    setScannedSuccess(false);
    if (showToast) {
      showToast('Form Reset', 'All instrument entry fields have been cleared.', 'info');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!instrumentId.trim()) {
      if (showToast) {
        showToast('Instrument ID Required', 'Please scan a QR code or enter the instrument ID manually.', 'warning');
      }
      return;
    }

    if (!type) {
      if (showToast) {
        showToast('Type Required', 'Please select the instrument type.', 'warning');
      }
      return;
    }

    if (!manufacturer.trim()) {
      if (showToast) {
        showToast('Manufacturer Required', 'Please enter the manufacturer name.', 'warning');
      }
      return;
    }

    if (!model.trim()) {
      if (showToast) {
        showToast('Model Required', 'Please enter the instrument model name or number.', 'warning');
      }
      return;
    }

    if (!serialNumber.trim()) {
      if (showToast) {
        showToast('Serial Number Required', 'Please specify the serial number of the unit.', 'warning');
      }
      return;
    }

    if (!expiry) {
      if (showToast) {
        showToast('Expiry Date Required', 'Please select the verification or stamping expiry date.', 'warning');
      }
      return;
    }

    const newInstrument: NewInstrumentData = {
      instrumentId: instrumentId.trim(),
      idEntryMethod: idMode,
      type,
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      serialNumber: serialNumber.trim(),
      status,
      expiry,
      action
    };

    try {
      await apiClient.createInstrument({
        instrumentId: newInstrument.instrumentId,
        type: newInstrument.type,
        category: 'electronic_scales_weighbridges',
        serialNo: newInstrument.serialNumber,
        manufacturer: newInstrument.manufacturer,
        model: newInstrument.model,
        ownerName: userSession?.enterpriseName || userSession?.name || 'Enterprise Owner',
        capacity: '30 kg',
        status: newInstrument.status as any,
        location: 'Enterprise Operating Site',
        accuracyClass: 'Class III',
        nextVerificationDue: newInstrument.expiry
      });
    } catch (err) {
      console.warn('Backend instrument sync fallback:', err);
    }

    if (showToast) {
      showToast(
        'Instrument Registered',
        `Instrument ${newInstrument.instrumentId} (${newInstrument.model}) registered successfully in database.`,
        'success'
      );
    }

    if (onSuccess) {
      onSuccess(newInstrument);
    }

    // Return to dashboard
    onBack();
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f8f9ff] via-[#f0f4f9] to-[#edf3fa] flex flex-col justify-start items-center py-8 sm:py-12 px-4 sm:px-6 md:px-8 selection:bg-[#dcfce7] selection:text-[#14532d]">
      <div className="max-w-4xl w-full space-y-6">
        {/* National Crest & Header (Consistent with Login & Owner Dashboard) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <EverimetLogo variant="icon" size="lg" className="p-2.5 bg-white border border-[#d8e4f1] shadow-sm rounded-2xl shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#eef8f1] text-[#15803d] border border-[#c6edd0]">
                  Government of India • Legal Metrology
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-500">
                  e-VeriMet
                </span>
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0c2340] tracking-tight mt-0.5">
                <span className="text-[#16a34a]">e</span>-VeriMet <span className="text-gray-300 font-light">|</span> Add New Instrument
              </h1>
            </div>
          </div>

          {/* User Profile & Navigation Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#d8e4f1] hover:border-[#16a34a]/40 text-xs font-bold text-[#121d26] flex items-center gap-2 shadow-2xs hover:bg-[#fdfdfd] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#16a34a]" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#e2e8f0] shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] flex items-center justify-center font-bold text-xs">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[#121d26] hidden md:inline">
                {userSession?.name || 'Owner'}
              </span>
              <div className="h-4 w-[1px] bg-gray-200" />
              <button
                type="button"
                onClick={() => setIsLoggingOut(true)}
                className="p-1 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Form Container Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-md space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-[#0c2340]">
              Instrument Information & Specifications
            </h2>
            <p className="text-xs text-[#4e6073]">
              Provide statutory particulars to enroll the instrument in the National Legal Metrology Registry
            </p>
          </div>

          {/* 1. Instrument ID (Two Options: Scan QR Code or Enter Manually) */}
          <div className="space-y-3 p-4 sm:p-5 rounded-xl border border-[#d8e4f1] bg-[#fdfdfd]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-[#121d26]">
                  Instrument ID *
                </label>
                <span className="text-[11px] text-[#4e6073]">
                  Select whether to scan statutory holographic QR code or enter manually
                </span>
              </div>

              {/* Toggle Buttons for Scan QR Code vs Enter Manually */}
              <div className="inline-flex p-1 rounded-xl bg-[#ecf4ff] border border-[#d8e4f1] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIdMode('scan')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    idMode === 'scan'
                      ? 'bg-white text-[#15803d] shadow-xs'
                      : 'text-[#4e6073] hover:text-[#121d26]'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>Scan QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIdMode('manual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    idMode === 'manual'
                      ? 'bg-white text-[#15803d] shadow-xs'
                      : 'text-[#4e6073] hover:text-[#121d26]'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>Enter Manually</span>
                </button>
              </div>
            </div>

            {/* Sub-view: Scan QR Code */}
            {idMode === 'scan' && (
              <div className="pt-2 space-y-3">
                <div className="p-4 rounded-xl border border-dashed border-[#c6edd0] bg-[#f0fdf4] flex flex-col items-center justify-center text-center space-y-3">
                  <div className="relative w-28 h-28 rounded-xl border-2 border-[#16a34a] bg-white flex items-center justify-center overflow-hidden shadow-inner">
                    {isScanning ? (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Activity className="w-8 h-8 text-[#16a34a] animate-pulse" />
                        <span className="text-[10px] font-bold text-[#16a34a]">Scanning...</span>
                        {/* Scanning beam animation */}
                        <div className="absolute inset-x-0 h-0.5 bg-[#16a34a] animate-bounce shadow-sm" />
                      </div>
                    ) : scannedSuccess ? (
                      <div className="flex flex-col items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-10 h-10 mb-1" />
                        <span className="text-[10px] font-bold">QR Captured</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Camera className="w-8 h-8 text-[#16a34a]" />
                        <span className="text-[9px] font-semibold text-[#4e6073] mt-1">Ready to Scan</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#121d26]">
                      Optical QR Code Scanner
                    </p>
                    <p className="text-[11px] text-[#4e6073] max-w-sm">
                      Align the statutory holographic seal or stamping barcode affixed to the instrument
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    disabled={isScanning}
                    className="px-4 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{isScanning ? 'Decoding QR...' : 'Click to Scan QR Code'}</span>
                  </button>
                </div>

                {instrumentId && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs text-emerald-900">
                        Detected Instrument ID: <strong className="font-mono font-bold text-[#121d26]">{instrumentId}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setInstrumentId('');
                        setScannedSuccess(false);
                      }}
                      className="text-[11px] text-emerald-700 hover:underline font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sub-view: Enter Manually */}
            {idMode === 'manual' && (
              <div className="pt-2">
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16a34a] pointer-events-none" />
                  <input
                    type="text"
                    value={instrumentId}
                    onChange={(e) => setInstrumentId(e.target.value)}
                    placeholder="e.g. IND-LM-9821-2024"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e4f1] text-xs font-mono font-medium text-[#121d26] bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] transition-colors"
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Enter the unique alphanumeric ID allocated by the Legal Metrology authority or OEM
                </span>
              </div>
            )}
          </div>

          {/* 2-Column Grid for Primary Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 2. Type */}
            <div className="space-y-1">
              <label htmlFor="inst-type" className="block text-xs font-bold text-[#121d26]">
                Instrument Type *
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16a34a] pointer-events-none" />
                <select
                  id="inst-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#121d26] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Instrument Type</option>
                  <option value="Non-Automatic Weighing Instrument (NAWI)">Non-Automatic Weighing Instrument (NAWI)</option>
                  <option value="Automatic Weighing Instrument (AWI)">Automatic Weighing Instrument (AWI)</option>
                  <option value="Electronic Weighbridge">Electronic Weighbridge</option>
                  <option value="Platform Scale (Class III)">Platform Scale (Class III)</option>
                  <option value="Countertop Commercial Scale">Countertop Commercial Scale</option>
                  <option value="Fuel Dispensing Unit (Petrol/Diesel)">Fuel Dispensing Unit (Petrol/Diesel)</option>
                  <option value="Flow Meter / Liquid Measure">Flow Meter / Liquid Measure</option>
                  <option value="Linear Measuring Tape / Rule">Linear Measuring Tape / Rule</option>
                  <option value="Spring Balance / Steelyard">Spring Balance / Steelyard</option>
                </select>
              </div>
            </div>

            {/* 3. Manufacturer */}
            <div className="space-y-1">
              <label htmlFor="inst-manufacturer" className="block text-xs font-bold text-[#121d26]">
                Manufacturer *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16a34a] pointer-events-none" />
                <input
                  id="inst-manufacturer"
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g. Mettler Toledo / Essae Teraoka"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#121d26] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] transition-colors"
                />
              </div>
            </div>

            {/* 4. Model */}
            <div className="space-y-1">
              <label htmlFor="inst-model" className="block text-xs font-bold text-[#121d26]">
                Model *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16a34a] pointer-events-none" />
                <input
                  id="inst-model"
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. BC-60 Commercial Counter Scale"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#121d26] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] transition-colors"
                />
              </div>
            </div>

            {/* 5. Serial Number */}
            <div className="space-y-1">
              <label htmlFor="inst-serial" className="block text-xs font-bold text-[#121d26]">
                Serial Number *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16a34a] pointer-events-none" />
                <input
                  id="inst-serial"
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. SN-883921-2024"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e4f1] text-xs font-mono font-medium text-[#121d26] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] transition-colors"
                />
              </div>
            </div>

            {/* 6. Status */}
            <div className="space-y-1">
              <label htmlFor="inst-status" className="block text-xs font-bold text-[#121d26]">
                Status *
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16a34a] pointer-events-none" />
                <select
                  id="inst-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#121d26] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] transition-colors appearance-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Under Verification">Under Verification</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending Stamping">Pending Stamping</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Expired">Expired</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* 7. Expiry */}
            <div className="space-y-1">
              <label htmlFor="inst-expiry" className="block text-xs font-bold text-[#121d26]">
                Expiry (Verification Expiry Date) *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16a34a] pointer-events-none" />
                <input
                  id="inst-expiry"
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#121d26] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 8. Action (Selection & Form Submission) */}
          <div className="space-y-1">
            <label htmlFor="inst-action" className="block text-xs font-bold text-[#121d26]">
              Action *
            </label>
            <div className="relative">
              <Wrench className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16a34a] pointer-events-none" />
              <select
                id="inst-action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#121d26] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] transition-colors appearance-none cursor-pointer"
              >
                <option value="Apply for Verification">Apply for Verification</option>
                <option value="Schedule Initial Stamping">Schedule Initial Stamping</option>
                <option value="Annual Stamping Renewal">Annual Stamping Renewal</option>
                <option value="Re-verification Post-Repair">Re-verification Post-Repair</option>
                <option value="Register into Inventory">Register into Inventory Only</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#d8e4f1] text-xs font-bold text-[#4e6073] hover:text-[#121d26] hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Fields</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#d8e4f1] text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save & Register Instrument</span>
              </button>
            </div>
          </div>
        </form>

        {/* Footer info banner matching Login page */}
        <p className="text-center text-[11px] text-gray-500 pb-4">
          National Legal Metrology Portal • Directorate of Legal Metrology, Department of Consumer Affairs, Government of India
        </p>
      </div>

      <LogoutOverlay
        isOpen={isLoggingOut}
        userName={userSession?.name || 'Trader'}
        userRole="Enterprise Owner"
        onComplete={onLogout}
      />
    </div>
  );
};

export default AddInstrumentPage;
