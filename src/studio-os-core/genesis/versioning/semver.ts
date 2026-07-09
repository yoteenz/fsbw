import type { GenesisVersion } from '../types';

export function formatGenesisVersion(version: GenesisVersion): string {
  const base = `${version.major}.${version.minor}.${version.patch}`;
  return version.edition ? `${version.edition} — ${base}` : base;
}

export function parseGenesisVersion(input: string): GenesisVersion {
  const editionMatch = input.match(/^(.+?)\s*—\s*(\d+)\.(\d+)\.(\d+)$/);
  if (editionMatch) {
    return {
      edition: editionMatch[1].trim(),
      major: Number(editionMatch[2]),
      minor: Number(editionMatch[3]),
      patch: Number(editionMatch[4]),
    };
  }

  const parts = input.split('.').map(Number);
  return {
    major: parts[0] ?? 0,
    minor: parts[1] ?? 0,
    patch: parts[2] ?? 0,
  };
}

export function bumpGenesisVersion(
  version: GenesisVersion,
  level: 'major' | 'minor' | 'patch'
): GenesisVersion {
  switch (level) {
    case 'major':
      return { ...version, major: version.major + 1, minor: 0, patch: 0 };
    case 'minor':
      return { ...version, minor: version.minor + 1, patch: 0 };
    case 'patch':
      return { ...version, patch: version.patch + 1 };
  }
}

export function compareGenesisVersions(a: GenesisVersion, b: GenesisVersion): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

export const INITIAL_GENESIS_VERSION: GenesisVersion = {
  edition: 'Genesis First Edition',
  major: 1,
  minor: 0,
  patch: 0,
};
