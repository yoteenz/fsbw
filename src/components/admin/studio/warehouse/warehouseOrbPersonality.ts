import type { WarehouseWingKind } from '../../../../studio-os-core/studio-warehouse/campus-nav';
import type { LivingArchitectureSnapshot } from '../../../../studio-os-core/living-architecture';
import type { LivingDistrictEcologySnapshot } from '../../../../studio-os-core/living-district-ecology';
import type { LivingCivilizationSnapshot } from '../../../../studio-os-core/living-civilization';
import type { CivilizationEventsSnapshot } from '../../../../studio-os-core/civilization-events';

export type WarehouseOrbPersonality = {
  role: string;
  greeting: string;
  accent: string;
};

const PERSONALITIES: Record<WarehouseWingKind, WarehouseOrbPersonality> = {
  threshold: {
    role: 'Archives Greeter',
    greeting:
      'Welcome to Studio Archives™ — the institutional memory of your company. Cross the Grand Entrance when you are ready.',
    accent: '#c9a962',
  },
  atrium: {
    role: 'Campus Navigator',
    greeting:
      'The Orientation Atrium™ connects every wing — production, legacy, innovation, genome, blueprints, and marketplace.',
    accent: '#d4c4a0',
  },
  warehouse: {
    role: 'Production Assistant',
    greeting:
      'I help retrieve assets, compare lighting packs, and mount objects to workspaces without regenerating.',
    accent: '#c9a962',
  },
  legacy: {
    role: 'Company Historian',
    greeting:
      'Every Golden Build™ is preserved forever — walk the Legacy Hall and touch your company history.',
    accent: '#9b7bb8',
  },
  innovation: {
    role: 'Storyteller & Inventor',
    greeting:
      'This wing holds breakthroughs — the problem, the invention, its impact, and its descendants on the Innovation Tree™.',
    accent: '#8ba4c4',
  },
  genome: {
    role: 'Brand Analyst',
    greeting:
      'The Company Genome Vault™ holds your evolving DNA — taste, motion, materials, and reuse patterns that power every recommendation.',
    accent: '#b8d4a8',
  },
  blueprint: {
    role: 'Systems Architect',
    greeting:
      'Blueprint Archive™ stores reusable systems — versioned, forkable, and marketplace eligible. Every workflow your company perfected.',
    accent: '#a8c4e0',
  },
  marketplace: {
    role: 'Creative Advisor',
    greeting:
      'Marketplace Pavilion™ — preview headquarters, departments, and scene packs. Import directly into the Warehouse Wing™.',
    accent: '#e8c878',
  },
  expansion: {
    role: 'Campus Architect',
    greeting:
      'Future Expansion Wings™ await — Research Institute™, AI Laboratory™, Patent Vault™, and more connect to the Atrium.',
    accent: '#d4af7a',
  },
};

export function resolveWarehouseOrbPersonality(
  wing: WarehouseWingKind,
  livingArchitecture?: LivingArchitectureSnapshot | null,
  livingEcology?: LivingDistrictEcologySnapshot | null,
  livingCivilization?: LivingCivilizationSnapshot | null,
  civilizationEvents?: CivilizationEventsSnapshot | null
): WarehouseOrbPersonality {
  const base = PERSONALITIES[wing];

  const discoveryCulture = civilizationEvents?.discoveryCulture;
  const worldExpanding = discoveryCulture?.worldExpansionAmbient != null;

  if (worldExpanding && civilizationEvents?.orbDiscoveryLine) {
    const oracleRoles: Partial<Record<WarehouseWingKind, string>> = {
      atrium: 'Discovery Oracle',
      legacy: 'World Historian',
      innovation: 'Frontier Explorer',
      marketplace: 'Discovery Cartographer',
      expansion: 'Atlas Oracle',
      blueprint: 'Knowledge Seeker',
      warehouse: 'Expedition Guide',
      genome: 'Mystery Analyst',
      threshold: 'World Greeter',
    };

    return {
      ...base,
      role: oracleRoles[wing] ?? 'Discovery Oracle',
      greeting: civilizationEvents.orbDiscoveryLine,
      accent: '#b8d4a8',
    };
  }

  if (civilizationEvents?.orbDiscoveryLine && !civilizationEvents.orbCuratorLine) {
    const oracleRoles: Partial<Record<WarehouseWingKind, string>> = {
      atrium: 'Discovery Oracle',
      expansion: 'Frontier Oracle',
      innovation: 'Exploration Guide',
      legacy: 'Lore Keeper',
    };

    return {
      ...base,
      role: oracleRoles[wing] ?? 'Discovery Oracle',
      greeting: civilizationEvents.orbDiscoveryLine,
      accent: '#a8c4b8',
    };
  }

  if (civilizationEvents?.orbCuratorLine) {
    const curatorRoles: Partial<Record<WarehouseWingKind, string>> = {
      atrium: 'Civilization Curator',
      legacy: 'Living Museum Curator',
      innovation: 'Discovery Curator',
      marketplace: 'Expo Curator',
      expansion: 'Grand Challenge Curator',
      blueprint: 'Knowledge Tournament Curator',
      warehouse: 'Industry Olympics Curator',
      genome: 'Collaboration Curator',
      threshold: 'Civilization Greeter',
    };

    return {
      ...base,
      role: curatorRoles[wing] ?? 'Civilization Curator',
      greeting: civilizationEvents.orbCuratorLine,
      accent: '#e8c878',
    };
  }

  if (livingCivilization?.orbArchitectLine) {
    const architectRoles: Partial<Record<WarehouseWingKind, string>> = {
      atrium: 'Civilization Architect',
      warehouse: 'Production Strategist',
      marketplace: 'Market Civilization Advisor',
      innovation: 'Innovation Civilization Lead',
      legacy: 'Historical Preservation Architect',
      expansion: 'Civilization Urban Planner',
      blueprint: 'Knowledge Systems Architect',
      genome: 'Cultural Evolution Analyst',
      threshold: 'Civilization Greeter',
    };

    return {
      ...base,
      role: architectRoles[wing] ?? 'Civilization Architect',
      greeting: livingCivilization.orbArchitectLine,
      accent: '#c9a962',
    };
  }

  if (livingEcology?.orbPlannerLine) {
    const plannerRoles: Partial<Record<WarehouseWingKind, string>> = {
      atrium: 'Ecosystem Architect',
      warehouse: 'Urban Production Planner',
      marketplace: 'Commerce Strategist',
      innovation: 'Innovation Ecologist',
      legacy: 'Preservation Planner',
      expansion: 'Campus Urban Planner',
      blueprint: 'Systems Ecologist',
      genome: 'Growth Analyst',
    };

    return {
      ...base,
      role: plannerRoles[wing] ?? 'Ecosystem Architect',
      greeting: livingEcology.orbPlannerLine,
      accent: '#8ba4c4',
    };
  }

  if (livingArchitecture?.orbHistorianLine) {
    const historianRoles: Partial<Record<WarehouseWingKind, string>> = {
      legacy: 'Architectural Historian',
      innovation: 'Architectural Historian',
      expansion: 'Campus Architect',
      warehouse: 'Production Historian',
      atrium: 'Campus Historian',
    };

    return {
      ...base,
      role: historianRoles[wing] ?? 'Architectural Historian',
      greeting: livingArchitecture.orbHistorianLine,
    };
  }

  return base;
}
