const fs = require('fs'), path = require('path');
const P = process.argv[2];
const pages = JSON.parse(JSON.stringify(require('./pages.cjs')));
const decisions = require('./decisions.cjs');
const workflows = require('./workflows.cjs');
const man = JSON.parse(fs.readFileSync(path.join(P, '20_ARCHITECTURE_APPROVAL_MANIFEST.json'), 'utf8'));
// Workflow links per family (tree:family), hand-mapped from doc 04 entry/visibility columns.
const W = (s) => s.split(',').map(x => 'W-' + x.trim().padStart(2, '0'));
const famWf = {
  'customer:01 OVERVIEW': W('1,13,17,19'), 'customer:02 ORDERS': W('1,2,3,4,5,6,14,15,27,31'), 'customer:03 CONCIERGE': W('16,21,28,31'),
  'customer:04 REWARDS': W('8,9,10,11,17,18,19,20,21,22,24,32'), 'customer:05 MY HAIR': W('2,12,13,35'), 'customer:06 WISHLIST': W('29,34'),
  'customer:07 REVIEWS & CONTENT': W('25,26,27'), 'customer:08 EARN & SHARE': W('23,25'), 'customer:09 ALERTS': W('5,6,17,28'), 'customer:10 SETTINGS': W('7,11,28,33'),
  'customer:ADJACENT': W('26,32'), 'customer:RETIRED': W('12,13'),
  'admin:01 COMMAND CENTER': W('1,5,25,27,28,29'), 'admin:02 ORDERS': W('1,2,3,4,5,6'), 'admin:03 APPROVALS': W('5,25,26,27'), 'admin:04 CUSTOMERS': W('7,13,17,33'),
  'admin:05 MEMBERSHIP & REWARDS': W('8,9,10,11,12,17,18,19,20,21,22,23,24,30,32'), 'admin:06 MEETINGS': W('2,14,15,16'), 'admin:07 INBOX': W('3,15,28'),
  'admin:08 CATALOG & INVENTORY': W('2,29'), 'admin:09 MARKETING': W('30,34'), 'admin:10 FINANCE': W('1,4,8,10'), 'admin:11 BRAND': W('27'), 'admin:14 SYSTEM': W('31,33'),
};
const ids = new Set(workflows.map(w => w.id));
for (const p of pages) p.workflows = (famWf[p.tree + ':' + p.family] || []).filter(id => ids.has(id));
// Risks from doc 11 summary table.
const risks = fs.readFileSync(path.join(P, '11_SECURITY_AND_MONEY_RISK_REGISTER.md'), 'utf8').split('\n')
  .filter(l => /^\| R-\d\d \|/.test(l)).map(l => l.split('|').slice(1, -1).map(s => s.trim()))
  .map(c => ({ id: c[0], risk: c[1], sev: c[2], band: c[4], gate: c[5], decision: c[6] }));
const data = { sprintId: man.sprintId, auditCommit: man.traceability.initialAuditCommit, counts: man.counts, gates: man.approvalRequirements, pages, decisions, workflows, risks };
const html = fs.readFileSync(path.join(__dirname, 'board_template.html'), 'utf8').replace('/*__DATA__*/', 'window.ARCH = ' + JSON.stringify(data).replace(/</g, '\\u003c') + ';');
const outDir = path.join(P, '21_INTERACTIVE_FOUNDER_ARCHITECTURE_BOARD_V2');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), html);
const noWf = pages.filter(p => !p.workflows.length).map(p => p.tree + ':' + p.family);
console.log('bytes', html.length, 'risks', risks.length, 'pages without workflows', [...new Set(noWf)].join(' | '));
