import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Landmark,
  Building2,
  CheckCircle2,
  Loader2,
  Lock,
  ChevronRight,
  ArrowLeft,
  Smartphone,
  Check,
  Sparkles,
  Volume2,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

export interface RazorpayPaymentDetails {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  paymentMethod: string;
  paidAmount: number;
  paidFeeFormatted: string;
  timestamp: string;
  bankName?: string;
  upiId?: string;
}

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentDetails: RazorpayPaymentDetails) => void;
  amount: number;
  enterpriseName: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  docketId: string;
  instrumentsCount: number;
  breakdown: {
    baseFee: number;
    stampingFee: number;
    gstAmount: number;
    total: number;
  };
}

const allowDemoPayments = import.meta.env.VITE_ALLOW_DEMO_PAYMENTS === 'true';

// Synthesize pleasant, crisp electronic payment success soundbox chime using Web Audio API
export const playPaymentSuccessSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // 4-note melodic ascending chime: D5 (587.33Hz) -> F#5 (739.99Hz) -> A5 (880Hz) -> D6 (1174.66Hz)
    const chords = [
      { freq: 587.33, start: 0.0, duration: 0.12, gain: 0.28 },
      { freq: 739.99, start: 0.1, duration: 0.14, gain: 0.32 },
      { freq: 880.0, start: 0.22, duration: 0.18, gain: 0.35 },
      { freq: 1174.66, start: 0.36, duration: 0.55, gain: 0.42 }
    ];

    chords.forEach(({ freq, start, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gainNode.gain.setValueAtTime(0, ctx.currentTime + start);
      gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    });

    // Secondary harmonic shimmer for warmth (Paytm Soundbox / POS Terminal resonance)
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(1174.66 * 1.5, ctx.currentTime + 0.36);
    shimmerGain.gain.setValueAtTime(0, ctx.currentTime + 0.36);
    shimmerGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.38);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.36 + 0.45);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmer.start(ctx.currentTime + 0.36);
    shimmer.stop(ctx.currentTime + 0.36 + 0.45);
  } catch (err) {
    console.warn('AudioContext playback error:', err);
  }
};

