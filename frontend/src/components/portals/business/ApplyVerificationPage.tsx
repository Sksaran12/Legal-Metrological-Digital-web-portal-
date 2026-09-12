import React, { useState, useRef, useMemo } from 'react';
import { LogoutOverlay } from '../../common/LogoutOverlay';
import {
  Scale,
  Building2,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Layers,
  Tag,
  Hash,
  MapPin,
  Compass,
  Upload,
  FileUp,
  FileText,
  Camera,
  CheckCircle2,
  RotateCcw,
  Check,
  X,
  Gauge,
  CreditCard,
  QrCode,
  Landmark,
  Download,
  Loader2,
  Sparkles,
  Receipt,
  Plus,
  Trash2,
  Copy,
  Calculator,
  Volume2
} from 'lucide-react';
import { UserSession } from '../../../types';
import { LocationPickerMap } from '../../common/LocationPickerMap';
import { EverimetLogo } from '../../common/EverimetLogo';
import { apiClient } from '../../../services/apiClient';
import {
  RazorpayPaymentModal,
  playPaymentSuccessSound,
  RazorpayPaymentDetails
} from '../../modals/RazorpayPaymentModal';

export interface AppliedInstrumentItem {
  id: string;
  instrumentType: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  capacity: string;
  accuracyClass: string;
  quantity: number;
  unitFee: number;
  subtotal: number;
}

export interface VerificationApplicationData {
  instrumentType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  capacity: string;
  accuracyClass: string;
  verificationType: string;
  installationAddress: string;
  gpsCoordinates: string;
  photographName: string;
  photographUrl?: string;
  supportingDocName: string;
  supportingDocSize?: string;
  docketId?: string;
  txnId?: string;
  paidFee?: string;
  instrumentsList?: AppliedInstrumentItem[];
  totalInstrumentsCount?: number;
  baseFeeTotal?: number;
  stampingFeeTotal?: number;
  gstAmount?: number;
  grandTotal?: number;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  paymentMethod?: string;
}

export const STATUTORY_INSTRUMENT_CATALOG = [
  {
    id: 'nawi_counter',
    name: 'Countertop Commercial Scale (NAWI)',
    category: 'Commercial Weighing Instruments',
    unitFee: 400,
    defaultAccuracyClass: 'Class III (Medium Accuracy - Commercial / Retail)',
    defaultCapacity: '30 kg (Max), 100 g (Min)'
  },
  {
    id: 'nawi_platform',
    name: 'Bench / Platform Scale (Class III)',
    category: 'Commercial Weighing Instruments',
    unitFee: 800,
    defaultAccuracyClass: 'Class III (Medium Accuracy - Commercial / Retail)',
    defaultCapacity: '150 kg (Max), 500 g (Min)'
  },
  {
    id: 'nawi_industrial',
    name: 'Heavy Industrial Platform Scale (up to 3T)',
    category: 'Industrial Weighing Instruments',
    unitFee: 1500,
    defaultAccuracyClass: 'Class III (Medium Accuracy - Commercial / Retail)',
    defaultCapacity: '3000 kg (Max), 5 kg (Min)'
  },
  {
    id: 'weighbridge',
    name: 'Electronic Weighbridge (Road / Rail Weighing)',
    category: 'Heavy Weighbridges',
    unitFee: 4500,
    defaultAccuracyClass: 'Class IIII (Ordinary Accuracy - Industrial / Bulk)',
    defaultCapacity: '50 Ton (Max), 500 kg (Min)'
  },
  {
    id: 'precision_class2',
    name: 'High Precision Bullion / Jeweller Scale (Class II)',
    category: 'Precision Laboratory & Bullion',
    unitFee: 1200,
    defaultAccuracyClass: 'Class II (High Accuracy - Precision / Gold)',
    defaultCapacity: '1 kg (Max), 0.01 g (Min)'
  },
  {
    id: 'analytical_class1',
    name: 'Analytical Microbalance (Class I)',
    category: 'Precision Laboratory & Bullion',
    unitFee: 2500,
    defaultAccuracyClass: 'Class I (Special Accuracy - Laboratory)',
    defaultCapacity: '220 g (Max), 0.1 mg (Min)'
  },
  {
    id: 'fuel_dispenser',
    name: 'Fuel Dispensing Unit (Petrol / Diesel Nozzle)',
    category: 'Liquid Measuring Systems',
    unitFee: 1800,
    defaultAccuracyClass: 'Class III (Medium Accuracy - Commercial / Retail)',
    defaultCapacity: '50 L/min'
  },
  {
    id: 'bulk_flow_meter',
    name: 'Bulk Liquid Flow Meter / Totalizer',
    category: 'Liquid Measuring Systems',
    unitFee: 3200,
    defaultAccuracyClass: 'Class III (Medium Accuracy - Commercial / Retail)',
    defaultCapacity: '500 L/min'
  },
  {
    id: 'linear_measure',
    name: 'Steel Tape / Linear Measuring Rule',
    category: 'Linear Measures',
    unitFee: 250,
    defaultAccuracyClass: 'Class III (Medium Accuracy - Commercial / Retail)',
    defaultCapacity: '50 m'
  },
  {
    id: 'capacity_measure',
    name: 'Conical / Cylindrical Capacity Measure (Set)',
    category: 'Capacity Measures',
    unitFee: 350,
    defaultAccuracyClass: 'Class III (Medium Accuracy - Commercial / Retail)',
    defaultCapacity: '10 Litres'
  }
];

