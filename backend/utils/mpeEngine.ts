/**
 * Statutory Maximum Permissible Error (MPE) Calculation Engine
 * Based on OIML R76-1 / The Legal Metrology (General) Rules, 2011
 */

export interface TestInput {
  testLoad: number;
  observedError: number;
}

export interface MPEEvaluationDetail {
  testName: string;
  testLoad: number;
  observedError: number;
  mpeTolerance: number;
  isPass: boolean;
  loadIntervals: number;
  zoneDescription: string;
}

export interface VerificationEvaluationResult {
  maxCapacity: number;
  eInterval: number;
  dDivision: number;
  accuracyClass: string;
  verificationType: 'initial' | 'in_service' | string;
  nIntervals: number;
  repeatability: MPEEvaluationDetail;
  eccentricity: MPEEvaluationDetail;
  linearity: MPEEvaluationDetail;
  overallResult: 'PASS' | 'FAIL';
  summaryMessage: string;
}

/**
 * Compute statutory MPE tolerance factor for a given test load and accuracy class
 */
export function calculateMPETolerance(
  testLoad: number,
  e: number,
  accuracyClass: string,
  verificationType: string = 'initial'
): { mpeTolerance: number; mpeFactor: number; zoneDescription: string } {
  if (!Number.isFinite(testLoad) || testLoad < 0) {
    throw new Error('Test load must be a finite non-negative number.');
  }
  if (!Number.isFinite(e) || e <= 0) {
    throw new Error('Verification interval e must be greater than zero.');
  }
  if (!accuracyClass.trim()) {
    throw new Error('Accuracy class is required.');
  }
  const validE = e > 0 ? e : 0.001;
  const loadInE = testLoad / validE;
  const isInService =
    verificationType.toLowerCase().includes('periodic') ||
    verificationType.toLowerCase().includes('in_service') ||
    verificationType.toLowerCase().includes('renewal') ||
    verificationType.toLowerCase().includes('re-verification');

  let baseFactor = 0.5;
  let zoneDescription = '';

  const cls = accuracyClass.toUpperCase();

  if (cls.includes('CLASS I') && !cls.includes('CLASS II')) {
    if (loadInE <= 50000) {
      baseFactor = 0.5;
      zoneDescription = `0 ≤ m ≤ 50,000e`;
    } else if (loadInE <= 200000) {
      baseFactor = 1.0;
      zoneDescription = `50,000e < m ≤ 200,000e`;
    } else {
      baseFactor = 1.5;
      zoneDescription = `m > 200,000e`;
    }
  } else if (cls.includes('CLASS II') && !cls.includes('CLASS III')) {
    if (loadInE <= 5000) {
      baseFactor = 0.5;
      zoneDescription = `0 ≤ m ≤ 5,000e`;
    } else if (loadInE <= 20000) {
      baseFactor = 1.0;
      zoneDescription = `5,000e < m ≤ 20,000e`;
    } else {
      baseFactor = 1.5;
      zoneDescription = `20,000e < m ≤ 100,000e`;
    }
  } else if (cls.includes('CLASS IIII')) {
    if (loadInE <= 50) {
      baseFactor = 0.5;
      zoneDescription = `0 ≤ m ≤ 50e`;
    } else if (loadInE <= 200) {
      baseFactor = 1.0;
      zoneDescription = `50e < m ≤ 200e`;
    } else {
      baseFactor = 1.5;
      zoneDescription = `200e < m ≤ 1,000e`;
    }
  } else {
    // Default Class III (Commercial / Retail)
    if (loadInE <= 500) {
      baseFactor = 0.5;
      zoneDescription = `0 ≤ m ≤ 500e`;
    } else if (loadInE <= 2000) {
      baseFactor = 1.0;
      zoneDescription = `500e < m ≤ 2,000e`;
    } else {
      baseFactor = 1.5;
      zoneDescription = `m > 2,000e`;
    }
  }

  // In-service / periodic verification doubles the initial MPE tolerance factor
  const mpeFactor = isInService ? baseFactor * 2 : baseFactor;
  const mpeTolerance = parseFloat((mpeFactor * validE).toFixed(4));

  return { mpeTolerance, mpeFactor, zoneDescription };
}

/**
 * Evaluate all three statutory tests (Repeatability, Eccentricity, Linearity)
 */
export function evaluateVerificationTests(params: {
  maxCapacity: number;
  eInterval: number;
  dDivision: number;
  accuracyClass: string;
  verificationType: string;
  repeatability: TestInput;
  eccentricity: TestInput;
  linearity: TestInput;
}): VerificationEvaluationResult {
  const { maxCapacity, eInterval, dDivision, accuracyClass, verificationType, repeatability, eccentricity, linearity } = params;

  if (!Number.isFinite(maxCapacity) || maxCapacity <= 0) {
    throw new Error('Maximum capacity must be greater than zero.');
  }
  if (!Number.isFinite(eInterval) || eInterval <= 0) {
    throw new Error('e interval must be greater than zero.');
  }
  if (!Number.isFinite(dDivision) || dDivision <= 0) {
    throw new Error('d division must be greater than zero.');
  }
  if (dDivision > eInterval) {
    throw new Error('d division cannot be greater than e interval.');
  }
  if (!verificationType.trim()) {
    throw new Error('Verification type is required.');
  }

  const validE = eInterval;
  const nIntervals = Math.round(maxCapacity / validE);

  const evalSingleTest = (testName: string, input: TestInput): MPEEvaluationDetail => {
    if (!Number.isFinite(input.testLoad) || input.testLoad < 0 || input.testLoad > maxCapacity) {
      throw new Error(`${testName} test load must be between zero and maximum capacity.`);
    }
    if (!Number.isFinite(input.observedError)) {
      throw new Error(`${testName} observed error must be finite.`);
    }
    const { mpeTolerance, zoneDescription } = calculateMPETolerance(input.testLoad, validE, accuracyClass, verificationType);
    const absObserved = Math.abs(input.observedError);
    const isPass = absObserved <= mpeTolerance + 0.00001;

    return {
      testName,
      testLoad: input.testLoad,
      observedError: input.observedError,
      mpeTolerance,
      isPass,
      loadIntervals: parseFloat((input.testLoad / validE).toFixed(2)),
      zoneDescription
    };
  };

  const repResult = evalSingleTest('Repeatability', repeatability);
  const eccResult = evalSingleTest('Eccentricity', eccentricity);
  const linResult = evalSingleTest('Linearity', linearity);

  const overallPass = repResult.isPass && eccResult.isPass && linResult.isPass;

  return {
    maxCapacity,
    eInterval: validE,
    dDivision: dDivision || validE,
    accuracyClass,
    verificationType,
    nIntervals,
    repeatability: repResult,
    eccentricity: eccResult,
    linearity: linResult,
    overallResult: overallPass ? 'PASS' : 'FAIL',
    summaryMessage: overallPass
      ? `All 3 metrological tests PASSED within statutory MPE tolerances (n = ${nIntervals} intervals).`
      : `Metrological evaluation FAILED. Observed error exceeded statutory MPE limit.`
  };
}
