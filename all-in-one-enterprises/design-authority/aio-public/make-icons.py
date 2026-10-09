"""python3 design-authority/aio-public/make-icons.py <lucide-static@1.52.0/icons> design-authority/aio-public/site-icons.js
Vendors the selected lucide-static (ISC) glyphs the public website uses — the same source and version as the IFTA family
(src/ifta/ui/IftaIcon.tsx): linear · structured · premium (brand board §07)."""
import re, sys
src, out = sys.argv[1:3]
NAMES = {
  'arrow': 'arrow-right', 'down': 'arrow-down', 'caret': 'chevron-down', 'chev': 'chevron-right', 'back': 'chevron-left',
  'search': 'search', 'menu': 'menu', 'close': 'x', 'shield': 'shield-check', 'gem': 'gem', 'users': 'users',
  'pin': 'map-pin', 'growth': 'chart-no-axes-column-increasing', 'doc': 'file-text', 'truck': 'truck',
  'calc': 'calculator', 'dollar': 'circle-dollar-sign', 'coins': 'hand-coins', 'handshake': 'handshake',
  'wrench': 'wrench', 'gear': 'settings', 'trend': 'trending-up', 'building': 'building-2', 'badge': 'badge-check',
  'route': 'route', 'map': 'map', 'fuel': 'fuel', 'clipboard': 'clipboard-check', 'calendar': 'calendar-check',
  'idcard': 'id-card', 'hardhat': 'hard-hat', 'package': 'package', 'wallet': 'wallet', 'receipt': 'receipt',
  'landmark': 'landmark', 'phone': 'phone', 'mail': 'mail', 'login': 'log-in', 'user': 'user-round', 'globe': 'globe',
  'check': 'check', 'done': 'circle-check', 'clock': 'clock', 'alert': 'circle-alert', 'info': 'info', 'lock': 'lock',
  'key': 'key-round', 'filebadge': 'file-badge', 'stamp': 'stamp', 'signpost': 'signpost', 'milestone': 'milestone',
  'rocket': 'rocket', 'compass': 'compass', 'headset': 'headset', 'scale': 'scale', 'briefcase': 'briefcase',
  'gauge': 'gauge', 'layers': 'layers', 'container': 'container', 'warehouse': 'warehouse', 'book': 'book-open',
  'help': 'circle-help', 'play': 'circle-play', 'eye': 'eye', 'send': 'send', 'upload': 'upload',
  'message': 'message-square', 'bell': 'bell', 'archive': 'archive', 'vault': 'vault',
}
rows = []
for key, name in NAMES.items():
    svg = open(f'{src}/{name}.svg').read()
    body = re.search(r'<svg[^>]*>\s*(.*?)\s*</svg>', svg, re.S).group(1)
    body = re.sub(r'\s+', ' ', re.sub(r'<!--.*?-->', '', body, flags=re.S)).strip()
    rows.append("  %s: '%s'," % (key, body.replace("'", "\\'")))
open(out, 'w').write("""/* AIO PUBLIC WEBSITE — line icons. Glyph geometry vendored from lucide-static v1.52.0 (ISC licence, © Lucide
 * contributors) by design-authority/aio-public/make-icons.py — the IFTA family's source and version. Generated; do not edit. */
const PUB_ICONS = {
%s
};
const ic = (k, cls = '') => `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${PUB_ICONS[k] ?? (console.error(`ICON MISSING: ${k}`), '')}</svg>`;
""" % '\n'.join(rows))
print(len(rows), 'icons')
