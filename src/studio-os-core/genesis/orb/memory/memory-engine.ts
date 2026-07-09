import type { OrbMemoryEntry } from '../types';
import { orbEngineNow } from '../context/context-engine';
import { mutateOrbStore, readOrbStore } from '../persistence';

function seedGenericMemory(companyIdentityId: string): OrbMemoryEntry[] {
  const timestamp = orbEngineNow();
  return [
    {
      memoryId: 'mem-canonical-operating-principle',
      tier: 'canonical',
      title: 'Headquarters over dashboard',
      detail: 'Studio OS experiences should feel like rooms and executive environments, not admin dashboards.',
      sourceSystems: ['Headquarters Principles™', 'Executive Headquarters™'],
      companyIdentityId,
      canonical: true,
      createdAt: timestamp,
    },
    {
      memoryId: 'mem-founder-preference-focus',
      tier: 'founder',
      title: 'Prefers calm executive briefings',
      detail: 'Founder responds best to one next best action with evidence, not alert walls.',
      sourceSystems: ['Orb™', 'Life & Culture Preferences™'],
      companyIdentityId,
      canonical: false,
      createdAt: timestamp,
    },
    {
      memoryId: 'mem-company-launch-stack',
      tier: 'company',
      title: 'Launch Stack readiness active',
      detail: 'Company is operating in Launch Stack mode with projection adapters while upstream systems mature.',
      sourceSystems: ['Studio OS Build Order™', 'Executive Headquarters™'],
      companyIdentityId,
      canonical: true,
      createdAt: timestamp,
    },
    {
      memoryId: 'mem-working-mission-review',
      tier: 'working',
      title: 'Mission queue review in progress',
      detail: 'Founder is reviewing blocked and awaiting-approval missions.',
      sourceSystems: ['Mission Engine™'],
      companyIdentityId,
      canonical: false,
      createdAt: timestamp,
    },
    {
      memoryId: 'mem-learning-genesis',
      tier: 'learning',
      title: 'Genesis kernel hierarchy',
      detail: 'Genesis is the canonical source of truth; compiled outputs are projections only.',
      sourceSystems: ['Genesis™', 'Institute of Knowledge™'],
      companyIdentityId,
      canonical: false,
      createdAt: timestamp,
    },
  ];
}

export function listOrbMemoryEntries(): OrbMemoryEntry[] {
  return readOrbStore().memoryEntries;
}

export function listOrbMemoryByTier(tier: OrbMemoryEntry['tier']): OrbMemoryEntry[] {
  return listOrbMemoryEntries().filter((m) => m.tier === tier);
}

export function proposeOrbMemoryWrite(entry: Omit<OrbMemoryEntry, 'memoryId' | 'createdAt'>): OrbMemoryEntry {
  const memory: OrbMemoryEntry = {
    ...entry,
    memoryId: `mem-${Date.now()}`,
    createdAt: orbEngineNow(),
  };
  mutateOrbStore((store) => ({
    ...store,
    memoryEntries: [memory, ...store.memoryEntries].slice(0, 200),
  }));
  return memory;
}

export function seedOrbMemoryEngine(companyIdentityId: string): void {
  const store = readOrbStore();
  if (store.memoryEntries.length > 0) return;
  mutateOrbStore((current) => ({
    ...current,
    memoryEntries: seedGenericMemory(companyIdentityId),
  }));
}
