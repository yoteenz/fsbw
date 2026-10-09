/*
 * AIO OFFICE workspace proofs — shared engine. One state object; every control is data-a="action" data-v="value";
 * an action changes state and the workspace redraws (no page navigation, inner list scroll is kept). Simulated actions
 * confirm inline and change sample state for this visit only — nothing is saved or sent.
 */
const WSX = {
  ws: 'overview',
  device: 'desktop',
  role: 'founder',
  before: false,
  fleet: { unit: 'v-tk-09', sec: 'maintenance', filter: 'all', q: '' },
  books: { client: 'c-tk', period: 'SEP 2026', phase: 'reconcile', item: 'q:q1', cadence: 'monthly' },
  comp: { sec: 'expirations', item: 'dl-abc-med', filter: 'all' },
  client: { id: 'c-abc', view: 'overview', service: null, stack: [], q: '', filter: 'all' },
  sheet: false,
  pending: null,
  over: {},
  hist: {},
  sims: [],
  ret: null,
  flash: null,
  loading: null,
};
const ACT = {};
const SIM = {};

/* ── state helpers ── */
const ov = (key, base) => WSX.over[key] ?? base;
const hv = (key, base = []) => [...(WSX.hist[key] || []), ...base];
const vals = (o) => Object.values(o);
const laneBySlug = (slug) => LANES.find((l) => l.slug === slug);
const staffOf = (id) => STAFF[id];
const initials = (id) => (id ? STAFF[id]?.b ?? '—' : '—');
const daysWord = (d) => (d < 0 ? `${-d} DAY${d === -1 ? '' : 'S'} LATE` : d === 0 ? 'TODAY' : `${d} DAY${d === 1 ? '' : 'S'}`);

/* ── small components ── */
const sw = (s) => (s ? `<span class="sw sw--${s[1]}"><i class="pip pip--${s[1]}"></i>${s[0]}</span>` : '');
const av = (id) => `<span class="av ${id === 's-alex' ? 'av--you' : ''}" title="${STAFF[id]?.name ?? ''}">${initials(id)}</span>`;
const ro = (n, label, { tone = '', a = '', v = '', on = false } = {}) => `<${a ? 'button type="button"' : 'div'} class="ro ${tone ? `ro--${tone}` : ''} ${on ? 'is-on' : ''}" ${a ? `data-a="${a}" data-v="${v}"` : ''}><b>${n}</b><span>${label}</span></${a ? 'button' : 'div'}>`;
const seg = (items, active, a, cls = '') => `<div class="wseg has-thumb ${cls}" role="tablist" data-thumb><i class="thumb" aria-hidden="true" data-keep-attrs="style data-placed"></i>${items.map(([id, label, n, quiet]) => `<button type="button" role="tab" class="wseg__b ${id === active ? 'is-on' : ''} ${quiet ? 'wseg__b--quiet' : ''}" data-a="${a}" data-v="${id}" aria-selected="${id === active}">${label}${n != null ? `<i>${n}</i>` : ''}</button>`).join('')}</div>`;
const facts = (pairs) => `<dl class="fx">${pairs.filter(Boolean).map(([k, v, s]) => `<div><dt>${k}</dt><dd>${v}${s ? `<small>${s}</small>` : ''}</dd></div>`).join('')}</dl>`;
const mhist = (key, base, title = 'HISTORY') => `<div><div class="sec-l">${title}</div><ul class="mh">${hv(key, base.map(([w, t]) => [w, t, false])).slice(0, 4).map(([w, t, sim]) => `<li class="${sim ? 'is-sim' : ''}"><b>${t}${sim ? ' <span class="simtag">SIMULATED</span>' : ''}</b><small>${w}</small></li>`).join('')}</ul></div>`;
const ntb = (html) => `<div class="ntb">${ico('info')}<span>${html}</span></div>`;
const rgn = (title, n, tools, body, cls = '', keep = '') => `<section class="rg ${cls}"><header class="rg__h"><span class="rg__t">${title}</span>${n != null ? `<span class="rg__n">${n}</span>` : ''}${tools ? `<span>${tools}</span>` : ''}</header><div class="rg__b" ${keep ? `data-keep="${keep}"` : ''}>${body}</div></section>`;
function docChip(id) {
  const d = DOCS[id];
  if (!d) return '';
  const miss = /REQUESTED|NOT RECEIVED/.test(d.status[0]);
  return `<div class="dch"><span class="dch__sheet ${miss ? 'dch__sheet--miss' : ''}"></span><span style="min-width:0;flex:1"><b>${d.title}</b><small>${d.type} · ${d.added}</small></span><span class="vis ${d.vis === 'client' ? 'vis--client' : ''}">${d.vis === 'client' ? 'CLIENT-VISIBLE' : 'STAFF ONLY'}</span></div>`;
}

