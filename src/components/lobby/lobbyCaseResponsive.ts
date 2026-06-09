import type React from 'react';

/** Scene-locked lobby display case — popovers scale with the mapped case box. */
export const LOBBY_CASE_CONTAINER_STYLE: React.CSSProperties = {
  containerType: 'size',
  containerName: 'lobbyDisplayCase',
};

export function lobbyCaseCqw(cqw: number, minPx: number, maxPx: number): string {
  return `clamp(${minPx}px, ${cqw}cqw, ${maxPx}px)`;
}

/** Popover card width tracks case width (design ~220px at ~390px viewport). */
export const LOBBY_CASE_POPOVER_WIDTH = lobbyCaseCqw(88, 118, 220);
export const LOBBY_CASE_POPOVER_MIN_HEIGHT = lobbyCaseCqw(52, 130, 200);
export const LOBBY_CASE_POPOVER_PADDING = lobbyCaseCqw(3.1, 8, 12);
export const LOBBY_CASE_POPOVER_GAP_ABOVE_PROP = lobbyCaseCqw(2.6, 6, 10);
/** Lift popover bottom above prop top — must stay ≥ 0 or the glass panel intrudes and clips open art. */
export const LOBBY_CASE_POPOVER_REGISTER_OFFSET_UP = lobbyCaseCqw(-3.6, -18, -12);
/** Phone contact card — fixed px (cqw in calc() is unreliable on some mobile browsers). */
export const LOBBY_CASE_POPOVER_PHONE_GAP_ABOVE_PROP = '12px';
export const LOBBY_CASE_POPOVER_PHONE_OFFSET_UP = '20px';
