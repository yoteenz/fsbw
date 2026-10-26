// Render checks for board V3.1: local mode (no store) and a simulated owner store.
const { chromium } = require('playwright');
const path = require('path');
const file = 'file://' + path.resolve(process.argv[2] || 'out/index.html');
const mock = `(() => {
  const docs = {}; const subs = [];
  const emit = () => subs.forEach(fn => fn({ docs: Object.entries(docs).map(([id, v]) => ({ id, data: () => v })) }));
  const db = { collection: () => ({ onSnapshot: (fn) => { subs.push(fn); setTimeout(emit, 0); return () => {}; } }),
    doc: (p) => ({ set: async (v) => { docs[p.split('/')[1]] = v; setTimeout(emit, 50); }, delete: async () => { delete docs[p.split('/')[1]]; setTimeout(emit, 0); } }) };
  const user = { isOwner: async () => true, id: async () => 'owner-test' };
  window.claude = { use: async (n) => n === 'db' ? db : n === 'user' ? user : null };
})();`;
(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const [label, width, owner] of [['phone-local', 390, false], ['desktop-local', 1280, false], ['phone-owner', 390, true], ['desktop-owner', 1280, true]]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    if (owner) await page.addInitScript(mock);
    await page.goto(file + '#decisions');
    await page.waitForTimeout(600);
    const r = { errors };
    r.overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    r.states = await page.$$eval('.dcard .dhead .state', ns => { const c = {}; ns.forEach(n => c[n.textContent] = (c[n.textContent] || 0) + 1); return c; });
    r.founderApprovedBadges = await page.$$eval('.state', ns => ns.filter(n => n.textContent.includes('FOUNDER APPROVED')).length);
    if (owner) {
      r.recordButtonsInitiallyDisabled = await page.$$eval('[id^="rb-"]', bs => ({ total: bs.length, disabled: bs.filter(b => b.disabled).length }));
      r.selectDefault = await page.$eval('#st-H3', s => s.options[s.selectedIndex].text);
      await page.check('#o-H3-1');
      r.afterSelect = { badge: await page.$eval('#dec-H3 .dhead .state', n => n.textContent), btnDisabled: await page.$eval('#rb-H3', b => b.disabled) };
      await page.selectOption('#st-H3', 'APPROVED');
      r.afterOutcome = { badge: await page.$eval('#dec-H3 .dhead .state', n => n.textContent), btnDisabled: await page.$eval('#rb-H3', b => b.disabled) };
      await page.click('#rb-H3');
      await page.waitForTimeout(300);
      r.afterRecord = { badge: await page.$eval('#dec-H3 .dhead .state', n => n.textContent) };
      await page.click('.tab[data-view="export"]');
      const m = JSON.parse(await page.$eval('#manifest', t => t.value));
      const pickM = id => m.decisions.find(d => d.id === id);
      r.manifest = { templateVersion: m.templateVersion, status: m.status, recordedCount: m.recordedCount, H3: pickM('H3'), A1a: pickM('A1a'), A1b: pickM('A1b') };
      await page.click('.tab[data-view="decisions"]');
    } else {
      await page.click('.tab[data-view="export"]');
      const m = JSON.parse(await page.$eval('#manifest', t => t.value));
      r.manifest = { templateVersion: m.templateVersion, status: m.status, approvalRecorded: m.approvalRecorded, A1a: m.decisions.find(d => d.id === 'A1a') };
      await page.click('.tab[data-view="decisions"]');
    }
    await page.screenshot({ path: 'shot_' + label + '.png', fullPage: false });
    out[label] = r;
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 2));
})();
