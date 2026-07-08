/**
 * Smoke test: Studio Orb radial menu layout stays in viewport (bottom-right orb).
 * Run: npx tsx scripts/test-studio-orb-radial-layout.ts
 */

import {
  computeRadialMenuLayout,
  RADIAL_ITEM_HEIGHT,
  RADIAL_ITEM_WIDTH,
  RADIAL_ORB_HALF_PX,
  RADIAL_MENU_ORB_GAP,
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

const orbBottomRight = { x: 390 - 16 - 20, y: 664 - 34 - 14 - 20 };

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

function noItemsOverlapOrb(
  layout: ReturnType<typeof computeRadialMenuLayout>,
  anchorX: number,
  anchorY: number
) {
  const halfW = RADIAL_ITEM_WIDTH / 2;
  const halfH = RADIAL_ITEM_HEIGHT / 2;
  const pad = RADIAL_MENU_ORB_GAP;
  const orbHalf = RADIAL_ORB_HALF_PX;

  for (const item of layout.items) {
    const overlaps = !(
      item.x + halfW < anchorX - orbHalf - pad ||
      item.x - halfW > anchorX + orbHalf + pad ||
      item.y + halfH < anchorY - orbHalf - pad ||
      item.y - halfH > anchorY + orbHalf + pad
    );
    assert(!overlaps, `item ${item.index} overlaps Orb`);
  }
}

function lowestItemAboveOrb(
  layout: ReturnType<typeof computeRadialMenuLayout>,
  anchorY: number
) {
  const halfH = RADIAL_ITEM_HEIGHT / 2;
  const orbTop = anchorY - RADIAL_ORB_HALF_PX - RADIAL_MENU_ORB_GAP;
  const lowestBottom = Math.max(...layout.items.map((item) => item.y + halfH));
  assert(lowestBottom <= orbTop + 0.5, `lowest projection (${lowestBottom}) should sit above orb top (${orbTop})`);
}

const layout5 = computeRadialMenuLayout(orbBottomRight.x, orbBottomRight.y, 5, iphoneSafari);
assert(layout5.items.length === 5, 'five items');
allItemsInBounds(layout5, iphoneSafari);
noItemsOverlapOrb(layout5, orbBottomRight.x, orbBottomRight.y);
lowestItemAboveOrb(layout5, orbBottomRight.y);

const layout3 = computeRadialMenuLayout(orbBottomRight.x, orbBottomRight.y, 3, iphoneSafari);
assert(layout3.items.length === 3, 'three items');
allItemsInBounds(layout3, iphoneSafari);
noItemsOverlapOrb(layout3, orbBottomRight.x, orbBottomRight.y);

const tinyViewport: ViewportRect = {
  width: 320,
  height: 480,
  offsetLeft: 0,
  offsetTop: 0,
  insets: { top: 44, right: 0, bottom: 34, left: 0 },
};
const orbTiny = { x: 320 - 20 - 20, y: 480 - 34 - 14 - 20 };
const layoutStacked = computeRadialMenuLayout(orbTiny.x, orbTiny.y, 5, tinyViewport);
assert(layoutStacked.mode === 'stacked' || layoutStacked.mode === 'radial', 'valid mode');
allItemsInBounds(layoutStacked, tinyViewport);
noItemsOverlapOrb(layoutStacked, orbTiny.x, orbTiny.y);

console.log('OK: Studio Orb radial layout smoke tests passed');
console.log(`  iPhone 5-action mode: ${layout5.mode}`);
console.log(`  iPhone 3-action mode: ${layout3.mode}`);
console.log(`  tight viewport mode: ${layoutStacked.mode}`);
