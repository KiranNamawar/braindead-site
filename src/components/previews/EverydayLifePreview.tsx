import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign } from 'lucide-react';

interface EverydayLifePreviewProps {
  isActive: boolean;
}

const EverydayLifePreview: React.FC<EverydayLifePreviewProps> = ({ isActive }) => {
  const [billAmount, setBillAmount] = useState(50);
  const [tipPercentage, setTipPercentage] = useState(18);
  const [tipAmount, setTipAmount] = useState(9);
  const [total, setTotal] = useState(59);

  useEffect(() => {
    const tip = (billAmount * tipPercentage) / 100;
    setTipAmount(Number(tip.toFixed(2)));
    setTotal(Number((billAmount + tip).toFixed(2)));
  }, [billAmount, tipPercentage]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="w-5 h-5 text-blue-400" />
        <span className="text-white font-medium">Tip Calculator Preview</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Bill Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="number"
              value={billAmount}
              onChange={(e) => setBillAmount(Number(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Tip Percentage</label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="30"
              value={tipPercentage}
              onChange={(e) => setTipPercentage(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="text-blue-400 font-medium">{tipPercentage}%</span>
              <span>30%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-gray-400 text-xs mb-1">Bill</div>
            <div className="text-white font-semibold">${billAmount.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">Tip ({tipPercentage}%)</div>
            <div className="text-green-400 font-semibold">${tipAmount.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">Total</div>
            <div className="text-blue-400 font-bold text-lg">${total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500 italic">
          "No more awkward math at restaurants!"
        </p>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default EverydayLifePreview;