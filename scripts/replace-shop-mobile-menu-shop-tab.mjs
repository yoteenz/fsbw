/**
 * One-off codemod: replace inline SHOP mobile menu array+map with <ShopMobileMenuShopTab />.
 * Run from repo root: node scripts/replace-shop-mobile-menu-shop-tab.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'src');

const NEEDLE =
  "{ label: 'UNITS', hasArrow: true, isExpandable: true, subItems: ['STRAIGHT', 'WAVY', 'CURLY'] }";

function componentsImportPath(fromFile) {
  const rel = path.relative(path.dirname(fromFile), path.join(src, 'components', 'ShopMobileMenuShopTab.tsx'));
  let s = rel.replace(/\\/g, '/').replace(/\.tsx$/, '');
  if (!s.startsWith('.')) s = './' + s;
  return s;
}

function findUnitsLine(lines) {
  return lines.findIndex((l) => l.includes(NEEDLE));
}

function findArrayStart(lines, unitsIdx) {
  for (let i = unitsIdx; i >= 0; i--) {
    if (/^\s*\[\s*$/.test(lines[i])) return i;
  }
  return -1;
}

function findMapLine(lines, unitsIdx) {
  for (let i = unitsIdx; i < lines.length; i++) {
    if (lines[i].includes('].map((item, index) => (')) return i;
  }
  return -1;
}

function findMapEnd(lines, mapLine) {
  for (let i = mapLine + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === '))') return i;
  }
  return -1;
}

function ensureImport(content, fromFile) {
  if (/import\s*\{[^}]*\bShopMobileMenuShopTab\b/.test(content)) return content;
  const imp = `import { ShopMobileMenuShopTab } from '${componentsImportPath(fromFile)}';`;
  const lines = content.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) lastImport = i;
  }
  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, imp);
    return lines.join('\n');
  }
  return imp + '\n' + content;
}

function indentOf(line) {
  const m = line.match(/^(\s*)/);
  return m ? m[1] : '';
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const unitsIdx = findUnitsLine(lines);
  if (unitsIdx < 0) return { filePath, status: 'skip-no-units' };

  const start = findArrayStart(lines, unitsIdx);
  const mapLine = findMapLine(lines, unitsIdx);
  const end = findMapEnd(lines, mapLine);
  if (start < 0 || mapLine < 0 || end < 0) {
    return { filePath, status: `skip-bounds start=${start} map=${mapLine} end=${end}` };
  }

  const block = lines.slice(start, end + 1).join('\n');
  if (block.includes('ShopMobileMenuShopTab')) return { filePath, status: 'skip-already' };

  const duplicate = block.includes("!item.isExpandable && item.label === 'ORDER AUTHORIZATION FORM'");
  const tm = block.match(/transform:\s*['"]translateX\(([^)]+)\)['"]/);
  const translate = tm ? tm[1] : '7px';

  const isBookingLayout = filePath.endsWith('BookingFlowLayout.tsx');
  const baseIndent = indentOf(lines[start]);
  const p = `${baseIndent}                        `;

  const propLines = [
    `${p}navigate={navigate}`,
    `${p}mobileMenuExpandedItems={mobileMenuExpandedItems}`,
    `${p}handleMobileMenuItemToggle={handleMobileMenuItemToggle}`
  ];
  if (isBookingLayout) {
    propLines.push(
      `${p}closeSubItemMenu={closeMenu}`,
      `${p}closeAfterStaticNav={closeMenu}`,
      `${p}buildAWigPath="/build-a-wig/noir"`,
      `${p}labelTranslateX="${translate}"`,
      `${p}arrowImgAlt=""`
    );
  } else {
    propLines.push(`${p}closeSubItemMenu={() => setShowMobileMenu(false)}`);
    if (translate !== '7px') propLines.push(`${p}labelTranslateX="${translate}"`);
    if (duplicate) propLines.push(`${p}duplicateRowClickForStaticLinks`);
  }

  const replacement = [
    `${baseIndent}                      <ShopMobileMenuShopTab`,
    ...propLines,
    `${baseIndent}                      />`
  ].join('\n');

  const newLines = [...lines.slice(0, start), replacement, ...lines.slice(end + 1)];
  content = newLines.join('\n');
  content = ensureImport(content, filePath);
  fs.writeFileSync(filePath, content);
  return { filePath, status: 'ok', duplicate, translate };
}

const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (name.endsWith('.tsx')) files.push(p);
  }
}
walk(src);

const targets = files.filter((f) => {
  const t = fs.readFileSync(f, 'utf8');
  return t.includes(NEEDLE) && t.includes("].map((item, index) => (");
});

const results = targets.map(processFile);
const bad = results.filter((r) => r.status.startsWith('skip-') && r.status !== 'skip-already');
console.log(JSON.stringify(results.filter((r) => r.status === 'ok'), null, 2));
if (bad.length) {
  console.error('Problems:', bad);
  process.exit(1);
}