interface ApplyVerificationPageProps {
  userSession?: UserSession;
  onBack: () => void;
  onLogout: () => void;
  onSubmitSuccess?: (data: VerificationApplicationData) => void;
  showToast?: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const ApplyVerificationPage: React.FC<ApplyVerificationPageProps> = ({
  userSession,
  onBack,
  onLogout,
  onSubmitSuccess,
  showToast
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Page step flow: 'form' | 'submitted' (with modal for payment)
  const [pageStep, setPageStep] = useState<'form' | 'submitted'>('form');

  // Multi-instrument items state
  const [instruments, setInstruments] = useState<AppliedInstrumentItem[]>([
    {
      id: 'inst-1',
      instrumentType: '',
      category: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      capacity: '',
      accuracyClass: '',
      quantity: 1,
      unitFee: 0,
      subtotal: 0
    }
  ]);

  // General application fields
  const [verificationType, setVerificationType] = useState('Initial Verification (First Stamping for New Instrument)');
  const [installationAddress, setInstallationAddress] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState('');

  // Photograph upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Supporting documents upload state
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docFileName, setDocFileName] = useState<string>('');
  const docInputRef = useRef<HTMLInputElement>(null);

  // Razorpay Modal state
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [pendingDocketId, setPendingDocketId] = useState('');

  // Submission result payload for Full-Page Green Success Screen
  const [submissionPayload, setSubmissionPayload] = useState<VerificationApplicationData | null>(null);

  // Real-time calculation computation
  const calculationSummary = useMemo(() => {
    const baseFeeTotal = instruments.reduce((sum, item) => sum + item.subtotal, 0);
    const totalUnitsCount = instruments.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const stampingFeeTotal = 200; // statutory seal & e-stamping fee
    const taxableSubtotal = baseFeeTotal + stampingFeeTotal;
    const cgst = Math.round(taxableSubtotal * 0.09 * 100) / 100;
    const sgst = Math.round(taxableSubtotal * 0.09 * 100) / 100;
    const gstAmount = Math.round((cgst + sgst) * 100) / 100;
    const grandTotal = Math.round((taxableSubtotal + gstAmount) * 100) / 100;

    return {
      baseFeeTotal,
      totalUnitsCount,
      stampingFeeTotal,
      taxableSubtotal,
      cgst,
      sgst,
      gstAmount,
      grandTotal
    };
  }, [instruments]);

  const formatINR = (num: number) => {
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Add new equipment / instrument entry
  const handleAddInstrument = () => {
    const newEntry: AppliedInstrumentItem = {
      id: `inst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      instrumentType: '',
      category: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      capacity: '',
      accuracyClass: '',
      quantity: 1,
      unitFee: 0,
      subtotal: 0
    };
    setInstruments((prev) => [...prev, newEntry]);
    if (showToast) {
      showToast('Instrument Added', 'New equipment entry added to your application.', 'info');
    }
  };

  // Duplicate an instrument entry
  const handleDuplicateInstrument = (item: AppliedInstrumentItem) => {
    const duplicated: AppliedInstrumentItem = {
      ...item,
      id: `inst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      serialNumber: item.serialNumber ? `${item.serialNumber}-B` : '',
      quantity: 1,
      subtotal: item.unitFee * 1
    };
    setInstruments((prev) => [...prev, duplicated]);
    if (showToast) {
      showToast('Instrument Duplicated', `Created copy of ${item.instrumentType}.`, 'info');
    }
  };

  // Remove an instrument entry
  const handleRemoveInstrument = (id: string) => {
    if (instruments.length <= 1) {
      if (showToast) {
        showToast('Cannot Remove', 'Application must contain at least one instrument for verification.', 'warning');
      }
      return;
    }
    setInstruments((prev) => prev.filter((it) => it.id !== id));
    if (showToast) {
      showToast('Instrument Removed', 'Equipment entry removed.', 'info');
    }
  };

  // Update instrument type & statutory fee
  const handleInstrumentTypeChange = (id: string, typeName: string) => {
    const found = STATUTORY_INSTRUMENT_CATALOG.find((c) => c.name === typeName);
    if (!found) {
      setInstruments((prev) =>
        prev.map((it) => it.id === id ? { ...it, instrumentType: '', category: '', unitFee: 0, subtotal: 0 } : it)
      );
      return;
    }

    setInstruments((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const unitFee = found.unitFee;
          const subtotal = unitFee * it.quantity;
          return {
            ...it,
            instrumentType: found.name,
            category: found.category,
            unitFee,
            subtotal,
            capacity: it.capacity || found.defaultCapacity,
            accuracyClass: found.defaultAccuracyClass
          };
        }
        return it;
      })
    );
  };

  const handleUnitFeeChange = (id: string, value: string) => {
    const unitFee = Math.max(0, Number(value) || 0);
    setInstruments((prev) =>
      prev.map((it) => it.id === id ? { ...it, unitFee, subtotal: unitFee * it.quantity } : it)
    );
  };

