/**
 * Legal Metrology (Government Approved Test Centre) Rules, 2013
 * Official Statutory Schedules & Technical Specifications
 */

// ============================================================================
// FIRST SCHEDULE [See sub-rule (1) of rule 3]
// Weights and Measures which shall be verified by Government Approved Test Centre
// ============================================================================
export interface FirstScheduleItem {
  id: string;
  itemNumber: number;
  name: string;
  legalDescription: string;
  maxScope?: string;
  accuracyClass?: string;
  testStandard: string;
}

export const GATC_FIRST_SCHEDULE: FirstScheduleItem[] = [
  {
    id: 'water_meter',
    itemNumber: 1,
    name: 'Water meter',
    legalDescription: 'Cold potable water meters and hot water meters for municipal/industrial metering',
    testStandard: 'IS 779 / ISO 4064'
  },
  {
    id: 'sphygmomanometer',
    itemNumber: 2,
    name: 'Sphygmomanometer',
    legalDescription: 'Non-invasive blood pressure measurement instruments (mechanical and digital)',
    testStandard: 'OIML R 16-1 / IS 3390'
  },
  {
    id: 'clinical_thermometer',
    itemNumber: 3,
    name: 'Clinical Thermometer',
    legalDescription: 'Liquid-in-glass and electrical clinical thermometers for body temperature',
    testStandard: 'OIML R 115 / IS 3055'
  },
  {
    id: 'automatic_rail_weighbridge',
    itemNumber: 4,
    name: 'Automatic Rail Weighbridges',
    legalDescription: 'Automatic instruments for weighing railway wagons in-motion and static',
    testStandard: 'OIML R 106 / Seventh Schedule'
  },
  {
    id: 'tape_measures',
    itemNumber: 5,
    name: 'Tape Measures',
    legalDescription: 'Steel, fiberglass, and cloth measuring tapes for trade and land measurement',
    testStandard: 'OIML R 35 / IS 1269'
  },
  {
    id: 'nawi_class_3_4_upto_150kg',
    itemNumber: 6,
    name: 'Non-automatic weighing instrument of Accuracy Class-IIII/ Class-III (upto 150kg)',
    legalDescription: 'Commercial counter/platform scales of Class III & IIII with maximum capacity not exceeding 150 kg',
    maxScope: '150 kg',
    accuracyClass: 'Class III or Class IIII',
    testStandard: 'OIML R 76 / Form 24'
  },
  {
    id: 'load_cell',
    itemNumber: 7,
    name: 'Load cell',
    legalDescription: 'Standard beam, canister, and S-type strain gauge load cells used in trade instruments',
    testStandard: 'OIML R 60 / IS 15467'
  },
  {
    id: 'beam_scale',
    itemNumber: 8,
    name: 'Beam Scale',
    legalDescription: 'Mechanical equal-arm beam scales Classes A, B, C and D for retail and bulk market yards',
    testStandard: 'Legal Metrology (General) Rules, 2011'
  },
  {
    id: 'counter_machine',
    itemNumber: 9,
    name: 'Counter Machine',
    legalDescription: 'Mechanical counter weighing machines with equal or unequal arms for retail outlets',
    testStandard: 'IS 1435 / Seventh Schedule'
  },
  {
    id: 'weights_all_categories',
    itemNumber: 10,
    name: 'Weights of all categories',
    legalDescription: 'Standard weights Class M1, M2, M3 cast iron, brass, and bullions for commercial transactions',
    testStandard: 'OIML R 111 / Fourth Schedule'
  }
];

// ============================================================================
// SECOND SCHEDULE [See sub-rule (1) of rule 5]
// Application for Approval of Government Approved Test Centre
// ============================================================================
export interface SecondScheduleApplication {
  id?: string;
  applicationNo?: string;
  // (1) Full name and complete address of the person/ applicant
  applicantFullName: string;
  applicantAddress: string;
  contactEmail: string;
  contactPhone: string;

