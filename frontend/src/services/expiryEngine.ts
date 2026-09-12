/**
 * Expiry Engine & Legal Metrology Certificate Database Store
 * Implements statutory temporal mappings from the blueprint:
 * - 12 months / 30 days for electronic scales and weighbridges
 * - 24 months / 45 days for certain weights and measures
 * - 60 months / 90 days for storage tanks
 *
 * Database storage fields:
 * • verificationDate
 * • validityPeriod
 * • expiryDate
 * • status
 */

export type InstrumentCategory =
  | 'electronic_scales_weighbridges'
  | 'weights_and_measures'
  | 'storage_tanks';

export interface CategoryTemporalRule {
  id: InstrumentCategory;
  label: string;
  validityMonths: number;
  warningThresholdDays: number;
  description: string;
  statutoryRuleRef: string;
}

export const TEMPORAL_MAPPINGS: Record<InstrumentCategory, CategoryTemporalRule> = {
  electronic_scales_weighbridges: {
    id: 'electronic_scales_weighbridges',
    label: 'Electronic Scales & Weighbridges',
    validityMonths: 12,
    warningThresholdDays: 30,
    description: 'Annual verification cycle with 30-day grace/renewal advisory threshold',
    statutoryRuleRef: 'Legal Metrology Rules 2011, Sixth Schedule (Clause 1)'
  },
  weights_and_measures: {
    id: 'weights_and_measures',
    label: 'Weights & Measures',
    validityMonths: 24,
    warningThresholdDays: 45,
    description: 'Biennial verification cycle with 45-day inspection notice window',
    statutoryRuleRef: 'Legal Metrology Rules 2011, Sixth Schedule (Clause 4)'
  },
  storage_tanks: {
    id: 'storage_tanks',
    label: 'Storage Tanks & Heavy Flow Provers',
    validityMonths: 60,
    warningThresholdDays: 90,
    description: 'Quinquennial verification cycle with 90-day hydrostatic re-calibration window',
    statutoryRuleRef: 'Legal Metrology Rules 2011, Petroleum & Tank Prover Schedules'
  }
};

export interface LegalMetrologyCertificate {
  certificateId: string;
  instrumentId: string;
  owner: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  accuracyClass: string;
  capacity: string;
  verificationDate: string;
  validityPeriod: string;
  expiryDate: string;
  lmoId: string;
  status: 'valid' | 'expiring_soon' | 'expired' | 'suspended' | 'condemned';
  instrument: string;
  category: InstrumentCategory;
  warningThresholdDays: number;
  daysRemaining: number;
  qrPayload?: string;
  verifiedBy?: string;
  establishmentAddress?: string;
  eInterval?: string;
  digitalSignatureHash?: string;
}

export interface ExpiryCalculationResult {
  verificationDate: string;
  validityPeriod: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  daysRemaining: number;
  warningThresholdDays: number;
  categoryLabel: string;
}

/**
 * Format a Date object to DD/MM/YYYY
 */
export function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Parse DD/MM/YYYY or YYYY-MM-DD into Date
 */
