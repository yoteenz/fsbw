import type { Load } from '../dispatch/dispatchTypes';
import type { LoadBoardPublication, LoadMatchScore, LoadMatchScoreBand } from './freightTypes';
import type { TruckDispatchProfile } from '../dispatch/dispatchTypes';
import { computeLoadedRpm, computeTrueRpm } from './freightCalculations';

export interface LoadScoreContext {
  publication: LoadBoardPublication;
  carrierRateMinor: number;
  pickupDeadheadMiles: number;
  truck?: TruckDispatchProfile;
  preferences?: {
    minPreferredRpmMinor?: number;
    preferredEquipment?: string;
    preferredStates?: string[];
  };
}

function bandForScore(score: number): LoadMatchScoreBand {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'strong';
  if (score >= 70) return 'good';
  if (score >= 60) return 'fair';
  return 'low';
}

function bandLabel(band: LoadMatchScoreBand): string {
  switch (band) {
    case 'excellent': return 'EXCELLENT MATCH';
    case 'strong': return 'STRONG MATCH';
    case 'good': return 'GOOD MATCH';
    case 'fair': return 'FAIR MATCH';
    case 'low': return 'LOW MATCH';
    default: return 'INSUFFICIENT DATA';
  }
}

/** Explainable score — returns insufficient_data when inputs are too sparse. */
export function computeLoadMatchScore(load: Load, ctx: LoadScoreContext): LoadMatchScore {
  const reasons: string[] = [];
  let points = 0;
  let maxPoints = 0;

  if (ctx.carrierRateMinor <= 0 || load.loadedMiles <= 0) {
    return { score: 0, band: 'insufficient_data', label: 'INSUFFICIENT DATA', reasons: ['Rate or mileage data missing'] };
  }

  const loadedRpm = computeLoadedRpm(ctx.carrierRateMinor, load.loadedMiles);
  const trueRpm = computeTrueRpm(ctx.carrierRateMinor, ctx.pickupDeadheadMiles, load.loadedMiles);

  maxPoints += 25;
  if (loadedRpm >= 200) { points += 25; reasons.push('Strong loaded rate per mile'); }
  else if (loadedRpm >= 150) { points += 18; reasons.push('Acceptable loaded rate per mile'); }
  else { points += 8; reasons.push('Below typical loaded RPM'); }

  maxPoints += 20;
  if (ctx.pickupDeadheadMiles <= 50) { points += 20; reasons.push('Low pickup deadhead'); }
  else if (ctx.pickupDeadheadMiles <= 100) { points += 12; reasons.push('Moderate pickup deadhead'); }
  else { points += 4; reasons.push('High pickup deadhead reduces true RPM'); }

  maxPoints += 15;
  if (trueRpm >= 180) { points += 15; reasons.push('True RPM supports immediate profitability'); }
  else if (trueRpm >= 140) { points += 10; }
  else { points += 3; reasons.push('True RPM is tight after deadhead'); }

  if (ctx.truck) {
    maxPoints += 20;
    const eqMatch = !ctx.truck.trailerType || load.equipmentType.toLowerCase().includes((ctx.truck.trailerType ?? '').toLowerCase().slice(0, 4));
    if (eqMatch) { points += 20; reasons.push(`Equipment compatible with ${ctx.truck.nickname}`); }
    else { points += 5; reasons.push('Equipment may not match selected truck'); }

    maxPoints += 10;
    if (ctx.truck.availability === 'available') { points += 10; reasons.push('Truck marked available'); }
    else if (ctx.truck.availability === 'available_soon') { points += 6; reasons.push('Truck available soon'); }
    else { points += 0; reasons.push('Truck availability limited'); }
  }

  if (ctx.preferences?.minPreferredRpmMinor) {
    maxPoints += 10;
    if (loadedRpm >= ctx.preferences.minPreferredRpmMinor) {
      points += 10;
      reasons.push('Meets your minimum RPM preference');
    }
  }

  if (maxPoints < 40) {
    return { score: 0, band: 'insufficient_data', label: 'INSUFFICIENT DATA', reasons: ['Add truck or preferences for a trustworthy score'] };
  }

  const score = Math.round((points / maxPoints) * 100);
  const band = bandForScore(score);
  return { score, band, label: bandLabel(band), reasons };
}