  // (2) Name of the weight or measure for which Government Approved Test Centre has been applied
  appliedFirstScheduleItems: string[]; // array of FirstScheduleItem.id

  // (3) The detail and complete function of the applicant
  applicantFunctionDetails: string;

  // (4) NABL or Director, Legal Metrology certificate or certificate provided by any other institutions specified in the rules
  nablCertificateNo: string;
  nablIssueDate: string;
  nablValidUntil: string;
  accreditationBody: 'NABL' | 'Director, Legal Metrology' | 'NPL (National Physical Laboratory)' | 'RRSL';

  // (5) Experience detail in the relevant field of the applicant
  relevantExperienceYears: number;
  relevantExperienceSummary: string;

  // (6) No. of persons employed and their particulars
  totalEmployeesCount: number;
  technicalStaffParticulars: string;

  // (7) Total area of the organization including the detail of Government Approved Test Centre proposed
  totalOrganizationAreaSqMeters: number;
  proposedGatcLabAreaSqMeters: number;

  // (8) Qualification of Principal Officer and his deputy
  principalOfficerName: string;
  principalOfficerQualification: string;
  deputyOfficerName: string;
  deputyOfficerQualification: string;

  // (9) Detail of the standards available with the institutions and other testing Facilities
  referenceStandardsAvailable: string;
  testingFacilitiesSummary: string;

  // (10) Are the officers of the applicant has acquired the training in respect of quality management system (ISO/IEC 17025) and measurement of uncertainty from any recognized laboratory in India and abroad
  iso17025Trained: boolean;
  trainingInstituteName: string;
  trainingDetails: string;

  // (11) Copy of the Quality management system of the laboratory, if available
  qmsManualRefNo: string;
  qmsManualAvailable: boolean;

  // (12) Experience in the field for testing of the weights or measure
  weightsMeasuresTestingExperience: string;

  // (13) Any other information which the applicant may consider to be useful for assessing the performance of the applicant
  additionalPerformanceInfo?: string;

  // (14) Details of the Demand Draft
  demandDraftNo: string;
  demandDraftDate: string;
  demandDraftBank: string;
  demandDraftAmount: string;

  // (15) Jurisdiction / area for which application is made
  proposedJurisdictionArea: string;

  // (16) Undertaking that person or applicant will abide by the provisions of the Legal Metrology Act, 2009 and the rules made there under
  statutoryUndertakingAgreed: boolean;
  undertakingDate: string;

  // (17) Consumer complaint number
  consumerComplaintNumber: string;
  grievanceRedressalOfficer: string;

