import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Zap, 
  Heart, 
  Clock, 
  Eye, 
  DollarSign, 
  Mail, 
  Lock, 
  Wifi, 
  Star,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react';

const EnhancedFeaturesSection: React.FC = () => {
  const [animatedStats, setAnimatedStats] = useState({
    emailsNotCollected: 0,
    loginPromptsShown: 0,
    premiumUpsells: 0,
    dataSoldToAdvertisers: 0,
    subscriptionFeesAvoided: 0,
    timeSavedFromSignups: 0
  });

  useEffect(() => {
    // Animate the stats on mount
    const timer = setTimeout(() => {
      setAnimatedStats({
        emailsNotCollected: 999999,
        loginPromptsShown: 0,
        premiumUpsells: 0,
        dataSoldToAdvertisers: 0,
        subscriptionFeesAvoided: 999,
        timeSavedFromSignups: 47
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "No Login Wall",
      description: "Revolutionary concept: tools that work immediately",
      sarcasticNote: "Shocking, we know. No email, no password, no 'verify your account' nonsense.",
      gradient: "from-green-500 to-emerald-600",
      comparison: { us: "Works instantly", others: "Please create an account first" }
    },
    {
      icon: Eye,
      title: "Zero Email Harvesting",
      description: "We don't want your email. Shocking, right?",
      sarcasticNote: "Your inbox is safe from our 'newsletters' about productivity tips you didn't ask for.",
      gradient: "from-blue-500 to-cyan-600",
      comparison: { us: "No emails collected", others: "Enter email to continue" }
    },
    {
      icon: DollarSign,
      title: "Actually Free",
      description: "No hidden premium tiers or 'pro' versions",
      sarcasticNote: "Everything works. No 'upgrade to premium' popups every 5 seconds.",
      gradient: "from-purple-500 to-pink-600",
      comparison: { us: "100% free forever", others: "Free trial, then $9.99/month" }
    },
    {
      icon: Lock,
      title: "Privacy Respected",
      description: "Your data doesn't fund our yacht collection",
      sarcasticNote: "We store your preferences locally. Wild concept in 2024.",
      gradient: "from-orange-500 to-red-600",
      comparison: { us: "Data stays on your device", others: "We share data with 847 partners" }
    },
    {
      icon: Sparkles,
      title: "No Ads",
      description: "Clean interface without popup cancer",
      sarcasticNote: "No 'hot singles in your area' while you're calculating tips.",
      gradient: "from-yellow-500 to-orange-600",
      comparison: { us: "Ad-free experience", others: "Skip ad in 5... 4... 3..." }
    },
    {
      icon: Wifi,
      title: "Works Offline",
      description: "Because the internet isn't always reliable",
      sarcasticNote: "Your productivity doesn't depend on your WiFi having an existential crisis.",
      gradient: "from-indigo-500 to-purple-600",
      comparison: { us: "Works without internet", others: "Please check your connection" }
    }
  ];

  const sarcasticStats = [
    {
      value: "∞",
      label: "Emails NOT Collected",
      description: "We're terrible at email marketing",
      icon: Mail,
      color: "text-green-400"
    },
    {
      value: "0",
      label: "Login Prompts Shown",
      description: "Revolutionary, we know",
      icon: Lock,
      color: "text-blue-400"
    },
    {
      value: "0",
      label: "Premium Upsells",
      description: "Still zero, somehow",
      icon: DollarSign,
      color: "text-purple-400"
    },
    {
      value: "None",
      label: "Data Sold to Advertisers",
      description: "Weird business model, right?",
      icon: Shield,
      color: "text-orange-400"
    },
    {
      value: "$∞/mo",
      label: "Subscription Fees Avoided",
      description: "Your wallet thanks you",
      icon: Heart,
      color: "text-pink-400"
    },
    {
      value: "47 years",
      label: "Time Saved from Signups",
      description: "Rough estimate",
      icon: Clock,
      color: "text-cyan-400"
    }
  ];

  return (
    <section className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">BrainDead.site</span>?
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Because thinking is overrated, privacy matters, and subscription fatigue is real. 
            Here's what makes us different (spoiler: we actually respect you).
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-500 hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 mb-3">{feature.description}</p>
              
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4 border-l-4 border-gradient-to-b from-blue-500 to-purple-600">
                <p className="text-gray-300 text-sm italic">"{feature.sarcasticNote}"</p>
              </div>

              {/* Comparison */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">Us:</span>
                  <span className="text-gray-300">{feature.comparison.us}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">Others:</span>
                  <span className="text-gray-400">{feature.comparison.others}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sarcastic Stats Section */}
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">
              Our <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Terrible</span> Business Metrics
            </h3>
            <p className="text-gray-400 text-lg">
              We're really bad at the whole "monetize users" thing. Here's proof:
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {sarcasticStats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center group animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="mb-3">
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                  <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm font-medium mb-1">
                    {stat.label}
                  </div>
                  <div className="text-gray-500 text-xs italic">
                    {stat.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm italic">
              * These metrics would make any VC cry, but they make us proud
            </p>
          </div>
        </div>

        {/* Anti-Corporate Manifesto */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Our <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Anti-Corporate</span> Promise
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white mb-3">What we WON'T do:</h4>
                <div className="space-y-2">
                  {[
                    "Ask for your email to 'send you updates'",
                    "Show you ads for productivity courses",
                    "Limit features unless you upgrade",
                    "Track you across the internet",
                    "Send push notifications about engagement",
                    "Make you watch ads to use basic features"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white mb-3">What we WILL do:</h4>
                <div className="space-y-2">
                  {[
                    "Make tools that actually work",
                    "Respect your privacy like it's 1995",
                    "Keep everything free forever",
                    "Store your data locally (revolutionary!)",
                    "Focus on utility over engagement",
                    "Treat you like a human, not a product"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <p className="text-gray-400 text-lg italic">
                "In a world of subscription fatigue and privacy invasion, we choose to be boringly ethical."
              </p>
              <p className="text-gray-500 text-sm mt-2">
                - The BrainDead.site Team (probably eating ramen while writing this)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedFeaturesSection;