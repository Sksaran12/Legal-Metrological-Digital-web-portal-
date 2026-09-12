import React, { useState, useEffect } from 'react';
import { NavigationView, StakeholderItem, ToastMessage, UserRole, UserSession } from './types';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LMOInspectionPortal } from './components/portals/lmo/LMOInspectionPortal';
import { AdminCommandCenter } from './components/portals/admin/AdminCommandCenter';
import { PublicQRVerification } from './components/portals/public/PublicQRVerification';
import { BusinessDashboard } from './components/portals/business/BusinessDashboard';
import { LoginGateway } from './components/auth/LoginGateway';
import { Registration } from './components/auth/registration';
import { LandingPage } from './components/portals/landing/LandingPage';
import { OwnerDashboard } from './components/portals/business/OwnerDashboard';
import { AdminDashboard } from './components/portals/admin/AdminDashboard';
import { CertificateModal } from './components/modals/CertificateModal';
import { RejectionNoticeModal } from './components/modals/RejectionNoticeModal';
import { ReportTamperModal } from './components/modals/ReportTamperModal';
import { EmergencyAuditModal } from './components/modals/EmergencyAuditModal';
import { StakeholderDetailModal } from './components/modals/StakeholderDetailModal';
import { ToastContainer } from './components/common/Toast';
import { apiClient } from './services/apiClient';

