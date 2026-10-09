/*
 * AIO OFFICE — the complete office. Every department and every page registers itself here: what it is called, which
 * review group it belongs to, which root it lives under, how it draws, the states the founder should see (MAIN ·
 * SELECTED · DEEPER · PHONE), its TRY demonstrations, and the links from the approved roots that open it.
 *
 *   registerWorkspace({
 *     id, no, name, group,          // 'auth' · 'fleet' · 'money' · 'office'
 *     page,                          // the root it lives under: 'home' · 'intake' · 'work' · 'reports' · 'more'
 *     lane,                          // the WORK lane slug (studio LANES) when it is a service lane
 *     view: () => html,              // the workspace (inside the approved header + navigation)
 *     shape, line,                   // what it is built around, in a few words (review chrome only)
 *     states: [[label, acts, device?]],
 *     demos: [[label, [[action, value, caption], …]]],
 *     audit: [acts, …],              // extra states the text audit and QA visit
 *     phoneAct: { 'x.item': 'x.open' },
 *     enter: (a, b) => {},           // set state when another workspace jumps here (ACT.go 'id:a:b')
 *     label: () => 'UNIT 09',        // what BACK TO … says when leaving from here
 *     route: (seg, client) => bool,  // a data-go route from the approved roots this workspace answers
 *     root: true,                    // an approved root drawn by studio.js (not redesigned)
 *   })
 *
 * The approved roots (HOME · INTAKE · WORK · REPORTS · MORE) are drawn exactly as approved; the routes on them
 * (data-go="work/permitting", "rec/policy/pol-dh", "reports/clients", "more/billing" …) open the workspaces below.
 */
const WS_REG = [];
const WS_GROUPS = [
  { id: 'auth', no: '1', name: 'AUTHORITY & FILINGS', line: 'PERMITS · FUEL TAXES · DEADLINES · READINESS' },
  { id: 'fleet', no: '2', name: 'TRUCKS & PEOPLE', line: 'THE TRUCKS · THE DRIVERS · THE REPAIRS' },
  { id: 'money', no: '3', name: 'FREIGHT & MONEY', line: 'LOADS · BROKERAGE · INVOICES · COVERAGE · THE BOOKS' },
  { id: 'office', no: '4', name: 'THE OFFICE', line: 'HOME · INTAKE · REPORTS · MORE · CLIENT 360' },
];
function registerWorkspace(def) {
  WS_REG.push({ group: 'office', page: 'work', states: [], demos: [], audit: [], phoneAct: {}, ...def });
}
const wsById = (id) => WS_REG.find((w) => w.id === id);
const wsByLane = (slug) => WS_REG.find((w) => w.lane === slug);
const groupOf = (id) => WS_GROUPS.find((g) => g.id === wsById(id)?.group);
/** A group's departments in review order: approved roots first (HOME · INTAKE · WORK · REPORTS · MORE), then by lane number. */
const ROOT_ORDER = ['r-home', 'r-intake', 'r-work', 'r-reports', 'r-more'];
const groupWs = (gid) => WS_REG.filter((w) => w.group === gid && !w.hidden).sort((a, b) => (a.root ? ROOT_ORDER.indexOf(a.id) : 99) - (b.root ? ROOT_ORDER.indexOf(b.id) : 99) || (Number(a.no) || 999) - (Number(b.no) || 999));

/** A route from an approved root (Batch 1 address form: path[~filter][@client]). Returns the workspace id it opened. */
function routeWs(route) {
  const [beforeAt, client = ''] = String(route).split('@');
  const [path] = beforeAt.split('~');
  const seg = path.split('/').filter(Boolean);
  const roots = { home: 'r-home', intake: 'r-intake', work: 'r-work', reports: 'r-reports', more: 'r-more' };
  if (seg.length === 1 && roots[seg[0]] && wsById(roots[seg[0]])) return roots[seg[0]];
  for (const w of WS_REG) if (w.route && w.route(seg, client)) return w.id;
  return null;
}
