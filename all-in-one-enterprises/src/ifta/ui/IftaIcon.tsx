/**
 * IFTA family icon set — linear · structured · premium (brand board §07). Glyph geometry vendored from lucide-static
 * v1.52.0 (ISC licence, © Lucide contributors) by scripts/ifta/make-ifta-icons.py; no runtime dependency.
 */
import { createElement, type SVGProps } from 'react';

type El = [string, Record<string, string>];
const GLYPHS = {
  miles: [['path', {d: 'M5 21v-6'}], ['path', {d: 'M12 21V9'}], ['path', {d: 'M19 21V3'}]],
  fuel: [['path', {d: 'M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5'}], ['path', {d: 'M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16'}], ['path', {d: 'M2 21h13'}], ['path', {d: 'M3 9h11'}]],
  pin: [['path', {d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0'}], ['circle', {cx: '12', cy: '10', r: '3'}]],
  coins: [['path', {d: 'M13.744 17.736a6 6 0 1 1-7.48-7.48'}], ['path', {d: 'M15 6h1v4'}], ['path', {d: 'm6.134 14.768.866-.5 2 3.464'}], ['circle', {cx: '16', cy: '8', r: '6'}]],
  doc: [['path', {d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z'}], ['path', {d: 'M14 2v5a1 1 0 0 0 1 1h5'}], ['path', {d: 'M10 9H8'}], ['path', {d: 'M16 13H8'}], ['path', {d: 'M16 17H8'}]],
  truck: [['path', {d: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2'}], ['path', {d: 'M15 18H9'}], ['path', {d: 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14'}], ['circle', {cx: '17', cy: '18', r: '2'}], ['circle', {cx: '7', cy: '18', r: '2'}]],
  send: [['path', {d: 'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z'}], ['path', {d: 'm21.854 2.147-10.94 10.939'}]],
  done: [['circle', {cx: '12', cy: '12', r: '10'}], ['path', {d: 'm16 9-5.5 5.5L8 12'}]],
  check: [['path', {d: 'M20 6 9 17l-5-5'}]],
  clock: [['circle', {cx: '12', cy: '12', r: '10'}], ['path', {d: 'M12 6v6l4 2'}]],
  warn: [['path', {d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'}], ['path', {d: 'M12 9v4'}], ['path', {d: 'M12 17h.01'}]],
  alert: [['circle', {cx: '12', cy: '12', r: '10'}], ['line', {}], ['line', {}]],
  chevron: [['path', {d: 'm9 18 6-6-6-6'}]],
  arrow: [['path', {d: 'M5 12h14'}], ['path', {d: 'm12 5 7 7-7 7'}]],
  search: [['path', {d: 'm21 21-4.34-4.34'}], ['circle', {cx: '11', cy: '11', r: '8'}]],
  bell: [['path', {d: 'M10.268 21a2 2 0 0 0 3.464 0'}], ['path', {d: 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326'}]],
  upload: [['path', {d: 'M12 3v12'}], ['path', {d: 'm17 8-5-5-5 5'}], ['path', {d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'}]],
  calendar: [['path', {d: 'M8 2v3'}], ['path', {d: 'M16 2v3'}], ['rect', {x: '3', y: '3', width: '18', height: '18', rx: '2'}], ['path', {d: 'M3 9h18'}], ['path', {d: 'M8 13h.01'}], ['path', {d: 'M12 13h.01'}], ['path', {d: 'M16 13h.01'}], ['path', {d: 'M8 17h.01'}], ['path', {d: 'M12 17h.01'}], ['path', {d: 'M16 17h.01'}]],
  flag: [['path', {d: 'M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528'}]],
  users: [['path', {d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'}], ['path', {d: 'M16 3.128a4 4 0 0 1 0 7.744'}], ['path', {d: 'M22 21v-2a4 4 0 0 0-3-3.87'}], ['circle', {cx: '9', cy: '7', r: '4'}]],
  message: [['path', {d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z'}]],
  shield: [['path', {d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'}], ['path', {d: 'm9 12 2 2 4-4'}]],
  target: [['circle', {cx: '12', cy: '12', r: '10'}], ['circle', {cx: '12', cy: '12', r: '6'}], ['circle', {cx: '12', cy: '12', r: '2'}]],
  bulb: [['path', {d: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5'}], ['path', {d: 'M9 18h6'}], ['path', {d: 'M10 22h4'}]],
  receipt: [['path', {d: 'M12 17V7'}], ['path', {d: 'M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8'}], ['path', {d: 'M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z'}]],
  route: [['circle', {cx: '6', cy: '19', r: '3'}], ['path', {d: 'M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15'}], ['circle', {cx: '18', cy: '5', r: '3'}]],
  tasks: [['path', {d: 'M13 5h8'}], ['path', {d: 'M13 12h8'}], ['path', {d: 'M13 19h8'}], ['path', {d: 'm3 17 2 2 4-4'}], ['path', {d: 'm3 7 2 2 4-4'}]],
  clipboard: [['rect', {width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1'}], ['path', {d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'}], ['path', {d: 'M12 11h4'}], ['path', {d: 'M12 16h4'}], ['path', {d: 'M8 11h.01'}], ['path', {d: 'M8 16h.01'}]],
  archive: [['rect', {width: '20', height: '5', x: '2', y: '3', rx: '1'}], ['path', {d: 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8'}], ['path', {d: 'M10 12h4'}]],
  building: [['path', {d: 'M10 12h4'}], ['path', {d: 'M10 8h4'}], ['path', {d: 'M14 21v-3a2 2 0 0 0-4 0v3'}], ['path', {d: 'M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2'}], ['path', {d: 'M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16'}]],
  menu: [['path', {d: 'M4 5h16'}], ['path', {d: 'M4 12h16'}], ['path', {d: 'M4 19h16'}]],
  close: [['path', {d: 'M18 6 6 18'}], ['path', {d: 'm6 6 12 12'}]],
  map: [['path', {d: 'M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z'}], ['path', {d: 'M15 5.764v15'}], ['path', {d: 'M9 3.236v15'}]],
  pending: [['path', {d: 'M10.1 2.182a10 10 0 0 1 3.8 0'}], ['path', {d: 'M13.9 21.818a10 10 0 0 1-3.8 0'}], ['path', {d: 'M17.609 3.721a10 10 0 0 1 2.69 2.7'}], ['path', {d: 'M2.182 13.9a10 10 0 0 1 0-3.8'}], ['path', {d: 'M20.279 17.609a10 10 0 0 1-2.7 2.69'}], ['path', {d: 'M21.818 10.1a10 10 0 0 1 0 3.8'}], ['path', {d: 'M3.721 6.391a10 10 0 0 1 2.7-2.69'}], ['path', {d: 'M6.391 20.279a10 10 0 0 1-2.69-2.7'}]],
  more: [['circle', {cx: '12', cy: '12', r: '1'}], ['circle', {cx: '19', cy: '12', r: '1'}], ['circle', {cx: '5', cy: '12', r: '1'}]],
  download: [['path', {d: 'M12 15V3'}], ['path', {d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'}], ['path', {d: 'm7 10 5 5 5-5'}]],
  info: [['circle', {cx: '12', cy: '12', r: '10'}], ['path', {d: 'M12 16v-4'}], ['path', {d: 'M12 8h.01'}]],
  history: [['path', {d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'}], ['path', {d: 'M3 3v5h5'}], ['path', {d: 'M12 7v5l4 2'}]],
  draft: [['path', {d: 'M14.364 13.634a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506l4.013-4.009a1 1 0 0 0-3.004-3.004z'}], ['path', {d: 'M14.487 7.858A1 1 0 0 1 14 7V2'}], ['path', {d: 'M20 19.645V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l2.516 2.516'}], ['path', {d: 'M8 18h1'}]],
  gauge: [['path', {d: 'm12 14 4-4'}], ['path', {d: 'M3.34 19a10 10 0 1 1 17.32 0'}]],
  vault: [['rect', {width: '18', height: '18', x: '3', y: '3', rx: '2'}], ['circle', {cx: '7.5', cy: '7.5', r: '.5', fill: 'currentColor'}], ['path', {d: 'm7.9 7.9 2.7 2.7'}], ['circle', {cx: '16.5', cy: '7.5', r: '.5', fill: 'currentColor'}], ['path', {d: 'm13.4 10.6 2.7-2.7'}], ['circle', {cx: '7.5', cy: '16.5', r: '.5', fill: 'currentColor'}], ['path', {d: 'm7.9 16.1 2.7-2.7'}], ['circle', {cx: '16.5', cy: '16.5', r: '.5', fill: 'currentColor'}], ['path', {d: 'm13.4 13.4 2.7 2.7'}], ['circle', {cx: '12', cy: '12', r: '2'}]],
  faq: [['circle', {cx: '12', cy: '12', r: '10'}], ['path', {d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'}], ['path', {d: 'M12 17h.01'}]],
  active: [['path', {d: 'M21 12a9 9 0 1 1-6.219-8.56'}]],
  user: [['circle', {cx: '12', cy: '8', r: '5'}], ['path', {d: 'M20 21a8 8 0 0 0-16 0'}]],
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