export function parseDate(dateStr: string): Date {
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Core Expiry Engine: calculates validityPeriod, expiryDate, and status
 * based on the statutory temporal mappings from the blueprint.
 */
export function calculateExpiry(
  verificationDateInput: string | Date,
  category: InstrumentCategory = 'electronic_scales_weighbridges'
): ExpiryCalculationResult {
  const rule = TEMPORAL_MAPPINGS[category] || TEMPORAL_MAPPINGS.electronic_scales_weighbridges;
  const vDate =
    typeof verificationDateInput === 'string'
      ? parseDate(verificationDateInput)
      : new Date(verificationDateInput.getTime());

  // Calculate expiry date by adding validityMonths
  const expDate = new Date(vDate.getTime());
  expDate.setMonth(expDate.getMonth() + rule.validityMonths);

  // Compare against current date
  const now = new Date();
  const diffTime = expDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: 'valid' | 'expiring_soon' | 'expired' = 'valid';
  if (daysRemaining < 0) {
    status = 'expired';
  } else if (daysRemaining <= rule.warningThresholdDays) {
    status = 'expiring_soon';
  } else {
    status = 'valid';
  }

  return {
    verificationDate: formatDate(vDate),
    validityPeriod: `${rule.validityMonths} months`,
    expiryDate: formatDate(expDate),
    status,
    daysRemaining,
    warningThresholdDays: rule.warningThresholdDays,
    categoryLabel: rule.label
  };
}

// Initial Database Seeding with the required LM-CERT-2026-0001
const SEED_CERTIFICATES: LegalMetrologyCertificate[] = [
  {
    certificateId: 'LM-CERT-2026-0001',
    instrumentId: 'INST-SCALE-001',
    owner: 'Apex Weighing & Retail Solutions Ltd.',
    manufacturer: 'Essae-Teraoka Precision Instruments',
    model: 'DS-215 Electronic Precision Series',
    serialNumber: 'XYZ123',
    accuracyClass: 'Class III',
    capacity: '30 kg',
    verificationDate: '05/09/2026',
    validityPeriod: '12 months',
    expiryDate: '05/09/2027',
    lmoId: 'LMO-XXXX',
    status: 'valid',
    instrument: 'Electronic Weighing Scale',
    category: 'electronic_scales_weighbridges',
    warningThresholdDays: 30,
    daysRemaining: 365,
    verifiedBy: 'Inspector Rajesh Sharma (LMO-XXXX)',
    establishmentAddress: 'Plot 18, MIDC Industrial Area, Mumbai',
    eInterval: '5 g',
    digitalSignatureHash: 'ed25519:e8b39a4f21d4c9f7a602bb147814cb9f67a21190bc281e4b308e2f8910d6e8b4'
  },
  {
    certificateId: 'LM-CERT-2025-0042',
    instrumentId: 'INST-WM-8891',
    owner: 'National Grain Silos & Warehouse Corp.',
    manufacturer: 'Premier Standard Weights Works',
    model: 'M1 Hexagonal Cast Iron Working Standards',
    serialNumber: 'XYZ456',
    accuracyClass: 'Class M1',
    capacity: '20 kg',
    verificationDate: '15/03/2025',
    validityPeriod: '24 months',
    expiryDate: '15/03/2027',
    lmoId: 'LMO-3011',
    status: 'valid',
    instrument: 'Weights & Measures (Cast Iron)',
    category: 'weights_and_measures',
    warningThresholdDays: 45,
    daysRemaining: 191,
    verifiedBy: 'Inspector Suman Verma (LMO-3011)',
    establishmentAddress: 'APMC Market Yard, New Delhi',
    eInterval: '1 g',
    digitalSignatureHash: 'ed25519:7a4c9b2e81f03d15c94e6b12a87d3f901124ca88be19f4308a7c2901ee435bb1'
  },
  {
    certificateId: 'LM-CERT-2024-0019',
    instrumentId: 'INST-TK-9021',
    owner: 'Bharat Petroleum Terminal Infra Ltd.',
    manufacturer: 'L&T Heavy Engineering Provers',
    model: 'Vertical Cylindrical Bulk Tank Prover #4',
    serialNumber: 'XYZ789',
    accuracyClass: 'Class II',
    capacity: '50,000 Litres',
    verificationDate: '10/01/2024',
    validityPeriod: '60 months',
    expiryDate: '10/01/2029',
    lmoId: 'LMO-1044',
    status: 'valid',
    instrument: 'Storage Tank & Flow Prover',
    category: 'storage_tanks',
    warningThresholdDays: 90,
    daysRemaining: 887,
    verifiedBy: 'Director K. Srinivasan (LMO-1044)',
    establishmentAddress: 'Jawahar Docks Bulk Depot, Mumbai Port Trust',
    eInterval: '10 L',
    digitalSignatureHash: 'ed25519:3b9918fc8190de1247ba89211cfa590124cc98ae237b01934efa7781023bc67d'
  },
  {
    certificateId: 'LM-CERT-2023-9999',
    instrumentId: 'INST-SCALE-OLD',
    owner: 'QuickMart Grocery Hub',
    manufacturer: 'Avery Weigh-Tronix India',
    model: 'DX-100 Classic',
    serialNumber: 'OLD-999',
    accuracyClass: 'Class III',
    capacity: '15 kg',
    verificationDate: '15/05/2023',
    validityPeriod: '12 months',
    expiryDate: '15/05/2024',
    lmoId: 'LMO-8812',
    status: 'expired',
    instrument: 'Electronic Weighing Scale',
    category: 'electronic_scales_weighbridges',
    warningThresholdDays: 30,
    daysRemaining: -478,
    verifiedBy: 'Inspector A. K. Roy (LMO-8812)',
    establishmentAddress: 'Station Road, Thane West',
    eInterval: '5 g',
    digitalSignatureHash: 'ed25519:0000expired4f21d4c9f7a602bb147814cb9f67a21190bc281e4b308e2f8910d6e8b4'
  }
];

const STORAGE_KEY = 'everimet_certificates_db_v1';

/**
 * Load all stored certificates from localStorage or fallback to seeds
 */
export function getStoredCertificates(): LegalMetrologyCertificate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CERTIFICATES));
      return SEED_CERTIFICATES;
    }
    const parsed: LegalMetrologyCertificate[] = JSON.parse(raw);
    // Ensure the default requested certificate exists
    const hasDefault = parsed.some((c) => c.certificateId === 'LM-CERT-2026-0001');
    if (!hasDefault) {
      const merged = [SEED_CERTIFICATES[0], ...parsed];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (err) {
    console.warn('Could not read certificates from storage:', err);
    return SEED_CERTIFICATES;
  }
}

/**
 * Save / Insert a new certificate into the database
 */
export function saveCertificate(cert: LegalMetrologyCertificate): void {
  try {
    const all = getStoredCertificates();
    const existingIdx = all.findIndex(
      (c) => c.certificateId.trim().toUpperCase() === cert.certificateId.trim().toUpperCase()
    );
    if (existingIdx >= 0) {
      all[existingIdx] = cert;
    } else {
      all.unshift(cert);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    // Async persist to MongoDB Atlas backend API
    const rawApiBase = (import.meta as any).env?.VITE_API_BASE_URL;
    const apiBase = rawApiBase ? rawApiBase.replace(/\/$/, '') : '/api';
    fetch(`${apiBase}/certificates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cert)
    }).catch(() => {
      // Local storage fallback when backend is offline or connecting
    });
  } catch (err) {
    console.warn('Could not save certificate to storage:', err);
  }
}

/**
 * Lookup certificate by Certificate ID or Serial Number (case-insensitive)
 */
export function findCertificate(query: string): LegalMetrologyCertificate | null {
  if (!query) return null;
  const clean = query.trim().toUpperCase();
  const all = getStoredCertificates();
  return (
    all.find(
      (c) =>
        c.certificateId.trim().toUpperCase() === clean ||
        c.serialNumber.trim().toUpperCase() === clean ||
        c.instrumentId.trim().toUpperCase() === clean
    ) || null
  );
}

/**
 * Helper to generate next Certificate ID
 */
export function generateNextCertificateId(): string {
  const all = getStoredCertificates();
  const count = all.length + 1;
  const padded = String(count).padStart(4, '0');
  return `LM-CERT-2026-${padded}`;
}
