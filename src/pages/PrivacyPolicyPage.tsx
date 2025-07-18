import React from 'react';
import { Shield, Lock, Eye, Database, Download, Trash2 } from 'lucide-react';
import BackButton from '../components/BackButton';
import SEOHead from '../components/SEOHead';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="Privacy Policy"
        description="Learn how BrainDead.site protects your privacy with local-only data storage, no tracking, and complete transparency."
        canonical="/privacy-policy"
      />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          We take your privacy seriously. Here's exactly how we handle your data.
          <span className="text-blue-400"> Spoiler: We don't collect it!</span>
        </p>
      </div>

      {/* Quick Summary */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">TL;DR - The Good Stuff</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <Lock className="w-6 h-6 text-green-400 mt-1" />
            <div>
              <h3 className="text-green-400 font-semibold mb-1">Local Only</h3>
              <p className="text-gray-300 text-sm">All your data stays on your device. We literally can't access it.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Eye className="w-6 h-6 text-blue-400 mt-1" />
            <div>
              <h3 className="text-blue-400 font-semibold mb-1">No Tracking</h3>
              <p className="text-gray-300 text-sm">No cookies, no analytics, no creepy behavior tracking.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Database className="w-6 h-6 text-purple-400 mt-1" />
            <div>
              <h3 className="text-purple-400 font-semibold mb-1">No Servers</h3>
              <p className="text-gray-300 text-sm">We don't have databases to store your info. Problem solved.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Download className="w-6 h-6 text-orange-400 mt-1" />
            <div>
              <h3 className="text-orange-400 font-semibold mb-1">Your Data</h3>
              <p className="text-gray-300 text-sm">Export or delete everything anytime. No questions asked.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Policy */}
      <div className="space-y-12">
        {/* Data Collection */}
        <section className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">What Data We Collect</h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-2">The Honest Answer: Almost Nothing</h3>
              <p className="text-gray-300 mb-4">
                Unlike every other website on the internet, we don't collect your personal information. Here's what we might store locally on your device:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>Tool Preferences:</strong> Your favorite tools and recent usage (if you enable it)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>Settings:</strong> Theme preferences, privacy choices</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>Usage Stats:</strong> Anonymous tool usage for improving the app (optional)</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h3 className="text-red-400 font-semibold mb-2">What We DON'T Collect</h3>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>❌ Your name, email, or any personal info</li>
                <li>❌ IP addresses or location data</li>
                <li>❌ Browsing history or behavior tracking</li>
                <li>❌ The content you process in our tools</li>
                <li>❌ Device fingerprinting or unique identifiers</li>
                <li>❌ Social media profiles or third-party data</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Data */}
        <section className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">How We Use Your Data</h2>
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <h3 className="text-green-400 font-semibold mb-2">Local Storage Only</h3>
              <p className="text-gray-300">
                Any data we store stays in your browser's local storage. It never leaves your device. 
                We can't see it, access it, or do anything with it. It's encrypted and only you have the key.
              </p>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h3 className="text-blue-400 font-semibold mb-2">Improving Your Experience</h3>
              <p className="text-gray-300">
                If you enable analytics, we track anonymous usage patterns locally to improve the app. 
                This data never leaves your browser and contains no personal information.
              </p>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Data Sharing</h2>
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <h3 className="text-3xl font-bold text-white mb-2">We Don't Share Data</h3>
            <p className="text-gray-300 text-lg mb-4">Period. End of story. Nothing to share.</p>
            <p className="text-gray-400 text-sm">
              Since we don't collect your data, we can't share it with advertisers, data brokers, 
              government agencies, or anyone else. It's physically impossible.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Cookies & Tracking</h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">No Tracking Cookies</h3>
              <p className="text-gray-300">
                We don't use tracking cookies, analytics cookies, or any third-party cookies. 
                The only "cookies" we might use are essential ones for basic functionality (like remembering your preferences).
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">No Third-Party Scripts</h3>
              <p className="text-gray-300">
                No Google Analytics, Facebook Pixel, or other tracking scripts. 
                The only external resources we load are fonts and essential libraries.
              </p>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Your Rights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Download className="w-5 h-5 text-blue-400" />
                <h3 className="text-blue-400 font-semibold">Export Your Data</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Download all your locally stored data in a standard JSON format anytime.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                <h3 className="text-red-400 font-semibold">Delete Everything</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Permanently delete all your data with one click. No questions, no retention periods.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="w-5 h-5 text-green-400" />
                <h3 className="text-green-400 font-semibold">Full Transparency</h3>
              </div>
              <p className="text-gray-300 text-sm">
                See exactly what data is stored and how it's used through our privacy dashboard.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <h3 className="text-purple-400 font-semibold">Control Everything</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Enable or disable any data storage feature. Your device, your rules.
              </p>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Security</h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">Local Encryption</h3>
              <p className="text-gray-300">
                All data stored locally is encrypted using AES encryption. Even if someone gains access to your browser storage, 
                they can't read your data without the encryption key.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">Input Sanitization</h3>
              <p className="text-gray-300">
                All user inputs are sanitized to prevent XSS attacks and other security vulnerabilities. 
                Your safety is our priority.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">No Data Breaches</h3>
              <p className="text-gray-300">
                Since we don't store your data on our servers, there's nothing to breach. 
                Your data can't be stolen from us because we don't have it.
              </p>
            </div>
          </div>
        </section>

        {/* Changes to Policy */}
        <section className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Changes to This Policy</h2>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-300 mb-4">
              If we ever change this privacy policy, we'll update this page and notify users through the app. 
              But honestly, since we don't collect data, there's not much to change.
            </p>
            <p className="text-gray-400 text-sm">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Questions?</h2>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-300 mb-4">
              If you have questions about this privacy policy or how we handle data, 
              you can check our open-source code or reach out through our contact page.
            </p>
            <p className="text-gray-400 text-sm">
              Remember: We literally can't see your data, so we can't answer questions about what specific data you have stored. 
              Use the privacy dashboard to see that information.
            </p>
          </div>
        </section>
      </div>

      {/* Footer CTA */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-2">Privacy-First Tools</h3>
          <p className="text-gray-300 mb-4">
            Ready to use tools that actually respect your privacy?
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            Start Using Tools
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;