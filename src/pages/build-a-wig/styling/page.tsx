import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StylingPage() {
  const navigate = useNavigate();
  const [selectedStyling, setSelectedStyling] = useState(() => {
    return localStorage.getItem('selectedStyling') || 'NONE';
  });

  const stylingOptions = [
    { id: 'none', name: 'NONE', price: 0 },
    { id: 'trim', name: 'TRIM', price: 25 },
    { id: 'layered', name: 'LAYERED', price: 50 },
    { id: 'tapered', name: 'TAPERED', price: 75 },
    { id: 'custom', name: 'CUSTOM', price: 100 },
  ];

  const handleSelect = (styling: string) => {
    setSelectedStyling(styling);
    localStorage.setItem('selectedStyling', styling);
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
        
        <h1 className="text-4xl font-bold mb-8">Select Styling</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stylingOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.name)}
                className={`p-6 border-2 rounded-lg transition-colors ${
                  selectedStyling === option.name
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

