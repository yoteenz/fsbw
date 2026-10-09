import { existsSync } from 'node:fs';

const CANDIDATES = [
  process.env.WFE_BLENDER_BIN,
  '/home/ubuntu/.tools/blender-5.2.2-linux-x64/blender',
  '/usr/bin/blender',
].filter(Boolean) as string[];

export function resolveBlenderExecutable(): { path: string; versionHint: string } | null {
  for (const path of CANDIDATES) {
    if (existsSync(path)) {
      const hint = path.includes('5.2.2') ? '5.2.2 LTS' : 'system';
      return { path, versionHint: hint };
    }
  }
  return null;
}
