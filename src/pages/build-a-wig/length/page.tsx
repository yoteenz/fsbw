import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LengthPage() {
  const navigate = useNavigate();
  const [selectedLength, setSelectedLength] = useState(() => {
    return localStorage.getItem('selectedLength') || '24"';
  });

  const lengthOptions = [
    { id: '18', name: '18"', price: 0 },
    { id: '20', name: '20"', price: 50 },
    { id: '22', name: '22"', price: 100 },
    { id: '24', name: '24"', price: 150 },
    { id: '26', name: '26"', price: 200 },
    { id: '28', name: '28"', price: 250 },
  ];

  const handleSelect = (length: string) => {
    setSelectedLength(length);
    localStorage.setItem('selectedLength', length);
    // Navigate back to main page
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
        
        <h1 className="text-4xl font-bold mb-8">Select Length</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {lengthOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.name)}
                className={`p-6 border-2 rounded-lg transition-colors ${
                  selectedLength === option.name
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

