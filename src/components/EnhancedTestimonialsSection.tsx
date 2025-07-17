import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles, Heart, Zap } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  sarcasticNote: string;
  rating: number;
  category: 'developer' | 'designer' | 'student' | 'professional' | 'entrepreneur';
  toolsUsed: string[];
  timeSaved: string;
  favoriteFeature: string;
}

const EnhancedTestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Senior Developer',
      company: 'TechCorp',
      avatar: 'SC',
      content: 'Finally, a calculator that doesn\'t judge me for not knowing what 7 × 8 equals. My productivity has increased by 420%!',
      sarcasticNote: 'Yes, she actually calculated the percentage increase. With our calculator.',
      rating: 5,
      category: 'developer',
      toolsUsed: ['Calculator', 'JSON Formatter', 'Base64 Encoder'],
      timeSaved: '2 hours/week',
      favoriteFeature: 'No login required'
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      role: 'UI/UX Designer',
      company: 'DesignStudio',
      avatar: 'MR',
      content: 'The color picker saved my career. I no longer have to explain to clients what "slightly off-white" means in hex code.',
      sarcasticNote: 'He now speaks fluent hex. #FFFFFF is his favorite word.',
      rating: 5,
      category: 'designer',
      toolsUsed: ['Color Picker', 'CSS Gradient Generator', 'Favicon Generator'],
      timeSaved: '3 hours/week',
      favoriteFeature: 'Actually works offline'
    },
    {
      id: '3',
      name: 'Jessica Park',
      role: 'Product Manager',
      company: 'StartupXYZ',
      avatar: 'JP',
      content: 'I use the password generator for everything. My passwords are now so secure, even I can\'t remember them!',
      sarcasticNote: 'She now has 47 "forgot password" emails per week. Progress!',
      rating: 5,
      category: 'professional',
      toolsUsed: ['Password Generator', 'QR Generator', 'Text Tools'],
      timeSaved: '1.5 hours/week',
      favoriteFeature: 'No ads or popups'
    },
    {
      id: '4',
      name: 'Alex Thompson',
      role: 'Computer Science Student',
      company: 'State University',
      avatar: 'AT',
      content: 'The binary converter helped me pass my CS class. Now I dream in 1s and 0s, but at least I\'m graduating!',
      sarcasticNote: 'His dating profile now lists "fluent in binary" as a skill.',
      rating: 5,
      category: 'student',
      toolsUsed: ['Binary Converter', 'Hash Generator', 'UUID Generator'],
      timeSaved: '5 hours/week',
      favoriteFeature: 'Free forever (broke student approved)'
    },
    {
      id: '5',
      name: 'Emily Watson',
      role: 'Content Creator',
      company: 'Freelance',
      avatar: 'EW',
      content: 'The word counter and text tools are my secret weapons. My clients think I\'m a writing genius. Little do they know...',
      sarcasticNote: 'She\'s basically a cyborg writer now. Resistance is futile.',
      rating: 5,
      category: 'entrepreneur',
      toolsUsed: ['Word Counter', 'Text Case Converter', 'Lorem Ipsum'],
      timeSaved: '4 hours/week',
      favoriteFeature: 'Privacy-focused (no tracking)'
    },
    {
      id: '6',
      name: 'David Kim',
      role: 'Data Analyst',
      company: 'Analytics Inc',
      avatar: 'DK',
      content: 'The timestamp converter is a lifesaver. I no longer have existential crises trying to figure out what 1640995200 means.',
      sarcasticNote: 'He can now convert Unix timestamps faster than he can order coffee.',
      rating: 5,
      category: 'professional',
      toolsUsed: ['Timestamp Converter', 'JSON Formatter', 'Hash Generator'],
      timeSaved: '2.5 hours/week',
      favoriteFeature: 'Works instantly (no waiting)'
    },
    {
      id: '7',
      name: 'Rachel Green',
      role: 'Marketing Manager',
      company: 'BrandCorp',
      avatar: 'RG',
      content: 'The QR generator saved my last campaign. Now I can turn any URL into a mysterious square that millennials love to scan.',
      sarcasticNote: 'She\'s now the "QR Queen" of her office. The crown is made of pixels.',
      rating: 5,
      category: 'professional',
      toolsUsed: ['QR Generator', 'Color Picker', 'Image Optimizer'],
      timeSaved: '3 hours/week',
      favoriteFeature: 'No subscription fees'
    },
    {
      id: '8',
      name: 'Tom Wilson',
      role: 'Freelance Developer',
      company: 'Self-Employed',
      avatar: 'TW',
      content: 'These tools are like having a Swiss Army knife for the internet. Except this one doesn\'t require a monthly subscription.',
      sarcasticNote: 'He\'s saved enough on subscriptions to buy an actual Swiss Army knife.',
      rating: 5,
      category: 'developer',
      toolsUsed: ['All of them', 'Seriously', 'Every single one'],
      timeSaved: '10 hours/week',
      favoriteFeature: 'Everything is actually free'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = testimonials[currentIndex];

  const getCategoryColor = (category: string) => {
    const colors = {
      developer: 'from-blue-500 to-cyan-600',
      designer: 'from-pink-500 to-purple-600',
      student: 'from-green-500 to-emerald-600',
      professional: 'from-orange-500 to-red-600',
      entrepreneur: 'from-yellow-500 to-orange-600'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'developer': return '👨‍💻';
      case 'designer': return '🎨';
      case 'student': return '🎓';
      case 'professional': return '💼';
      case 'entrepreneur': return '🚀';
      default: return '👤';
    }
  };

  return (
    <section className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            What Our <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Users</span> Say
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real testimonials from real people with real productivity problems. 
            (We didn't pay them, they're just genuinely happy.)
          </p>
        </div>

        {/* Main Testimonial Display */}
        <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 mb-12">
          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          <div className="max-w-4xl mx-auto text-center">
            {/* Quote Icon */}
            <Quote className="w-12 h-12 text-blue-400 mx-auto mb-6 opacity-50" />

            {/* Testimonial Content */}
            <blockquote className="text-2xl md:text-3xl font-light text-white mb-8 leading-relaxed">
              "{currentTestimonial.content}"
            </blockquote>

            {/* Sarcastic Note */}
            <div className="bg-gray-800/50 rounded-xl p-4 mb-8 border-l-4 border-gradient-to-b from-blue-500 to-purple-600 max-w-2xl mx-auto">
              <p className="text-gray-300 text-sm italic">
                💭 {currentTestimonial.sarcasticNote}
              </p>
            </div>

            {/* User Info */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${getCategoryColor(currentTestimonial.category)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                {currentTestimonial.avatar}
              </div>
              <div className="text-left">
                <div className="text-white font-semibold text-lg">{currentTestimonial.name}</div>
                <div className="text-gray-400">{currentTestimonial.role}</div>
                <div className="text-gray-500 text-sm">{currentTestimonial.company}</div>
              </div>
              <div className="text-2xl">{getCategoryIcon(currentTestimonial.category)}</div>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center space-x-1 mb-6">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="text-blue-400 font-bold text-lg">{currentTestimonial.timeSaved}</div>
                <div className="text-gray-400 text-sm">Time Saved</div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="text-green-400 font-bold text-lg">{currentTestimonial.toolsUsed.length}</div>
                <div className="text-gray-400 text-sm">Tools Used</div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="text-purple-400 font-bold text-sm">{currentTestimonial.favoriteFeature}</div>
                <div className="text-gray-400 text-sm">Favorite Feature</div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Dots */}
        <div className="flex items-center justify-center space-x-2 mb-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-blue-400 scale-125' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {['developer', 'designer', 'student', 'professional', 'entrepreneur'].map((category) => {
            const count = testimonials.filter(t => t.category === category).length;
            return (
              <button
                key={category}
                onClick={() => {
                  const firstIndex = testimonials.findIndex(t => t.category === category);
                  if (firstIndex !== -1) goToTestimonial(firstIndex);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentTestimonial.category === category
                    ? `bg-gradient-to-r ${getCategoryColor(category)} text-white`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {getCategoryIcon(category)} {category} ({count})
              </button>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-3xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              User <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Satisfaction</span> Stats
            </h3>
            <p className="text-gray-400">
              Because numbers don't lie (unlike our marketing team)
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">5.0</div>
              <div className="text-gray-400 text-sm">Average Rating</div>
              <div className="text-gray-500 text-xs">Out of 5 stars</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-red-400 mb-1">98%</div>
              <div className="text-gray-400 text-sm">Would Recommend</div>
              <div className="text-gray-500 text-xs">To their worst enemy</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">3.2h</div>
              <div className="text-gray-400 text-sm">Avg Time Saved</div>
              <div className="text-gray-500 text-xs">Per week</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-1">0</div>
              <div className="text-gray-400 text-sm">Complaints</div>
              <div className="text-gray-500 text-xs">About pricing</div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm italic">
              * Results may vary. Side effects may include increased productivity and decreased subscription fatigue.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedTestimonialsSection;