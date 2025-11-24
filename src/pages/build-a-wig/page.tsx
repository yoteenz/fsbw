import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface WigCustomization {
  capSize: string;
  length: string;
  density: string;
  lace: string;
  texture: string;
  color: string;
  hairline: string;
  styling: string;
  addOns: string[];
}

export default function BuildAWigPage() {
  const navigate = useNavigate();
  const [customization, setCustomization] = useState<WigCustomization>(() => {
    return {
      capSize: localStorage.getItem('selectedCapSize') || 'M',
      length: localStorage.getItem('selectedLength') || '24"',
      density: localStorage.getItem('selectedDensity') || '200%',
      lace: localStorage.getItem('selectedLace') || '13X6',
      texture: localStorage.getItem('selectedTexture') || 'SILKY',
      color: localStorage.getItem('selectedColor') || 'OFF BLACK',
      hairline: localStorage.getItem('selectedHairline') || 'NATURAL',
      styling: localStorage.getItem('selectedStyling') || 'NONE',
      addOns: JSON.parse(localStorage.getItem('selectedAddOns') || '[]'),
    };
  });

  const customizationSteps = [
    { key: 'length', label: 'Length', value: customization.length, route: '/build-a-wig/length' },
    { key: 'color', label: 'Color', value: customization.color, route: '/build-a-wig/color' },
    { key: 'density', label: 'Density', value: customization.density, route: '/build-a-wig/density' },
    { key: 'lace', label: 'Lace', value: customization.lace, route: '/build-a-wig/lace' },
    { key: 'texture', label: 'Texture', value: customization.texture, route: '/build-a-wig/texture' },
    { key: 'hairline', label: 'Hairline', value: customization.hairline, route: '/build-a-wig/hairline' },
    { key: 'capSize', label: 'Cap Size', value: customization.capSize, route: '/build-a-wig/cap-size' },
    { key: 'styling', label: 'Styling', value: customization.styling, route: '/build-a-wig/styling' },
    { key: 'addOns', label: 'Add-ons', value: customization.addOns.length > 0 ? `${customization.addOns.length} selected` : 'None', route: '/build-a-wig/addons' },
  ];

  // Load saved selections from localStorage
  useEffect(() => {
    const savedCapSize = localStorage.getItem('selectedCapSize');
    const savedLength = localStorage.getItem('selectedLength');
    const savedDensity = localStorage.getItem('selectedDensity');
    const savedLace = localStorage.getItem('selectedLace');
    const savedTexture = localStorage.getItem('selectedTexture');
    const savedColor = localStorage.getItem('selectedColor');
    const savedHairline = localStorage.getItem('selectedHairline');
    const savedStyling = localStorage.getItem('selectedStyling');
    const savedAddOns = localStorage.getItem('selectedAddOns');

    if (savedCapSize || savedLength || savedDensity || savedLace || savedTexture || savedColor || savedHairline || savedStyling || savedAddOns) {
      setCustomization(prev => ({
        ...prev,
        capSize: savedCapSize || prev.capSize,
        length: savedLength || prev.length,
        density: savedDensity || prev.density,
        lace: savedLace || prev.lace,
        texture: savedTexture || prev.texture,
        color: savedColor || prev.color,
        hairline: savedHairline || prev.hairline,
        styling: savedStyling || prev.styling,
        addOns: savedAddOns ? JSON.parse(savedAddOns) : prev.addOns,
      }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Build A Wig</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Customization Steps</h2>
          
          <div className="space-y-4">
            {customizationSteps.map((step) => (
              <button
                key={step.key}
                onClick={() => navigate(step.route)}
                className="w-full text-left p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{step.label}</span>
                  <span className="text-gray-600">{step.value}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

