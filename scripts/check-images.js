/**
 * Quick script to check which color variant images exist
 * Usage: node scripts/check-images.js
 */

const fs = require('fs');
const path = require('path');

const COLORS = [
  'JET BLACK', 'OFF BLACK', 'ESPRESSO', 'CHESTNUT', 'HONEY', 'AUBURN',
  'COPPER', 'GINGER', 'SANGRIA', 'CHERRY', 'RASPBERRY', 'PLUM',
  'COBALT', 'TEAL', 'SLIME', 'CITRINE'
];

const VIEWS = ['front', 'left', 'right'];
const HAIRLINES = ['natural', 'peak', 'lagos'];

const assetsDir = path.join(__dirname, '..', 'public', 'assets');

function checkImages() {
  console.log('Checking for color variant images...\n');
  
  const results = {
    found: [],
    missing: [],
    originals: []
  };
  
  // Check originals first
  HAIRLINES.forEach(hairline => {
    VIEWS.forEach(view => {
      const originalPath = path.join(assetsDir, `${hairline} ${view}.png`);
      if (fs.existsSync(originalPath)) {
        results.originals.push(`${hairline} ${view}.png`);
      }
    });
  });
  
  // Check color variants
  COLORS.forEach(color => {
    if (color === 'OFF BLACK' || color === 'JET BLACK') {
      return; // Skip black colors (use originals)
    }
    
    HAIRLINES.forEach(hairline => {
      VIEWS.forEach(view => {
        const variantPath = path.join(assetsDir, `${hairline} ${view} ${color}.png`);
        if (fs.existsSync(variantPath)) {
          results.found.push(`${hairline} ${view} ${color}.png`);
        } else {
          results.missing.push(`${hairline} ${view} ${color}.png`);
        }
      });
    });
  });
  
  // Print results
  console.log('Original Images Found:');
  results.originals.forEach(img => console.log(`  ✓ ${img}`));
  
  console.log(`\nColor Variants Found: ${results.found.length}`);
  if (results.found.length > 0) {
    console.log('Examples:');
    results.found.slice(0, 5).forEach(img => console.log(`  ✓ ${img}`));
    if (results.found.length > 5) {
      console.log(`  ... and ${results.found.length - 5} more`);
    }
  }
  
  console.log(`\nColor Variants Missing: ${results.missing.length}`);
  if (results.missing.length > 0 && results.missing.length <= 20) {
    results.missing.forEach(img => console.log(`  ✗ ${img}`));
  } else if (results.missing.length > 20) {
    console.log('Examples:');
    results.missing.slice(0, 10).forEach(img => console.log(`  ✗ ${img}`));
    console.log(`  ... and ${results.missing.length - 10} more`);
  }
  
  const totalNeeded = (COLORS.length - 2) * HAIRLINES.length * VIEWS.length;
  const progress = ((results.found.length / totalNeeded) * 100).toFixed(1);
  
  console.log(`\nProgress: ${results.found.length}/${totalNeeded} (${progress}%)`);
  
  // Generate a report file
  const report = {
    timestamp: new Date().toISOString(),
    originals: results.originals.length,
    found: results.found.length,
    missing: results.missing.length,
    totalNeeded: totalNeeded,
    progress: parseFloat(progress),
    foundImages: results.found,
    missingImages: results.missing
  };
  
  const reportPath = path.join(__dirname, 'image-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);
}

checkImages();

