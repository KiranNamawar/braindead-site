import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <button
      onClick={handleBack}
      className="group fixed top-4 left-4 md:top-6 md:left-6 z-50 flex items-center space-x-2 px-3 py-2 md:px-4 md:py-3 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl text-gray-300 hover:text-white hover:border-gray-600 transition-all duration-300 hover:scale-105 shadow-lg"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm font-medium hidden sm:inline">Back</span>
    </button>
  );
};

export default BackButton;