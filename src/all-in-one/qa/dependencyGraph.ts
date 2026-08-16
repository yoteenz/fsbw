/** All In One dependency classification for extraction */

export type DependencyClass = 'AIO_SPECIFIC' | 'SHARED_GENERIC' | 'FS_SPECIFIC' | 'EXTERNAL';

export interface DependencyNode {
  id: string;
  path: string;
  class: DependencyClass;
  notes?: string;
}

export const AIO_DEPENDENCY_GRAPH: DependencyNode[] = [
  { id: 'aio-src', path: 'src/all-in-one/', class: 'AIO_SPECIFIC' },
  { id: 'aio-docs', path: 'docs/all-in-one/', class: 'AIO_SPECIFIC' },
  { id: 'aio-migrations', path: 'all-in-one/supabase/migrations/', class: 'AIO_SPECIFIC' },
  { id: 'aio-styles', path: 'src/all-in-one/styles/', class: 'AIO_SPECIFIC', notes: 'Scoped under .aio-app' },
  { id: 'react', path: 'react', class: 'EXTERNAL' },
  { id: 'react-router', path: 'react-router-dom', class: 'EXTERNAL' },
  { id: 'vitest', path: 'vitest', class: 'EXTERNAL' },
  { id: 'playwright', path: '@playwright/test', class: 'EXTERNAL' },
  { id: 'vite-host', path: 'vite.config / App.tsx lazy host', class: 'SHARED_GENERIC', notes: 'Extraction replaces host shell' },
  { id: 'fs-supabase', path: 'src/lib/supabase', class: 'FS_SPECIFIC', notes: 'Must NOT be imported by AIO' },
  { id: 'fs-admin', path: 'src/utils/adminAuth', class: 'FS_SPECIFIC', notes: 'Must NOT be imported by AIO' },
];

export function getFsSpecificDependencies(): DependencyNode[] {
  return AIO_DEPENDENCY_GRAPH.filter((n) => n.class === 'FS_SPECIFIC');
}

export function getAioSpecificDependencies(): DependencyNode[] {
  return AIO_DEPENDENCY_GRAPH.filter((n) => n.class === 'AIO_SPECIFIC');
}

/** Known extraction blockers from shared-host architecture */
export const EXTRACTION_BLOCKERS_STATIC = [
  'Application still mounted via Frontal Slayer App.tsx lazy route host',
  'Shared Vite build bundles AIO with FS — not standalone package.json yet',
  'Debug route /all-in-one not yet standalone domain',
  'Dedicated AIO Supabase project not provisioned for live RLS tests',
] as const;
