import fs from 'fs';
import path from 'path';

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name === 'store.ts' || ent.name.endsWith('-store.ts') || ent.name === 'org-store.ts') out.push(p);
  }
  return out;
}

const files = walk('src/studio-os-core');
let count = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const ensureMatch = src.match(
    /export function (ensureOrganization[A-Za-z]+)\(\s*organizationId: string\s*\): ([^{]+)\{\s*return (sync[A-Za-z]+FromSources)\(organizationId\);\s*\}/
  );
  if (!ensureMatch) continue;

  const [, ensureFn, returnType, syncFn] = ensureMatch;
  const getMatch = src.match(/export function (getOrganization[A-Za-z]+)\(/);
  if (!getMatch) continue;
  const getFn = getMatch[1];

  const relImport = file.includes('/executive-council/') || file.includes('/studio-institute/')
    ? '../../sync/profile-cache'
    : '../sync/profile-cache';

  if (!src.includes('readFirstEnsure')) {
    const insert = `import { readFirstEnsure } from '${relImport}';\n`;
    const idx = src.indexOf('\n');
    src = src.slice(0, idx + 1) + insert + src.slice(idx + 1);
  }

  const oldBlock = ensureMatch[0];
  const newBlock = `export function ${ensureFn}(organizationId: string): ${returnType.trim()} {
  return readFirstEnsure(organizationId, ${getFn}, ${syncFn});
}`;
  src = src.replace(oldBlock, newBlock);
  fs.writeFileSync(file, src);
  count++;
}

console.log(`patched ${count} ensure functions`);
