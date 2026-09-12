/**
 * Backend Expiry Engine for Statutory Instrument Validity
 */

export type InstrumentCategory =
  | 'electronic_scales_weighbridges'
  | 'weights_and_measures'
  | 'storage_tanks'
  | string;

export interface CategoryTemporalRule {
  id: string;
  label: string;
  validityMonths: number;
  warningThresholdDays: number;
  description: string;
  statutoryRuleRef: string;
}

export const TEMPORAL_RULES: Record<string, CategoryTemporalRule> = {
  electronic_scales_weighbridges: {
    id: 'electronic_scales_weighbridges',
    label: 'Electronic Scales & Weighbridges',
    validityMonths: 12,
    warningThresholdDays: 30,
    description: 'Annual verification cycle with 30-day renewal advisory threshold',
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

export function getTemporalRule(category: string): CategoryTemporalRule {
  const normalized = (category || '').toLowerCase();
  if (normalized.includes('weight') || normalized.includes('mass')) {
    return TEMPORAL_RULES.weights_and_measures;
  }
  if (normalized.includes('tank') || normalized.includes('volume') || normalized.includes('flow')) {
    return TEMPORAL_RULES.storage_tanks;
  }
  return TEMPORAL_RULES.electronic_scales_weighbridges;
}

export function calculateExpiryDates(verificationDate: Date, category: string) {
  const rule = getTemporalRule(category);
  const expiryDate = new Date(verificationDate);
  expiryDate.setMonth(expiryDate.getMonth() + rule.validityMonths);

  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: 'Compliant' | 'Expiring Soon' | 'Expired' = 'Compliant';
  let certStatus: 'valid' | 'expiring_soon' | 'expired' = 'valid';

  if (daysRemaining <= 0) {
    status = 'Expired';
    certStatus = 'expired';
  } else if (daysRemaining <= rule.warningThresholdDays) {
    status = 'Expiring Soon';
    certStatus = 'expiring_soon';
  }

  return {
    verificationDate,
    validityMonths: rule.validityMonths,
    expiryDate,
    daysRemaining,
    warningThresholdDays: rule.warningThresholdDays,
    status,
    certStatus
  };
}
