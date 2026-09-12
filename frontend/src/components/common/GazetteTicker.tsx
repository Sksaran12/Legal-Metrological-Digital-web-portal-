import React, { useState, useEffect } from 'react';
import { Bell, ChevronRight, AlertCircle, FileText, ExternalLink } from 'lucide-react';

const NOTICES = [
  {
    tag: 'RULE 24 MANDATE',
    text: 'Mandatory QR holographic sealing and digital stamping enforced for all Commercial Weighing & Measuring Instruments.',
    gazetteRef: 'GSR 76(E)/2024'
  },
  {
    tag: 'DEADLINE EXTENSION',
    text: 'Annual verification renewal window for electronic weighbridges & automated fuel dispensers open through state directorates.',
    gazetteRef: 'Order No. 14/2024-LM'
  },
  {
    tag: 'E-VERIMET INTEGRATION',
    text: 'Direct e-Stamping & BharatKosh fee settlement now active across all 36 States & Union Territories.',
    gazetteRef: 'Sec 24 Legal Metrology Act'
  },
  {
    tag: 'MODEL APPROVAL',
    text: 'New OIML R 76 Class II & III standards applicable for all imported load-cell digital indicators.',
    gazetteRef: 'Notification 88/2024'
  }
];

export const GazetteTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % NOTICES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const activeNotice = NOTICES[currentIndex];

  return (
    <div className="w-full mb-6 rounded-xl bg-white border border-[#d8e4f1] shadow-2xs overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center">
        {/* Ticker Badge */}
        <div className="bg-[#0c2340] text-white px-4 py-2.5 flex items-center gap-2 shrink-0 font-display font-bold text-xs uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Bell className="w-3.5 h-3.5 text-emerald-400" />
          <span>Statutory Gazette</span>
        </div>

        {/* Rolling Message */}
        <div className="flex-1 px-4 py-2.5 flex items-center justify-between text-xs text-[#0b1c30] gap-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#eef8f1] text-[#15803d] border border-[#c6edd0] shrink-0">
              {activeNotice.tag}
            </span>
            <p className="truncate font-medium text-gray-800">
              {activeNotice.text}
            </p>
            <span className="text-[10px] text-gray-500 font-mono shrink-0 hidden lg:inline">
              [{activeNotice.gazetteRef}]
            </span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1 shrink-0">
            {NOTICES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'w-5 bg-[#16a34a]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Notice ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
