import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, ExternalLink, Lightbulb, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface HelpContent {
  title: string;
  description: string;
  tips?: string[];
  examples?: Array<{
    title: string;
    content: string;
    code?: string;
  }>;
  links?: Array<{
    title: string;
    url: string;
  }>;
  type?: 'info' | 'warning' | 'success' | 'tip';
}

interface ContextualHelpProps {
  content: HelpContent;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({
  content,
  position = 'top',
  trigger = 'hover',
  size = 'md',
  className = '',
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let newPosition = position;

      // Check if tooltip would go off screen and adjust position
      switch (position) {
        case 'top':
          if (triggerRect.top - tooltipRect.height < 10) {
            newPosition = 'bottom';
          }
          break;
        case 'bottom':
          if (triggerRect.bottom + tooltipRect.height > viewport.height - 10) {
            newPosition = 'top';
          }
          break;
        case 'left':
          if (triggerRect.left - tooltipRect.width < 10) {
            newPosition = 'right';
          }
          break;
        case 'right':
          if (triggerRect.right + tooltipRect.width > viewport.width - 10) {
            newPosition = 'left';
          }
          break;
      }

      setActualPosition(newPosition);
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const getIcon = () => {
    switch (content.type) {
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-xs';
      case 'lg':
        return 'max-w-lg';
      default:
        return 'max-w-md';
    }
  };

  const getPositionClasses = () => {
    const base = 'absolute z-50';
    switch (actualPosition) {
      case 'top':
        return `${base} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${base} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${base} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${base} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${base} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  const getArrowClasses = () => {
    const base = 'absolute w-2 h-2 bg-gray-800 transform rotate-45';
    switch (actualPosition) {
      case 'top':
        return `${base} top-full left-1/2 -translate-x-1/2 -mt-1`;
      case 'bottom':
        return `${base} bottom-full left-1/2 -translate-x-1/2 -mb-1`;
      case 'left':
        return `${base} left-full top-1/2 -translate-y-1/2 -ml-1`;
      case 'right':
        return `${base} right-full top-1/2 -translate-y-1/2 -mr-1`;
      default:
        return `${base} top-full left-1/2 -translate-x-1/2 -mt-1`;
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="cursor-help"
      >
        {children || (
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
        )}
      </div>

      {isVisible && (
        <>
          {/* Backdrop for click trigger */}
          {trigger === 'click' && (
            <div
              className="fixed inset-0 z-40"
              onClick={handleClose}
            />
          )}

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className={`${getPositionClasses()} ${getSizeClasses()}`}
          >
            <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 text-sm">
              {/* Arrow */}
              <div className={getArrowClasses()} />

              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getIcon()}
                  <h4 className="font-semibold text-white">
                    {content.title}
                  </h4>
                </div>
                {trigger === 'click' && (
                  <button
                    onClick={handleClose}
                    className="text-gray-300 hover:text-white ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-200 mb-3 leading-relaxed">
                {content.description}
              </p>

              {/* Tips */}
              {content.tips && content.tips.length > 0 && (
                <div className="mb-3">
                  <h5 className="font-medium text-white mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Tips:
                  </h5>
                  <ul className="space-y-1">
                    {content.tips.map((tip, index) => (
                      <li key={index} className="text-gray-200 text-xs flex items-start gap-2">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Examples */}
              {content.examples && content.examples.length > 0 && (
                <div className="mb-3">
                  <h5 className="font-medium text-white mb-2">Examples:</h5>
                  <div className="space-y-2">
                    {content.examples.map((example, index) => (
                      <div key={index} className="bg-gray-700 rounded p-2">
                        <div className="font-medium text-gray-100 text-xs mb-1">
                          {example.title}
                        </div>
                        <div className="text-gray-300 text-xs mb-1">
                          {example.content}
                        </div>
                        {example.code && (
                          <pre className="bg-gray-900 text-green-400 text-xs p-2 rounded overflow-x-auto">
                            {example.code}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {content.links && content.links.length > 0 && (
                <div className="border-t border-gray-600 pt-2">
                  <div className="space-y-1">
                    {content.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-300 hover:text-blue-200 text-xs transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Convenience component for simple tooltips
interface SimpleTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  content,
  position = 'top',
  children,
  className = ''
}) => {
  return (
    <ContextualHelp
      content={{
        title: '',
        description: content
      }}
      position={position}
      trigger="hover"
      size="sm"
      className={className}
    >
      {children}
    </ContextualHelp>
  );
};

export default ContextualHelp;