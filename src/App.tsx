import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { trackPageView } from './utils/analytics';
import { info } from './utils/logger';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastContainer';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import PWAUpdateNotification from './components/PWAUpdateNotification';
import AccessibilityEnhancements from './components/shared/AccessibilityEnhancements';
import PrivacyNotice from './components/PrivacyNotice';
import PrivacyDashboard from './components/PrivacyDashboard';
import PrivacyIndicator from './components/PrivacyIndicator';
import Layout from './components/Layout';
import SEOHead from './components/SEOHead';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Lazy load HomePage and PrivacyPolicyPage (critical pages)
import HomePage from './pages/HomePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

// Lazy load all tool pages for optimal code splitting
const CalculatorPage = React.lazy(() => import('./pages/CalculatorPage'));
const ColorPickerPage = React.lazy(() => import('./pages/ColorPickerPage'));
const QRGeneratorPage = React.lazy(() => import('./pages/QRGeneratorPage'));
const TextToolsPage = React.lazy(() => import('./pages/TextToolsPage'));
const PasswordGeneratorPage = React.lazy(() => import('./pages/PasswordGeneratorPage'));
const HashGeneratorPage = React.lazy(() => import('./pages/HashGeneratorPage'));
const ImageOptimizerPage = React.lazy(() => import('./pages/ImageOptimizerPage'));
const TimestampConverterPage = React.lazy(() => import('./pages/TimestampConverterPage'));
const JSONFormatterPage = React.lazy(() => import('./pages/JSONFormatterPage'));
const RandomGeneratorPage = React.lazy(() => import('./pages/RandomGeneratorPage'));
const UnitConverterPage = React.lazy(() => import('./pages/UnitConverterPage'));

// Everyday Life Tools
const TipCalculatorPage = React.lazy(() => import('./pages/TipCalculatorPage'));
const AgeCalculatorPage = React.lazy(() => import('./pages/AgeCalculatorPage'));
const BMICalculatorPage = React.lazy(() => import('./pages/BMICalculatorPage'));
const LoanCalculatorPage = React.lazy(() => import('./pages/LoanCalculatorPage'));
const PercentageCalculatorPage = React.lazy(() => import('./pages/PercentageCalculatorPage'));
const GradeCalculatorPage = React.lazy(() => import('./pages/GradeCalculatorPage'));

// Text & Writing Tools
const WordCounterPage = React.lazy(() => import('./pages/WordCounterPage'));
const TextCaseConverterPage = React.lazy(() => import('./pages/TextCaseConverterPage'));
const LoremIpsumPage = React.lazy(() => import('./pages/LoremIpsumPage'));
const DiffCheckerPage = React.lazy(() => import('./pages/DiffCheckerPage'));
const TextSummarizerPage = React.lazy(() => import('./pages/TextSummarizerPage'));

// Creative & Design Tools
const GradientGeneratorPage = React.lazy(() => import('./pages/GradientGeneratorPage'));
const ASCIIArtGeneratorPage = React.lazy(() => import('./pages/ASCIIArtGeneratorPage'));
const FaviconGeneratorPage = React.lazy(() => import('./pages/FaviconGeneratorPage'));

// Time & Productivity Tools
const PomodoroTimerPage = React.lazy(() => import('./pages/PomodoroTimerPage'));
const WorldClockPage = React.lazy(() => import('./pages/WorldClockPage'));
const StopwatchTimerPage = React.lazy(() => import('./pages/StopwatchTimerPage'));
const CountdownTimerPage = React.lazy(() => import('./pages/CountdownTimerPage'));

// Developer Tools
const Base64EncoderPage = React.lazy(() => import('./pages/Base64EncoderPage'));
const URLEncoderPage = React.lazy(() => import('./pages/URLEncoderPage'));
const MarkdownEditorPage = React.lazy(() => import('./pages/MarkdownEditorPage'));
const UUIDGeneratorPage = React.lazy(() => import('./pages/UUIDGeneratorPage'));
const JWTDecoderPage = React.lazy(() => import('./pages/JWTDecoderPage'));

// Number & Conversion Tools
const NumberConverterPage = React.lazy(() => import('./pages/NumberConverterPage'));
const RomanNumeralPage = React.lazy(() => import('./pages/RomanNumeralPage'));

// Scroll to top component
const ScrollToTop: React.FC = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(location.pathname);
    info('Page navigation', { path: location.pathname });
  }, [location.pathname]);
  
  return null;
};

