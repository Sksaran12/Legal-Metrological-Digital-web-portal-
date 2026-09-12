import React, { useState } from 'react';
import { Header } from '../../common/Header';
import { GazetteTicker } from '../../common/GazetteTicker';
import { VerificationHub } from '../lmo/VerificationHub';
import { ServicesSection } from '../../common/ServicesSection';
import { ProcessSection } from '../../common/ProcessSection';
import { GrievanceSection } from '../../common/GrievanceSection';
import { Footer } from '../../common/Footer';
import { GrievanceModal } from '../../modals/GrievanceModal';
import { CertificateModal } from '../../modals/CertificateModal';
import { AboutScreen } from './AboutScreen';
import { ServicesScreen } from './ServicesScreen';
import { VerificationProcessScreen } from './VerificationProcessScreen';
import { ContactScreen } from './ContactScreen';
import { ActiveScreen, VerificationRecord } from '../../../types';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister
}) => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [fontScale, setFontScale] = useState<number>(1);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Modal dialog states
  const [isGrievanceOpen, setIsGrievanceOpen] = useState(false);
  const [selectedRecordForCert, setSelectedRecordForCert] = useState<VerificationRecord | null>(null);

  const handleVerifyScroll = () => {
    if (activeScreen !== 'home') {
      setActiveScreen('home');
      setTimeout(() => {
        document.getElementById('verification-hub')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('verification-hub')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-linear-to-br from-[#eef2f7] via-[#f7f9fb] to-[#e8eef5] text-[#0b1c30] antialiased"
      style={{ fontSize: `${fontScale * 100}%` }}
    >
      {/* Institutional Top Header with Register & Login */}
      <Header
        activeScreen={activeScreen}
        onNavigate={(screen) => {
          setActiveScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onVerifyScroll={handleVerifyScroll}
        fontScale={fontScale}
        setFontScale={setFontScale}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Statutory Notifications Gazette Bar */}
        <GazetteTicker />

        {/* Dynamic Screen Rendering */}
        {activeScreen === 'home' && (
          <div className="space-y-6">
            {/* Flagship Hero: Statutory Verification Command Hub */}
            <VerificationHub
              onViewCertificate={(record) => setSelectedRecordForCert(record)}
              onOpenLogin={onOpenLogin}
              onOpenRegister={onOpenRegister}
            />

            {/* Core Statutory Online Services Cards */}
            <ServicesSection
              onSelectService={() => {
                setActiveScreen('services-and-licenses');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenLogin={onOpenLogin}
              onOpenRegister={onOpenRegister}
            />

            {/* Standard 4-Step Verification Process */}
            <ProcessSection />

            {/* Consumer Grievance & Helpdesk Bar */}
            <GrievanceSection
              onOpenGrievance={() => setIsGrievanceOpen(true)}
            />
          </div>
        )}

        {activeScreen === 'about-legal-metrology' && <AboutScreen />}

        {activeScreen === 'services-and-licenses' && (
          <ServicesScreen onOpenRegister={onOpenRegister} />
        )}

        {activeScreen === 'verification-process' && <VerificationProcessScreen />}

        {activeScreen === 'contact-and-helpdesk' && (
          <ContactScreen onOpenGrievance={() => setIsGrievanceOpen(true)} />
        )}
      </main>

      {/* Official Government of India Footer */}
      <Footer onOpenHelpdesk={() => setActiveScreen('contact-and-helpdesk')} />

      {/* Grievance Modal */}
      {isGrievanceOpen && (
        <GrievanceModal onClose={() => setIsGrievanceOpen(false)} />
      )}

      {/* Official Certificate Form VII Modal */}
      {selectedRecordForCert && (
        <CertificateModal
          record={selectedRecordForCert}
          onClose={() => setSelectedRecordForCert(null)}
        />
      )}
    </div>
  );
};