/* ── the next action, with inline simulated confirmation ── */
/** Register a simulated action and draw its button. apply() changes sample state; rec is the record key for history. */
function simBtn(key, { label, effect, apply, rec, primary = false, founder = false, sm = false }) {
  if (founder && !FOUNDER) return '';
  SIM[key] = { label, effect, apply, rec };
  if (WSX.pending === key || WSX.loading === key) {
    const busy = WSX.loading === key;
    return `<div class="simc" data-key="simc:${key}" role="group" aria-label="Confirm ${label}"><span class="simc__h"><b>${label}</b><span class="simtag">SIMULATED</span></span><span class="simc__e">${effect}</span><span class="simc__n">NOTHING IS SAVED OR SENT.</span><span class="simc__acts"><button type="button" class="wbtn wbtn--gold wbtn--sm ${busy ? 'is-loading' : ''}" data-a="sim.ok" data-v="${key}" ${busy ? 'aria-busy="true"' : ''}>${busy ? '<i class="spin" aria-hidden="true"></i>WORKING' : `${ico('pass')}CONFIRM`}</button><button type="button" class="wbtn wbtn--sm wbtn--ghost" data-a="sim.no" ${busy ? 'disabled' : ''}>CANCEL</button></span></div>`;
  }
  return `<button type="button" class="wbtn ${primary ? 'wbtn--gold' : ''} ${sm ? 'wbtn--sm' : ''}" data-a="sim.ask" data-v="${key}">${label}${founder ? ' <span class="founder">FOUNDER</span>' : ''}</button>`;
}
function nextBlock(title, buttons, tone = '') {
  return `<div class="nx ${tone ? `nx--${tone}` : ''}"><span class="nx__l">${tone === 'done' ? 'DONE' : tone === 'calm' ? 'NOTHING URGENT' : 'NEXT STEP'}</span><span class="nx__t">${title}</span>${buttons ? `<div class="nx__acts">${buttons}</div>` : ''}</div>`;
}
ACT['sim.ask'] = (k) => (WSX.pending = k);
ACT['sim.no'] = () => (WSX.pending = null);
ACT['sim.ok'] = (k) => {
  const s = SIM[k];
  WSX.pending = null;
  if (!s) return;
  s.apply?.();
  if (s.rec) (WSX.hist[s.rec] ||= []).unshift(['JUST NOW', s.label, true]);
  WSX.sims.unshift(s.label);
  WSX.flash = `SIMULATED · ${s.label}`;
};

/* ── moving between workspaces keeps a way back ── */
const WS_NAMES = { fleet: 'VEHICLES & FLEET', books: 'BOOKKEEPING', comp: 'COMPLIANCE', client: 'CLIENT 360' };
ACT['go'] = (v) => {
  const [ws, a, b] = v.split(':');
  WSX.ret = { ws: WSX.ws, label: retLabel() };
  WSX.ws = ws;
  WSX.sheet = false;
  WSX.pending = null;
  if (ws === 'fleet' && a) Object.assign(WSX.fleet, { unit: a, sec: b || 'registration', filter: 'all' });
  if (ws === 'client' && a) Object.assign(WSX.client, { id: a, view: b ? 'service' : 'overview', service: b || null, stack: [] });
  if (ws === 'comp' && a) Object.assign(WSX.comp, { item: a, sec: 'expirations', filter: 'all' });
  if (ws === 'books' && a) Object.assign(WSX.books, { client: a, item: null });
};
ACT['ret'] = () => {
  const r = WSX.ret;
  WSX.ret = null;
  if (r) WSX.ws = r.ws;
  WSX.sheet = false;
};
function retLabel() {
  if (WSX.ws === 'fleet') return VEHICLES[WSX.fleet.unit]?.unit ?? 'FLEET';
  if (WSX.ws === 'client') return ACCOUNTS[WSX.client.id]?.name ?? 'CLIENT';
  if (WSX.ws === 'comp') return 'COMPLIANCE';
  if (WSX.ws === 'books') return 'BOOKKEEPING';
  return 'OVERVIEW';
}
const retChip = () => (WSX.ret && WSX.ret.ws !== 'overview' ? `<button type="button" class="wbtn wbtn--sm wbtn--dark" data-a="ret">${ico('back')}BACK TO ${WSX.ret.label}</button>` : '');
ACT['sheet.close'] = () => {
  WSX.sheet = false;
  WSX.pending = null;
};

/** The workspace bar: lane number, title, instruments, tools. */
function wsBar(no, title, readouts, tools = '') {
  return `<header class="wsb"><div class="wsb__id"><span class="wsb__no">${no}</span><h1 class="wsb__t">${title}</h1></div>${readouts ? `<div class="ros">${readouts}</div>` : ''}<div class="wsb__tools">${retChip()}${tools}</div></header>`;
}
/** A drawer: a bottom sheet on the phone, a side drawer when asked. The bar holds the grip and the close control, so
 *  nothing ever sits on top of the content's own header. */
function phoneSheet(inner, { side = false, label = 'Detail' } = {}) {
  if (!WSX.sheet) return '';
  return `<div class="wscrim ${side ? 'wscrim--side' : ''}" data-a="sheet.close" data-key="scrim" aria-hidden="true"></div><div class="wsheet ${side ? 'wsheet--side' : ''}" data-key="sheet" role="dialog" aria-modal="true" aria-label="${label}" tabindex="-1"><div class="wsheet__bar"><span class="wsheet__grab" aria-hidden="true"></span><span class="wsheet__l">${side ? label.toUpperCase() : ''}</span><button type="button" class="wbtn wbtn--icon wbtn--sm wsheet__x" data-a="sheet.close" aria-label="Close">${ico('close')}</button></div><div class="wsheet__body">${inner}</div></div>`;
}
