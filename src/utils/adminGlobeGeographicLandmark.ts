/**
 * Best-effort “postcard” landmark (title + emoji) from city/region/country text — no external API.
 * Used for order ship clusters and standalone live visitor points on the admin globe.
 */
export type GeographicLandmark = { title: string; symbol: string };

const RULES: Array<{ test: RegExp; title: string; symbol: string }> = [
  { test: /\bNEW YORK\b|\bNYC\b|\bNY,\s*US\b/, title: 'Statue of Liberty', symbol: '🗽' },
  { test: /\bLOS ANGELES\b|\bLA,\s*CA\b/, title: 'Hollywood Sign', symbol: '🎬' },
  { test: /\bSAN FRANCISCO\b|\bGOLDEN GATE\b/, title: 'Golden Gate', symbol: '🌉' },
  { test: /\bCHICAGO\b/, title: 'Cloud Gate', symbol: '☁️' },
  { test: /\bSEATTLE\b/, title: 'Space Needle', symbol: '🗼' },
  { test: /\bMIAMI\b/, title: 'Art Deco Beach', symbol: '🏖️' },
  { test: /\bLAS VEGAS\b/, title: 'Strip', symbol: '🎰' },
  { test: /\bMEMPHIS\b|\bMUSIC CITY\b/, title: 'Graceland & Blues', symbol: '🎸' },
  { test: /\bNASHVILLE\b/, title: 'Music Row', symbol: '🎸' },
  { test: /\bWASHINGTON\b|\bDC\b/, title: 'Capitol', symbol: '🏛️' },
  { test: /\bAUSTIN\b|\bAUSTIN,\s*TX\b/, title: 'Live Music', symbol: '🤠' },
  { test: /\bLONDON\b/, title: 'Big Ben', symbol: '🕰️' },
  { test: /\bPARIS\b/, title: 'Eiffel Tower', symbol: '🗼' },
  { test: /\bBERLIN\b/, title: 'Brandenburg Gate', symbol: '🏛️' },
  { test: /\bTOKYO\b/, title: 'Tokyo Tower', symbol: '🗼' },
  { test: /\bDUBAI\b/, title: 'Burj Khalifa', symbol: '🏙️' },
  { test: /\bSYDNEY\b/, title: 'Opera House', symbol: '🎭' },
  { test: /\bTORONTO\b/, title: 'CN Tower', symbol: '🗼' },
  { test: /\bMEXICO CITY\b/, title: 'Angel of Independence', symbol: '🪽' },
  { test: /\bRIO DE JANEIRO\b|\bRIO DE JANEIRO,?\s*RJ\b/, title: 'Christ the Redeemer', symbol: '🗿' },
  { test: /\bMUMBAI\b/, title: 'Gateway of India', symbol: '🛕' },
  { test: /\bSINGAPORE\b/, title: 'Marina Bay', symbol: '🦁' },
  { test: /\bSEOUL\b/, title: 'N Seoul Tower', symbol: '🗼' },
  { test: /\bMOSCOW\b/, title: "Saint Basil's", symbol: '🧅' },
  { test: /\bCAIRO\b/, title: 'Pyramids', symbol: '🔺' },
  { test: /\bJOHANNESBURG\b/, title: 'City skyline', symbol: '🏙️' },
  { test: /\bSTOCKHOLM\b/, title: 'Gamla Stan', symbol: '🏰' },
  { test: /\bBUENOS AIRES\b/, title: 'Obelisk', symbol: '🗼' },
  { test: /\bMELBOURNE\b/, title: 'Arts Centre', symbol: '🎭' },
  { test: /\bAMSTERDAM\b|\bKÖLN\b|\bMÜNCHEN\b|\bBARCELONA\b|\bROME\b|\bFLORENCE\b|\bVENICE\b/, title: 'Canals & piazzas', symbol: '🧭' },
];

/**
 * @param mode — `order` clusters default to “Orders hub” when unknown; `visitor` to “Local views”.
 */
export function landmarkForGeographicText(blob: string, mode: 'order' | 'visitor' = 'order'): GeographicLandmark {
  const b = String(blob ?? '')
    .trim()
    .toUpperCase();
  for (const r of RULES) {
    if (r.test.test(b)) return { title: r.title, symbol: r.symbol };
  }
  if (mode === 'visitor') return { title: 'Local views', symbol: '👁️' };
  return { title: 'Orders hub', symbol: '📍' };
}