  // Status and Audit
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
  reviewRemarks?: string;
  assignedInspector?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Helper to determine if an instrument is legally eligible for GATC verification
 * under Rule 3(1) of Legal Metrology (GATC) Rules, 2013.
 */
export function evaluateGatcEligibility(instrument: {
  equipmentName?: string;
  instrumentType?: string;
  equipmentClass?: string;
  capacity?: string | number;
}): {
  eligible: boolean;
  matchedScheduleItem?: FirstScheduleItem;
  reason: string;
} {
  const name = (instrument.equipmentName || instrument.instrumentType || '').toLowerCase();
  const accClass = (instrument.equipmentClass || '').toLowerCase();
  const capStr = String(instrument.capacity || '').toLowerCase();

  // Parse numerical capacity in kg if available
  let capKg = 0;
  const match = capStr.match(/([0-9,.]+)/);
  if (match) {
    const rawVal = parseFloat(match[1].replace(/,/g, ''));
    if (capStr.includes('ton') || capStr.includes('t')) {
      capKg = rawVal * 1000;
    } else if (capStr.includes('g') && !capStr.includes('kg')) {
      capKg = rawVal / 1000;
    } else {
      capKg = rawVal;
    }
  }

  // 1. Water meter
  if (name.includes('water meter')) {
    return {
      eligible: true,
      matchedScheduleItem: GATC_FIRST_SCHEDULE[0],
      reason: 'Eligible under First Schedule Item 1: Water meter.'
    };
  }

  // 2. Sphygmomanometer
  if (name.includes('sphygmo') || name.includes('blood pressure') || name.includes('bp monitor')) {
    return {
      eligible: true,
      matchedScheduleItem: GATC_FIRST_SCHEDULE[1],
      reason: 'Eligible under First Schedule Item 2: Sphygmomanometer.'
    };
  }

  // 3. Clinical Thermometer
  if (name.includes('thermometer')) {
    return {
      eligible: true,
      matchedScheduleItem: GATC_FIRST_SCHEDULE[2],
      reason: 'Eligible under First Schedule Item 3: Clinical Thermometer.'
    };
  }

  // 4. Automatic Rail Weighbridge
  if (name.includes('rail') && name.includes('weighbridge')) {
    return {
      eligible: true,
      matchedScheduleItem: GATC_FIRST_SCHEDULE[3],
      reason: 'Eligible under First Schedule Item 4: Automatic Rail Weighbridges.'
    };
  }

  // 5. Tape Measures
  if (name.includes('tape') || name.includes('measuring tape')) {
    return {
      eligible: true,
      matchedScheduleItem: GATC_FIRST_SCHEDULE[4],
      reason: 'Eligible under First Schedule Item 5: Tape Measures.'
    };
  }

  // 7. Load cell
  if (name.includes('load cell')) {
    return {
      eligible: true,
      matchedScheduleItem: GATC_FIRST_SCHEDULE[6],
      reason: 'Eligible under First Schedule Item 7: Load cell.'
    };
  }

  // 8. Beam Scale
  if (name.includes('beam scale') || name.includes('beam')) {
    return {
      eligible: true,
      matchedScheduleItem: GATC_FIRST_SCHEDULE[7],
      reason: 'Eligible under First Schedule Item 8: Beam Scale.'
    };
  }

  // 9. Counter Machine
  if (name.includes('counter machine')) {
    return {
      eligible: true,
      matchedScheduleItem: GATC_FIRST_SCHEDULE[8],
      reason: 'Eligible under First Schedule Item 9: Counter Machine.'
    };
  }

  // 10. Weights of all categories
  if (name.includes('weight') && !name.includes('bridge') && !name.includes('scale')) {
    return {
      eligible: true,
      matchedScheduleItem: GATC_FIRST_SCHEDULE[9],
      reason: 'Eligible under First Schedule Item 10: Weights of all categories.'
    };
  }

  // 6. Non-automatic weighing instrument of Accuracy Class-IIII/ Class-III (upto 150kg)
  if (
    name.includes('scale') ||
    name.includes('weigh') ||
    name.includes('balance') ||
    name.includes('nawi') ||
    name.includes('platform')
  ) {
    // If heavy weighbridge or >150kg
    if (capKg > 150) {
      return {
        eligible: false,
        reason: `Exceeds GATC scope: Capacity is ${capKg} kg (> 150 kg limit). Under Rule 3(1)(6) of GATC Rules 2013, GATCs are restricted to NAWI up to 150 kg. Mandatory LMO field inspection required.`
      };
    }
    // Check Accuracy Class
    const isClass3or4 = accClass.includes('iii') || accClass.includes('iiii') || accClass.includes('class 3') || accClass.includes('class 4') || accClass === '';
    if (isClass3or4) {
      return {
        eligible: true,
        matchedScheduleItem: GATC_FIRST_SCHEDULE[5],
        reason: `Eligible under First Schedule Item 6: NAWI Class III/IIII (Capacity: ${capKg || capStr} <= 150 kg).`
      };
    } else {
      return {
        eligible: false,
        reason: `Accuracy class (${instrument.equipmentClass}) is outside GATC Rule 3(1)(6) scope (Requires Class III or Class IIII).`
      };
    }
  }

  // Default outside scope
  return {
    eligible: false,
    reason: 'Instrument type is not included in the First Schedule of GATC Rules, 2013. Requires direct Government LMO inspection.'
  };
}