export const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  enterpriseName,
  applicantName,
  applicantEmail,
  applicantPhone,
  docketId,
  instrumentsCount,
  breakdown
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [processingMessage, setProcessingMessage] = useState('Connecting to Bank Secure Gateway...');

  // Form states
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(applicantName || 'Authorized Signatory');
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Dynamic order details
  const [orderId, setOrderId] = useState('');
  const [timeLeft, setTimeLeft] = useState(899); // 14:59 timer

  useEffect(() => {
    if (isOpen) {
      setOrderId(allowDemoPayments ? `order_LMP_${Math.floor(100000 + Math.random() * 900000)}` : '');
      setPaymentStatus('idle');
      setTimeLeft(899);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || paymentStatus !== 'idle') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, paymentStatus]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedAmount = `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const executePayment = (method: string) => {
    if (!allowDemoPayments) {
      setProcessingMessage('Live Razorpay checkout is not configured for this environment.');
      setPaymentStatus('idle');
      return;
    }

    setPaymentStatus('processing');
    setProcessingMessage('Contacting National Electronic Metrology Payment Gateway...');

    setTimeout(() => {
      setProcessingMessage('Securing 3D-Secure 2.0 / UPI Two-Factor Authorization...');
    }, 800);

    setTimeout(() => {
      setProcessingMessage(`Capturing ${formattedAmount} into Directorate Treasury Account...`);
    }, 1600);

    setTimeout(() => {
      // Trigger authentic sound effect!
      playPaymentSuccessSound();

      setPaymentStatus('success');

      const paymentId = `pay_Rzp${Math.floor(100000000 + Math.random() * 900000000)}`;
      const paymentDetails: RazorpayPaymentDetails = {
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        paymentMethod: method,
        paidAmount: amount,
        paidFeeFormatted: formattedAmount,
        timestamp: new Date().toISOString(),
        bankName: method === 'netbanking' ? selectedBank : undefined,
        upiId: method === 'upi' ? upiId : undefined
      };

      // Notify parent after brief celebratory screen
      setTimeout(() => {
        onSuccess(paymentDetails);
      }, 1500);
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#c7d7e8] flex flex-col max-h-[92vh]">
        
        {/* Top Razorpay Identity Header */}
        <div className="bg-[#0c2340] text-white px-5 py-4 flex items-center justify-between border-b border-[#1b3a5c]">
          <div className="flex items-center gap-3">
            {/* Razorpay Brand Icon */}
            <div className="w-9 h-9 rounded-xl bg-[#0066ff] flex items-center justify-center shadow-md">
              <span className="font-extrabold text-lg text-white italic tracking-tighter">R</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
                  Razorpay <span className="text-[#38bdf8] font-semibold text-xs">Checkout</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#16a34a]/30 text-[#86efac] border border-[#16a34a]/40 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  TRUSTED BUSINESS
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate max-w-[240px] sm:max-w-xs">
                Directorate of Legal Metrology • Section 24 Stamping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {paymentStatus === 'idle' && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Cancel Transaction"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Amount Banner */}
        <div className="bg-[#08182b] text-white px-5 py-3 flex items-center justify-between border-b border-[#172c44]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Grand Total Payable
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-white font-mono">
                {formattedAmount}
              </span>
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="text-[11px] font-semibold text-[#38bdf8] hover:underline cursor-pointer"
              >
                {showBreakdown ? 'Hide Fee Breakdown ▲' : 'View Fee Breakdown ▼'}
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">
              Order: {orderId}
            </span>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center justify-end gap-1">
              <Clock className="w-3 h-3" />
              {formatTimer(timeLeft)} remaining
            </span>
          </div>
        </div>

        {/* Collapsible Fee Breakdown Drawer */}
        {showBreakdown && (
          <div className="bg-[#0b2038] text-slate-200 px-5 py-3 text-xs space-y-1.5 border-b border-[#172c44] animate-in slide-in-from-top-1 duration-150">
            <div className="flex justify-between text-slate-300">
              <span>1. Base Verification Fee ({instrumentsCount} instrument{instrumentsCount > 1 ? 's' : ''}):</span>
              <span className="font-mono font-bold text-white">₹{breakdown.baseFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>2. Statutory e-Stamping &amp; Holographic Seal:</span>
              <span className="font-mono font-bold text-white">₹{breakdown.stampingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>3. Central GST (9%) + State GST (9%) [18%]:</span>
              <span className="font-mono font-bold text-white">₹{breakdown.gstAmount.toFixed(2)}</span>
            </div>
            <div className="pt-1.5 mt-1 border-t border-slate-600 flex justify-between font-bold text-white">
              <span>Total Statutory Remittance:</span>
              <span className="font-mono text-emerald-400">{formattedAmount}</span>
            </div>
          </div>
        )}

        {/* Applicant Summary Bar */}
        <div className="bg-[#f1f5f9] px-5 py-2.5 border-b border-[#e2e8f0] flex items-center justify-between text-xs text-[#0c2340]">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-3.5 h-3.5 text-[#0066ff] shrink-0" />
            <span className="font-bold truncate">{enterpriseName}</span>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <span className="text-gray-600 hidden sm:inline truncate">{applicantEmail}</span>
          </div>
          <span className="text-[10px] font-bold text-[#0c2340] shrink-0 px-2 py-0.5 rounded bg-white border border-[#cbd5e1]">
            Docket: {docketId}
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {paymentStatus === 'idle' && (
            <div className="space-y-4">
              {!allowDemoPayments && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
                  Live Razorpay checkout is not configured. This screen cannot process or confirm a real payment.
                </div>
              )}
               
              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'upi'
                      ? 'bg-[#eff6ff] border-[#0066ff] text-[#0066ff] ring-2 ring-[#0066ff]/20 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span>UPI / QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'card'
                      ? 'bg-[#eff6ff] border-[#0066ff] text-[#0066ff] ring-2 ring-[#0066ff]/20 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Debit / Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('netbanking')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'netbanking'
                      ? 'bg-[#eff6ff] border-[#0066ff] text-[#0066ff] ring-2 ring-[#0066ff]/20 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Landmark className="w-5 h-5" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* TAB 1: UPI / QR CODE */}
              {activeTab === 'upi' && (
                <div className="p-4 rounded-xl border border-[#cbd5e1] bg-slate-50/70 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1.5 text-center sm:text-left">
                      <span className="text-xs font-bold text-[#0c2340] block">
                        Scan QR code using any UPI App
                      </span>
                      <p className="text-[11px] text-gray-500">
                        Supports Google Pay, PhonePe, Paytm, BHIM, CRED &amp; all banking apps.
                      </p>
                      <div className="pt-1 flex items-center justify-center sm:justify-start gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                          0% Gateway Convenience Fee
                        </span>
                      </div>
                    </div>

                    {/* Interactive QR Code Simulator */}
                    <div className="p-2.5 bg-white rounded-2xl border-2 border-[#0066ff] shadow-md flex flex-col items-center shrink-0">
                      <div
                        className="w-28 h-28 bg-[#0c2340] rounded-xl flex items-center justify-center text-white relative group cursor-pointer"
                        onClick={() => executePayment('upi')}
                        title={allowDemoPayments ? 'Click QR to run the configured demo payment' : 'Live Razorpay checkout is not configured'}
                      >
                        <QrCode className="w-20 h-20 text-white" />
                        <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity text-center p-1">
                          {allowDemoPayments ? 'Click to Demo Pay' : 'Live payment unavailable'}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-gray-500 mt-1">
                        everimet.statutory@rzp
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 space-y-2">
                    <label className="block text-xs font-bold text-[#0c2340]">
                      Or Enter UPI ID / VPA
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. yourname@okhdfcbank"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-[#0c2340] bg-white focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
                      />
                      <button
                        type="button"
                        onClick={() => executePayment('upi')}
                        className="px-4 py-2 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Verify &amp; Pay
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Fast App Chips */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[10px] font-bold text-gray-500">Quick Pay:</span>
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => executePayment(`upi_${app.toLowerCase().replace(' ', '')}`)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:border-[#0066ff] text-[11px] font-semibold text-[#0c2340] hover:bg-[#eff6ff] transition-colors cursor-pointer shadow-2xs"
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD */}
              {activeTab === 'card' && (
                <div className="p-4 rounded-xl border border-[#cbd5e1] bg-slate-50/70 space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0c2340]">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full pl-3 pr-20 py-2.5 rounded-xl border border-gray-300 text-xs font-mono font-medium text-[#0c2340] bg-white focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-blue-100 text-[#0066ff] text-[10px] font-extrabold">
                        VISA / RuPay
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#0c2340]">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-medium text-[#0c2340] bg-white focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#0c2340] flex items-center justify-between">
                        <span>CVV</span>
                        <span className="text-[10px] font-normal text-gray-500">3 digits</span>
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength={3}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-medium text-[#0c2340] bg-white focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0c2340]">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-[#0c2340] bg-white focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" id="save-card-chk" defaultChecked className="rounded text-[#0066ff]" />
                    <label htmlFor="save-card-chk" className="text-[11px] text-gray-600 cursor-pointer">
                      Save this card securely as per RBI Tokenization Framework
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 3: NETBANKING */}
              {activeTab === 'netbanking' && (
                <div className="p-4 rounded-xl border border-[#cbd5e1] bg-slate-50/70 space-y-3">
                  <span className="text-xs font-bold text-[#0c2340] block">
                    Popular Commercial &amp; Treasury Banks
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'State Bank of India (SBI)',
                      'HDFC Bank',
                      'ICICI Bank',
                      'Axis Bank',
                      'Punjab National Bank',
                      'Bank of Baroda'
                    ].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                          selectedBank === bank
                            ? 'bg-[#eff6ff] border-[#0066ff] text-[#0066ff] font-bold shadow-2xs'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Landmark className="w-3.5 h-3.5 mb-1 text-slate-500" />
                        <span className="block truncate">{bank}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-[#0c2340] mb-1">
                      Or Select from All Indian Scheduled Banks
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-[#0c2340] bg-white"
                    >
                      <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Union Bank of India">Union Bank of India</option>
                      <option value="Canara Bank">Canara Bank</option>
                      <option value="IDBI Bank">IDBI Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Action Buttons Toolbar */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                {allowDemoPayments && (
                  <button
                    type="button"
                    onClick={() => executePayment('demo_fast_pay')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    title="Simulate 1-click demo payment approval"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>1-Click Demo Pay</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => executePayment(activeTab)}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] active:scale-[0.98] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay {formattedAmount}</span>
                </button>
              </div>

              {/* Security Badges Footer */}
              <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  PCI-DSS Level 1 Compliant
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  256-bit Bank Grade SSL
                </span>
              </div>
            </div>
          )}

          {/* STATE 2: PROCESSING ANIMATION */}
          {paymentStatus === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-200">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-[#0066ff] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-[#0066ff] font-bold">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-[#0c2340]">
                  Processing Razorpay Payment...
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {processingMessage}
                </p>
              </div>

              <span className="inline-block text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-semibold">
                Please do not press back or refresh the window
              </span>
            </div>
          )}

          {/* STATE 3: PAYMENT DONE & CELEBRATION CHIME */}
          {paymentStatus === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-300">
              
              {/* Big Animated Green Checkmark */}
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-400 text-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
                <Check className="w-12 h-12 stroke-[3]" />
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                  Payment Received • Official Chime Played!
                </span>
                <h3 className="font-display font-extrabold text-2xl text-[#0c2340] tracking-tight">
                  Payment Successful!
                </h3>
                <p className="font-mono text-lg font-extrabold text-emerald-700">
                  {formattedAmount} Paid
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-gray-600 max-w-sm w-full font-mono space-y-1 text-left">
                <div className="flex justify-between">
                  <span>Razorpay Payment ID:</span>
                  <span className="font-bold text-[#0c2340]">pay_Rzp{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Reference:</span>
                  <span className="font-bold text-[#0c2340]">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction Status:</span>
                  <span className="font-bold text-emerald-700">CAPTURED (SUCCESS)</span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Finalizing statutory verification docket and generating receipt...
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};