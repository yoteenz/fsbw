/**
 * Helper script to update image references in the codebase
 * This script helps integrate generated color variant images
 * 
 * Usage: node scripts/update-image-references.js
 */

const fs = require('fs');
const path = require('path');

// Color mapping
const COLORS = [
  'JET BLACK', 'OFF BLACK', 'ESPRESSO', 'CHESTNUT', 'HONEY', 'AUBURN',
  'COPPER', 'GINGER', 'SANGRIA', 'CHERRY', 'RASPBERRY', 'PLUM',
  'COBALT', 'TEAL', 'SLIME', 'CITRINE'
];

// Image views
const VIEWS = ['front', 'left', 'right'];
const HAIRLINES = ['natural', 'peak', 'lagos'];

/**
 * Get image path based on hairline, view, and color
 */
function getImagePath(hairline, view, color) {
  if (color === 'OFF BLACK' || color === 'JET BLACK') {
    // Use original images for black colors
    return `/assets/${hairline} ${view}.png`;
  }
  return `/assets/${hairline} ${view} ${color}.png`;
}

/**
 * Check if image file exists
 */
function imageExists(hairline, view, color) {
  const imagePath = path.join(__dirname, '..', 'public', 'assets', 
    color === 'OFF BLACK' || color === 'JET BLACK' 
      ? `${hairline} ${view}.png`
      : `${hairline} ${view} ${color}.png`
  );
  return fs.existsSync(imagePath);
}

/**
 * Generate helper function code for getting images
 */
function generateImageHelper() {
  return `
// Helper function to get mannequin image based on hairline, view, and color
export function getMannequinImage(hairline: string, view: 'front' | 'left' | 'right', color: string): string {
  // Normalize hairline (handle variations)
  const normalizedHairline = hairline.toUpperCase().includes('PEAK') ? 'peak' :
                             hairline.toUpperCase().includes('LAGOS') ? 'lagos' : 'natural';
  
  // Normalize view
  const normalizedView = view.toLowerCase();
  
  // For black colors, use original images
  if (color === 'OFF BLACK' || color === 'JET BLACK') {
    return \`/assets/\${normalizedHairline} \${normalizedView}.png\`;
  }
  
  // For colored hair, use color variant if it exists, otherwise fall back to original
  const colorVariantPath = \`/assets/\${normalizedHairline} \${normalizedView} \${color}.png\`;
  // In a real implementation, you'd check if the file exists
  // For now, return the color variant path
  return colorVariantPath;
}
`;
}

/**
 * Example usage in React component
 */
function generateReactExample() {
  return `
// Example: Using color variants in a React component
import { getMannequinImage } from './utils/imageHelpers';

function MannequinDisplay({ hairline, view, color }) {
  const imagePath = getMannequinImage(hairline, view, color);
  
  return (
    <img 
      src={imagePath} 
      alt={\`Mannequin \${view} view with \${color} hair\`}
      onError={(e) => {
        // Fallback to original if color variant doesn't exist
        e.target.src = \`/assets/\${hairline} \${view}.png\`;
      }}
    />
  );
}
`;
}

// Main execution
console.log('Image Reference Helper');
console.log('='.repeat(50));
console.log('\n1. Helper Function:');
console.log(generateImageHelper());
console.log('\n2. React Component Example:');
console.log(generateReactExample());
console.log('\n3. Checking available images...\n');

let availableCount = 0;
let missingCount = 0;

COLORS.forEach(color => {
  HAIRLINES.forEach(hairline => {
    VIEWS.forEach(view => {
      if (imageExists(hairline, view, color)) {
        availableCount++;
        console.log(`✓ Found: ${hairline} ${view} ${color}`);
      } else if (color !== 'OFF BLACK' && color !== 'JET BLACK') {
        missingCount++;
        console.log(`✗ Missing: ${hairline} ${view} ${color}`);
      }
    });
  });
});

console.log(`\nSummary:`);
console.log(`Available: ${availableCount}`);
console.log(`Missing: ${missingCount}`);
console.log(`\nTotal needed: ${COLORS.length * HAIRLINES.length * VIEWS.length - (2 * HAIRLINES.length * VIEWS.length)} color variants`);




