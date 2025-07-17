import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, Palette, Clock, Code, Hash } from 'lucide-react';

interface ToolCategory {
  id: string;
  name: string;
  description: string;
  sarcasticQuote: string;
  icon: React.ComponentType<any>;
  gradient: string;
  tools: Array<{
    id: string;
    name: string;
    path: string;
    description: string;
  }>;
  previewComponent: React.ComponentType<any>;
}

interface ToolCategoryShowcaseProps {
  category: ToolCategory;
  className?: string;
}

const ToolCategoryShowcase: React.FC<ToolCategoryShowcaseProps> = ({ category, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 hover:border-gray-700 transition-all duration-500 hover:scale-[1.02] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
            <category.icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">{category.name}</h3>
            <p className="text-gray-400 text-sm">{category.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">{category.tools.length} tools</div>
          <div className="flex space-x-1">
            {category.tools.slice(0, 3).map((_, idx) => (
              <div key={idx} className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Sarcastic Quote */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border-l-4 border-gradient-to-b from-blue-500 to-purple-600">
        <p className="text-gray-300 text-sm italic">"{category.sarcasticQuote}"</p>
      </div>

      {/* Interactive Preview */}
      <div className="mb-6 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">Try it now:</h4>
          <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded">Live Preview</span>
        </div>
        <div className="transition-all duration-300">
          <category.previewComponent isActive={isHovered} />
        </div>
      </div>

      {/* Tool List */}
      <div className="mb-6">
        <h4 className="text-white font-semibold mb-3">Available Tools:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {category.tools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.path}
              className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-700/50 transition-colors group/tool"
            >
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full group-hover/tool:scale-125 transition-transform"></div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{tool.name}</div>
                <div className="text-gray-400 text-xs">{tool.description}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover/tool:text-white group-hover/tool:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <Link
        to={category.tools[0]?.path || '#'}
        className={`inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r ${category.gradient} rounded-xl font-semibold text-white hover:scale-105 transition-all duration-300 group-hover:shadow-lg`}
      >
        <span>Explore {category.name}</span>
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};

export default ToolCategoryShowcase;