/** Map US postal abbreviations to full state names (admin display). */
const US_STATE_NAMES: Record<string, string> = {
  AL: 'ALABAMA',
  AK: 'ALASKA',
  AZ: 'ARIZONA',
  AR: 'ARKANSAS',
  CA: 'CALIFORNIA',
  CO: 'COLORADO',
  CT: 'CONNECTICUT',
  DE: 'DELAWARE',
  DC: 'DISTRICT OF COLUMBIA',
  FL: 'FLORIDA',
  GA: 'GEORGIA',
  HI: 'HAWAII',
  ID: 'IDAHO',
  IL: 'ILLINOIS',
  IN: 'INDIANA',
  IA: 'IOWA',
  KS: 'KANSAS',
  KY: 'KENTUCKY',
  LA: 'LOUISIANA',
  ME: 'MAINE',
  MD: 'MARYLAND',
  MA: 'MASSACHUSETTS',
  MI: 'MICHIGAN',
  MN: 'MINNESOTA',
  MS: 'MISSISSIPPI',
  MO: 'MISSOURI',
  MT: 'MONTANA',
  NE: 'NEBRASKA',
  NV: 'NEVADA',
  NH: 'NEW HAMPSHIRE',
  NJ: 'NEW JERSEY',
  NM: 'NEW MEXICO',
  NY: 'NEW YORK',
  NC: 'NORTH CAROLINA',
  ND: 'NORTH DAKOTA',
  OH: 'OHIO',
  OK: 'OKLAHOMA',
  OR: 'OREGON',
  PA: 'PENNSYLVANIA',
  RI: 'RHODE ISLAND',
  SC: 'SOUTH CAROLINA',
  SD: 'SOUTH DAKOTA',
  TN: 'TENNESSEE',
  TX: 'TEXAS',
  UT: 'UTAH',
  VT: 'VERMONT',
  VA: 'VIRGINIA',
  WA: 'WASHINGTON',
  WV: 'WEST VIRGINIA',
  WI: 'WISCONSIN',
  WY: 'WYOMING',
};

/**
 * Best-effort: last "CITY, ST 12345" or "..., ST, 12345" segment in a single-line US address.
 */
export function fullUsStateNameFromAddressLine(address: string | undefined | null): string | undefined {
  const t = (address || '').trim();
  if (!t) return undefined;
  const m = t.match(/,\s*([A-Za-z]{2})\s+(\d{5})(?:-\d{4})?\s*$/);
  if (!m) return undefined;
  const abbr = m[1].toUpperCase();
  return US_STATE_NAMES[abbr];
}

export function regionParenLabelFromAddressLine(address: string | undefined | null): string | undefined {
  const us = fullUsStateNameFromAddressLine(address);
  if (us) return us;
  const t = (address || '').trim();
  if (!t) return undefined;
  const parts = t.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return undefined;
  const last = parts[parts.length - 1]!;
  // Skip if last segment looks like a US zip-only tail (already handled)
  if (/^[A-Za-z]{2}\s+\d{5}/.test(last)) return undefined;
  const upper = last.toUpperCase();
  if (upper.length >= 3 && upper.length <= 40 && /^[A-Z0-9\s.'-]+$/.test(upper)) return upper;
  return undefined;
}
