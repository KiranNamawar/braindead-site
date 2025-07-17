import React, { useState, useEffect } from 'react';
import { Zap, ArrowRightLeft, Calculator } from 'lucide-react';
import BackButton from '../components/BackButton';

import SEOHead from '../components/SEOHead';

interface ConversionUnit {
  name: string;
  symbol: string;
  factor: number; // Factor to convert to base unit
}

interface ConversionCategory {
  name: string;
  baseUnit: string;
  units: ConversionUnit[];
}

const UnitConverterPage: React.FC = () => {
  // const { showSuccess, showError } = useToast();
  const [activeCategory, setActiveCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [conversionHistory, setConversionHistory] = useState<Array<{from: string, to: string, category: string, timestamp: string}>>([]);

  const categories: { [key: string]: ConversionCategory } = {
    length: {
      name: 'Length',
      baseUnit: 'meter',
      units: [
        { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
        { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
        { name: 'Meter', symbol: 'm', factor: 1 },
        { name: 'Kilometer', symbol: 'km', factor: 1000 },
        { name: 'Inch', symbol: 'in', factor: 0.0254 },
        { name: 'Foot', symbol: 'ft', factor: 0.3048 },
        { name: 'Yard', symbol: 'yd', factor: 0.9144 },
        { name: 'Mile', symbol: 'mi', factor: 1609.344 }
      ]
    },
    weight: {
      name: 'Weight',
      baseUnit: 'kilogram',
      units: [
        { name: 'Milligram', symbol: 'mg', factor: 0.000001 },
        { name: 'Gram', symbol: 'g', factor: 0.001 },
        { name: 'Kilogram', symbol: 'kg', factor: 1 },
        { name: 'Ounce', symbol: 'oz', factor: 0.0283495 },
        { name: 'Pound', symbol: 'lb', factor: 0.453592 },
        { name: 'Stone', symbol: 'st', factor: 6.35029 },
        { name: 'Ton', symbol: 't', factor: 1000 }
      ]
    },
    temperature: {
      name: 'Temperature',
      baseUnit: 'celsius',
      units: [
        { name: 'Celsius', symbol: '°C', factor: 1 },
        { name: 'Fahrenheit', symbol: '°F', factor: 1 },
        { name: 'Kelvin', symbol: 'K', factor: 1 }
      ]
    },
    volume: {
      name: 'Volume',
      baseUnit: 'liter',
      units: [
        { name: 'Milliliter', symbol: 'ml', factor: 0.001 },
        { name: 'Liter', symbol: 'l', factor: 1 },
        { name: 'Cubic Meter', symbol: 'm³', factor: 1000 },
        { name: 'Fluid Ounce', symbol: 'fl oz', factor: 0.0295735 },
        { name: 'Cup', symbol: 'cup', factor: 0.236588 },
        { name: 'Pint', symbol: 'pt', factor: 0.473176 },
        { name: 'Quart', symbol: 'qt', factor: 0.946353 },
        { name: 'Gallon', symbol: 'gal', factor: 3.78541 }
      ]
    },
    area: {
      name: 'Area',
      baseUnit: 'square meter',
      units: [
        { name: 'Square Millimeter', symbol: 'mm²', factor: 0.000001 },
        { name: 'Square Centimeter', symbol: 'cm²', factor: 0.0001 },
        { name: 'Square Meter', symbol: 'm²', factor: 1 },
        { name: 'Square Kilometer', symbol: 'km²', factor: 1000000 },
        { name: 'Square Inch', symbol: 'in²', factor: 0.00064516 },
        { name: 'Square Foot', symbol: 'ft²', factor: 0.092903 },
        { name: 'Square Yard', symbol: 'yd²', factor: 0.836127 },
        { name: 'Acre', symbol: 'ac', factor: 4046.86 },
        { name: 'Hectare', symbol: 'ha', factor: 10000 }
      ]
    },
    speed: {
      name: 'Speed',
      baseUnit: 'meter per second',
      units: [
        { name: 'Meter per Second', symbol: 'm/s', factor: 1 },
        { name: 'Kilometer per Hour', symbol: 'km/h', factor: 0.277778 },
        { name: 'Mile per Hour', symbol: 'mph', factor: 0.44704 },
        { name: 'Foot per Second', symbol: 'ft/s', factor: 0.3048 },
        { name: 'Knot', symbol: 'kn', factor: 0.514444 }
      ]
    }
  };

  const convertTemperature = (value: number, from: string, to: string): number => {
    // Convert to Celsius first
    let celsius = value;
    if (from === '°F') {
      celsius = (value - 32) * 5/9;
    } else if (from === 'K') {
      celsius = value - 273.15;
    }

    // Convert from Celsius to target
    if (to === '°F') {
      return celsius * 9/5 + 32;
    } else if (to === 'K') {
      return celsius + 273.15;
    }
    return celsius;
  };

  const performConversion = () => {
    if (!fromValue || !fromUnit || !toUnit) return;

    const value = parseFloat(fromValue);
    if (isNaN(value)) return;

    const category = categories[activeCategory];
    let result: number;

    if (activeCategory === 'temperature') {
      result = convertTemperature(value, fromUnit, toUnit);
    } else {
      const fromUnitData = category.units.find(u => u.symbol === fromUnit);
      const toUnitData = category.units.find(u => u.symbol === toUnit);
      
      if (!fromUnitData || !toUnitData) return;

      // Convert to base unit, then to target unit
      const baseValue = value * fromUnitData.factor;
      result = baseValue / toUnitData.factor;
    }

    setToValue(result.toString());

    // Add to history
    const historyEntry = {
      from: `${value} ${fromUnit}`,
      to: `${result.toFixed(6)} ${toUnit}`,
      category: category.name,
      timestamp: new Date().toLocaleString()
    };
    setConversionHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
  };

  const swapUnits = () => {
    const tempUnit = fromUnit;
    const tempValue = fromValue;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue);
    setToValue(tempValue);
  };

  useEffect(() => {
    const category = categories[activeCategory];
    if (category.units.length > 0) {
      setFromUnit(category.units[0].symbol);
      setToUnit(category.units[1]?.symbol || category.units[0].symbol);
    }
    setFromValue('');
    setToValue('');
  }, [activeCategory]);

  useEffect(() => {
    if (fromValue && fromUnit && toUnit) {
      performConversion();
    } else {
      setToValue('');
    }
  }, [fromValue, fromUnit, toUnit, activeCategory]);

  const categoryTabs = Object.entries(categories).map(([key, category]) => ({
    id: key,
    label: category.name
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="Unit Converter"
        description="Convert between different units of measurement with precision and ease."
        canonical="/unit-converter"
      />
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl mb-6">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4">
          Unit Converter
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Convert between different units of measurement with precision and ease. 
          <span className="text-yellow-400"> Because math is hard, but conversion shouldn't be!</span>
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-2 overflow-x-auto">
          <div className="flex space-x-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeCategory === tab.id
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Converter */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              {categories[activeCategory].name} Converter
            </h3>
            
            <div className="space-y-6">
              {/* From Section */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">From</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    placeholder="Enter value"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                  />
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                  >
                    {categories[activeCategory].units.map((unit) => (
                      <option key={unit.symbol} value={unit.symbol}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={swapUnits}
                  className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </button>
              </div>

              {/* To Section */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">To</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={toValue}
                    readOnly
                    placeholder="Result"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                  />
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                  >
                    {categories[activeCategory].units.map((unit) => (
                      <option key={unit.symbol} value={unit.symbol}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result Display */}
              {fromValue && toValue && (
                <div className="bg-gray-800/50 rounded-2xl p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-2">
                      {fromValue} {fromUnit} = {parseFloat(toValue).toFixed(6)} {toUnit}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {categories[activeCategory].name} Conversion
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History & Quick Conversions */}
        <div className="space-y-6">
          {/* Quick Conversions */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Conversions</h3>
            <div className="space-y-2">
              {categories[activeCategory].units.slice(0, 5).map((unit, index) => (
                <button
                  key={unit.symbol}
                  onClick={() => {
                    setFromValue('1');
                    setFromUnit(unit.symbol);
                    setToUnit(categories[activeCategory].units[(index + 1) % categories[activeCategory].units.length].symbol);
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-white transition-colors"
                >
                  <div className="font-semibold text-sm">1 {unit.symbol}</div>
                  <div className="text-gray-400 text-xs">{unit.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Conversion History */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Conversions</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {conversionHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No conversions yet.<br />
                  <span className="text-sm">Start converting units!</span>
                </p>
              ) : (
                conversionHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-yellow-400 text-sm font-semibold">{entry.category}</span>
                      <span className="text-xs text-gray-400">{entry.timestamp}</span>
                    </div>
                    <div className="text-sm text-white">
                      {entry.from} → {entry.to}
                    </div>
                  </div>
                ))
              )}
            </div>
            {conversionHistory.length > 0 && (
              <button
                onClick={() => setConversionHistory([])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">⚡ Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Use the swap button to reverse conversions</li>
              <li>• Temperature conversions use precise formulas</li>
              <li>• Results are rounded to 6 decimal places</li>
              <li>• Quick conversions show common unit pairs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitConverterPage;