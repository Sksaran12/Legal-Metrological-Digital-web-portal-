import React from 'react';
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  FileSpreadsheet,
  Layers,
  Wrench,
  Award
} from 'lucide-react';

export const VerificationProcessScreen: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="rounded-2xl bg-[#0c2340] text-white p-8 sm:p-10 border border-[#1b3a61] shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold border border-white/15">
            <Scale className="w-3.5 h-3.5" />
            <span>Statutory Metrological Protocol</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Verification &amp; Stamping Process Guide
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Technical inspection procedures, Maximum Permissible Error (MPE) tolerances, and security sealing protocols under The Legal Metrology General Rules, 2011.
          </p>
        </div>
      </div>

      {/* Technical Protocol Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* MPE Table */}
          <div className="rounded-2xl bg-white border border-[#d8e4f1] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-display font-extrabold text-base text-[#0c2340]">
                  Maximum Permissible Error (MPE) Under OIML R 76
                </h3>
                <p className="text-xs text-gray-500">Permissible delta between standard test load and indicated weight</p>
              </div>
              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-[#eef8f1] text-[#15803d]">
                Rule 16 Table
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-bold bg-[#f8f9ff]">
                    <th className="p-2.5">Load Range (in terms of e)</th>
                    <th className="p-2.5">Initial Verification MPE</th>
                    <th className="p-2.5">In-Service Inspection MPE</th>
                    <th className="p-2.5">Commercial Application</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  <tr>
                    <td className="p-2.5">0 ≤ m ≤ 500 e</td>
                    <td className="p-2.5 text-emerald-700 font-bold">± 0.5 e</td>
                    <td className="p-2.5 text-gray-700">± 1.0 e</td>
                    <td className="p-2.5 font-sans text-gray-600">Jewellery / High Precision (Class I/II)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">500 e &lt; m ≤ 2000 e</td>
                    <td className="p-2.5 text-emerald-700 font-bold">± 1.0 e</td>
                    <td className="p-2.5 text-gray-700">± 2.0 e</td>
                    <td className="p-2.5 font-sans text-gray-600">Grocery / Counter Scales (Class III)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">2000 e &lt; m ≤ 10000 e</td>
                    <td className="p-2.5 text-emerald-700 font-bold">± 1.5 e</td>
                    <td className="p-2.5 text-gray-700">± 3.0 e</td>
                    <td className="p-2.5 font-sans text-gray-600">Industrial Weighbridges / Tankers</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Test Procedures */}
          <div className="rounded-2xl bg-white border border-[#d8e4f1] p-6 shadow-2xs space-y-4">
            <h3 className="font-display font-extrabold text-base text-[#0c2340]">
              Mandatory Statutory Test Regimen
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-gray-200 space-y-1">
                <div className="font-bold text-[#0c2340] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Eccentricity (Corner Load) Test</span>
                </div>
                <p className="text-gray-600">
                  Applied at 1/3 maximum capacity on the 4 corners of platform to verify quadrant load sensor linearity.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-gray-200 space-y-1">
                <div className="font-bold text-[#0c2340] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Repeatability Test</span>
                </div>
                <p className="text-gray-600">
                  3 consecutive test load applications at 50% and 100% capacity; max deviation must not exceed MPE.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-gray-200 space-y-1">
                <div className="font-bold text-[#0c2340] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero-Setting &amp; Tare Range</span>
                </div>
                <p className="text-gray-600">
                  Verifies automatic zero-tracking device operates within ±0.25 e and semi-automatic tare operates correctly.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-gray-200 space-y-1">
                <div className="font-bold text-[#0c2340] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tamper-Proof Holographic Sealing</span>
                </div>
                <p className="text-gray-600">
                  Affixing security wire seal with unique serial code preventing access to calibration jumper/potentiometer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Infractions */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertOctagon className="w-5 h-5 text-amber-600" />
              <span>Statutory Penalties for Violations</span>
            </div>
            <div className="text-xs text-amber-950 space-y-3">
              <div>
                <span className="font-bold block">Section 30: Non-Verification</span>
                <p className="text-gray-700 mt-0.5">Fine up to ₹25,000 for using unverified weight or measure; second offence includes imprisonment up to 1 year.</p>
              </div>
              <div>
                <span className="font-bold block">Section 26: Altering or Tampering</span>
                <p className="text-gray-700 mt-0.5">Fine up to ₹50,000 or imprisonment for tampering with official holographic wire seals or calibration firmware.</p>
              </div>
              <div>
                <span className="font-bold block">Section 36: Short Delivery</span>
                <p className="text-gray-700 mt-0.5">Delivering less weight or measure than contracted constitutes a cognizable statutory offence.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#d8e4f1] p-6 space-y-3 shadow-2xs">
            <h4 className="font-display font-bold text-sm text-[#0c2340]">Official Stamping Marks</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center justify-between p-2 rounded bg-[#f8f9ff]">
                <span>State Identification Code:</span>
                <span className="font-mono font-bold text-[#0c2340]">MH / DL / KA / GJ</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#f8f9ff]">
                <span>Officer Identification:</span>
                <span className="font-mono font-bold text-[#0c2340]">LM-2041</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#f8f9ff]">
                <span>Quarter of Stamping:</span>
                <span className="font-mono font-bold text-[#0c2340]">A / B / C / D (2025)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
