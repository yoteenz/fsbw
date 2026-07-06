/** Milestone 96 — Memory Engine™ V1.0 */

export const MEMORY_ENGINE_STORAGE_KEY = 'studioOsMemoryEngine_v1';
export const MEMORY_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_MEMORY_ENGINE_UPDATED = 'studio-os-memory-engine-updated';

export const MEMORY_ENGINE_PHILOSOPHY = [
  'Knowledge explains why something works. Memory proves whether it actually worked.',
  'Studio OS should remember forever — transforming from assistant into an organization that remembers.',
  'Every completed project compounds institutional knowledge — lessons · best practices · mistakes to avoid.',
  'Stop repeating mistakes. Continuously compound what the organization has proven in practice.',
] as const;

export const MEMORY_RECORD_TYPES = [
  'project',
  'campaign',
  'experiment',
  'decision',
  'success',
  'failure',
  'lesson',
  'customer-history',
  'meeting-outcome',
  'workflow-improvement',
  'historical-metric',
  'professional-insight',
] as const;

export const MEMORY_OUTCOMES = ['success', 'partial', 'failure', 'ongoing', 'unknown'] as const;

export const RECALL_RECOMMENDATIONS = [
  'strongly-recommend',
  'recommend',
  'cautious',
  'avoid',
  'insufficient-data',
] as const;

export const PROJECT_ARTIFACT_SECTIONS = [
  'lessons-learned',
  'best-practices',
  'mistakes-to-avoid',
  'recommendations',
  'future-improvements',
] as const;
