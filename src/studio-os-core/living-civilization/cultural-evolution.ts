/**
 * Cultural Evolution™ — civilization develops identity over time.
 */

import { readCampusEvolutionStore } from '../campus-evolution-engine/store';
import type { CulturalTrait } from './types';

export function computeCulturalEvolution(companyName: string): CulturalTrait[] {
  const campus = readCampusEvolutionStore();
  const brand = campus.brandInheritance;
  const culture = campus.cultureProfile;
  const traits: CulturalTrait[] = [];

  if (brand.architecture) {
    traits.push({
      id: 'culture-architecture',
      category: 'architecture',
      label: 'Architectural Identity',
      expression: brand.architecture,
    });
  }

  if (brand.materials || brand.colors) {
    traits.push({
      id: 'culture-design',
      category: 'design',
      label: 'Design Language',
      expression: `${brand.materials} · ${brand.colors}`,
    });
  }

  if (brand.motionLanguage || brand.lighting) {
    traits.push({
      id: 'culture-language',
      category: 'language',
      label: 'Motion & Atmosphere',
      expression: `${brand.motionLanguage} · ${brand.lighting}`,
    });
  }

  if (brand.uniqueness || brand.identity) {
    traits.push({
      id: 'culture-philosophy',
      category: 'philosophy',
      label: 'Founder Philosophy',
      expression: brand.uniqueness || brand.identity,
    });
  }

  if (culture.expression) {
    traits.push({
      id: 'culture-tradition',
      category: 'tradition',
      label: 'Community Tradition',
      expression: culture.expression,
    });
  }

  if (campus.livingMuseum.length >= 3) {
    traits.push({
      id: 'culture-ceremony',
      category: 'ceremony',
      label: 'Innovation Ceremonies',
      expression: `${campus.livingMuseum.length} living museum halls · milestones celebrated through architecture`,
    });
  }

  if (traits.length === 0) {
    traits.push({
      id: 'culture-emerging',
      category: 'philosophy',
      label: 'Emerging Civilization',
      expression: `${companyName || 'Your company'} is establishing its cultural identity through earned progress`,
    });
  }

  return traits.slice(0, 5);
}
