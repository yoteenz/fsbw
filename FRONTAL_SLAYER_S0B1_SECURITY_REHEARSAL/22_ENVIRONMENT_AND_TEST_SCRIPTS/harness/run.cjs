// Usage: node run.cjs <database> <phaseLabel> <outJson>
const { Client } = require('/home/user/fsbw/node_modules/pg');
const fs = require('fs');
const { T, ACTOR, actors } = require('./tests.cjs');
(async () => {
  const [db, phase, out] = process.argv.slice(2);
  const c = new Client({ host: '/tmp/fsrehearsal_pg1', user: 'postgres', database: db });
  await c.connect();
  const results = [];
  for (const t of T) {
    const a = actors[t.actor];
    const stmts = Array.isArray(t.sql) ? t.sql : [t.sql];
    let res = null, all = [], err = null;
    await c.query('BEGIN');
    try {
      if (!t.superuser) {
        await c.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(a.claims)]);
        await c.query(`SET LOCAL ROLE ${a.role}`);
      } else {
        await c.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(a.claims)]);
      }
      for (const s of stmts) { res = await c.query(s); all.push(res); }
    } catch (e) { err = e; }
    await c.query('ROLLBACK');
    let outcome, detail = '';
    if (err) {
      outcome = (err.code === '42501' || /row-level security/i.test(err.message)) ? 'DENIED' : (err.code === '42725' ? 'AMBIGUOUS_UNCALLABLE' : 'ERROR');
      detail = `${err.code} ${err.message}`.slice(0, 220);
    } else if (t.expect === 'ZERO_COUNT') {
      const n = Number(Object.values(res.rows[0])[0]); outcome = n === 0 ? 'ZERO_COUNT' : 'VISIBLE'; detail = `count=${n}`;
    } else if (t.expect === 'PRESERVED') {
      const row = res.rows[0];
      if (!row) { outcome = 'NO_ROWS'; }
      else { const v = row[t.preservedColumn]; const preserved = (t.preservedColumn === 'role' && v === 'user') || (t.preservedColumn === 'loyalty_points' && v === 0) || (t.preservedColumn === 'membership_type' && v === 'STANDARD'); outcome = preserved ? 'PRESERVED' : 'CHANGED'; detail = JSON.stringify(row).slice(0, 220); }
    } else if (t.kind === 'POS') {
      let ok = false; try { ok = !!t.check(res, all); } catch (e) { ok = false; }
      outcome = ok ? 'OK' : 'UNEXPECTED'; detail = JSON.stringify(res.rows).slice(0, 220);
    } else {
      outcome = res.rowCount === 0 ? 'NO_ROWS' : 'EXECUTED'; detail = JSON.stringify(res.rows).slice(0, 220);
    }
    const blocked = ['DENIED', 'NO_ROWS', 'ZERO_COUNT', 'PRESERVED', 'AMBIGUOUS_UNCALLABLE'].includes(outcome);
    let verdict;
    if (t.kind === 'NEG') verdict = blocked ? 'PASS' : 'FAIL';
    else if (t.kind === 'POS') verdict = outcome === 'OK' ? 'PASS' : 'FAIL';
    else verdict = 'INFO';
    results.push({ id: t.id, risk: t.risk, kind: t.kind, actor: ACTOR[t.actor], layer: t.layer, title: t.title, phase, outcome, verdict, expected: t.kind === 'POS' ? t.expectText : (t.kind === 'NEG' ? 'blocked' : 'record behaviour'), detail, note: t.note || '' });
  }
  await c.end();
  fs.writeFileSync(out, JSON.stringify(results, null, 1));
  const s = results.reduce((m, r) => (m[r.verdict] = (m[r.verdict] || 0) + 1, m), {});
  console.log(phase, JSON.stringify(s));
})().catch(e => { console.error(e); process.exit(1); });
