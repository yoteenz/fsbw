/*
 * AIO OFFICE unified review — shared components. Built on the approved root components (studio.js / studio.css:
 * panel, status words, chips, buttons, gold arrows, honest lines, lock panels, bars) so every page reads as one product.
 * Every interactive element carries data-go (navigation inside the review), data-sim (a SIMULATED action, confirmed in a
 * sheet and never saved) or data-gap (a destination that is not designed yet — recorded in the gap register).
 */
const client = (id) => ACCOUNTS[id];
const staffName = (id) => (id ? STAFF[id]?.name ?? '—' : 'UNASSIGNED');
const clientName = (id) => ACCOUNTS[id]?.name ?? '—';

/** Session-only overrides from simulated actions (never saved, reset on reload). */
const SESSION = { status: {}, history: {}, gaps: new Set() };
const statusOf = (type, r, fallback) => SESSION.status[`${type}:${r.id}`] ?? fallback ?? r.status;

function crumbs(items) {
  return `<nav class="crumbs" aria-label="Breadcrumb">${items
    .map(([label, route], i) => (route && i < items.length - 1 ? `<a data-go="${route}">${label}</a>` : `<span>${label}</span>`))
    .join(`<i>${ico('fwd')}</i>`)}</nav>`;
}

/** Page header: back, breadcrumb, title, subtitle, status words, actions. */
function pageHead({ trail = [], title, sub = '', chips = [], actions = '', back = true }) {
  return `<header class="pg">
    <div class="pg__top">${back ? `<button class="pg__back" data-act="back" aria-label="Back">${ico('back')}</button>` : ''}${crumbs(trail)}</div>
    <div class="pg__main"><div class="pg__text"><h1 class="pg__title">${title}</h1>${sub ? `<p class="pg__sub">${sub}</p>` : ''}${chips.length ? `<div class="pg__chips">${chips.map((c) => (Array.isArray(c) ? st(c) : c)).join('')}</div>` : ''}</div>${actions ? `<div class="pg__acts">${actions}</div>` : ''}</div>
  </header>`;
}

/** Slim photographic band for a lane landing (the lane's own photograph, as on the WORK cards). */
function laneBand(l, kicker, title, sub) {
  const photo = l.photo.startsWith('standins/') ? l.photo : l.photo;
  return `<section class="plate plate--dark band lane-band bleed"><img src="${photo}" alt="" style="object-position:${PHOTO_POS[l.n] || '50% 50%'}">
    ${l.standin ? '<span class="lane__standin band__standin">STAND-IN</span>' : ''}
    <p class="hero__kicker">${kicker}</p><h1 class="hero__title"><span>${title}</span></h1>${sub ? `<p class="hero__sub">${sub}</p>` : ''}</section>`;
}

/** Client context bar: the one place that says whose work this is. */
function ctxBar(id, { compact = false } = {}) {
  const c = client(id);
  if (!c) return '';
  return `<div class="ctx ${compact ? 'ctx--compact' : ''}" role="region" aria-label="Client context">
    <span class="badge ${c.life === 'PREBUILT' ? 'badge--pre' : ''}">${c.b}</span>
    <span class="ctx__t"><b>${c.name}</b><small>${c.dot} · ${c.mc} · ${c.state}</small></span>
    ${st(LIFE[c.life])}
    <span class="ctx__acts"><span class="btn btn--sm" data-go="client/${c.id}">${ico('company')}CLIENT 360</span><span class="btn btn--sm" data-act="switch">${ico('people')}SWITCH</span><span class="btn btn--sm btn--icon" data-act="clear-client" aria-label="Clear client">${ico('close')}</span></span>
  </div>`;
}

function tabs(items, active) {
  return `<div class="tabs" role="tablist">${items
    .map(([id, label, count, route, tone]) => `<a role="tab" class="tab ${id === active ? 'is-on' : ''} ${tone ? `tab--${tone}` : ''}" data-go="${route}" aria-selected="${id === active}">${label}${count != null ? `<i>${count}</i>` : ''}</a>`)
    .join('')}</div>`;
}

