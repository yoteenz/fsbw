import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CapSizePage() {
  const navigate = useNavigate();
  const [selectedCapSize, setSelectedCapSize] = useState(() => {
    return localStorage.getItem('selectedCapSize') || 'M';
  });

  const capSizeOptions = [
    { id: 's', name: 'S', description: 'Small (21.5" - 22")', price: 0 },
    { id: 'm', name: 'M', description: 'Medium (22" - 22.5")', price: 0 },
    { id: 'l', name: 'L', description: 'Large (22.5" - 23")', price: 0 },
    { id: 'xl', name: 'XL', description: 'Extra Large (23" - 23.5")', price: 25 },
  ];

  const handleSelect = (capSize: string) => {
    setSelectedCapSize(capSize);
    localStorage.setItem('selectedCapSize', capSize);
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
        
        <h1 className="text-4xl font-bold mb-8">Select Cap Size</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {capSizeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.name)}
                className={`p-6 border-2 rounded-lg transition-colors ${
                  selectedCapSize === option.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl font-semibold mb-2">{option.name}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
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

