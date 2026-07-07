/**
 * Smoke test: Studio Orb radial menu layout stays in viewport (bottom-right orb).
 * Run: npx tsx scripts/test-studio-orb-radial-layout.ts
 */

import {
  computeRadialMenuLayout,
  RADIAL_ITEM_HEIGHT,
  RADIAL_ITEM_WIDTH,
  type ViewportRect,
} from '../src/components/admin/studio/studio-orb/studioOrbRadialLayout';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

const iphoneSafari: ViewportRect = {
  width: 390,
  height: 664,
  offsetLeft: 0,
  offsetTop: 0,
  insets: { top: 47, right: 0, bottom: 34, left: 0 },
};

const orbBottomRight = { x: 390 - 16 - 29, y: 664 - 34 - 20 - 29 };

function allItemsInBounds(layout: ReturnType<typeof computeRadialMenuLayout>, viewport: ViewportRect) {
  const pad = 12;
  const minX = viewport.offsetLeft + viewport.insets.left + pad;
  const maxX = viewport.offsetLeft + viewport.width - viewport.insets.right - pad;
  const minY = viewport.offsetTop + viewport.insets.top + pad;
  const maxY = viewport.offsetTop + viewport.height - viewport.insets.bottom - pad;
  const halfW = RADIAL_ITEM_WIDTH / 2;
  const halfH = RADIAL_ITEM_HEIGHT / 2;

  for (const item of layout.items) {
    assert(item.x - halfW >= minX, `item ${item.index} left clipped`);
    assert(item.x + halfW <= maxX, `item ${item.index} right clipped`);
    assert(item.y - halfH >= minY, `item ${item.index} top clipped`);
    assert(item.y + halfH <= maxY, `item ${item.index} bottom clipped`);
  }
}

const layout3 = computeRadialMenuLayout(orbBottomRight.x, orbBottomRight.y, 3, iphoneSafari);
assert(layout3.items.length === 3, 'three items');
allItemsInBounds(layout3, iphoneSafari);

const tinyViewport: ViewportRect = {
  width: 320,
  height: 480,
  offsetLeft: 0,
  offsetTop: 0,
  insets: { top: 44, right: 0, bottom: 34, left: 0 },
};
const orbTiny = { x: 320 - 20 - 29, y: 480 - 34 - 20 - 29 };
const layoutStacked = computeRadialMenuLayout(orbTiny.x, orbTiny.y, 3, tinyViewport);
assert(layoutStacked.mode === 'stacked' || layoutStacked.mode === 'radial', 'valid mode');
allItemsInBounds(layoutStacked, tinyViewport);

console.log('OK: Studio Orb radial layout smoke tests passed');
console.log(`  iPhone 3-action mode: ${layout3.mode}`);
console.log(`  tight viewport mode: ${layoutStacked.mode}`);
