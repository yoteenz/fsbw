/**
 * Primary architectural destinations — places, not pages.
 * ERA 2 — WORLD™
 */

import type { ArchitecturalDestination } from './types';

export const ATLAS_DESTINATION: ArchitecturalDestination = {
  id: 'atlas',
  label: 'Atlas™',
  icon: '🌎',
  path: '/admin/studio/world-atlas',
  kind: 'atlas',
};

/** Flagship-scale destinations visible from any headquarters */
export const PRIMARY_ARCHITECTURAL_DESTINATIONS: ArchitecturalDestination[] = [
  {
    id: 'warehouse',
    label: 'Warehouse™',
    icon: '🏭',
    path: '/admin/studio/studio-archives',
    kind: 'flagship',
  },
  {
    id: 'museum',
    label: 'Museum™',
    icon: '🏛',
    path: '/admin/studio/studio-archives?zone=museum-wing',
    kind: 'wing',
  },
  {
    id: 'innovation-district',
    label: 'Innovation District™',
    icon: '✦',
    path: '/admin/studio/innovation-district',
    kind: 'flagship',
  },
  {
    id: 'knowledge-library',
    label: 'Knowledge Library™',
    icon: '📚',
    path: '/admin/studio/world-knowledge-engine',
    kind: 'flagship',
  },
  {
    id: 'blueprint-hall',
    label: 'Blueprint Hall™',
    icon: '📐',
    path: '/admin/studio/studio-archives?zone=blueprint-archive',
    kind: 'wing',
  },
  {
    id: 'prototype-vault',
    label: 'Prototype Vault™',
    icon: '🔬',
    path: '/admin/studio/studio-archives?zone=generation-bay',
    kind: 'wing',
  },
  {
    id: 'material-library',
    label: 'Material Library™',
    icon: '🪨',
    path: '/admin/studio/studio-archives?zone=materials-library',
    kind: 'wing',
  },
  {
    id: 'genome-lab',
    label: 'Genome Lab™',
    icon: '🧬',
    path: '/admin/studio/studio-archives?zone=company-genome-vault',
    kind: 'wing',
  },
  {
    id: 'marketplace-pavilion',
    label: 'Marketplace Pavilion™',
    icon: '🏪',
    path: '/admin/studio/studio-archives?zone=marketplace-imports',
    kind: 'wing',
  },
  {
    id: 'future-observatory',
    label: 'Future Observatory™',
    icon: '🔭',
    path: '/admin/studio/architecture-observatory',
    kind: 'flagship',
  },
  {
    id: 'creative-direction',
    label: 'Creative Direction Studio™',
    icon: '🎬',
    path: '/admin/studio/department/creative-direction',
    kind: 'flagship',
  },
  {
    id: 'command-center',
    label: 'Command Deck™',
    icon: '⚡',
    path: '/admin/studio/overview',
    kind: 'flagship',
  },
];
