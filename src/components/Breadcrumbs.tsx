import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../utils/seo';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  if (items.length <= 1) return null;

  return (
    <nav 
      className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" aria-hidden="true" />
            )}
            
            {index === items.length - 1 ? (
              // Current page - not a link
              <span 
                className="font-medium text-gray-900 dark:text-gray-100"
                aria-current="page"
              >
                {index === 0 && <Home className="w-4 h-4 mr-1 inline" aria-hidden="true" />}
                {item.name}
              </span>
            ) : (
              // Link to previous pages
              <Link
                to={item.url.replace(window.location.origin, '')}
                className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label={`Go to ${item.name}`}
              >
                {index === 0 && <Home className="w-4 h-4 mr-1" aria-hidden="true" />}
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;