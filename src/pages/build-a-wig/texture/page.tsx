import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TexturePage() {
  const navigate = useNavigate();
  const [selectedTexture, setSelectedTexture] = useState(() => {
    return localStorage.getItem('selectedTexture') || 'SILKY';
  });

  const textureOptions = [
    { id: 'silky', name: 'SILKY', price: 0 },
    { id: 'straight', name: 'STRAIGHT', price: 0 },
    { id: 'body-wave', name: 'BODY WAVE', price: 50 },
    { id: 'loose-wave', name: 'LOOSE WAVE', price: 50 },
    { id: 'curly', name: 'CURLY', price: 100 },
  ];

  const handleSelect = (texture: string) => {
    setSelectedTexture(texture);
    localStorage.setItem('selectedTexture', texture);
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
        
        <h1 className="text-4xl font-bold mb-8">Select Texture</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {textureOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.name)}
                className={`p-6 border-2 rounded-lg transition-colors ${
                  selectedTexture === option.name
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

