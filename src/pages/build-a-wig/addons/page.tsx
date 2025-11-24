import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddOnsPage() {
  const navigate = useNavigate();
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedAddOns');
    return saved ? JSON.parse(saved) : [];
  });

  const addOnOptions = [
    { id: 'closure', name: 'Closure', price: 50 },
    { id: 'wig-cap', name: 'Wig Cap', price: 15 },
    { id: 'adhesive', name: 'Adhesive', price: 20 },
    { id: 'brush', name: 'Styling Brush', price: 10 },
    { id: 'stand', name: 'Wig Stand', price: 25 },
  ];

  const handleToggle = (addOnId: string) => {
    setSelectedAddOns(prev => {
      const newAddOns = prev.includes(addOnId)
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId];
      localStorage.setItem('selectedAddOns', JSON.stringify(newAddOns));
      return newAddOns;
    });
  };

  const handleDone = () => {
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
        
        <h1 className="text-4xl font-bold mb-8">Select Add-ons</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            {addOnOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleToggle(option.id)}
                className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                  selectedAddOns.includes(option.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{option.name}</div>
                    <div className="text-sm text-gray-600">${option.price}</div>
                  </div>
                  {selectedAddOns.includes(option.id) && (
                    <div className="text-blue-600">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={handleDone}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