/** A list row that becomes a table row on desktop: lead · title / sub · meta · status · chevron. */
function row({ go, lead = '', title, sub = '', meta = '', status = null, extra = '', sim = null }) {
  const target = go ? `data-go="${go}"` : sim ? `data-sim="${sim}"` : '';
  return `<div class="row ${target ? '' : 'row--static'}" ${target}>${lead ? `<span class="row__lead">${lead}</span>` : ''}<span class="row__t"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}${extra}</span>${meta ? `<span class="row__m">${meta}</span>` : ''}${status ? `<span class="row__s">${st(status)}</span>` : ''}${go ? ico('fwd', 'chev') : ''}</div>`;
}
const rows = (list, empty = 'NOTHING HERE') => `<div class="panel rows">${list.length ? list.map(row).join('') : `<div class="rows__empty">${empty}</div>`}</div>`;
const badge = (c) => `<span class="badge ${c?.life === 'PREBUILT' ? 'badge--pre' : ''}">${c?.b ?? '—'}</span>`;
const icoTile = (name) => `<span class="row__ico">${ico(name)}</span>`;

function kv(pairs, cols = 2) {
  return `<dl class="kv kv--${cols}">${pairs
    .map(([k, v, note]) => `<div class="kv__i"><dt>${k}</dt><dd>${v}${note ? `<small>${note}</small>` : ''}</dd></div>`)
    .join('')}</dl>`;
}

function timeline(events) {
  return `<ol class="tl">${events
    .map(([when, what, who, vis]) => `<li class="tl__i"><span class="tl__dot"></span><span class="tl__w">${when}</span><span class="tl__t">${what}</span><span class="tl__m">${who ?? ''}${vis ? ` <span class="tag-vis tag-vis--${vis}">${vis === 'client' ? 'CLIENT-VISIBLE' : vis === 'sim' ? 'SIMULATED · NOT SAVED' : 'INTERNAL'}</span>` : ''}</span></li>`)
    .join('')}</ol>`;
}

/** Related records — linked, never copied. */
function related(items) {
  return `<div class="panel rel">${items
    .map(({ lane, title, go, why, status }) => `<div class="rel__i ${go ? '' : 'rel__i--static'}" ${go ? `data-go="${go}"` : ''}><span class="rel__l">${lane}</span><span class="rel__t">${title}</span>${why ? `<small>${why}</small>` : ''}${status ? st(status) : ''}${go ? ico('fwd', 'chev') : ''}</div>`)
    .join('')}</div>`;
}

/** Empty / blocked / not-built states show the shape of the page and why it cannot fill yet. */
function stateBlock({ kind = 'notbuilt', title, body, gap, fields = [] }) {
  const label = { notbuilt: 'NOT BUILT YET', blocked: 'BLOCKED', empty: 'NOTHING HERE YET', paused: 'PAUSED' }[kind];
  if (kind === 'notbuilt' && typeof PAGE_GAPS !== 'undefined') PAGE_GAPS.push(title);
  return `<div class="panel stb stb--${kind}">
    <div class="stb__head">${st([label, kind === 'blocked' || kind === 'paused' ? 'bad' : 'mute'])}<b>${title}</b></div>
    <p>${body}</p>
    ${fields.length ? `<div class="stb__fields">${fields.map((f) => `<span>${f}</span>`).join('')}</div>` : ''}
    ${gap ? `<small class="stb__gap">${gap}</small>` : ''}
  </div>`;
}

function stepper(steps, idx) {
  return `<ol class="steps">${steps.map((s, i) => `<li class="${i < idx ? 'is-done' : i === idx ? 'is-on' : ''}"><i>${i < idx ? ico('pass') : i + 1}</i><span>${s}</span></li>`).join('')}</ol>`;
}

function section(title, sub, body, right = '') {
  return `<section class="sec">${secHead(title, sub, right)}${body}</section>`;
}

/** Actions: founder-only ones never render for staff. Every action here is SIMULATED in the review (data-sim):
 *  { label, sim, ico, founder, effect: what the live office would do, set: 'type:id=WORD|tone' (session status) }. */
