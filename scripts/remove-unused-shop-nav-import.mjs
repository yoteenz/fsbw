import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '..', 'src');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

for (const f of walk(src)) {
  if (f.endsWith('ShopMobileMenuShopTab.tsx')) continue;
  let c = fs.readFileSync(f, 'utf8');
  const matches = c.match(/navigateShopMenuSubItem/g);
  if (!matches) continue;
  if (matches.length > 1) continue;
  const lines = c.split(/\r?\n/);
  const next = lines.filter((l) => !/navigateShopMenuSubItem/.test(l));
  if (next.length === lines.length) continue;
  fs.writeFileSync(f, next.join('\n'));
  console.log('removed unused import:', f);
}
