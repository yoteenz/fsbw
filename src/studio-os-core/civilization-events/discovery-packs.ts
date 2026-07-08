/**
 * Discovery Pack Rewards™ — earned civilization discoveries, never purchased.
 */

import type { CivilizationDiscovery } from './types';

export const CIVILIZATION_DISCOVERY_CATALOG: CivilizationDiscovery[] = [
  {
    id: 'disc-prototype-tech-vault',
    kind: 'technology',
    title: 'Prototype Technology Vault™',
    description: 'Exclusive prototype systems unlocked only through Innovation Challenge victory',
    earnedOnly: true,
    unlockedBy: 'Invent the Impossible™ — Innovation Challenge winner',
    worldGraphNodeId: 'W-DISC-prototype-tech-vault',
    permanentEffects: ['Prototype Vault™ advanced bays', 'New AI capability nodes in World Graph™'],
  },
  {
    id: 'disc-profession-monuments',
    kind: 'architectural-style',
    title: 'Profession Monument Row™',
    description: 'Industry Olympics winners commission permanent profession monuments',
    earnedOnly: true,
    unlockedBy: 'Industry Olympics™ 2026 — profession champions',
    worldGraphNodeId: 'W-DISC-profession-monuments',
    permanentEffects: ['Innovation District monument row', 'New Atlas profession destinations'],
  },
  {
    id: 'disc-skybridge-research-institute',
    kind: 'district',
    title: 'Skybridge Research Institute™',
    description: 'Cross-discipline championship unlocks shared research campus infrastructure',
    earnedOnly: true,
    unlockedBy: 'Cross-Discipline Championship™ — collaborative innovation winner',
    worldGraphNodeId: 'W-DISC-skybridge-research',
    permanentEffects: ['Skybridge connects districts', 'Research Institute™ wing commissioned', 'Joint Museum eligibility'],
  },
  {
    id: 'disc-advanced-blueprint-system',
    kind: 'blueprint-system',
    title: 'Advanced Blueprint System™',
    description: 'Knowledge Tournament unlocks next-generation Blueprint lineage tools',
    earnedOnly: true,
    unlockedBy: 'Knowledge Tournament™ — applied knowledge champion',
    worldGraphNodeId: 'W-DISC-advanced-blueprint',
    permanentEffects: ['Knowledge Library advanced wings', 'Blueprint Graph™ depth expansion'],
  },
  {
    id: 'disc-legendary-materials',
    kind: 'material',
    title: 'Legendary Materials Library™',
    description: 'World Expo grand prize — materials that cannot be bought, only discovered',
    earnedOnly: true,
    unlockedBy: 'Studio World Expo™ — grand jury selection',
    worldGraphNodeId: 'W-DISC-legendary-materials',
    permanentEffects: ['Material Library legendary tier', 'Environmental theme unlocks'],
  },
  {
    id: 'disc-orb-curator-mode',
    kind: 'orb-ability',
    title: 'Orb Civilization Curator Mode™',
    description: 'Exclusive Orb ability to identify emerging talent and future collaborations',
    earnedOnly: true,
    unlockedBy: 'Greatest Community Builder™ — Collaboration Honor',
    worldGraphNodeId: 'W-DISC-orb-curator',
    permanentEffects: ['Orb identifies nominees', 'Collaboration matchmaking across civilization'],
  },
  {
    id: 'disc-grand-challenge-district',
    kind: 'district',
    title: 'Grand Challenge Legacy District™',
    description: 'Annual Grand Challenge winner permanently expands Studio World geography',
    earnedOnly: true,
    unlockedBy: 'The Grand Challenge™ 2026 — community breakthrough',
    worldGraphNodeId: 'W-DISC-grand-challenge-district',
    permanentEffects: ['New district unlocked', 'Education Institute annex', 'Permanent curriculum in World Graph™'],
  },
  {
    id: 'disc-expo-atlas-pavilion',
    kind: 'atlas-destination',
    title: 'Expo Pavilion Atlas Destination™',
    description: 'World Expo becomes permanent Atlas showcase destination',
    earnedOnly: true,
    unlockedBy: 'Studio World Expo™ 2026 — annual showcase',
    worldGraphNodeId: 'W-DISC-expo-atlas',
    permanentEffects: ['Atlas Expo Pavilion', 'Marketplace exhibition integration', 'Visitor vote history preserved'],
  },
];

export function discoveryById(id: string): CivilizationDiscovery | undefined {
  return CIVILIZATION_DISCOVERY_CATALOG.find((d) => d.id === id);
}
