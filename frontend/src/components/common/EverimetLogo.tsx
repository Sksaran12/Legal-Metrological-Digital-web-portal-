import React from 'react';

interface EverimetLogoProps {
  className?: string;
  variant?: 'icon' | 'full' | 'brand';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  textColor?: 'dark' | 'white';
}

export const EverimetLogo: React.FC<EverimetLogoProps> = ({
  className = '',
  variant = 'brand',
  size = 'md',
  showSubtitle = true,
  textColor = 'dark'
}) => {
  // Icon dimensions
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { w: 32, h: 32, textClass: 'text-sm', subClass: 'text-[9px]' };
      case 'lg':
        return { w: 56, h: 56, textClass: 'text-xl', subClass: 'text-xs' };
      case 'xl':
        return { w: 84, h: 84, textClass: 'text-2xl sm:text-3xl', subClass: 'text-xs' };
      case 'md':
      default:
        return { w: 42, h: 42, textClass: 'text-base sm:text-lg', subClass: 'text-[10px]' };
    }
  };

  const dim = getDimensions();

  // Emblem Vector Graphic matching official e-VeriMet emblem
  const Emblem = (
    <svg
      viewBox="0 0 500 340"
      className="w-full h-full object-contain"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="logo-shadow" x="-5%" y="-5%" width="115%" height="115%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Central Scale Structure */}
      <g id="scale-structure" fill="#0c2340" stroke="#0c2340">
        {/* Fulcrum Top Circle */}
        <circle cx="250" cy="50" r="15" fill="#ffffff" stroke="#0c2340" strokeWidth="8" />

        {/* Central Pillar */}
        <path d="M 244 64 L 256 64 L 260 160 L 240 160 Z" fill="#0c2340" stroke="none" />

        {/* Scale Horizontal Beam */}
        <path d="M 140 72 L 240 60 L 260 60 L 360 72" fill="none" stroke="#0c2340" strokeWidth="7" strokeLinecap="round" />

        {/* Left Hook Ring */}
        <circle cx="140" cy="73" r="8" fill="#ffffff" stroke="#0c2340" strokeWidth="5" />

        {/* Right Hook Ring */}
        <circle cx="360" cy="73" r="8" fill="#ffffff" stroke="#0c2340" strokeWidth="5" />

        {/* Left Suspension Strings */}
        <line x1="138" y1="80" x2="88" y2="185" stroke="#0c2340" strokeWidth="5" strokeLinecap="round" />
        <line x1="142" y1="80" x2="192" y2="185" stroke="#0c2340" strokeWidth="5" strokeLinecap="round" />

        {/* Right Suspension Strings */}
        <line x1="358" y1="80" x2="308" y2="185" stroke="#0c2340" strokeWidth="5" strokeLinecap="round" />
        <line x1="362" y1="80" x2="412" y2="185" stroke="#0c2340" strokeWidth="5" strokeLinecap="round" />

        {/* Left Scale Pan Bowl */}
        <path d="M 88 185 Q 140 225 192 185 Z" fill="#0c2340" stroke="#0c2340" strokeWidth="2" strokeLinejoin="round" />

        {/* Right Scale Pan Bowl */}
        <path d="M 308 185 Q 360 225 412 185 Z" fill="#0c2340" stroke="#0c2340" strokeWidth="2" strokeLinejoin="round" />
      </g>

      {/* Left Pan Content: Standard Calibration Weight */}
      <g id="standard-weight" fill="#0c2340">
        <path d="M 133 124 Q 140 117 147 124 L 146 131 L 134 131 Z" />
        <rect x="135" y="130" width="10" height="4" />
        <path d="M 130 134 L 150 134 L 158 174 Q 140 176 122 174 Z" />
      </g>

      {/* Right Pan Content: Dial Gauge / Meter */}
      <g id="dial-gauge">
        <circle cx="360" cy="148" r="34" fill="#ffffff" stroke="#0c2340" strokeWidth="5.5" />
        <circle cx="360" cy="153" r="3.5" fill="#0c2340" />
        <line x1="360" y1="153" x2="376" y2="136" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="360" y1="120" x2="360" y2="126" stroke="#0c2340" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="380" y1="128" x2="375" y2="133" stroke="#0c2340" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="388" y1="148" x2="382" y2="148" stroke="#0c2340" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="340" y1="128" x2="345" y2="133" stroke="#0c2340" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="332" y1="148" x2="338" y2="148" stroke="#0c2340" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Central Verification Document */}
      <g id="verification-document" filter="url(#logo-shadow)">
        <path d="M 205 130 L 268 130 L 295 158 L 295 260 L 205 260 Z" fill="#ffffff" stroke="#0c2340" strokeWidth="7" strokeLinejoin="round" />
        <path d="M 268 130 L 268 158 L 295 158" fill="#ffffff" stroke="#0c2340" strokeWidth="6" strokeLinejoin="round" />

        {/* 3 Green Checkmarks & Test Lines */}
        <path d="M 218 175 L 224 181 L 234 170" fill="none" stroke="#16a34a" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="244" y1="175" x2="278" y2="175" stroke="#0c2340" strokeWidth="5" strokeLinecap="round" />

        <path d="M 218 202 L 224 208 L 234 197" fill="none" stroke="#16a34a" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="244" y1="202" x2="278" y2="202" stroke="#0c2340" strokeWidth="5" strokeLinecap="round" />

        <path d="M 218 229 L 224 235 L 234 224" fill="none" stroke="#16a34a" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="244" y1="229" x2="265" y2="229" stroke="#0c2340" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Security Verification Shield at bottom-right */}
      <g id="verification-shield" filter="url(#logo-shadow)">
        <path d="M 276 215 L 302 210 L 328 215 C 328 250 302 272 302 280 C 302 272 276 250 276 215 Z" fill="#16a34a" stroke="#15803d" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M 288 242 L 298 252 L 316 232" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div
        className={`relative shrink-0 flex items-center justify-center p-1 rounded-xl bg-white border border-[#d8e4f1] shadow-2xs ${className}`}
        style={{ width: `${dim.w}px`, height: `${dim.h}px` }}
      >
        {Emblem}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div style={{ width: `${dim.w * 1.6}px`, height: `${dim.h * 1.2}px` }} className="mb-2 shrink-0">
          {Emblem}
        </div>
        <div className={`font-display font-extrabold tracking-tight uppercase ${textColor === 'white' ? 'text-white' : 'text-[#0c2340]'}`} style={{ fontSize: '18px' }}>
          Legal Metrology
        </div>
        <div className="flex items-center gap-1.5 my-0.5 text-xs font-bold text-[#16a34a] tracking-wider uppercase">
          <span className="h-0.5 w-6 bg-[#16a34a] rounded-full inline-block" />
          <span>Verification &amp; Certification</span>
          <span className="h-0.5 w-6 bg-[#16a34a] rounded-full inline-block" />
        </div>
        <div className={`text-[10px] tracking-widest font-semibold uppercase ${textColor === 'white' ? 'text-gray-300' : 'text-[#0c2340]/80'}`}>
          Accurate • Trusted • Compliant
        </div>
      </div>
    );
  }

  // Variant 'brand' (Emblem on left + e-VeriMet & Legal Metrology on right)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative shrink-0 flex items-center justify-center p-1.5 rounded-xl bg-white border border-[#d8e4f1] shadow-2xs hover:border-[#16a34a]/60 transition-colors"
        style={{ width: `${dim.w + 6}px`, height: `${dim.h + 6}px` }}
      >
        {Emblem}
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-display font-extrabold tracking-tight leading-tight ${dim.textClass} ${textColor === 'white' ? 'text-white' : 'text-[#0c2340]'}`}>
            <span className="text-[#16a34a]">e</span>-VeriMet
          </span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
            textColor === 'white'
              ? 'bg-[#16a34a]/20 border border-[#16a34a]/40 text-emerald-300'
              : 'bg-[#eef8f1] border border-[#c6edd0] text-[#15803d]'
          }`}>
            Portal
          </span>
        </div>

        {showSubtitle && (
          <p className={`font-medium leading-none mt-1 truncate ${dim.subClass} ${textColor === 'white' ? 'text-gray-300' : 'text-gray-500'}`}>
            Legal Metrology Verification &amp; Certification
          </p>
        )}
      </div>
    </div>
  );
};