function App() {
  const [isPrivacyDashboardOpen, setIsPrivacyDashboardOpen] = useState(false);

  React.useEffect(() => {
    info('Application started', { 
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.MODE 
    });
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ToastProvider>
          <AccessibilityEnhancements>
            <Router>
              <ScrollToTop />
              <Layout>
                <SEOHead />
                <Suspense fallback={<LoadingSpinner size="lg" message="Loading tool..." />}>
                  <Routes>
                    {/* Critical pages - not lazy loaded */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    
                    {/* Core Tools - lazy loaded */}
                    <Route path="/calculator" element={<CalculatorPage />} />
                    <Route path="/color-picker" element={<ColorPickerPage />} />
                    <Route path="/qr-generator" element={<QRGeneratorPage />} />
                    <Route path="/text-tools" element={<TextToolsPage />} />
                    <Route path="/password-generator" element={<PasswordGeneratorPage />} />
                    <Route path="/hash-generator" element={<HashGeneratorPage />} />
                    <Route path="/image-optimizer" element={<ImageOptimizerPage />} />
                    <Route path="/timestamp-converter" element={<TimestampConverterPage />} />
                    <Route path="/json-formatter" element={<JSONFormatterPage />} />
                    <Route path="/random-generator" element={<RandomGeneratorPage />} />
                    <Route path="/unit-converter" element={<UnitConverterPage />} />
                    
                    {/* Everyday Life Tools */}
                    <Route path="/tip-calculator" element={<TipCalculatorPage />} />
                    <Route path="/age-calculator" element={<AgeCalculatorPage />} />
                    <Route path="/bmi-calculator" element={<BMICalculatorPage />} />
                    <Route path="/loan-calculator" element={<LoanCalculatorPage />} />
                    <Route path="/percentage-calculator" element={<PercentageCalculatorPage />} />
                    <Route path="/grade-calculator" element={<GradeCalculatorPage />} />
                    
                    {/* Text & Writing Tools */}
                    <Route path="/word-counter" element={<WordCounterPage />} />
                    <Route path="/text-case-converter" element={<TextCaseConverterPage />} />
                    <Route path="/lorem-ipsum" element={<LoremIpsumPage />} />
                    <Route path="/diff-checker" element={<DiffCheckerPage />} />
                    <Route path="/text-summarizer" element={<TextSummarizerPage />} />
                    
                    {/* Creative & Design Tools */}
                    <Route path="/gradient-generator" element={<GradientGeneratorPage />} />
                    <Route path="/ascii-art-generator" element={<ASCIIArtGeneratorPage />} />
                    <Route path="/favicon-generator" element={<FaviconGeneratorPage />} />
                    
                    {/* Time & Productivity Tools */}
                    <Route path="/pomodoro-timer" element={<PomodoroTimerPage />} />
                    <Route path="/world-clock" element={<WorldClockPage />} />
                    <Route path="/stopwatch-timer" element={<StopwatchTimerPage />} />
                    <Route path="/countdown-timer" element={<CountdownTimerPage />} />
                    
                    {/* Developer Tools */}
                    <Route path="/base64-encoder" element={<Base64EncoderPage />} />
                    <Route path="/url-encoder" element={<URLEncoderPage />} />
                    <Route path="/markdown-editor" element={<MarkdownEditorPage />} />
                    <Route path="/uuid-generator" element={<UUIDGeneratorPage />} />
                    <Route path="/jwt-decoder" element={<JWTDecoderPage />} />
                    
                    {/* Number & Conversion Tools */}
                    <Route path="/number-converter" element={<NumberConverterPage />} />
                    <Route path="/roman-numeral" element={<RomanNumeralPage />} />
                  </Routes>
                </Suspense>
              </Layout>
              {/* PWA Components */}
              <OfflineIndicator />
              <PWAInstallPrompt />
              <PWAUpdateNotification />
              
              {/* Privacy Components */}
              <PrivacyNotice onOpenDashboard={() => setIsPrivacyDashboardOpen(true)} />
              <PrivacyIndicator onOpenDashboard={() => setIsPrivacyDashboardOpen(true)} />
              <PrivacyDashboard 
                isOpen={isPrivacyDashboardOpen} 
                onClose={() => setIsPrivacyDashboardOpen(false)} 
              />
            </Router>
          </AccessibilityEnhancements>
        </ToastProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;