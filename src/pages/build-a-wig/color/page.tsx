import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ColorPage() {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(() => {
    return localStorage.getItem('selectedColor') || 'OFF BLACK';
  });

  const colorOptions = [
    { id: 'off-black', name: 'OFF BLACK', colorCode: '#000000' },
    { id: '1b', name: '1B', colorCode: '#1a1a1a' },
    { id: '2', name: '2', colorCode: '#2c1810' },
    { id: '4', name: '4', colorCode: '#3d2817' },
    { id: '6', name: '6', colorCode: '#4a3428' },
    { id: '8', name: '8', colorCode: '#5d4a3a' },
  ];

  const handleSelect = (color: string) => {
    setSelectedColor(color);
    localStorage.setItem('selectedColor', color);
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
        
        <h1 className="text-4xl font-bold mb-8">Select Color</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {colorOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.name)}
                className={`p-6 border-2 rounded-lg transition-colors ${
                  selectedColor === option.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div
                  className="w-full h-16 rounded mb-2"
                  style={{ backgroundColor: option.colorCode }}
                />
                <div className="text-lg font-semibold">{option.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

