/*
 * AIO OFFICE workspace motion. The review redraws by morphing the device DOM instead of replacing it, so only what
 * changed changes: selections, tabs and panels transition in CSS (ws.css · MOTION), scroll and focus survive, and
 * content keyed with data-swap enters with a short settle. Drawers enter and leave on their own, hold focus, and give
 * it back. Reduced motion is honoured everywhere (ws.css switches the durations off; drawers close without waiting).
 */
const MOTION = {
  reduced: () => document.documentElement.dataset.motion === 'reduce' || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  sheetOut: 200, // ms — matches --m-out in ws.css
  confirm: 420, // ms — the simulated action's brief working state
};

/* ── morph: patch the live DOM to match new markup ── */
/** A child's identity across redraws: id, data-key, data-swap (a new value means new content), or its action + value. */
function mkey(n) {
  if (n.nodeType !== 1) return null;
  if (n.id) return `#${n.id}`;
  const sw = n.getAttribute('data-swap');
  if (sw != null) return `swap:${n.tagName}:${sw}`;
  const k = n.getAttribute('data-key');
  if (k != null) return `key:${k}`;
  const a = n.getAttribute('data-a');
  if (a) return `a:${n.tagName}:${a}|${n.getAttribute('data-v') ?? ''}`;
  return null;
}
function morphAttrs(a, b) {
  const keep = (a.getAttribute('data-keep-attrs') || '').split(' ');
  for (const { name, value } of [...b.attributes]) if (!keep.includes(name) && a.getAttribute(name) !== value) a.setAttribute(name, value);
  for (const { name } of [...a.attributes]) if (!keep.includes(name) && name !== 'data-keep-attrs' && !b.hasAttribute(name)) a.removeAttribute(name);
  if (a.tagName === 'INPUT' && document.activeElement !== a) a.value = b.getAttribute('value') ?? '';
}
function morphNode(a, b) {
  if (a.nodeType !== 1) {
    if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue;
    return;
  }
  morphAttrs(a, b);
  morphChildren(a, b);
}
function morphChildren(from, to) {
  const olds = [...from.childNodes];
  const keyed = new Map();
  for (const c of olds) {
    const k = mkey(c);
    if (k && !keyed.has(k)) keyed.set(k, c);
  }
  const used = new Set();
  let cursor = 0;
  const next = [];
  for (const nc of [...to.childNodes]) {
    const k = mkey(nc);
    let m = null;
    if (k) {
      const c = keyed.get(k);
      if (c && !used.has(c) && c.tagName === nc.tagName) m = c;
    } else {
      while (cursor < olds.length) {
        const c = olds[cursor++];
        if (used.has(c) || mkey(c)) continue;
        if (c.nodeType === nc.nodeType && (c.nodeType !== 1 || c.tagName === nc.tagName)) {
          m = c;
          break;
        }
      }
    }
    if (m) {
      used.add(m);
      morphNode(m, nc);
      next.push(m);
    } else next.push(nc);
  }
  for (const c of olds) if (!used.has(c)) c.remove();
  next.forEach((n, i) => {
    if (from.childNodes[i] !== n) from.insertBefore(n, from.childNodes[i] || null);
  });
}
/** Parse markup; every clickable that is not a button becomes keyboard-reachable (tab stop + role) before it lands. */
function prepare(html) {
  const t = document.createElement('template');
  t.innerHTML = html;
  t.content.querySelectorAll('[data-a]:not(button):not(input):not(.wscrim), [data-k], [data-go]:not(button)').forEach((e) => {
    if (!e.hasAttribute('tabindex')) e.setAttribute('tabindex', '0');
    if (!e.hasAttribute('role')) e.setAttribute('role', 'button');
  });
  return t.content;
}
function morphInto(el, html) {
  morphChildren(el, prepare(html));
}
function replaceInto(el, html) {
  el.replaceChildren(prepare(html));
}

/* ── segmented controls: one obsidian thumb slides to the active choice ── */
function placeThumbs(root, animate = true) {
  root.querySelectorAll('[data-thumb]').forEach((g) => {
    const th = g.querySelector(':scope > .thumb');
    const on = g.querySelector(':scope > .is-on');
    if (!th) return;
    if (!on) {
      th.style.opacity = '0';
      return;
    }
    const first = th.dataset.placed !== '1';
    if (first || !animate || MOTION.reduced()) th.style.transition = 'none';
    th.style.transform = `translate(${on.offsetLeft}px, ${on.offsetTop}px)`;
    th.style.width = `${on.offsetWidth}px`;
    th.style.height = `${on.offsetHeight}px`;
    th.style.opacity = '1';
    if (th.style.transition === 'none') {
      void th.offsetWidth;
      th.style.transition = '';
    }
    th.dataset.placed = '1';
    // a scrolled tab row keeps the active choice in view
    if (g.scrollWidth > g.clientWidth + 1) {
      const l = on.offsetLeft - 24;
      const r = on.offsetLeft + on.offsetWidth + 24;
      if (l < g.scrollLeft) g.scrollTo({ left: Math.max(0, l), behavior: animate && !MOTION.reduced() ? 'smooth' : 'auto' });
      else if (r > g.scrollLeft + g.clientWidth) g.scrollTo({ left: r - g.clientWidth, behavior: animate && !MOTION.reduced() ? 'smooth' : 'auto' });
    }
    g.classList.toggle('is-scrolled-end', g.scrollLeft + g.clientWidth >= g.scrollWidth - 2);
  });
}

/* ── drawers: enter, leave, hold focus, give it back ── */
const FOCUSABLE = 'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
/** After a redraw: the workspace behind an open drawer is inert; a newly opened drawer takes focus; a closed one gives
 *  focus back to what opened it (wasShown also counts a drawer that was still leaving). */
function settleSheet(root, wasOpen, opener, wasShown = wasOpen) {
  const sheet = root.querySelector('.wsheet:not(.is-out)');
  const back = [...root.querySelectorAll('.ao > :not(.ws-main), .ws-main > .ws')];
  back.forEach((el) => el.toggleAttribute('inert', !!sheet));
  if (sheet && !wasOpen) sheet.focus({ preventScroll: true });
  if (!sheet && wasShown && opener) {
    const el = [...root.querySelectorAll('[data-a]')].find((x) => `${x.dataset.a}|${x.dataset.v ?? ''}` === opener && x.getClientRects().length);
    el?.focus({ preventScroll: true });
  }
}
/** Keep Tab inside an open drawer. */
function trapTab(e, root) {
  const sheet = root.querySelector('.wsheet:not(.is-out)');
  if (!sheet || e.key !== 'Tab') return;
  const f = [...sheet.querySelectorAll(FOCUSABLE)].filter((x) => x.getClientRects().length && !x.closest('svg'));
  if (!f.length) return;
  const i = f.indexOf(document.activeElement);
  if (e.shiftKey && (i <= 0)) {
    e.preventDefault();
    f[f.length - 1].focus();
  } else if (!e.shiftKey && (i === f.length - 1 || i < 0)) {
    e.preventDefault();
    f[0].focus();
  }
}
