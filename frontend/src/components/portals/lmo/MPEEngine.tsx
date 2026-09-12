import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Wrench,
  Sparkles,
  ShieldCheck,
  Scale,
  Activity,
  Calculator,
  Zap,
  Info,
  Check
} from 'lucide-react';

export interface MPEResult {
  isPass: boolean;
  e: number;
  maxCapacity: number;
  testLoad: number;
  observedError: number;
  accuracyClass: string;
  verificationType: 'initial' | 'in_service';
  mpeFactor: number;
  calculatedMPE: number;
  threshold500e: number;
  threshold2000e: number;
  loadIntervals: number;
  zoneDescription: string;
}

interface MPEEngineProps {
  initialE?: number;
  initialMax?: number;
  initialTestLoad?: number;
  initialObservedError?: number;
  initialAccuracyClass?: string;
  initialVerificationType?: 'initial' | 'in_service';
  onResultChange?: (result: MPEResult) => void;
}

export const MPEEngine: React.FC<MPEEngineProps> = ({
  initialE = 0.5,
  initialMax = 500,
  initialTestLoad = 100,
  initialObservedError = 0.2,
  initialAccuracyClass = 'Class III',
  initialVerificationType = 'initial',
  onResultChange
}) => {
  // Engine Parameters
  const [e, setE] = useState<number>(initialE);
  const [maxCapacity, setMaxCapacity] = useState<number>(initialMax);
  const [testLoad, setTestLoad] = useState<number>(initialTestLoad);
  const [observedError, setObservedError] = useState<number>(initialObservedError);
  const [accuracyClass, setAccuracyClass] = useState<string>(initialAccuracyClass);
  const [verificationType, setVerificationType] = useState<'initial' | 'in_service'>(initialVerificationType);

  // Sync external props changes
  useEffect(() => { setE(initialE); }, [initialE]);
  useEffect(() => { setMaxCapacity(initialMax); }, [initialMax]);
  useEffect(() => { setTestLoad(initialTestLoad); }, [initialTestLoad]);
  useEffect(() => { setObservedError(initialObservedError); }, [initialObservedError]);

  // Exact OIML R 76-1 / Statutory Legal Metrology Computation
  const calculationResult: MPEResult = useMemo(() => {
    const validE = e > 0 ? e : 0.001;
    const threshold500e = 500 * validE;
    const threshold2000e = 2000 * validE;
    const loadIntervals = testLoad / validE;

    let baseFactor = 0.5;
    let zoneDesc = `0 ≤ m ≤ 500e (≤ ${threshold500e.toFixed(2)} kg)`;

    if (accuracyClass === 'Class III' || accuracyClass === 'Class IIII') {
      if (testLoad <= threshold500e) {
        baseFactor = 0.5;
        zoneDesc = `0 ≤ m ≤ 500e (${testLoad} kg ≤ ${threshold500e.toFixed(2)} kg)`;
      } else if (testLoad <= threshold2000e) {
        baseFactor = 1.0;
        zoneDesc = `500e < m ≤ 2000e (${threshold500e.toFixed(2)} kg < ${testLoad} kg ≤ ${threshold2000e.toFixed(2)} kg)`;
      } else {
        baseFactor = 1.5;
        zoneDesc = `m > 2000e (${testLoad} kg > ${threshold2000e.toFixed(2)} kg)`;
      }
    } else if (accuracyClass === 'Class II') {
      if (loadIntervals <= 5000) {
        baseFactor = 0.5;
        zoneDesc = `0 ≤ m ≤ 5,000e`;
      } else if (loadIntervals <= 20000) {
        baseFactor = 1.0;
        zoneDesc = `5,000e < m ≤ 20,000e`;
      } else {
        baseFactor = 1.5;
        zoneDesc = `20,000e < m ≤ 100,000e`;
      }
    } else {
      // Class I Special Precision
      if (loadIntervals <= 50000) {
        baseFactor = 0.5;
        zoneDesc = `0 ≤ m ≤ 50,000e`;
      } else if (loadIntervals <= 200000) {
        baseFactor = 1.0;
        zoneDesc = `50,000e < m ≤ 200,000e`;
      } else {
        baseFactor = 1.5;
        zoneDesc = `m > 200,000e`;
      }
    }

    const multiplier = verificationType === 'in_service' ? 2.0 : 1.0;
    const finalFactor = baseFactor * multiplier;
    const calculatedMPE = parseFloat((finalFactor * validE).toFixed(4));
    const absError = Math.abs(observedError);
    const isPass = absError <= calculatedMPE + 0.00001;

    return {
      isPass,
      e: validE,
      maxCapacity,
      testLoad,
      observedError,
      accuracyClass,
      verificationType,
      mpeFactor: finalFactor,
      calculatedMPE,
      threshold500e,
      threshold2000e,
      loadIntervals,
      zoneDescription: zoneDesc
    };
  }, [e, maxCapacity, testLoad, observedError, accuracyClass, verificationType]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(calculationResult);
    }
  }, [calculationResult, onResultChange]);

  const totalScaleDivisions = Math.round((maxCapacity || 500) / (e || 0.5));
  const errorPercentage = calculationResult.calculatedMPE > 0
    ? Math.min(100, (Math.abs(observedError) / calculationResult.calculatedMPE) * 100)
    : 0;

  return (
    <div className="bg-white rounded-3xl border-2 border-[#c6edd0] p-6 shadow-sm space-y-6">
      {/* Redesigned Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#16a34a] to-[#114b30] text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-[#eef8f1] text-[#15803d] border border-[#c6edd0]">
                OIML R 76-1 / Statutory Engine
              </span>
              <span className="text-[10px] font-mono font-bold text-gray-500">
                n = {totalScaleDivisions.toLocaleString()} divisions
              </span>
            </div>
            <h3 className="font-display font-extrabold text-xl text-[#0c2340] tracking-tight mt-0.5">
              Maximum Permissible Error (MPE) Engine
            </h3>
          </div>
        </div>

        {/* Status Indicator Pill */}
        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 shadow-2xs shrink-0 ${
          calculationResult.isPass
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
        }`}>
          {calculationResult.isPass ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600" />
          )}
          <div className="text-left">
            <div className="text-xs font-black uppercase tracking-wider">
              {calculationResult.isPass ? 'PASS (Stamping Permitted)' : 'FAIL (Cert Blocked)'}
            </div>
            <div className="text-[10px] font-mono">
              |E_obs| {calculationResult.isPass ? '≤' : '>'} MPE ({calculationResult.calculatedMPE} kg)
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned 4-Step Interactive Calculation Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 bg-[#f8fafc] rounded-2xl border border-gray-200 space-y-1">
          <span className="text-[10px] font-sans font-bold text-[#4e6073] uppercase block">1. Scale Interval (n)</span>
          <div className="font-black text-sm text-[#0c2340]">Max / e = {maxCapacity} / {e}</div>
          <span className="text-[10px] font-sans text-gray-500 block">n = {totalScaleDivisions} divisions</span>
        </div>

        <div className="p-3.5 bg-[#f8fafc] rounded-2xl border border-gray-200 space-y-1">
          <span className="text-[10px] font-sans font-bold text-[#4e6073] uppercase block">2. Zone &amp; MPE Factor</span>
          <div className="font-black text-sm text-[#15803d]">±{calculationResult.mpeFactor} × e</div>
          <span className="text-[10px] font-sans text-gray-500 block truncate" title={calculationResult.zoneDescription}>
            {calculationResult.zoneDescription}
          </span>
        </div>

        <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
          <span className="text-[10px] font-sans font-bold text-emerald-800 uppercase block">3. Statutory MPE Limit</span>
          <div className="font-black text-base text-emerald-700">±{calculationResult.calculatedMPE} kg</div>
          <span className="text-[10px] font-sans text-emerald-800 block">
            {verificationType === 'in_service' ? '2× In-Service Allowance' : '1× Initial Stamping'}
          </span>
        </div>

        <div className={`p-3.5 rounded-2xl border space-y-1 ${
          calculationResult.isPass ? 'bg-emerald-100/60 border-emerald-300 text-emerald-900' : 'bg-rose-100/60 border-rose-300 text-rose-900'
        }`}>
          <span className="text-[10px] font-sans font-bold uppercase block">4. Tolerance Gate</span>
          <div className="font-black text-sm">
            {Math.abs(observedError)} kg {calculationResult.isPass ? '≤' : '>'} {calculationResult.calculatedMPE} kg
          </div>
          <span className="text-[10px] font-sans font-bold block">
            {calculationResult.isPass ? '✓ Tolerance Compliant' : '✕ Exceeds Statutory Limit'}
          </span>
        </div>
      </div>

      {/* Visual Tolerance Bar Gauge */}
      <div className="p-4 bg-[#fafbfc] rounded-2xl border border-gray-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#0c2340] flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#16a34a]" />
            Error Exposure Tolerance Bar
          </span>
          <span className="font-mono text-xs font-bold text-gray-700">
            {errorPercentage.toFixed(1)}% of allowable MPE
          </span>
        </div>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 ${
              calculationResult.isPass ? 'bg-emerald-500' : 'bg-rose-600'
            }`}
            style={{ width: `${Math.min(100, errorPercentage)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-gray-500">
          <span>0.00 kg (Perfect Zero)</span>
          <span>Statutory MPE Limit: ±{calculationResult.calculatedMPE} kg</span>
        </div>
      </div>

      {/* Input Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-[#4e6073] block">Scale Interval (e)</label>
          <input
            type="number"
            step="0.01"
            value={e}
            onChange={(evt) => setE(parseFloat(evt.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs font-bold text-[#0c2340] focus:ring-2 focus:ring-[#16a34a]/30 outline-none"
          />
        </div>

        <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-[#4e6073] block">Max Capacity (Max)</label>
          <input
            type="number"
            step="1"
            value={maxCapacity}
            onChange={(evt) => setMaxCapacity(parseFloat(evt.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs font-bold text-[#0c2340] focus:ring-2 focus:ring-[#16a34a]/30 outline-none"
          />
        </div>

        <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-[#4e6073] block">Applied Test Load</label>
          <input
            type="number"
            step="0.1"
            value={testLoad}
            onChange={(evt) => setTestLoad(parseFloat(evt.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs font-bold text-[#0c2340] focus:ring-2 focus:ring-[#16a34a]/30 outline-none"
          />
        </div>

        <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-[#4e6073] block">Observed Error (E)</label>
          <input
            type="number"
            step="0.01"
            value={observedError}
            onChange={(evt) => setObservedError(parseFloat(evt.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs font-bold text-[#0c2340] focus:ring-2 focus:ring-[#16a34a]/30 outline-none"
          />
        </div>

        <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-[#4e6073] block">Accuracy Class</label>
          <select
            value={accuracyClass}
            onChange={(evt) => setAccuracyClass(evt.target.value)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-[#0c2340] outline-none cursor-pointer"
          >
            <option value="Class III">Class III (Commercial)</option>
            <option value="Class II">Class II (High Precision)</option>
            <option value="Class I">Class I (Special Precision)</option>
            <option value="Class IIII">Class IIII (Ordinary)</option>
          </select>
        </div>

        <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-[#4e6073] block">Verification Type</label>
          <select
            value={verificationType}
            onChange={(evt) => setVerificationType(evt.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-[#0c2340] outline-none cursor-pointer"
          >
            <option value="initial">Initial (1× MPE)</option>
            <option value="in_service">In-Service (2× MPE)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