const simAttrs = (a) => `data-sim="${a.sim}" data-label="${a.label}"${a.effect ? ` data-effect="${a.effect}"` : ''}${a.set ? ` data-set="${a.set}"` : ''}`;
function actionsBar(list) {
  return list
    .filter((a) => !a.founder || FOUNDER)
    .map((a, i) => (a.off ? `<span class="btn btn--ghost" aria-disabled="true" title="${a.off}">${a.label}</span>` : `<span class="btn ${i === 0 ? 'btn--gold' : ''}" ${simAttrs(a)}>${a.ico ? ico(a.ico) : ''}${a.label}${a.founder ? '<span class="qa__grant">FOUNDER</span>' : ''}</span>`))
    .join('');
}
/** The actions column on a record: what can be done here, and what cannot yet (said plainly, never a dead button). */
function actionsPanel(list, title = 'ACTIONS') {
  const shown = list.filter((a) => !a.founder || FOUNDER);
  return `<div class="panel acts"><div class="acts__h"><b>${title}</b><span class="tag-vis tag-vis--sim">SIMULATED IN REVIEW</span></div>${shown
    .map((a, i) =>
      a.off
        ? `<div class="acts__i acts__i--off" aria-disabled="true"><span>${a.label}</span><small>${a.off}</small></div>`
        : `<div class="acts__i ${i === 0 ? 'acts__i--pri' : ''}" ${simAttrs(a)}>${a.ico ? ico(a.ico) : ''}<span>${a.label}${a.founder ? '<span class="qa__grant">FOUNDER</span>' : ''}</span>${a.effect ? `<small>${a.effect}</small>` : ''}</div>`,
    )
    .join('')}${!FOUNDER && list.some((a) => a.founder) ? `<div class="acts__note">${ico('lock')}SOME ACTIONS HERE ARE FOUNDER-ONLY AND ARE NOT OFFERED TO YOUR ROLE.</div>` : ''}</div>`;
}

function docPreview(d) {
  const missing = /REQUESTED|NOT RECEIVED/.test(d.status[0]);
  return `<div class="doc ${missing ? 'doc--missing' : ''}">
    <div class="doc__sheet">${missing ? `<span>NOT RECEIVED</span>` : `<i></i><i></i><i class="s"></i><i></i><i class="s"></i><i></i><i></i><i class="s"></i>`}</div>
    <div class="doc__meta"><b>${d.title}</b><small>${d.type} · ADDED ${d.added}</small><span class="tag-vis tag-vis--${d.vis === 'client' ? 'client' : 'internal'}">${d.vis === 'client' ? 'CLIENT-VISIBLE' : 'STAFF ONLY'}</span></div>
  </div>`;
}

function permissionPage(what, grant, back = 'home') {
  return `<div class="panel lock" style="margin-top:16px">
    <span class="lock__ico">${ico('lock')}</span>
    <span class="lock__t">${what} IS GRANTED BY ROLE.</span>
    <p class="lock__p">YOUR ROLE DOES NOT INCLUDE ${grant}. ACCESS IS GIVEN BY THE FOUNDER, AND THE OFFICE CHECKS IT ON THE SERVER — NOT JUST BY HIDING A BUTTON.</p>
    <span class="lock__go"><span class="btn" data-go="${back}">${ico('home')}GO BACK</span></span>
  </div>`;
}

/** Filter chips keep the client context of the current route (CUR is set by the router). */
function filterChips(list, active, base) {
  const sfx = typeof CUR !== 'undefined' && CUR.client ? `@${CUR.client}` : '';
  return `<div class="fchips">${list.map(([id, label, n]) => `<a class="fchip ${id === active ? 'is-on' : ''}" data-go="${base}${id === 'all' ? '' : `~${id}`}${sfx}">${label}${n != null ? `<i>${n}</i>` : ''}</a>`).join('')}</div>`;
}

const notice = (text, tone = 'mute') => `<div class="panel honest notice notice--${tone}">${ico('info')}<span>${text}</span></div>`;
const designOnly = (text) => `<div class="design-only">${ico('info')}<span><b>DESIGN ONLY:</b> ${text}</span></div>`;
