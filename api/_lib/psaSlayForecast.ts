/**
 * Slay Forecast — hair-specific event/destination planning (no live weather API).
 */
export type SlayForecastClimate = {
  destination: string;
  heat: 'LOW' | 'MODERATE' | 'HIGH';
  humidity: 'LOW' | 'MODERATE' | 'HIGH';
  founderPickUnit: string;
  founderPickUnitId: string;
  why: string[];
  maintenanceNote: string;
  installTimingNote: string;
};

const FORECASTS: SlayForecastClimate[] = [
  {
    destination: 'MIAMI / SOUTH FLORIDA / CARIBBEAN',
    heat: 'HIGH',
    humidity: 'HIGH',
    founderPickUnit: 'BEACH WAVE',
    founderPickUnitId: 'beach-wave',
    why: [
      'Better texture retention in humid heat',
      'Lower daily fight than tight curls',
      'Still glam enough for dinner and photos',
    ],
    maintenanceNote: 'Plan a nightly wrap or pineapple routine if they are out late.',
    installTimingNote: 'Book install or self-install at least 3 to 5 days before the trip if this is a new unit.',
  },
  {
    destination: 'VEGAS / DESERT / ARIZONA',
    heat: 'HIGH',
    humidity: 'LOW',
    founderPickUnit: 'SOFT WAVE',
    founderPickUnitId: 'soft-wave',
    why: [
      'Dry heat can make bone-straight hair look flat by day two',
      'Soft wave holds shape with less product buildup',
      'Photographs well under harsh light',
    ],
    maintenanceNote: 'Light misting spray beats heavy oil in dry climates.',
    installTimingNote: 'If they need a fresh install, aim 4 to 7 days before travel.',
  },
  {
    destination: 'NYC / CHICAGO / WINTER CITY',
    heat: 'LOW',
    humidity: 'LOW',
    founderPickUnit: 'NOIR',
    founderPickUnitId: 'noir',
    why: [
      'Straight units behave predictably under coats and hats',
      'Less frizz risk than curls in dry cold air',
      'Easy to flat-iron touch up after transit',
    ],
    maintenanceNote: 'Silk scarf under wool hats saves edges.',
    installTimingNote: 'Winter events: confirm lace melt before heavy outerwear days.',
  },
  {
    destination: 'WEDDING / FORMAL GALA',
    heat: 'MODERATE',
    humidity: 'MODERATE',
    founderPickUnit: 'SOFT WAVE',
    founderPickUnitId: 'soft-wave',
    why: [
      'Versatile for ceremony and reception',
      'Holds up in photos without looking overdone',
      'Easier touch-up than tight curl patterns',
    ],
    maintenanceNote: 'Bring a travel flat iron or curling wand only if their chosen texture needs it.',
    installTimingNote: 'Install 2 to 4 days before the event so lace has settled.',
  },
  {
    destination: 'BEACH VACATION / HAWAII',
    heat: 'HIGH',
    humidity: 'HIGH',
    founderPickUnit: 'BEACH WAVE',
    founderPickUnitId: 'beach-wave',
    why: [
      'Salt air and humidity punish tight curl maintenance',
      'Beach wave reads intentional, not frizzy',
      'Still looks finished for resort dinners',
    ],
    maintenanceNote: 'Rinse salt water same day when possible.',
    installTimingNote: 'If this is a brand-new unit, do not wait until landing day to install.',
  },
];

function normalizeDestination(raw: string): string {
  return raw.trim().toUpperCase();
}

export function resolveSlayForecast(destination: string): SlayForecastClimate | null {
  const d = normalizeDestination(destination);
  if (!d) return null;

  for (const row of FORECASTS) {
    const keys = row.destination.split('/').map((k) => k.trim());
    if (keys.some((k) => d.includes(k) || k.includes(d))) return row;
  }

  if (/WEDDING|BRIDAL|GALA|FORMAL|PROM/i.test(d)) {
    return FORECASTS.find((r) => r.destination.includes('WEDDING')) ?? null;
  }
  if (/MIAMI|FLORIDA|CARIB|CABO|CANCUN|HUMID/i.test(d)) {
    return FORECASTS.find((r) => r.destination.includes('MIAMI')) ?? null;
  }
  if (/VEGAS|DESERT|PHOENIX|ARIZONA|PALM SPRINGS/i.test(d)) {
    return FORECASTS.find((r) => r.destination.includes('VEGAS')) ?? null;
  }
  if (/BEACH|HAWAII|ISLAND|VACATION/i.test(d)) {
    return FORECASTS.find((r) => r.destination.includes('BEACH')) ?? null;
  }
  if (/NYC|NEW YORK|CHICAGO|WINTER|SNOW/i.test(d)) {
    return FORECASTS.find((r) => r.destination.includes('NYC')) ?? null;
  }

  return null;
}

export function buildSlayForecastToolResult(destination: string): Record<string, unknown> {
  const forecast = resolveSlayForecast(destination);
  if (!forecast) {
    return {
      found: false,
      destination,
      message:
        'No preset forecast for that destination. Ask about heat, humidity, and maintenance tolerance, then recommend from catalog.',
    };
  }
  return {
    found: true,
    slayForecast: {
      destination: forecast.destination,
      heat: forecast.heat,
      humidity: forecast.humidity,
      founderPick: forecast.founderPickUnit,
      founderPickUnitId: forecast.founderPickUnitId,
      why: forecast.why,
      maintenance: forecast.maintenanceNote,
      installTiming: forecast.installTimingNote,
    },
  };
}

export function buildPsaSlayForecastBlock(): string {
  return `## Slay Forecast (event / destination mode)
When a member mentions a trip, wedding, or city (e.g. "going to Miami"), build a **SLAY FORECAST** block:

SLAY FORECAST
HEAT: {LOW|MODERATE|HIGH}
HUMIDITY: {LOW|MODERATE|HIGH}
MY PICK: {UNIT}
WHY: (2 to 3 bullets)
MAINTENANCE: (one line)
INSTALL TIMING: (one line)

Call \`get_slay_forecast\` with their destination before guessing. Tie into Build-a-Wig, booking, and Lounge lessons when relevant.`;
}
