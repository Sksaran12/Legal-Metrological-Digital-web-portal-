import React from 'react';
import { EverimetLogo } from './EverimetLogo';
import {
  ShieldCheck,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  FileText,
  Lock,
  Award
} from 'lucide-react';

interface FooterProps {
  onOpenHelpdesk?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenHelpdesk }) => {
  return (
    <footer className="w-full bg-[#0c2340] text-gray-300 border-t border-[#1b3a61] mt-auto">
      {/* Top Main Footer */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Official Emblem & Identity */}
          <div className="space-y-4">
            <EverimetLogo variant="brand" size="md" textColor="white" />
            <p className="text-xs text-gray-300 leading-relaxed">
              Official statutory portal of the Directorate of Legal Metrology, Department of Consumer Affairs, Government of India.
            </p>
            <div className="text-[11px] text-gray-400 space-y-1">
              <p className="font-semibold text-white">Krishi Bhawan, New Delhi - 110001</p>
              <p>Operating under The Legal Metrology Act, 2009 (Act No. 1 of 2010)</p>
            </div>
          </div>

          {/* Col 2: Statutory Acts & Framework */}
          <div className="space-y-3 text-xs">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Acts &amp; Regulations
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#act" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>The Legal Metrology Act, 2009</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a href="#rules" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>The Legal Metrology (General) Rules, 2011</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a href="#pcr" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>Packaged Commodities Rules (PCR), 2011</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a href="#model" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>Model Approval Guidelines (RRSL / NPL)</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a href="#oiml" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>OIML R 76-1 International Norms</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Services */}
          <div className="space-y-3 text-xs">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Statutory Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenHelpdesk}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Verify Verification Certificate (Form VII)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenHelpdesk}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Statutory Holographic QR Authenticator
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenHelpdesk}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  National Legal Metrology Helpdesk
                </button>
              </li>
              <li>
                <a href="https://bharatkosh.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>BharatKosh Non-Tax Portal</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>National Consumer Helpline (NCH 1915)</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Statutory Helpdesk & Security */}
          <div className="space-y-3 text-xs">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Regulatory Helpdesk
            </h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1800-11-4000 / 011-23386123</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>dir-lm-ca@nic.in</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Directorate of Legal Metrology, Krishi Bhawan, New Delhi</span>
              </div>
            </div>

            <div className="pt-2 p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ed25519 Cryptographic Trust</span>
              </div>
              <p className="text-[10px] text-gray-400">
                All certificates anchored to National Metrology Root Authority with tamper-proof digital seals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#1b3a61] bg-[#07172b] py-4 text-center text-xs text-gray-400 px-4">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} Directorate of Legal Metrology, Department of Consumer Affairs, Government of India. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Usage</a>
            <span>•</span>
            <a href="#accessibility" className="hover:text-white transition-colors">Accessibility Statement</a>
            <span>•</span>
            <span className="text-emerald-400 font-mono font-bold">e-VeriMet v2.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
