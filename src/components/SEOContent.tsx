import React from 'react';
import { Tool, ToolCategory } from '../types';
import { generateToolSEOContent, generateCategorySEOContent, generateHomepageSEOContent } from '../utils/seoContent';
import FAQSection from './FAQSection';

interface SEOContentProps {
  type: 'tool' | 'category' | 'homepage';
  toolId?: string;
  category?: ToolCategory;
  className?: string;
}

export const SEOContent: React.FC<SEOContentProps> = ({ 
  type, 
  toolId, 
  category, 
  className = "" 
}) => {
  if (type === 'tool' && toolId) {
    const seoContent = generateToolSEOContent(toolId);
    if (!seoContent) return null;

    return (
      <div className={`space-y-12 ${className}`}>
        {/* Tool Introduction */}
        <section className="max-w-4xl mx-auto px-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              About This Tool
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {seoContent.content.introduction}
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-400">Key Features</h3>
                <ul className="space-y-2">
                  {seoContent.content.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-400">Common Use Cases</h3>
                <ul className="space-y-2">
                  {seoContent.content.useCases.map((useCase, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <span className="text-gray-300">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-8 border border-blue-500/20">
            <h3 className="text-xl font-semibold mb-4 text-center">Why Choose This Tool?</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {seoContent.content.benefits.map((benefit, index) => (
                <div key={index} className="text-center p-4 bg-white/5 rounded-lg">
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection faqs={seoContent.faq} />
      </div>
    );
  }

  if (type === 'category' && category) {
    const categoryContent = generateCategorySEOContent(category);
    if (!categoryContent) return null;

    return (
      <div className={`space-y-12 ${className}`}>
        {/* Category Introduction */}
        <section className="max-w-4xl mx-auto px-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Tools
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {categoryContent.introduction}
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-400">Benefits</h3>
                <ul className="space-y-2">
                  {categoryContent.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      <span className="text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-400">Use Cases</h3>
                <ul className="space-y-2">
                  {categoryContent.useCases.map((useCase, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <span className="text-gray-300">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Available Tools */}
        <section className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl font-bold mb-6 text-center">Available Tools</h3>
          <div className="grid gap-4">
            {Object.entries(categoryContent.toolDescriptions).map(([toolId, description]) => (
              <div key={toolId} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h4 className="text-lg font-semibold mb-2 text-blue-400">
                  {toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
                <p className="text-gray-300">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (type === 'homepage') {
    const homepageContent = generateHomepageSEOContent();

    return (
      <div className={`space-y-12 ${className}`}>
        {/* Homepage Benefits */}
        <section className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Why BrainDead.site?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {homepageContent.content.introduction}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homepageContent.content.features.map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <div className="text-2xl mb-3">
                  {index === 0 && '🚫'} {/* No registration */}
                  {index === 1 && '📱'} {/* Works offline */}
                  {index === 2 && '🔒'} {/* No data collection */}
                  {index === 3 && '📱'} {/* Mobile responsive */}
                  {index === 4 && '⌨️'} {/* Keyboard shortcuts */}
                  {index === 5 && '📤'} {/* Export capabilities */}
                </div>
                <h3 className="font-semibold mb-2 text-blue-400">
                  {feature.split(' ').slice(0, 2).join(' ')}
                </h3>
                <p className="text-gray-300 text-sm">{feature}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-8 border border-blue-500/20">
            <h3 className="text-2xl font-bold mb-6 text-center">Perfect For</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {homepageContent.content.useCases.map((useCase, index) => (
                <div key={index} className="text-center p-4 bg-white/5 rounded-lg">
                  <span className="text-gray-300">{useCase}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection 
          title="Frequently Asked Questions"
          faqs={homepageContent.faq} 
        />
      </div>
    );
  }

  return null;
};

export default SEOContent;