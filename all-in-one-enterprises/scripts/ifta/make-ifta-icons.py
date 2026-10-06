"""python3 scripts/ifta/make-ifta-icons.py <lucide-static@1.52.0/icons> src/ifta/ui/IftaIcon.tsx — vendors selected lucide-static (ISC) glyphs."""
import re, sys
src, out = sys.argv[1:3]
NAMES = {
  'miles': 'chart-no-axes-column-increasing', 'fuel': 'fuel', 'pin': 'map-pin', 'coins': 'coins', 'doc': 'file-text',
  'truck': 'truck', 'send': 'send', 'done': 'circle-check', 'check': 'check', 'clock': 'clock', 'warn': 'triangle-alert',
  'alert': 'circle-alert', 'chevron': 'chevron-right', 'arrow': 'arrow-right', 'search': 'search', 'bell': 'bell',
  'upload': 'upload', 'calendar': 'calendar-days', 'flag': 'flag', 'users': 'users', 'message': 'message-square',
  'shield': 'shield-check', 'target': 'target', 'bulb': 'lightbulb', 'receipt': 'receipt', 'route': 'route',
  'tasks': 'list-checks', 'clipboard': 'clipboard-list', 'archive': 'archive', 'building': 'building-2', 'menu': 'menu',
  'close': 'x', 'map': 'map', 'pending': 'circle-dashed', 'more': 'ellipsis', 'download': 'download', 'info': 'info',
  'history': 'history', 'draft': 'file-pen-line', 'gauge': 'gauge', 'vault': 'vault', 'faq': 'circle-help',
  'active': 'loader-circle', 'user': 'user-round',
}
rows = []
for key, name in NAMES.items():
    svg = open(f'{src}/{name}.svg').read()
    body = re.search(r'>\s*(.*)\s*</svg>', svg, re.S).group(1)
    els = re.findall(r'<(path|circle|rect|line|polyline|polygon|ellipse)\s+([^>]*?)\s*/>', body)
    parts = []
    for tag, attrs in els:
        kv = dict(re.findall(r'([a-z-]+)="([^"]*)"', attrs))
        parts.append("['%s', {%s}]" % (tag, ', '.join("%s: '%s'" % (k if '-' not in k else "'%s'" % k, v) for k, v in kv.items())))
    rows.append("  %s: [%s]," % (key, ', '.join(parts)))
tsx = """/**
 * IFTA family icon set — linear · structured · premium (brand board §07). Glyph geometry vendored from lucide-static
 * v1.52.0 (ISC licence, © Lucide contributors) by scripts/ifta/make-ifta-icons.py; no runtime dependency.
 */
import { createElement, type SVGProps } from 'react';

type El = [string, Record<string, string>];
const GLYPHS = {
%s
} satisfies Record<string, El[]>;

export type IftaIconName = keyof typeof GLYPHS;

export function IftaIcon({ name, size = 20, strokeWidth = 1.75, ...rest }: { name: IftaIconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {GLYPHS[name].map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}
""" % '\n'.join(rows)
open(out, 'w').write(tsx)
print(len(rows), 'icons')
