// node scripts/ifta/make-us-state-paths.mjs <dir with extracted us-atlas@3.0.1, topojson-client@3.1.0, topojson-simplify@3.0.3, d3-geo@3.1.1> src/ifta/ui/usStatePaths.ts
// Pre-projected us-atlas states → simplified SVG path strings (ISC data). Offline generator; nothing is added to package.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const [vendor, outFile] = process.argv.slice(2);
const require = createRequire(import.meta.url);
const topo = require(`${vendor}/topojson-client-3.1.0/package/dist/topojson-client.js`);
const simp = require(`${vendor}/topojson-simplify-3.0.3/package/dist/topojson-simplify.js`);
const geo = await import(`${vendor}/d3-geo-3.1.1/package/src/index.js`);
let us = JSON.parse(readFileSync(`${vendor}/us-atlas-3.0.1/package/states-albers-10m.json`, 'utf8'));
us = simp.presimplify(us);
us = simp.simplify(us, 1.2);
const states = topo.feature(us, us.objects.states).features;
const path = geo.geoPath();
const FIPS = { '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV','55':'WI','56':'WY','72':'PR' };
const round = (d) => d.replace(/(\d+\.\d{1})\d+/g, '$1');
const rows = [];
for (const f of states) {
  const code = FIPS[f.id];
  if (!code || code === 'PR') continue;
  const d = round(path(f));
  const [cx, cy] = path.centroid(f).map((v) => Math.round(v * 10) / 10);
  rows.push(`  ${code}: { d: '${d}', c: [${cx}, ${cy}] },`);
}
rows.sort();
const out = `/**
 * US state outlines for the IFTA jurisdiction map (generated — do not edit).
 * Source: us-atlas@3.0.1 states-albers-10m (ISC licence, US Census Bureau cartographic boundaries), simplified with
 * topojson-simplify, projected (Albers USA, 975 × 610 viewBox). Generator: scripts/ifta/make-us-state-paths.mjs.
 */
export const US_STATE_VIEWBOX = '0 0 975 610';
export const US_STATE_PATHS: Record<string, { d: string; c: [number, number] }> = {
${rows.join('\n')}
};
`;
writeFileSync(outFile, out);
console.log('states', rows.length, 'bytes', out.length);
