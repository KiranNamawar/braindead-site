import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  faqs: FAQItem[];
  className?: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ 
  title = "Frequently Asked Questions", 
  faqs, 
  className = "" 
}) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden transition-all duration-200 hover:bg-white/15"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                aria-expanded={openItems.has(index)}
              >
                <h3 className="font-semibold text-lg pr-4">{faq.question}</h3>
                {openItems.has(index) ? (
                  <ChevronUp className="w-5 h-5 text-blue-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-blue-400 flex-shrink-0" />
                )}
              </button>
              
              {openItems.has(index) && (
                <div className="px-6 pb-4">
                  <div className="text-gray-300 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;