import React, { useState, useEffect } from 'react';
import { Play, X, ChevronLeft, ChevronRight, CheckCircle, HelpCircle, Lightbulb, Zap } from 'lucide-react';
import { useToast } from '../ToastContainer';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToolTutorialProps {
  toolId: string;
  steps: TutorialStep[];
  onComplete?: () => void;
  autoStart?: boolean;
  className?: string;
}

const ToolTutorial: React.FC<ToolTutorialProps> = ({
  toolId,
  steps,
  onComplete,
  autoStart = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Check if user has seen this tutorial before
    const seenTutorials = JSON.parse(localStorage.getItem('seen-tutorials') || '[]');
    const hasSeen = seenTutorials.includes(toolId);
    setHasSeenTutorial(hasSeen);

    if (autoStart && !hasSeen) {
      setIsOpen(true);
    }
  }, [toolId, autoStart]);

  useEffect(() => {
    if (isOpen && steps[currentStep]?.target) {
      highlightElement(steps[currentStep].target!);
    }

    return () => {
      removeHighlight();
    };
  }, [isOpen, currentStep, steps]);

  const highlightElement = (selector: string) => {
    try {
      const element = document.querySelector(selector);
      if (element) {
        element.classList.add('tutorial-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.warn('Failed to highlight element:', selector);
    }
  };

  const removeHighlight = () => {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
  };

  const startTutorial = () => {
    setIsOpen(true);
    setCurrentStep(0);
    setCompletedSteps(new Set());
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, steps[currentStep].id]));
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const completeTutorial = () => {
    setCompletedSteps(prev => new Set([...prev, steps[currentStep].id]));
    
    // Mark tutorial as seen
    const seenTutorials = JSON.parse(localStorage.getItem('seen-tutorials') || '[]');
    if (!seenTutorials.includes(toolId)) {
      seenTutorials.push(toolId);
      localStorage.setItem('seen-tutorials', JSON.stringify(seenTutorials));
    }

    setHasSeenTutorial(true);
    setIsOpen(false);
    removeHighlight();

    showToast({
      type: 'success',
      title: 'Tutorial Complete!',
      message: 'You\'re now ready to use this tool like a pro!'
    });

    if (onComplete) {
      onComplete();
    }
  };

  const closeTutorial = () => {
    setIsOpen(false);
    removeHighlight();
  };

  const resetTutorial = () => {
    const seenTutorials = JSON.parse(localStorage.getItem('seen-tutorials') || '[]');
    const filtered = seenTutorials.filter((id: string) => id !== toolId);
    localStorage.setItem('seen-tutorials', JSON.stringify(filtered));
    setHasSeenTutorial(false);
    startTutorial();
  };

  if (!isOpen) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={startTutorial}
          className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
        >
          <Play className="w-4 h-4" />
          {hasSeenTutorial ? 'Replay Tutorial' : 'Start Tutorial'}
        </button>
        
        {hasSeenTutorial && (
          <button
            onClick={resetTutorial}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
          >
            <HelpCircle className="w-4 h-4" />
            Help
          </button>
        )}
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
      
      {/* Tutorial Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Tutorial
              </h3>
            </div>
            <button
              onClick={closeTutorial}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Navigation */}
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-center gap-1 overflow-x-auto">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    index === currentStep
                      ? 'bg-blue-500 text-white'
                      : completedSteps.has(step.id)
                      ? 'bg-green-500 text-white'
                      : index < currentStep
                      ? 'bg-gray-300 text-gray-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {completedSteps.has(step.id) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              {currentStepData.title}
            </h4>
            
            <p className="text-gray-600 mb-4">
              {currentStepData.description}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              {currentStepData.content}
            </div>

            {currentStepData.action && (
              <div className="mt-4">
                <button
                  onClick={currentStepData.action.onClick}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  {currentStepData.action.label}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={closeTutorial}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip
              </button>
              
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for highlighting */}
      <style jsx>{`
        .tutorial-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default ToolTutorial;