/**
 * Line items persisted on `userOrders_*` orders for inventory + refunds + visual snapshots.
 */

import type { BawVisualSnapshot } from './bawVisualSnapshot/types';
import { isSignatureUnitCommerceLine } from './bawVisualSnapshot/unitSlug';
import { getApprovedColorMeta } from './bawVisualSnapshot/colorPalette';

export type PersistedOrderLineItem = {
  name?: string;
  productName?: string;
  quantity: number;
  type?: string;
  subtotal?: number;
  image?: string;
  options?: Record<string, string>;
  visualSnapshot?: BawVisualSnapshot;
  visualSnapshotAssetId?: string;
  visualSnapshotUrl?: string;
  visualSnapshotStatus?: BawVisualSnapshot['status'];
  baseUnitId?: string;
};

function optionsFromCartLine(i: Record<string, unknown>): Record<string, string> {
  const opts: Record<string, string> = {};
  const fields = [
    'color',
    'length',
    'density',
    'lace',
    'capSize',
    'texture',
    'hairline',
    'styling',
    'partSelection',
  ] as const;
  for (const key of fields) {
    const v = i[key];
    if (typeof v === 'string' && v.trim()) opts[key] = v.trim();
  }
  if (Array.isArray(i.addOns) && i.addOns.length > 0) {
    opts.addOns = (i.addOns as string[]).join(' · ');
  }
  if (typeof i.selectedColorHex === 'string') opts.colorHex = i.selectedColorHex;
  if (typeof i.visualSnapshotUrl === 'string') opts.visualSnapshotUrl = i.visualSnapshotUrl;
  if (typeof i.visualSnapshotStatus === 'string') opts.visualSnapshotStatus = i.visualSnapshotStatus;
  if (typeof i.visualSnapshotAssetId === 'string') opts.visualSnapshotAssetId = i.visualSnapshotAssetId;
  if (typeof i.baseUnitId === 'string') opts.baseUnitId = i.baseUnitId;
  if (typeof i.image === 'string') opts.image = i.image;
  return opts;
}

/** Snapshot cart lines at checkout — includes configuration + visual snapshot for historical accuracy. */
export function buildPersistedLineItemsFromCart(cartItems: unknown[] | null | undefined): PersistedOrderLineItem[] {
  if (!cartItems || !Array.isArray(cartItems)) return [];
  const out: PersistedOrderLineItem[] = [];
  for (const raw of cartItems) {
    const i = raw as Record<string, unknown>;
    const qty = Math.max(1, Math.floor(Number(i.quantity) || 1));
    const name = String(i.name ?? '').trim() || 'ITEM';
    const line: PersistedOrderLineItem = {
      name,
      productName: name,
      quantity: qty,
      type: typeof i.type === 'string' ? i.type : undefined,
      subtotal: typeof i.price === 'number' ? i.price * qty : undefined,
    };

    if (isSignatureUnitCommerceLine(i as { name?: string; type?: string })) {
      line.options = optionsFromCartLine(i);
      if (typeof i.image === 'string') line.image = i.image;
      if (i.visualSnapshot && typeof i.visualSnapshot === 'object') {
        line.visualSnapshot = i.visualSnapshot as BawVisualSnapshot;
      }
      if (typeof i.visualSnapshotAssetId === 'string') line.visualSnapshotAssetId = i.visualSnapshotAssetId;
      if (typeof i.visualSnapshotUrl === 'string') line.visualSnapshotUrl = i.visualSnapshotUrl;
      if (typeof i.visualSnapshotStatus === 'string') {
        line.visualSnapshotStatus = i.visualSnapshotStatus as BawVisualSnapshot['status'];
      }
      if (typeof i.baseUnitId === 'string') line.baseUnitId = i.baseUnitId;
      if (!line.options.colorHex && typeof i.color === 'string') {
        line.options.colorHex = getApprovedColorMeta(i.color).hex;
      }
    }

    out.push(line);
  }
  return out;
}

/** First Signature unit snapshot URL from cart — for order-level hero thumb. */
export function primaryVisualSnapshotUrlFromCart(cartItems: unknown[] | null | undefined): string | null {
  if (!cartItems || !Array.isArray(cartItems)) return null;
  for (const raw of cartItems) {
    const i = raw as Record<string, unknown>;
    if (!isSignatureUnitCommerceLine(i as { name?: string; type?: string })) continue;
    const url =
      (typeof i.visualSnapshotUrl === 'string' && i.visualSnapshotUrl) ||
      (i.visualSnapshot as { url?: string } | undefined)?.url ||
      (typeof i.image === 'string' && i.image);
    if (url) return url;
  }
  return null;
}