  // Update quantity stepper
  const handleQuantityChange = (id: string, newQty: number) => {
    const safeQty = Math.max(1, Math.min(500, Math.floor(newQty || 1)));
    setInstruments((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          return {
            ...it,
            quantity: safeQty,
            subtotal: it.unitFee * safeQty
          };
        }
        return it;
      })
    );
  };

  // Update other text fields of an instrument
  const handleFieldChange = (id: string, field: keyof AppliedInstrumentItem, value: any) => {
    setInstruments((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  // Upload handlers
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      if (showToast) {
        showToast('Photograph Uploaded', `${file.name} ready for submission.`, 'success');
      }
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFile(file);
      setDocFileName(file.name);
      if (showToast) {
        showToast('Document Uploaded', `${file.name} (${(file.size / 1024).toFixed(1)} KB) attached.`, 'success');
      }
    }
  };

  const handleRemoveDoc = () => {
    setDocFile(null);
    setDocFileName('');
    if (docInputRef.current) {
      docInputRef.current.value = '';
    }
  };

  const handleUseSamplePhoto = () => {
    setPhotoPreview('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80');
    setPhotoFile(new File(['sample'], 'scale_inspection_photo.jpg', { type: 'image/jpeg' }));
    if (showToast) {
      showToast('Sample Photograph Attached', 'Official scale inspection photo selected.', 'info');
    }
  };

  const handleUseSampleDoc = () => {
    setDocFileName('Model_Approval_Certificate_LMPC_2026.pdf');
    setDocFile(new File(['sample'], 'Model_Approval_Certificate_LMPC_2026.pdf', { type: 'application/pdf' }));
    if (showToast) {
      showToast('Sample Document Attached', 'Model approval & invoice PDF attached.', 'info');
    }
  };

  const handleResetForm = () => {
    setInstruments([
      {
        id: 'inst-1',
        instrumentType: '',
        category: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        capacity: '',
        accuracyClass: '',
        quantity: 1,
        unitFee: 0,
        subtotal: 0
      }
    ]);
    setVerificationType('Initial Verification (First Stamping for New Instrument)');
    setInstallationAddress('');
    setGpsCoordinates('');
    handleRemovePhoto();
    handleRemoveDoc();
    setPageStep('form');
    if (showToast) {
      showToast('Form Reset', 'All verification application fields cleared.', 'info');
    }
  };

  // Step 1 -> Trigger Razorpay Payment Modal
  const handleOpenRazorpayPayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that each instrument has required values
    for (let i = 0; i < instruments.length; i++) {
      const it = instruments[i];
      if (!it.manufacturer.trim()) {
        if (showToast) showToast('Missing Manufacturer', `Please enter manufacturer for item #${i + 1} (${it.instrumentType}).`, 'warning');
        return;
      }
      if (!it.model.trim()) {
        if (showToast) showToast('Missing Model', `Please enter model for item #${i + 1} (${it.instrumentType}).`, 'warning');
        return;
      }
      if (!it.serialNumber.trim()) {
        if (showToast) showToast('Missing Serial Number', `Please enter serial number for item #${i + 1}.`, 'warning');
        return;
      }
      if (!it.instrumentType || it.unitFee <= 0) {
        if (showToast) showToast('Price Required', `Select an equipment type and enter a valid unit price for item #${i + 1}.`, 'warning');
        return;
      }
    }

    if (!installationAddress.trim()) {
      if (showToast) showToast('Address Required', 'Please provide physical installation address.', 'warning');
      return;
    }
    if (!gpsCoordinates.trim()) {
      if (showToast) showToast('GPS Location Required', 'Use Detect GPS, search for the premises, or drop a pin on the map before continuing.', 'warning');
      return;
    }

    const generatedDocket = `APP-2026-IND-${Math.floor(2000 + Math.random() * 7000)}`;
    setPendingDocketId(generatedDocket);
    setIsRazorpayModalOpen(true);
  };

  // Step 2 -> Handle Razorpay Payment Success
  const handleRazorpaySuccess = async (paymentDetails: RazorpayPaymentDetails) => {
    setIsRazorpayModalOpen(false);

    // Play crisp payment success soundbox chime immediately!
    playPaymentSuccessSound();

    const effectiveAddress = installationAddress.trim();
    const effectiveGps = gpsCoordinates.trim();
    const effectivePhotoName = photoFile ? photoFile.name : '';
    const effectiveDocName = docFileName;
    const docketId = pendingDocketId || `APP-2026-IND-${Math.floor(2000 + Math.random() * 7000)}`;

    // Prepare multi-instrument summary strings
    const firstInst = instruments[0];
    const instrumentTypeSummary =
      instruments.length === 1
        ? `${firstInst.instrumentType} (${firstInst.quantity} ${firstInst.quantity > 1 ? 'units' : 'unit'})`
        : `${firstInst.instrumentType} (${firstInst.quantity} units) + ${instruments.length - 1} other types (${calculationSummary.totalUnitsCount} total units)`;

    const equipmentNameSummary =
      instruments.length === 1
        ? `${firstInst.manufacturer} ${firstInst.model}`.trim() || firstInst.instrumentType
        : `${firstInst.manufacturer} ${firstInst.model} + ${instruments.length - 1} more`;

    const serialSummary =
      instruments.length === 1
        ? firstInst.serialNumber
        : instruments.map((it) => `${it.serialNumber} (x${it.quantity})`).join(', ');

    const applicationPayload: VerificationApplicationData = {
      instrumentType: instrumentTypeSummary,
      manufacturer: firstInst.manufacturer,
      model: firstInst.model,
      serialNumber: serialSummary,
      capacity: firstInst.capacity,
      accuracyClass: firstInst.accuracyClass,
      verificationType,
      installationAddress: effectiveAddress,
      gpsCoordinates: effectiveGps,
      photographName: effectivePhotoName,
      photographUrl: photoPreview || undefined,
      supportingDocName: effectiveDocName,
      docketId,
      txnId: paymentDetails.razorpayPaymentId,
      paidFee: formatINR(calculationSummary.grandTotal),
      instrumentsList: instruments,
      totalInstrumentsCount: calculationSummary.totalUnitsCount,
      baseFeeTotal: calculationSummary.baseFeeTotal,
      stampingFeeTotal: calculationSummary.stampingFeeTotal,
      gstAmount: calculationSummary.gstAmount,
      grandTotal: calculationSummary.grandTotal,
      razorpayPaymentId: paymentDetails.razorpayPaymentId,
      razorpayOrderId: paymentDetails.razorpayOrderId,
      paymentMethod: paymentDetails.paymentMethod
    };

    try {
      const res = await apiClient.createApplication({
        appNo: docketId,
        enterpriseName: userSession?.enterpriseName || (userSession?.name ? `${userSession.name} Enterprise` : 'Apex Scale Solutions'),
        enterpriseType: 'Trader / Importer',
        equipmentName: equipmentNameSummary,
        equipmentSerial: serialSummary,
        equipmentClass: firstInst.accuracyClass,
        instrumentType: instrumentTypeSummary,
        manufacturer: firstInst.manufacturer,
        model: firstInst.model,
        capacity: firstInst.capacity,
        verificationType,
        installationAddress: effectiveAddress,
        gpsCoordinates: effectiveGps,
        photographName: effectivePhotoName,
        supportingDocName: effectiveDocName,
        jurisdiction: 'Mumbai Metropolitan Region',
        zone: 'Zone II',
        stage: 'intake',
        stageLabel: 'Application Intake Received',
        stageBadgeClass: 'bg-[#eef8f1] text-[#15803d]',
        feeAmount: formatINR(calculationSummary.grandTotal),
        paymentStatus: 'Paid',
        txnId: paymentDetails.razorpayPaymentId,
        paymentMethod: `RAZORPAY (${paymentDetails.paymentMethod})`,
        razorpayPaymentId: paymentDetails.razorpayPaymentId,
        razorpayOrderId: paymentDetails.razorpayOrderId,
        instrumentsList: instruments.map((it) => ({
          instrumentType: it.instrumentType,
          category: it.category,
          manufacturer: it.manufacturer,
          model: it.model,
          serialNumber: it.serialNumber,
          capacity: it.capacity,
          accuracyClass: it.accuracyClass,
          quantity: it.quantity,
          unitFee: it.unitFee,
          subtotal: it.subtotal
        })),
        totalInstrumentsCount: calculationSummary.totalUnitsCount,
        baseFeeTotal: calculationSummary.baseFeeTotal,
        stampingFeeTotal: calculationSummary.stampingFeeTotal,
        gstAmount: calculationSummary.gstAmount,
        grandTotal: calculationSummary.grandTotal
      } as any);

      if (!res?.success || !res.data) {
        throw new Error(res?.message || 'The application was not saved by the backend.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'The application could not be saved.';
      if (showToast) {
        showToast('Application Not Submitted', message, 'error');
      }
      return;
    }

    setSubmissionPayload(applicationPayload);
    setPageStep('submitted');

    if (showToast) {
      showToast(
        'Payment Confirmed & Application Filed!',
        `Razorpay ${paymentDetails.razorpayPaymentId} processed. Docket ${docketId} registered in MongoDB Atlas.`,
        'success'
      );
    }

    if (onSubmitSuccess) {
      onSubmitSuccess(applicationPayload);
    }
  };

  // Download official statutory receipt & application summary file
  const handleDownloadReceipt = () => {
    if (!submissionPayload) return;

    const enterpriseName = userSession?.enterpriseName || (userSession?.name ? `${userSession.name} Enterprise` : 'Registered Business Owner');
    const content = `================================================================================
          GOVERNMENT OF INDIA • DEPARTMENT OF CONSUMER AFFAIRS
              DIRECTORATE OF LEGAL METROLOGY (e-VeriMet)
          STATUTORY VERIFICATION APPLICATION & RAZORPAY RECEIPT
================================================================================
Docket Reference Number : ${submissionPayload.docketId}
Razorpay Payment ID     : ${submissionPayload.razorpayPaymentId || submissionPayload.txnId}
Razorpay Order ID       : ${submissionPayload.razorpayOrderId || 'order_demo_rzp'}
Payment Mode            : Razorpay Gateway (${submissionPayload.paymentMethod || 'UPI/Card/Netbanking'})
Payment Status          : SUCCESS & VERIFIED (${submissionPayload.paidFee})
Date & Time of Receipt  : ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

APPLICANT & ENTERPRISE DETAILS:
--------------------------------
Enterprise Name        : ${enterpriseName}
Authorized Owner / Rep : ${userSession?.name || 'Authorized Applicant'}
Email / User ID        : ${userSession?.identifier || 'owner@domain.in'}
Role Designation       : Trader / Equipment Owner (Legal Metrology Act, Sec 24)

ITEMIZED INSTRUMENTS SPECIFICATIONS & STATUTORY QUANTITIES:
------------------------------------------------------------
${(submissionPayload.instrumentsList || instruments)
  .map(
    (it, idx) =>
      `Item #${idx + 1}: ${it.instrumentType}
  • Quantity           : ${it.quantity} unit(s)
  • Statutory Unit Fee : ${formatINR(it.unitFee)}
  • Line Subtotal      : ${formatINR(it.subtotal)}
  • Manufacturer       : ${it.manufacturer}
  • Model              : ${it.model}
  • Serial Number      : ${it.serialNumber}
  • Max/Min Capacity   : ${it.capacity}
  • Accuracy Class     : ${it.accuracyClass}`
  )
  .join('\n\n')}

PHYSICAL INSTALLATION SITE & LOCATION:
--------------------------------------
Premises Address       : ${submissionPayload.installationAddress}
GPS Coordinates        : ${submissionPayload.gpsCoordinates}
Attached Photograph    : ${submissionPayload.photographName}
Attached Document      : ${submissionPayload.supportingDocName}

REAL STATUTORY FEE CALCULATION BREAKDOWN:
-----------------------------------------
1. Itemized Inspection Fee (${calculationSummary.totalUnitsCount} units total) : ${formatINR(calculationSummary.baseFeeTotal)}
2. Official e-Stamping & Holographic Seal Fee  : ${formatINR(calculationSummary.stampingFeeTotal)}
3. Central GST (CGST @ 9%)                      : ${formatINR(calculationSummary.cgst)}
4. State GST (SGST @ 9%)                        : ${formatINR(calculationSummary.sgst)}
--------------------------------------------------------------------------------
TOTAL STATUTORY AMOUNT PAID (INR)               : ${formatINR(calculationSummary.grandTotal)}
================================================================================
  This is an official computer-generated statutory acknowledgment from e-VeriMet.
  Valid under Section 24 of The Legal Metrology Act, 2009. No signature required.
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Statutory_Receipt_${submissionPayload.docketId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (showToast) {
      showToast('Payment Receipt Downloaded', `Official Challan saved: Statutory_Receipt_${submissionPayload.docketId}.txt`, 'success');
    }
  };

  // FULL-PAGE GREEN SUCCESS SCREEN (Rendered when pageStep === 'submitted')
  if (pageStep === 'submitted' && submissionPayload) {
    const enterpriseName = userSession?.enterpriseName || (userSession?.name ? `${userSession.name} Enterprise` : 'Registered Business Owner');

    return (
      <div className="min-h-screen bg-linear-to-br from-[#eef2f7] via-[#f7f9fb] to-[#e8eef5] flex flex-col justify-start items-center py-8 sm:py-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-3xl w-full space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-3">
              <EverimetLogo variant="icon" size="md" className="p-2 bg-[#eef8f1] border border-[#c6edd0] rounded-xl shrink-0 text-[#16a34a]" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Government of India • Statutory Submission
                  </span>
                </div>
                <h1 className="font-display font-extrabold text-xl text-[#0c2340]">
                  e-VeriMet <span className="text-gray-300">|</span> Application Docket Status
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#d8e4f1] hover:border-emerald-500 text-xs font-bold text-[#121d26] flex items-center gap-2 shadow-2xs hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#16a34a]" />
              <span>Back to Dashboard</span>
            </button>
          </div>

          {/* Main Hero Success Card */}
          <div className="gov-panel rounded-3xl border-2 border-teal-500/20 p-6 sm:p-10 space-y-6 text-center relative overflow-hidden">
            
            {/* Glowing top accent line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-emerald-500 via-green-500 to-teal-500" />

            {/* Glowing Big Success Icon */}
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 border-4 border-emerald-300 text-emerald-600 flex items-center justify-center shadow-inner animate-pulse">
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.5]" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Payment Verified & Application Logged
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0c2340] tracking-tight">
                Verification Application Submitted Successfully!
              </h2>
              <p className="text-xs sm:text-sm text-[#4e6073]">
                Your statutory equipment stamping request with {calculationSummary.totalUnitsCount} instrument unit(s) has been officially recorded under Section 24 of The Legal Metrology Act, 2009.
              </p>
            </div>

            {/* Replay Soundbox Chime Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={playPaymentSuccessSound}
                className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                title="Play Electronic Payment Soundbox Chime"
              >
                <Volume2 className="w-4 h-4 text-teal-600 animate-bounce" />
                <span>Replay payment confirmation</span>
              </button>
            </div>

            <div className="rounded-2xl border border-[#d8e4f1] bg-white p-4 sm:p-5 text-left">
              <div className="flex items-center justify-between gap-3 border-b border-[#e2e8f0] pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0c2340]">Application Timeline</h3>
                <span className="text-[10px] font-bold text-[#0f766e] bg-[#edf7f6] border border-[#bfe3df] px-2 py-0.5 rounded-full">
                  Current stage
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 text-[11px]">
                {[
                  'Application Submitted',
                  'Payment Verified',
                  'Document Review',
                  'Officer Assigned',
                  'Physical Inspection',
                  'Certificate Issued'
                ].map((step, index) => (
                  <div key={step} className="flex items-start gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                    <span className="w-5 h-5 rounded-full bg-[#0f766e] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-[#0c2340] leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Docket & Transaction Key Highlights Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#eef8f1] border border-[#c6edd0]">
              <div className="text-left bg-white p-3.5 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Official Docket Reference ID
                </span>
                <span className="font-mono font-extrabold text-base text-emerald-800">
                  {submissionPayload.docketId}
                </span>
              </div>

              <div className="text-left bg-white p-3.5 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Razorpay Transaction ID & Status
                </span>
                <span className="font-mono font-extrabold text-sm text-emerald-800 flex items-center justify-between flex-wrap gap-1">
                  <span>{submissionPayload.razorpayPaymentId || submissionPayload.txnId}</span>
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    PAID {submissionPayload.paidFee}
                  </span>
                </span>
              </div>
            </div>

            {/* Itemized Instruments Specifications Table */}
            <div className="text-left rounded-2xl border border-gray-200 bg-gray-50/80 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0c2340] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#16a34a]" />
                  <span>Itemized Instruments Stamping List ({calculationSummary.totalUnitsCount} Units)</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                  {instruments.length} Category Items
                </span>
              </div>

              <div className="divide-y divide-gray-200 text-xs">
                {instruments.map((item, idx) => (
                  <div key={item.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-[#0c2340]">{item.instrumentType}</span>
                        <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-mono font-bold">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 ml-7 space-x-2">
                        <span>{item.manufacturer} {item.model}</span>
                        <span>•</span>
                        <span className="font-mono">SN: {item.serialNumber}</span>
                        <span>•</span>
                        <span>{item.capacity}</span>
                      </div>
                    </div>
                    <div className="text-right sm:shrink-0 ml-7 sm:ml-0">
                      <span className="text-[11px] text-gray-500 block">
                        {item.quantity} × {formatINR(item.unitFee)}
                      </span>
                      <span className="font-mono font-bold text-[#0c2340]">
                        {formatINR(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fee Breakdown Summary */}
              <div className="border-t-2 border-dashed border-gray-300 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Base Statutory Verification Subtotal</span>
                  <span className="font-mono">{formatINR(calculationSummary.baseFeeTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Statutory e-Stamping & Holographic Seal Fee</span>
                  <span className="font-mono">{formatINR(calculationSummary.stampingFeeTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Central GST (CGST 9%) + State GST (SGST 9%)</span>
                  <span className="font-mono">{formatINR(calculationSummary.gstAmount)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-[#0c2340] pt-1 border-t border-gray-200">
                  <span>Grand Total Paid via Razorpay</span>
                  <span className="font-mono text-emerald-700 text-base">{formatINR(calculationSummary.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Premises & Location info */}
            <div className="text-left rounded-2xl border border-gray-200 bg-white p-4 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Physical Inspection Premises & Verification Workflow
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                <div>
                  <span className="font-medium text-gray-500">Address: </span>
                  <span className="font-semibold">{submissionPayload.installationAddress}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">GPS Coordinates: </span>
                  <span className="font-mono font-bold text-emerald-800">{submissionPayload.gpsCoordinates}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Verification Type: </span>
                  <span>{submissionPayload.verificationType}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Inspectorate Cell: </span>
                  <span className="font-semibold text-[#0c2340]">Mumbai Metropolitan Legal Metrology Inspectorate</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#16a34a] text-[#16a34a] hover:bg-[#eef8f1] text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Statutory Challan & Receipt</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Owner Portal</span>
              </button>
            </div>

          </div>

          <p className="text-center text-[11px] text-emerald-800">
            Directorate of Legal Metrology • Department of Consumer Affairs, Government of India
          </p>
        </div>
      </div>
    );
  }

  // STEP 1: PRIMARY APPLICATION FORM VIEW WITH MULTI-INSTRUMENT SUPPORT & REAL-TIME CALCULATION
  const enterpriseName = userSession?.enterpriseName || (userSession?.name ? `${userSession.name} Enterprise` : 'Registered Business Owner');

  return (
    <div className="min-h-screen bg-linear-to-br from-[#eef6f7] via-[#f6f8fb] to-[#e8eef5] flex flex-col justify-start items-center py-6 sm:py-10 px-4 sm:px-6 md:px-8 selection:bg-[#ccfbf1] selection:text-[#134e4a]">
      <div className="max-w-5xl w-full space-y-6">
        
        {/* National Crest & Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <EverimetLogo variant="icon" size="lg" className="p-2.5 bg-white border border-[#d8e4f1] shadow-sm rounded-2xl shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#eef8f1] text-[#15803d] border border-[#c6edd0]">
                  Government of India • Legal Metrology
                </span>
                <span className="text-xs text-[#4e6073] hidden sm:inline">•</span>
                <span className="text-xs text-[#4e6073] font-medium hidden sm:inline">Form LM-V/2026</span>
              </div>
              <h1 className="font-display font-black text-xl sm:text-2xl text-[#0c2340] tracking-tight mt-0.5">
                Apply for Equipment Stamping & Verification
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Verification Form */}
        <form onSubmit={handleOpenRazorpayPayment} className="bg-white rounded-3xl border border-[#cbd5e1] p-5 sm:p-8 shadow-xl shadow-slate-200/60 space-y-8">
          
          {/* Form Header */}
          <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-[#121d26] flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-600" />
                <span>Statutory Verification & Stamping Application</span>
              </h2>
              <p className="text-xs text-[#4e6073] mt-0.5">
                Declare equipment specifications, instrument-wise quantities, premises location, and process statutory payment via Razorpay.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold font-mono">
                {calculationSummary.totalUnitsCount} Total Units
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold font-mono">
                {formatINR(calculationSummary.grandTotal)}
              </span>
            </div>
          </div>

          {/* SECTION 1: INSTRUMENT-WISE ITEMS WITH SEPARATE QUANTITY & STATUTORY FEES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0c2340] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#16a34a]" />
                  <span>1. Equipments & Instruments for Stamping</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Add each instrument category with individual model, serial number, and separate quantity counts.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddInstrument}
                className="px-3 py-1.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Equipment</span>
              </button>
            </div>

            {/* List of Instrument Cards */}
            <div className="space-y-4">
              {instruments.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#d8e4f1] bg-[#fdfdfd] p-4 sm:p-5 relative transition-all hover:border-[#16a34a]/40 hover:shadow-xs space-y-4"
                >
                  {/* Card Header Bar */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#16a34a] text-white text-xs font-black flex items-center justify-center shadow-2xs">
                        {index + 1}
                      </span>
                      <span className="text-xs font-extrabold text-[#0c2340]">
                        Instrument #{index + 1} Specifications
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                        Fee: {formatINR(item.unitFee)} / unit
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicateInstrument(item)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Duplicate this instrument entry"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {instruments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInstrument(item.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove this instrument"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Instrument Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    
                    {/* Instrument Type (6 cols) */}
                    <div className="sm:col-span-5 space-y-1">
                      <label className="block text-xs font-bold text-[#121d26]">
                        Instrument Category / Type *
                      </label>
                      <select
                        value={item.instrumentType}
                        onChange={(e) => handleInstrumentTypeChange(item.id, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#121d26] bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors cursor-pointer"
                      >
                        <option value="">Select equipment type</option>
                        {STATUTORY_INSTRUMENT_CATALOG.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name} ({formatINR(cat.unitFee)} / unit)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Unit Fee (3 cols) */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="block text-xs font-bold text-[#121d26]">
                        Unit Price (INR) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-700">₹</span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unitFee || ''}
                          onChange={(e) => handleUnitFeeChange(item.id, e.target.value)}
                          placeholder="Enter price"
                          required
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#cbd5e1] text-xs font-bold text-[#0f172a] bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Quantity Stepper (3 cols) */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-[#121d26]">
                        Quantity (Units) *
                      </label>
                      <div className="flex items-center border border-[#d8e4f1] rounded-xl bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2.5 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white text-xs font-bold cursor-pointer transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-full text-center text-xs font-bold font-mono text-[#0c2340] border-none focus:outline-none py-1.5"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="px-2.5 py-2 text-gray-600 hover:bg-gray-100 text-xs font-bold cursor-pointer transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Line Subtotal (2 cols) */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-[#121d26]">
                        Statutory Subtotal
                      </label>
                      <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold font-mono text-emerald-800 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-700">Total</span>
                        <span>{formatINR(item.subtotal)}</span>
                      </div>
                    </div>

                    {/* Manufacturer (4 cols) */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="block text-xs font-bold text-[#121d26]">
                        Manufacturer *
                      </label>
                      <input
                        type="text"
                        value={item.manufacturer}
                        onChange={(e) => handleFieldChange(item.id, 'manufacturer', e.target.value)}
                        placeholder="e.g. Mettler Toledo / Essae / Avery"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#121d26] bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors"
                      />
                    </div>

                    {/* Model (4 cols) */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="block text-xs font-bold text-[#121d26]">
                        Model Name / Number *
                      </label>
                      <input
                        type="text"
                        value={item.model}
                        onChange={(e) => handleFieldChange(item.id, 'model', e.target.value)}
                        placeholder="e.g. DS-215 / BC-60"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#121d26] bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors"
                      />
                    </div>

                    {/* Serial Number (4 cols) */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="block text-xs font-bold text-[#121d26]">
                        Serial Number(s) *
                      </label>
                      <input
                        type="text"
                        value={item.serialNumber}
                        onChange={(e) => handleFieldChange(item.id, 'serialNumber', e.target.value)}
                        placeholder="e.g. SN-492041 or SN-01 to SN-05"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-[#d8e4f1] text-xs font-mono font-medium text-[#121d26] bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors"
                      />
                    </div>

                    {/* Max/Min Capacity (6 cols) */}
                    <div className="sm:col-span-6 space-y-1">
                      <label className="block text-xs font-bold text-[#121d26]">
                        Capacity (Max / Min) *
                      </label>
                      <input
                        type="text"
                        value={item.capacity}
                        onChange={(e) => handleFieldChange(item.id, 'capacity', e.target.value)}
                        placeholder="e.g. 150 kg (Max), 500 g (Min)"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#121d26] bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors"
                      />
                    </div>

                    {/* Accuracy Class (6 cols) */}
                    <div className="sm:col-span-6 space-y-1">
                      <label className="block text-xs font-bold text-[#121d26]">
                        Accuracy Class *
                      </label>
                      <select
                        value={item.accuracyClass}
                        onChange={(e) => handleFieldChange(item.id, 'accuracyClass', e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#121d26] bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors cursor-pointer"
                      >
                        <option value="">Select accuracy class</option>
                        <option value="Class I (Special Accuracy - Laboratory)">Class I (Special Accuracy - Laboratory)</option>
                        <option value="Class II (High Accuracy - Precision / Gold)">Class II (High Accuracy - Precision / Gold)</option>
                        <option value="Class III (Medium Accuracy - Commercial / Retail)">Class III (Medium Accuracy - Commercial / Retail)</option>
                        <option value="Class IIII (Ordinary Accuracy - Industrial / Bulk)">Class IIII (Ordinary Accuracy - Industrial / Bulk)</option>
                      </select>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: REAL CALCULATION STATUTORY FEE SUMMARY WIDGET */}
          <div className="rounded-2xl border-2 border-emerald-500/30 bg-linear-to-br from-emerald-50/50 via-green-50/30 to-teal-50/50 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#16a34a]" />
                <h3 className="text-sm font-extrabold text-[#0c2340]">
                  Real Statutory Fee Calculation (Section 24, Legal Metrology Act)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-300 shadow-2xs">
                Live Dynamic Calculation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: Itemized Counts Breakdown */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Equipment Count Breakdown:
                </span>
                <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
                  {instruments.map((it, idx) => (
                    <div key={it.id} className="flex justify-between items-center text-gray-700">
                      <span className="truncate pr-2">
                        {idx + 1}. {it.instrumentType}
                      </span>
                      <span className="font-mono font-semibold shrink-0">
                        {it.quantity} × {formatINR(it.unitFee)} = <span className="font-bold text-[#0c2340]">{formatINR(it.subtotal)}</span>
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-[#0c2340]">
                    <span>Total Units to be Inspected:</span>
                    <span className="font-mono text-emerald-800">{calculationSummary.totalUnitsCount} Units</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Statutory Grand Total Calculation */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Statutory Tax & Gateway Invoice:
                </span>
                <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5 divide-y divide-gray-100">
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-gray-600">Base Statutory Testing Fee</span>
                    <span className="font-mono font-bold text-[#121d26]">{formatINR(calculationSummary.baseFeeTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Official e-Stamping & Hologram Seal Fee</span>
                    <span className="font-mono font-bold text-[#121d26]">{formatINR(calculationSummary.stampingFeeTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Central GST (CGST 9%)</span>
                    <span className="font-mono font-bold text-[#121d26]">{formatINR(calculationSummary.cgst)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">State GST (SGST 9%)</span>
                    <span className="font-mono font-bold text-[#121d26]">{formatINR(calculationSummary.sgst)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 bg-emerald-50 -mx-3 -mb-3 px-3 py-2.5 rounded-b-xl font-extrabold text-[#0c2340]">
                    <span className="text-xs">GRAND TOTAL PAYABLE:</span>
                    <span className="font-mono text-base text-[#15803d]">{formatINR(calculationSummary.grandTotal)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: VERIFICATION TYPE & LOCATION DETAILS */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#0c2340] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#16a34a]" />
                <span>2. Verification Type & Installation Premises</span>
              </h3>
              <p className="text-xs text-gray-500">
                Specify the verification nature and pinpoint the exact physical site for officer on-site inspection.
              </p>
            </div>

            {/* Verification Type */}
            <div className="space-y-1">
              <label htmlFor="verif-process-type" className="block text-xs font-bold text-[#121d26]">
                Verification Type *
              </label>
              <div className="relative">
                <Compass className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16a34a] pointer-events-none" />
                <select
                  id="verif-process-type"
                  value={verificationType}
                  onChange={(e) => setVerificationType(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#121d26] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors appearance-none cursor-pointer"
                >
                  <option value="Initial Verification (First Stamping for New Instrument)">Initial Verification (First Stamping for New Instrument)</option>
                  <option value="Periodic / Annual Stamping Renewal">Periodic / Annual Stamping Renewal</option>
                  <option value="Re-verification Post-Repair / Broken Seal">Re-verification Post-Repair / Broken Seal</option>
                  <option value="Relocation / Re-installation Verification">Relocation / Re-installation Verification</option>
                </select>
              </div>
            </div>

            {/* Installation Address with Map Pinpoint */}
            <div className="space-y-3 p-4 sm:p-5 rounded-xl border border-[#d8e4f1] bg-[#fdfdfd]">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="verif-address" className="block text-xs font-bold text-[#121d26]">
                    Installation Address & Geographic Location *
                  </label>
                  <span className="text-[10px] text-gray-500">
                    Site / premises for on-site inspection
                  </span>
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-[#16a34a] pointer-events-none" />
                  <textarea
                    id="verif-address"
                    rows={2}
                    value={installationAddress}
                    onChange={(e) => setInstallationAddress(e.target.value)}
                    placeholder="Complete physical address of premises, shop, warehouse, or installation site"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e4f1] text-xs font-medium text-[#121d26] bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] transition-colors"
                  />
                </div>
              </div>

              {/* Interactive Map with Pinpoint & Detect GPS */}
              <LocationPickerMap
                initialCoordinates={gpsCoordinates}
                initialAddress={installationAddress}
                onLocationChange={(coords, detectedAddress) => {
                  setGpsCoordinates(coords);
                  if (detectedAddress) {
                    setInstallationAddress(detectedAddress);
                  }
                }}
                showToast={showToast}
              />
            </div>
          </div>

          {/* SECTION 4: PHOTOGRAPH & SUPPORTING DOCUMENTS UPLOAD */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#0c2340] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#16a34a]" />
                <span>3. Equipment Photograph & Supporting Documents</span>
              </h3>
              <p className="text-xs text-gray-500">
                Upload clear manufacturer nameplate photo and purchase invoice or previous verification certificate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Photograph Upload */}
              <div className="p-4 rounded-xl border border-[#d8e4f1] bg-[#fdfdfd] space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#121d26]">
                      Photograph *
                    </label>
                    <span className="text-[10px] text-gray-500">JPG, PNG</span>
                  </div>
                  <p className="text-[11px] text-[#4e6073]">
                    Clear image of the instrument showing manufacturer nameplate and serial number
                  </p>
                </div>

                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {photoPreview ? (
                  <div className="relative p-2 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center gap-3">
                    <img
                      src={photoPreview}
                      alt="Instrument Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-emerald-300 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-emerald-900 truncate">
                        {photoFile?.name || 'scale_inspection_photo.jpg'}
                      </p>
                      <span className="text-[10px] text-emerald-700 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Ready to submit
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-1.5 rounded-lg text-emerald-700 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                      title="Remove Photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-xl bg-white space-y-2 text-center">
                    <Camera className="w-7 h-7 text-[#16a34a]" />
                    <span className="text-[11px] text-gray-500">No photograph selected</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] hover:bg-[#dcfce7] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Supporting Documents Upload */}
              <div className="p-4 rounded-xl border border-[#d8e4f1] bg-[#fdfdfd] space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#121d26]">
                      Supporting Documents *
                    </label>
                    <span className="text-[10px] text-gray-500">PDF, DOC, JPG</span>
                  </div>
                  <p className="text-[11px] text-[#4e6073]">
                    Model approval certificate, purchase invoice, or previous stamping certificate
                  </p>
                </div>

                <input
                  type="file"
                  ref={docInputRef}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleDocSelect}
                  className="hidden"
                />

                {docFileName ? (
                  <div className="relative p-2 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-emerald-900 truncate">
                        {docFileName}
                      </p>
                      <span className="text-[10px] text-emerald-700 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Attached document
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveDoc}
                      className="p-1.5 rounded-lg text-emerald-700 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                      title="Remove Document"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-xl bg-white space-y-2 text-center">
                    <FileUp className="w-7 h-7 text-[#16a34a]" />
                    <span className="text-[11px] text-gray-500">No document attached</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => docInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-[#eef8f1] border border-[#c6edd0] text-[#16a34a] hover:bg-[#dcfce7] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Doc</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* SECTION 5: ACTIONS & RAZORPAY PAYMENT TRIGGER */}
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
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Razorpay Payment ({formatINR(calculationSummary.grandTotal)})</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>

        </form>

        {/* Footer info banner */}
        <p className="text-center text-[11px] text-gray-500 pb-4">
          National Legal Metrology Portal • Directorate of Legal Metrology, Department of Consumer Affairs, Government of India
        </p>
      </div>

      {/* RAZORPAY DEMO PAYMENT MODAL */}
      <RazorpayPaymentModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        onSuccess={handleRazorpaySuccess}
        amount={calculationSummary.grandTotal}
        enterpriseName={enterpriseName}
        applicantName={userSession?.name || 'Authorized Applicant'}
        applicantEmail={userSession?.identifier || 'owner@domain.in'}
        applicantPhone={userSession?.phone || '+91 98201 44892'}
        docketId={pendingDocketId || `APP-2026-IND-${Math.floor(2000 + Math.random() * 7000)}`}
        instrumentsCount={calculationSummary.totalUnitsCount}
        breakdown={{
          baseFee: calculationSummary.baseFeeTotal,
          stampingFee: calculationSummary.stampingFeeTotal,
          gstAmount: calculationSummary.gstAmount,
          total: calculationSummary.grandTotal
        }}
      />

      <LogoutOverlay
        isOpen={isLoggingOut}
        userName={userSession?.name || 'Trader'}
        userRole="Enterprise Owner"
        onComplete={onLogout}
      />
    </div>
  );
};

export default ApplyVerificationPage;
