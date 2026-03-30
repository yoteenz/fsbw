import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'src');

function componentsImportPath(fromFile) {
  const rel = path.relative(path.dirname(fromFile), path.join(src, 'components', 'ShopMobileMenuShopTab.tsx'));
  let s = rel.replace(/\\/g, '/').replace(/\.tsx$/, '');
  if (!s.startsWith('.')) s = './' + s;
  return s;
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

for (const f of walk(src)) {
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('<ShopMobileMenuShopTab')) continue;
  if (/import\s*\{[^}]*\bShopMobileMenuShopTab\b/.test(c)) continue;
  const imp = `import { ShopMobileMenuShopTab } from '${componentsImportPath(f)}';`;
  const lines = c.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) lastImport = i;
  }
  if (lastImport < 0) continue;
  lines.splice(lastImport + 1, 0, imp);
  fs.writeFileSync(f, lines.join('\n'));
  console.log('import added:', f);
}
