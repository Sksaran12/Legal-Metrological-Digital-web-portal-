export type NavScreen =
  | 'dashboard-overview'
  | 'applications'
  | 'legal-metrology-officers'
  | 'government-approved-test-centres'
  | 'owners-registrations'
  | 'instruments-devices'
  | 'inspections-verifications'
  | 'verification-certificates'
  | 'reports-audit-logs'
  | 'compliance-alerts';

export interface SubPartItem {
  id: string;
  label: string;
  parentScreen: NavScreen;
  icon?: string;
  description?: string;
}

export type PipelineStage = 'intake' | 'review' | 'assign_lmo' | 'scheduled' | 'stamped';

export interface ApplicationItem {
  id: string;
  appNo: string;
  date: string;
  time: string;
  enterpriseName: string;
  enterpriseType: string;
  equipmentName: string;
  equipmentSerial: string;
  equipmentClass: string;
  jurisdiction: string;
  zone: string;
  stage: PipelineStage;
  stageLabel: string;
  stageBadgeClass: string;
  assignedLmo?: {
    id?: string;
    name: string;
    badgeNo: string;
    avatar?: string;
    phone?: string;
    zone?: string;
    email?: string;
  };
  isHighPriority?: boolean;
  slaDeadline?: string;
  accuracyTolerance?: string;
  feeAmount?: string;
  paymentStatus?: 'Paid' | 'Pending' | 'Exempted';
  lastCalibrated?: string;
  testCentre?: string;
}

export interface LmoOfficer {
  id: string;
  name: string;
  badgeNo: string;
  zone: string;
  zoneCode: string;
  status: 'On Site' | 'Transit' | 'Available' | 'On Leave';
  statusClass: string;
  inspectionsToday: number;
  completedThisMonth: number;
  stampingCertsIssued: number;
  phone: string;
  email: string;
  avatar: string;
  currentLocation: string;
}

export interface GatcCentre {
  id: string;
  name: string;
  code: string;
  location: string;
  nablAccreditationNo: string;
  accreditationStandard?: string;
  validUntil: string;
  testingCapacities: string[];
  activeTestQueue: number;
  status: 'Operational' | 'Audit Underway' | 'High Capacity';
  contactPerson: string;
  approvedFirstScheduleIds?: string[];
  iso17025Accredited?: boolean;
  jurisdictionArea?: string;
  consumerComplaintNumber?: string;
}

export interface OwnerRegistrationItem {
  id: string;
  registrationNo: string;
  enterpriseName: string;
  ownerName: string;
  enterpriseType: 'Manufacturer' | 'Importer' | 'Trader / Retailer' | 'Repairer' | 'Bulk Weighbridge Depot';
  licenseNo: string;
  zone: string;
  registeredDevices: number;
  complianceScore: number;
  status: 'Active' | 'Pending Verification' | 'Notice Issued';
  contactPhone: string;
  contactEmail: string;
}

export interface InstrumentItem {
  id: string;
  instrumentId?: string;
  serialNo: string;
  name?: string;
  type?: string;
  manufacturer?: string;
  model?: string;
  capacity?: string;
  category:
    | 'Mass / Weights'
    | 'Volume / Flow'
    | 'Pressure / Gas'
    | 'Precision Balances'
    | 'Dimensional'
    | 'electronic_scales_weighbridges'
    | 'weights_and_measures'
    | 'storage_tanks';
  accuracyClass: string;
  ownerName: string;
  location: string;
  qrHash: string;
  lastVerified: string;
  nextVerificationDue: string;
  status: 'Compliant' | 'Due for Renewal' | 'Violation Reported' | 'Active' | 'Expired';
}

export interface CertificateItem {
  id: string;
  certificateNo: string;
  certificateId?: string;
  entityName: string;
  owner?: string;
  equipment: string;
  instrument?: string;
  accuracyClass?: string;
  capacity?: string;
  serialNumber?: string;
  issueDate: string;
  verificationDate?: string;
  validTill: string;
  expiryDate?: string;
  officerName: string;
  verifiedBy?: string;
  officerBadge: string;
  lmoId?: string;
  zone: string;
  sha256Hash: string;
  digitalSignatureHash?: string;
  qrCodeUrl: string;
  status: 'Active' | 'Expiring Soon' | 'Revoked' | 'valid' | 'expired' | 'suspended' | 'condemned';
  feePaid: string;
}

export interface AlertViolation {
  id: string;
  alertNo: string;
  type: 'Seal Tampering' | 'Expired Verification' | 'Unauthorized Alteration' | 'Deviation Exceeds MPE' | 'SLA Breach Threat';
  severity: 'Critical' | 'High' | 'Moderate';
  entityName: string;
  location: string;
  zone: string;
  reportedAt: string;
  status: 'Pending Dispatch' | 'Investigation Active' | 'Warrant Issued' | 'Resolved';
  actionTaken: string;
}
