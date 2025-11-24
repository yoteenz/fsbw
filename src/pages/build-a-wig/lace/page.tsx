import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LacePage() {
  const navigate = useNavigate();
  const [selectedLace, setSelectedLace] = useState(() => {
    return localStorage.getItem('selectedLace') || '13X6';
  });

  const laceOptions = [
    { id: '13x6', name: '13X6', price: 0 },
    { id: '13x4', name: '13X4', price: -50 },
    { id: '360', name: '360', price: 100 },
    { id: 'full-lace', name: 'Full Lace', price: 200 },
  ];

  const handleSelect = (lace: string) => {
    setSelectedLace(lace);
    localStorage.setItem('selectedLace', lace);
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
        
        <h1 className="text-4xl font-bold mb-8">Select Lace</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {laceOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.name)}
                className={`p-6 border-2 rounded-lg transition-colors ${
                  selectedLace === option.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="text-xl font-semibold">{option.name}</div>
                {option.price !== 0 && (
                  <div className={`text-sm mt-2 ${option.price > 0 ? 'text-gray-600' : 'text-green-600'}`}>
                    {option.price > 0 ? '+' : ''}${option.price}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

