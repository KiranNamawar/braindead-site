import React from 'react';
import { Heart } from 'lucide-react';

const SimpleFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-950 border-t border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm mb-4">
            <span>© {currentYear} BrainDead.site</span>
            <span>•</span>
            <span className="flex items-center">
              Made with <Heart className="w-4 h-4 mx-1 text-red-400" /> for effortless productivity
            </span>
          </div>
          
          <p className="text-gray-500 text-xs">
            Premium utility tools for effortless productivity
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;