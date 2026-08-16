/** All In One dependency classification — standalone repository (Sprint 22) */

export type DependencyClass = 'AIO_SPECIFIC' | 'SHARED_GENERIC' | 'FS_SPECIFIC' | 'EXTERNAL';

export interface DependencyNode {
  id: string;
  path: string;
  class: DependencyClass;
  notes?: string;
}

export const AIO_DEPENDENCY_GRAPH: DependencyNode[] = [
  { id: 'aio-src', path: 'src/', class: 'AIO_SPECIFIC' },
  { id: 'aio-docs', path: 'docs/', class: 'AIO_SPECIFIC' },
  { id: 'aio-migrations', path: 'supabase/migrations/', class: 'AIO_SPECIFIC' },
  { id: 'aio-styles', path: 'src/styles/', class: 'AIO_SPECIFIC', notes: 'Scoped under .aio-app' },
  { id: 'react', path: 'react', class: 'EXTERNAL' },
  { id: 'react-router', path: 'react-router-dom', class: 'EXTERNAL' },
  { id: 'vitest', path: 'vitest', class: 'EXTERNAL' },
  { id: 'playwright', path: '@playwright/test', class: 'EXTERNAL' },
  { id: 'vite-standalone', path: 'vite.config.ts / src/main.tsx', class: 'AIO_SPECIFIC', notes: 'Independent entrypoint' },
  { id: 'fs-supabase', path: 'src/lib/supabase (FS host only)', class: 'FS_SPECIFIC', notes: 'Must NOT be imported' },
  { id: 'fs-admin', path: 'src/utils/adminAuth (FS host only)', class: 'FS_SPECIFIC', notes: 'Must NOT be imported' },
];

export function getFsSpecificDependencies(): DependencyNode[] {
  return AIO_DEPENDENCY_GRAPH.filter((n) => n.class === 'FS_SPECIFIC');
}

export function getAioSpecificDependencies(): DependencyNode[] {
  return AIO_DEPENDENCY_GRAPH.filter((n) => n.class === 'AIO_SPECIFIC');
}

/** Post-extraction: only non-blocking items remain */
export const EXTRACTION_BLOCKERS_STATIC = [
  'Dedicated AIO Supabase project not provisioned for live RLS tests',
] as const;

export type ExtractionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'VALIDATING' | 'EXTRACTED' | 'BLOCKED';

export const STANDALONE_EXTRACTION_STATUS: ExtractionStatus = 'EXTRACTED';
