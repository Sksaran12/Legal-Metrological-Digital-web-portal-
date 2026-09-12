import { LegalMetrologyCertificate } from './expiryEngine';
import { ApplicationItem, LmoOfficer, OwnerRegistrationItem, InstrumentItem, AlertViolation, GatcCentre } from '../adminTypes';

const rawApiBase = (import.meta as any).env?.VITE_API_BASE_URL;
const API_BASE = rawApiBase ? rawApiBase.replace(/\/$/, '') : '/api';

const fetchWithCredentials = (input: RequestInfo | URL, init: RequestInit = {}) =>
  globalThis.fetch(input, { ...init, credentials: 'include' });
const fetch = fetchWithCredentials;

function withCredentials(init: RequestInit = {}): RequestInit {
  return { ...init, credentials: 'include' };
}

function getAuthHeader(): Record<string, string> {
  const token: string | null = null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const apiClient = {
  // Auth API
  async login(credentials: { email: string; password: string; role?: string }) {
    const res = await fetchWithCredentials(`${API_BASE}/auth/login`, withCredentials({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }));
    const data = await res.json();
    if (data.token) {
    }
    if (data.userSession) {
      localStorage.setItem('everimet_user_session', JSON.stringify(data.userSession));
      localStorage.setItem('everimet_is_authenticated', 'true');
    }
    return data;
  },

  async register(registrationData: any) {
    const res = await fetchWithCredentials(`${API_BASE}/auth/register`, withCredentials({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    }));
    const data = await res.json();
    if (data.token) {
    }
    if (data.userSession) {
      localStorage.setItem('everimet_user_session', JSON.stringify(data.userSession));
      localStorage.setItem('everimet_is_authenticated', 'true');
    }
    return data;
  },

  async getMe() {
    const res = await fetchWithCredentials(`${API_BASE}/auth/me`, withCredentials({
      headers: { ...getAuthHeader() }
    }));
    return res.json();
  },

  async logout() {
    await fetchWithCredentials(`${API_BASE}/auth/logout`, withCredentials({ method: 'POST' }));
  },

  async createPaymentOrder(amount: number, receipt: string) {
    const res = await fetchWithCredentials(`${API_BASE}/payments/orders`, withCredentials({
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ amount, receipt })
    }));
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Unable to create payment order.');
    return result.data;
  },

  async verifyPayment(payment: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    applicationId?: string;
  }) {
    const res = await fetchWithCredentials(`${API_BASE}/payments/verify`, withCredentials({
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payment)
    }));
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Unable to verify payment.');
    return result.data;
  },

  // Certificate API
  async getCertificates(params?: { status?: string; category?: string; search?: string; ownerId?: string }): Promise<any[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/certificates?${query}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) {
      throw new Error(`Certificate request failed with status ${res.status}`);
    }
    const result = await res.json();
    return (result.data || []).map((c: any) => ({
      ...c,
      id: String(c.id || c._id || c.certificateId || c.certificateNo || ''),
      certificateNo: c.certificateNo || c.certificateId || '',
      certificateId: c.certificateId || c.certificateNo || '',
      entityName: c.entityName || c.owner || c.ownerRef?.enterpriseName || c.ownerRef?.name || '',
      owner: c.owner || c.entityName || c.ownerRef?.enterpriseName || c.ownerRef?.name || '',
      equipment: c.equipment || c.instrument || c.model || '',
      instrument: c.instrument || c.equipment || c.model || '',
      issueDate: c.issueDate || c.verificationDate || '',
      verificationDate: c.verificationDate || c.issueDate || '',
      validTill: c.validTill || c.expiryDate || '',
      expiryDate: c.expiryDate || c.validTill || '',
      officerName: c.officerName || c.verifiedBy || '',
      verifiedBy: c.verifiedBy || c.officerName || '',
      officerBadge: c.officerBadge || c.lmoId || '',
      lmoId: c.lmoId || c.officerBadge || '',
      zone: c.zone || '',
      sha256Hash: c.sha256Hash || c.digitalSignatureHash || '',
      digitalSignatureHash: c.digitalSignatureHash || c.sha256Hash || '',
      status: c.status === 'valid' ? 'Active' : c.status === 'expiring_soon' ? 'Expiring Soon' : c.status || 'Active',
      feePaid: c.feePaid || '',
      accuracyClass: c.accuracyClass || '',
      capacity: c.capacity || '',
      serialNumber: c.serialNumber || '',
      establishmentAddress: c.establishmentAddress || ''
    }));
  },

  async getCertificateByQuery(query: string): Promise<LegalMetrologyCertificate | null> {
    const res = await fetch(`${API_BASE}/certificates/${encodeURIComponent(query)}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) return null;
    const result = await res.json();
    return result.data || null;
  },

  async getPublicCertificateByQuery(query: string): Promise<LegalMetrologyCertificate | null> {
    const res = await fetch(`${API_BASE}/certificates/public/${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const result = await res.json();
    return result.data || null;
  },

  async getCertificatePdfUrl(query: string): Promise<string> {
    return `${API_BASE}/certificates/pdf/${encodeURIComponent(query)}`;
  },

  async saveCertificate(cert: Partial<LegalMetrologyCertificate> & { applicationRef?: string }) {
    const res = await fetch(`${API_BASE}/certificates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(cert)
    });
    return res.json();
  },

  async createCertificate(cert: Partial<LegalMetrologyCertificate> & { applicationRef?: string }) {
    return this.saveCertificate(cert);
  },

  // Applications API
  async getApplications(params?: { stage?: string; status?: string; paymentStatus?: string; search?: string; ownerId?: string }): Promise<ApplicationItem[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/applications?${query}`, {
      headers: { ...getAuthHeader() }
    });
    const result = await res.json();
    return (result.data || []).map((a: any) => ({
      ...a,
      id: String(a.id || a._id || a.appNo)
    }));
  },

  async getApplicationById(id: string): Promise<ApplicationItem | null> {
    const res = await fetch(`${API_BASE}/applications/${encodeURIComponent(id)}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) return null;
    const result = await res.json();
    if (!result.data) return null;
    return {
      ...result.data,
      id: String(result.data.id || result.data._id || result.data.appNo)
    };
  },

  async createApplication(appData: Partial<ApplicationItem>) {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(appData)
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || `Application request failed with status ${res.status}`);
    }
    return result;
  },

  async updateApplication(id: string, updateData: any) {
    const res = await fetch(`${API_BASE}/applications/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updateData)
    });
    return res.json();
  },


  async assignOfficer(appId: string, payload: { assignedLmoUser?: string; assignedGatcUser?: string; assignedLmo?: any; assignedGatc?: any; notes?: string }) {
    const res = await fetch(`${API_BASE}/applications/assign/${encodeURIComponent(appId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async submitVerification(appId: string, testData: {
    maxCapacity: number;
    eInterval: number;
    dDivision: number;
    accuracyClass: string;
    verificationType?: string;
    repeatability: { testLoad: number; observedError: number };
    eccentricity: { testLoad: number; observedError: number };
    linearity: { testLoad: number; observedError: number };
    remarks?: string;
  }) {
    const res = await fetch(`${API_BASE}/applications/verify/${encodeURIComponent(appId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(testData)
    });
    return res.json();
  },

  // LMO Officers API
  async getOfficers(): Promise<LmoOfficer[]> {
    const res = await fetch(`${API_BASE}/lmo-officers`, {
      headers: { ...getAuthHeader() }
    });
    const result = await res.json();
    return (result.data || []).map((o: any) => ({
      ...o,
      id: String(o.id || o._id || o.badgeNo)
    }));
  },

  async createOfficer(officerData: Partial<LmoOfficer>) {
    const res = await fetch(`${API_BASE}/lmo-officers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(officerData)
    });
    return res.json();
  },

  // Instruments API
  async getInstruments(params?: { category?: string; status?: string; search?: string; ownerId?: string }): Promise<InstrumentItem[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/instruments?${query}`, {
      headers: { ...getAuthHeader() }
    });
    const result = await res.json();
    return result.data || [];
  },

  async getInstrumentMetrics() {
    const res = await fetch(`${API_BASE}/instruments/metrics`, {
      headers: { ...getAuthHeader() }
    });
    const result = await res.json();
    return result.metrics || null;
  },

  async createInstrument(instrumentData: Partial<InstrumentItem>) {
    const res = await fetch(`${API_BASE}/instruments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(instrumentData)
    });
    return res.json();
  },

  // Stakeholders API
  async getStakeholders(): Promise<OwnerRegistrationItem[]> {
    const res = await fetch(`${API_BASE}/stakeholders`, {
      headers: { ...getAuthHeader() }
    });
    const result = await res.json();
    return (result.data || []).map((s: any) => ({
      ...s,
      id: String(s.id || s._id || s.registrationNo)
    }));
  },

  async updateStakeholderStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/stakeholders/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async createStakeholder(stakeholderData: Partial<OwnerRegistrationItem>) {
    const res = await fetch(`${API_BASE}/stakeholders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(stakeholderData)
    });
    return res.json();
  },

  // GATC Centres API
  async getGatcCentres(): Promise<GatcCentre[]> {
    const res = await fetch(`${API_BASE}/gatc-centres`, {
      headers: { ...getAuthHeader() }
    });
    const result = await res.json();
    return (result.data || []).map((g: any) => ({
      ...g,
      id: String(g.id || g._id || g.code)
    }));
  },

  async submitGatcApplication(appData: any) {
    const res = await fetch(`${API_BASE}/gatc-centres/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(appData)
    });
    return res.json();
  },

  async getGatcApplications() {
    const res = await fetch(`${API_BASE}/gatc-centres/applications`, {
      headers: { ...getAuthHeader() }
    });
    const result = await res.json();
    return result.data || [];
  },

  async updateGatcApplicationStatus(id: string, status: string, reviewRemarks?: string, assignedInspector?: string) {
    const res = await fetch(`${API_BASE}/gatc-centres/applications/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, reviewRemarks, assignedInspector })
    });
    return res.json();
  },

  // Alerts & Grievances API
  async getAlerts(): Promise<AlertViolation[]> {
    const res = await fetch(`${API_BASE}/alerts`, {
      headers: { ...getAuthHeader() }
    });
    const result = await res.json();
    return result.data || [];
  },

  async reportTamperOrGrievance(reportData: any) {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    return res.json();
  },

  // Helpdesk Inquiries API
  async submitInquiry(inquiryData: { name: string; email: string; topic?: string; message: string }) {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData)
    });
    return res.json();
  },

  async getInquiries() {
    const res = await fetch(`${API_BASE}/inquiries`, {
      headers: { ...getAuthHeader() }
    });
    const result = await res.json();
    return result.data || [];
  },

  // Certificates API
  async getPublicCertificate(query: string) {
    const res = await fetch(`${API_BASE}/certificates/public/${encodeURIComponent(query)}`);
    return res.json();
  },

  async getNetworkInfo(): Promise<{ success: boolean; lanIp: string; lanUrl: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/system/network-info`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
};
