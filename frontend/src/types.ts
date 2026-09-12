export type NavigationView =
  | 'lmo-portal'
  | 'admin-command'
  | 'public-qr'
  | 'business-portal'
  | 'login-gateway'
  | 'landing-page';

export type ActiveScreen =
  | 'home'
  | 'about-legal-metrology'
  | 'services-and-licenses'
  | 'verification-process'
  | 'contact-and-helpdesk';

export interface VerificationRecord {
  certNo: string;
  docketId: string;
  establishment: string;
  instrumentType: string;
  accuracyClass: string;
  maxCapacity: string;
  e: string;
  officerName: string;
  officerId: string;
  date: string;
  validUntil: string;
  status: 'valid' | 'expired' | 'suspended' | 'condemned';
  location?: string;
  hologramNo?: string;
  qrPayload?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
}

export type UserRole = 'owner' | 'administrator' | 'officer' | 'business' | 'citizen';

export interface UserSession {
  name: string;
  role: UserRole;
  identifier: string;
  roleLabel: string;
  email?: string;
  phone?: string;
  enterpriseName?: string;
  enterpriseType?: string;
  gstin?: string;
  licenseNo?: string;
  zone?: string;
}

export interface DocketItem {
  id: string;
  establishmentName: string;
  address: string;
  instrumentType: string;
  accuracyClass: string;
  dueDate: string;
  status: 'under_verification' | 'queued' | 'certified';
  capacity?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  paidFee?: string;
  paymentStatus?: string;
  rawApp?: any;
}

export interface StakeholderItem {
  id: string;
  name: string;
  subtext: string;
  licenseNo: string;
  role: string;
  roleType: 'manufacturer' | 'repairer' | 'trader' | 'officer' | 'dealer' | 'importer';
  status: 'certified' | 'pending' | 'flagged' | 'active';
  complianceScore: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type?: 'success' | 'warning' | 'info' | 'error';
}
