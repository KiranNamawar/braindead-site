import React from 'react';
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
import HomePage from './pages/HomePage';
import CalculatorPage from './pages/CalculatorPage';
import ColorPickerPage from './pages/ColorPickerPage';
import QRGeneratorPage from './pages/QRGeneratorPage';
import TextToolsPage from './pages/TextToolsPage';
import PasswordGeneratorPage from './pages/PasswordGeneratorPage';
import HashGeneratorPage from './pages/HashGeneratorPage';
import ImageOptimizerPage from './pages/ImageOptimizerPage';
import TimestampConverterPage from './pages/TimestampConverterPage';
import JSONFormatterPage from './pages/JSONFormatterPage';
import RandomGeneratorPage from './pages/RandomGeneratorPage';
import UnitConverterPage from './pages/UnitConverterPage';
import TipCalculatorPage from './pages/TipCalculatorPage';
import AgeCalculatorPage from './pages/AgeCalculatorPage';
import BMICalculatorPage from './pages/BMICalculatorPage';
import LoanCalculatorPage from './pages/LoanCalculatorPage';
import PercentageCalculatorPage from './pages/PercentageCalculatorPage';
import GradeCalculatorPage from './pages/GradeCalculatorPage';
import WordCounterPage from './pages/WordCounterPage';
import TextCaseConverterPage from './pages/TextCaseConverterPage';
import LoremIpsumPage from './pages/LoremIpsumPage';
import DiffCheckerPage from './pages/DiffCheckerPage';
import TextSummarizerPage from './pages/TextSummarizerPage';
import GradientGeneratorPage from './pages/GradientGeneratorPage';
import ASCIIArtGeneratorPage from './pages/ASCIIArtGeneratorPage';
import FaviconGeneratorPage from './pages/FaviconGeneratorPage';
import PomodoroTimerPage from './pages/PomodoroTimerPage';
import WorldClockPage from './pages/WorldClockPage';
import StopwatchTimerPage from './pages/StopwatchTimerPage';
import CountdownTimerPage from './pages/CountdownTimerPage';
import Base64EncoderPage from './pages/Base64EncoderPage';
import URLEncoderPage from './pages/URLEncoderPage';
import MarkdownEditorPage from './pages/MarkdownEditorPage';
import UUIDGeneratorPage from './pages/UUIDGeneratorPage';
import JWTDecoderPage from './pages/JWTDecoderPage';
import NumberConverterPage from './pages/NumberConverterPage';
import RomanNumeralPage from './pages/RomanNumeralPage';
import Layout from './components/Layout';
import SEOHead from './components/SEOHead';

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
                <Routes>
                  <Route path="/" element={<HomePage />} />
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
                  <Route path="/tip-calculator" element={<TipCalculatorPage />} />
                  <Route path="/age-calculator" element={<AgeCalculatorPage />} />
                  <Route path="/bmi-calculator" element={<BMICalculatorPage />} />
                  <Route path="/loan-calculator" element={<LoanCalculatorPage />} />
                  <Route path="/percentage-calculator" element={<PercentageCalculatorPage />} />
                  <Route path="/grade-calculator" element={<GradeCalculatorPage />} />
                  <Route path="/word-counter" element={<WordCounterPage />} />
                  <Route path="/text-case-converter" element={<TextCaseConverterPage />} />
                  <Route path="/lorem-ipsum" element={<LoremIpsumPage />} />
                  <Route path="/diff-checker" element={<DiffCheckerPage />} />
                  <Route path="/text-summarizer" element={<TextSummarizerPage />} />
                  <Route path="/gradient-generator" element={<GradientGeneratorPage />} />
                  <Route path="/ascii-art-generator" element={<ASCIIArtGeneratorPage />} />
                  <Route path="/favicon-generator" element={<FaviconGeneratorPage />} />
                  <Route path="/pomodoro-timer" element={<PomodoroTimerPage />} />
                  <Route path="/world-clock" element={<WorldClockPage />} />
                  <Route path="/stopwatch-timer" element={<StopwatchTimerPage />} />
                  <Route path="/countdown-timer" element={<CountdownTimerPage />} />
                  <Route path="/base64-encoder" element={<Base64EncoderPage />} />
                  <Route path="/url-encoder" element={<URLEncoderPage />} />
                  <Route path="/markdown-editor" element={<MarkdownEditorPage />} />
                  <Route path="/uuid-generator" element={<UUIDGeneratorPage />} />
                  <Route path="/jwt-decoder" element={<JWTDecoderPage />} />
                  <Route path="/number-converter" element={<NumberConverterPage />} />
                  <Route path="/roman-numeral" element={<RomanNumeralPage />} />
                </Routes>
              </Layout>
              {/* PWA Components */}
              <OfflineIndicator />
              <PWAInstallPrompt />
              <PWAUpdateNotification />
            </Router>
          </AccessibilityEnhancements>
        </ToastProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;