import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DensityPage() {
  const navigate = useNavigate();
  const [selectedDensity, setSelectedDensity] = useState(() => {
    return localStorage.getItem('selectedDensity') || '200%';
  });

  const densityOptions = [
    { id: '150', name: '150%', price: 0 },
    { id: '180', name: '180%', price: 50 },
    { id: '200', name: '200%', price: 100 },
    { id: '250', name: '250%', price: 150 },
    { id: '300', name: '300%', price: 200 },
  ];

  const handleSelect = (density: string) => {
    setSelectedDensity(density);
    localStorage.setItem('selectedDensity', density);
    navigate('/build-a-wig');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/build-a-wig')}
          className="mb-6 text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>
        
        <h1 className="text-4xl font-bold mb-8">Select Density</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {densityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.name)}
                className={`p-6 border-2 rounded-lg transition-colors ${
                  selectedDensity === option.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="text-xl font-semibold">{option.name}</div>
                {option.price > 0 && (
                  <div className="text-sm text-gray-600 mt-2">+${option.price}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