export default function App() {
  // Authentication Gate State - Synchronously initialized from localStorage to prevent unauthenticated/flicker state on F5 reload
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('everimet_is_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [unauthScreen, setUnauthScreen] = useState<'landing' | 'login' | 'register' | 'public-qr'>('landing');
  const [publicCertId, setPublicCertId] = useState<string | undefined>(undefined);
  const [loginPrefillEmail, setLoginPrefillEmail] = useState('');
  const [loginPrefillRole, setLoginPrefillRole] = useState<UserRole | undefined>(undefined);

  const [userSession, setUserSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem('everimet_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) {
          if (parsed.role === 'admin') parsed.role = 'administrator';
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return {
      name: 'Director K. Srinivasan',
      role: 'administrator',
      identifier: 'admin@legalmetrology.gov.in',
      roleLabel: 'System Administrator'
    };
  });

  const [currentView, setCurrentView] = useState<NavigationView>(() => {
    try {
      const savedView = localStorage.getItem('everimet_current_view') as NavigationView;
      if (savedView) return savedView;
      const saved = localStorage.getItem('everimet_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        const role = parsed.role === 'admin' ? 'administrator' : parsed.role;
        if (role === 'administrator') return 'admin-command';
        if (role === 'owner' || role === 'business') return 'business-portal';
        if (role === 'officer') return 'lmo-portal';
      }
    } catch {
      // fallback
    }
    return 'admin-command';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Validate stored session & JWT token on startup, or route directly to Public QR if scanned via mobile
  useEffect(() => {
    // Check URL parameters or pathname for mobile QR code scans
    let isQrUrl = false;
    try {
      const path = window.location.pathname;
      if (path.startsWith('/verify/') || path.startsWith('/certificate/')) {
        const idFromPath = path.split('/')[2];
        if (idFromPath) setPublicCertId(decodeURIComponent(idFromPath));
        setUnauthScreen('public-qr');
        setCurrentView('public-qr');
        isQrUrl = true;
      }

      const params = new URLSearchParams(window.location.search);
      const certParam = params.get('cert');
      const viewParam = params.get('view');
      if (certParam || viewParam === 'public-qr') {
        if (certParam) setPublicCertId(certParam);
        setUnauthScreen('public-qr');
        setCurrentView('public-qr');
        isQrUrl = true;
      }
    } catch (e) {
      console.warn('URL search params / pathname read error:', e);
    }
    const storedAuth = localStorage.getItem('everimet_is_authenticated');
    const storedSessionStr = localStorage.getItem('everimet_user_session');
    const storedView = localStorage.getItem('everimet_current_view') as NavigationView;

    if (storedAuth === 'true' && storedSessionStr) {
      try {
        const parsedSession: UserSession = JSON.parse(storedSessionStr);
        if (parsedSession.role === ('admin' as any)) {
          parsedSession.role = 'administrator';
        }
        setUserSession(parsedSession);
        setIsAuthenticated(true);
        if (!isQrUrl) {
          if (storedView) {
            setCurrentView(storedView);
          } else {
            const role = parsedSession.role;
            const view: NavigationView =
              role === 'owner' || role === 'business'
                ? 'business-portal'
                : role === 'administrator' || (role as string) === 'admin'
                ? 'admin-command'
                : role === 'officer'
                ? 'lmo-portal'
                : 'public-qr';
            setCurrentView(view);
          }
        }
      } catch (e) {
        console.warn('Failed to restore stored user session:', e);
      }
    }

    apiClient
        .getMe()
        .then((res) => {
          if (res && res.success && res.userSession) {
            const serverRole = res.userSession.role === 'admin' ? 'administrator' : res.userSession.role;
            const normalizedSession: UserSession = {
              ...res.userSession,
              role: serverRole as UserRole
            };

            // Safeguard: Check if locally active session is administrator
            const localSessionStr = localStorage.getItem('everimet_user_session');
            let localRole = null;
            if (localSessionStr) {
              try {
                localRole = JSON.parse(localSessionStr).role;
              } catch {}
            }

            // If user is currently logged in as administrator and server token returns a non-administrator role,
            // do not override administrator session
            if ((localRole === 'administrator' || localRole === 'admin') && serverRole !== 'administrator') {
              console.warn('Prevented role downgrade on reload: keeping active administrator session');
              return;
            }

            setUserSession(normalizedSession);
            setIsAuthenticated(true);
            localStorage.setItem('everimet_is_authenticated', 'true');
            localStorage.setItem('everimet_user_session', JSON.stringify(normalizedSession));
            if (!isQrUrl) {
              const role = normalizedSession.role;
              const view: NavigationView =
                role === 'owner' || role === 'business'
                  ? 'business-portal'
                  : role === 'administrator' || (role as string) === 'admin'
                  ? 'admin-command'
                  : role === 'officer'
                  ? 'lmo-portal'
                  : 'public-qr';
              setCurrentView(view);
              localStorage.setItem('everimet_current_view', view);
            }
          }
        })
        .catch(() => {
          // Token expired or server unreachable - preserve stored session
        });
  }, []);

  // Modals state
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certModalDetails, setCertModalDetails] = useState<any>({});

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionModalDetails, setRejectionModalDetails] = useState<any>({});

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalDetails, setReportModalDetails] = useState<any>({});

  const [emergencyAuditOpen, setEmergencyAuditOpen] = useState(false);

  const [stakeholderModalOpen, setStakeholderModalOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderItem | null>(null);

  // Toast dispatch helper
  const showToast = (
    title: string,
    description: string,
    type: 'success' | 'warning' | 'info' | 'error' = 'info'
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Login Handler
  const handleLoginSuccess = (view: NavigationView, roleName: string, role: UserRole, sessionData?: UserSession) => {
    let normalizedRole: UserRole = role === ('admin' as any) ? 'administrator' : role;
    let finalSession: UserSession;
    if (sessionData && (sessionData.name || sessionData.identifier)) {
      finalSession = {
        ...sessionData,
        role: sessionData.role === ('admin' as any) ? 'administrator' : sessionData.role
      };
      normalizedRole = finalSession.role;
    } else {
      finalSession = {
        name: roleName,
        role: normalizedRole,
        identifier:
          normalizedRole === 'officer'
            ? 'officer.rajesh@legalmetrology.gov.in'
            : normalizedRole === 'owner'
            ? 'owner@apexscale.in'
            : normalizedRole === 'administrator'
            ? 'admin@legalmetrology.gov.in'
            : normalizedRole === 'business'
            ? 'owner@apexscale.in'
            : 'consumer@domain.in',
        roleLabel:
          normalizedRole === 'officer'
            ? 'Legal Metrology Officer'
            : normalizedRole === 'owner'
            ? 'Trader / Enterprise Owner'
            : normalizedRole === 'administrator'
            ? 'System Administrator'
            : normalizedRole === 'business'
            ? 'Trader / Enterprise Owner'
            : 'Citizen'
      };
    }

    const targetView: NavigationView =
      normalizedRole === 'administrator'
        ? 'admin-command'
        : normalizedRole === 'owner' || normalizedRole === 'business'
        ? 'business-portal'
        : normalizedRole === 'officer'
        ? 'lmo-portal'
        : view;

    setIsAuthenticated(true);
    setUserSession(finalSession);
    setCurrentView(targetView);

    // Save session in localStorage so refreshing/reloading the page (F5) keeps the user logged in
    localStorage.setItem('everimet_is_authenticated', 'true');
    localStorage.setItem('everimet_user_session', JSON.stringify(finalSession));
    localStorage.setItem('everimet_current_view', targetView);
  };

  // Logout Handler
  const handleLogout = () => {
    void apiClient.logout();
    localStorage.removeItem('everimet_is_authenticated');
    localStorage.removeItem('everimet_user_session');
    localStorage.removeItem('everimet_current_view');
    setIsAuthenticated(false);
    setUnauthScreen('landing');
    showToast(
      'Session Terminated',
      'You have been logged out and returned to the e-VeriMet landing page.',
      'info'
    );
  };

  // Certificate Issuance Trigger
  const handleOpenCertificate = (details: any) => {
    setCertModalDetails(details);
    setCertModalOpen(true);
    showToast(
      'Ed25519 Certificate Prepared',
      'Cryptographic signature verified. Statutory holographic seal generated.',
      'success'
    );
  };

  // Rejection Notice Trigger
  const handleOpenRejection = (details: any) => {
    setRejectionModalDetails(details);
    setRejectionModalOpen(true);
  };

  const handleConfirmRejection = async (docketId: string, reason: string) => {
    try {
      await apiClient.updateApplication(docketId, {
        status: 'FAIL',
        rejectionReason: reason
      });
    } catch (e) {
      console.warn('Could not update application status on backend:', e);
    }
    showToast(
      'Rejection Notice Served',
      `Statutory condemnation issued for Docket ${docketId} under Section 24(2).`,
      'error'
    );
  };

  // Report Tamper Trigger
  const handleOpenReport = (details: any) => {
    setReportModalDetails(details);
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (data: any) => {
    try {
      await apiClient.reportTamperOrGrievance({
        type: 'Seal Tampering',
        severity: 'High',
        entityName: data.establishment || 'Commercial Establishment',
        location: data.certNo ? `Cert: ${data.certNo}` : 'Retail Premises',
        zone: 'Western Suburbs Zone',
        details: `${data.complaintType}: ${data.description}`
      });
    } catch (e) {
      console.warn('Could not record alert on backend:', e);
    }
    showToast(
      'Complaint Logged with Directorate',
      `Grievance registered for ${data.establishment}. Enforcement team notified.`,
      'warning'
    );
  };

  // Emergency Audit Trigger
  const handleDispatchEmergencyAudit = async (zone: string, teamsCount: number) => {
    try {
      await apiClient.reportTamperOrGrievance({
        type: 'SLA Breach Threat',
        severity: 'Critical',
        entityName: `Surprise Enforcement Taskforce - ${zone}`,
        location: zone,
        zone: zone,
        status: 'Investigation Active',
        actionTaken: `${teamsCount} Enforcement teams deployed with M1 calibration standards`,
        details: `Emergency inspection sweep initiated by Directorate across ${zone}.`
      });
    } catch (e) {
      console.warn('Could not record emergency audit alert:', e);
    }
    showToast(
      'Emergency Taskforce Deployed',
      `${teamsCount} Enforcement teams dispatched with M1 calibration units to ${zone}.`,
      'warning'
    );
  };

  // Stakeholder Dossier Trigger
  const handleOpenStakeholder = (stakeholder: StakeholderItem) => {
    setSelectedStakeholder(stakeholder);
    setStakeholderModalOpen(true);
  };

  // Quick Action New Verification from sidebar
  const handleNewVerification = () => {
    setCurrentView('lmo-portal');
    showToast(
      'New Verification Initialized',
      'Drafting blank OIML R 76 inspection worksheet for NAWI instrument.',
      'info'
    );
  };

  // PRIORITY VIEW: If Public QR is requested via mobile scan, URL params, or navigation
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isPublicQrRequested = currentView === 'public-qr' || unauthScreen === 'public-qr' || urlParams?.get('view') === 'public-qr' || Boolean(urlParams?.get('cert'));

  if (isPublicQrRequested) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (isAuthenticated) {
                const role = userSession.role;
                const targetView: NavigationView =
                  role === 'owner' || role === 'business'
                    ? 'business-portal'
                    : role === 'administrator'
                    ? 'admin-command'
                    : 'lmo-portal';
                setCurrentView(targetView);
                setUnauthScreen('landing');
              } else {
                setUnauthScreen('landing');
                setCurrentView('public-qr');
              }
              if (window.history.pushState) {
                window.history.pushState({}, '', window.location.pathname);
              }
            }}
            className="px-4 py-2 rounded-xl bg-white border border-[#d8e4f1] text-[#0c2340] hover:bg-slate-50 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            ← {isAuthenticated ? 'Return to Dashboard' : 'Back to Home'}
          </button>

          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <button
                onClick={() => setUnauthScreen('login')}
                className="px-4 py-2 rounded-xl bg-[#0c2340] text-white hover:bg-[#16a34a] text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Officer / Admin Sign In
              </button>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                Logged in as {userSession.name}
              </span>
            )}
          </div>
        </div>

        <PublicQRVerification
          showToast={showToast}
          onOpenReportModal={handleOpenReport}
          onPrintCertificate={handleOpenCertificate}
          initialCertId={publicCertId || urlParams?.get('cert') || ''}
          onNavigateHome={() => {
            if (isAuthenticated) {
              const role = userSession.role;
              setCurrentView(
                role === 'owner' || role === 'business'
                  ? 'business-portal'
                  : role === 'administrator'
                  ? 'admin-command'
                  : 'lmo-portal'
              );
            } else {
              setUnauthScreen('landing');
            }
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    );
  }

  // IF NOT AUTHENTICATED: Display Landing Page as first screen; or Login / Registration
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f9ff]">
        {unauthScreen === 'landing' ? (
          <LandingPage
            onOpenLogin={() => setUnauthScreen('login')}
            onOpenRegister={() => setUnauthScreen('register')}
          />
        ) : unauthScreen === 'register' ? (
          <Registration
            onNavigateToLogin={() => setUnauthScreen('login')}
            onNavigateToHome={() => setUnauthScreen('landing')}
            onRegisterSuccess={(data) => {
              showToast(
                'Registration Complete',
                `Account registered for ${data.name}. You can now login with your credentials.`,
                'success'
              );
              setLoginPrefillEmail(data.email || '');
              setLoginPrefillRole(data.role as UserRole);
              setUnauthScreen('login');
            }}
            showToast={showToast}
          />
        ) : (
          <LoginGateway
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setUnauthScreen('register')}
            onNavigateToHome={() => setUnauthScreen('landing')}
            initialEmail={loginPrefillEmail}
            initialRole={loginPrefillRole}
            showToast={showToast}
          />
        )}
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    );
  }

  // IF AUTHENTICATED AS ADMINISTRATOR: Display the dedicated Administrator Page completely based on the new file
  if (userSession.role === 'administrator' || (userSession.role as string) === 'admin') {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#eef2f7] via-[#f7f9fb] to-[#e8eef5]">
        <AdminDashboard
          userSession={userSession}
          onLogout={handleLogout}
          showToast={showToast}
        />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    );
  }

  // IF AUTHENTICATED AS OWNER: Display the dedicated Owner Page with the same design as the Login page
  if (userSession.role === 'owner' || userSession.role === 'business') {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#f0f4f9] via-[#f7f9ff] to-[#edf3fa]">
        <OwnerDashboard
          userSession={userSession}
          onLogout={handleLogout}
          showToast={showToast}
        />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    );
  }

  const renderedView = currentView as NavigationView;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#eef2f7] via-[#f7f9fb] to-[#e8eef5] flex flex-col selection:bg-[#ccfbf1] selection:text-[#134e4a]">
      {/* Top Main Navigation Header */}
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onEmergencyAudit={() => setEmergencyAuditOpen(true)}
        userSession={userSession}
        onLogout={handleLogout}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex">
        {/* Collapsible Left Sidebar (Desktop fixed 280px, mobile slide-over) */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewVerification={handleNewVerification}
          userSession={userSession}
          onLogout={handleLogout}
        />

        {/* Primary Content Viewport */}
        <main className="flex-1 min-w-0 lg:pl-[280px] p-4 sm:p-6 md:p-8 max-w-[1440px] mx-auto w-full pb-10">
          {/* Quick Breadcrumbs / Screen Subheader */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#cbd5e1]">
            <div className="flex items-center gap-2 text-xs text-[#4e6073]">
              <span className="font-semibold text-[#121d26]">National Metrology Portal</span>
              <span>/</span>
              <span className="capitalize font-bold text-[#16a34a]">
                {renderedView === 'lmo-portal'
                  ? 'Field Inspection & Verification Protocol'
                  : renderedView === 'admin-command'
                  ? 'Directorate Command Center & TSP Routing'
                  : renderedView === 'public-qr'
                  ? 'Public QR Authenticator & Citizen Grievance'
                  : 'Trader & Importer Workspace'}
              </span>
            </div>

            {/* Active Role Badge */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] text-[#4e6073]">Session:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#edf7f6] text-[#0f766e] border border-[#bfe3df] text-[11px] font-bold">
                {userSession.roleLabel}
              </span>
            </div>
          </div>

          {/* Active Screen Rendering */}
          {renderedView === 'lmo-portal' && (
            <LMOInspectionPortal
              userSession={userSession}
              onIssueCertificate={handleOpenCertificate}
              onIssueRejection={handleOpenRejection}
              showToast={showToast}
            />
          )}

          {renderedView === 'admin-command' && (
            <AdminCommandCenter
              showToast={showToast}
              onEmergencyAudit={() => setEmergencyAuditOpen(true)}
              onOpenStakeholder={handleOpenStakeholder}
            />
          )}

          {renderedView === 'public-qr' && (
            <PublicQRVerification
              showToast={showToast}
              onOpenReportModal={handleOpenReport}
              onPrintCertificate={handleOpenCertificate}
            />
          )}

          {renderedView === 'business-portal' && (
            <BusinessDashboard
              showToast={showToast}
              onOpenCertificate={handleOpenCertificate}
            />
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        details={certModalDetails}
        onNavigateToPublicVerification={(certId) => {
          setCertModalOpen(false);
          setCurrentView('public-qr');
        }}
      />

      <RejectionNoticeModal
        isOpen={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        details={rejectionModalDetails}
        onConfirmRejection={handleConfirmRejection}
      />

      <ReportTamperModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        details={reportModalDetails}
        onSubmitReport={handleSubmitReport}
      />

      <EmergencyAuditModal
        isOpen={emergencyAuditOpen}
        onClose={() => setEmergencyAuditOpen(false)}
        onDispatch={handleDispatchEmergencyAudit}
      />

      <StakeholderDetailModal
        isOpen={stakeholderModalOpen}
        onClose={() => setStakeholderModalOpen(false)}
        stakeholder={selectedStakeholder}
        onApprove={async (id) => {
          try {
            await apiClient.updateStakeholderStatus(id, 'Active');
          } catch (e) {
            console.warn('Could not approve stakeholder on backend:', e);
          }
          showToast('License Approved', `Stakeholder license renewed until 2025.`, 'success');
        }}
        onFlag={async (id) => {
          try {
            await apiClient.updateStakeholderStatus(id, 'Notice Issued');
          } catch (e) {
            console.warn('Could not flag stakeholder on backend:', e);
          }
          showToast('Flagged for Audit', `Stakeholder docket flagged for surprise inspection.`, 'warning');
        }}
      />

      {/* Floating System Toasts */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
