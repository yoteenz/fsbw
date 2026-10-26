// Export the empty (nothing recorded) manifest v4 from the built board, local mode.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.resolve(process.argv[2]) + '#export'); await p.waitForTimeout(400);
  const m = JSON.parse(await p.$eval('#manifest', t => t.value)); m.exportedAt = null; m.note = 'TEMPLATE. Generated from board V3.1 with an empty decision store. No founder decision is recorded in this file.';
  fs.writeFileSync(process.argv[3], JSON.stringify(m, null, 2) + '\n'); await b.close(); console.log(m.status, m.decisions.length); })();
