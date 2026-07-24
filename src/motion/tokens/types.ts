/** Frontal Slayer Motion System (FSMS) — shared types */

import type { CSSProperties, ReactNode } from 'react';

export type FsmsAlign = 'left' | 'center' | 'right';

export type FsmsPresetId =
  | 'luxury-reveal'
  | 'morning-reveal'
  | 'sunlight-sweep'
  | 'crystal-fade'
  | 'elegant-dissolve'
  | 'campaign-intro'
  | 'campaign-outro';

export type FsmsPhaseTiming = {
  /** Sparkle priming (ms) */
  sparkleIn: number;
  /** Light sweep across material (ms) */
  sweep: number;
  /** Glass visibility hold (ms) */
  hold: number;
  /** Dissolve back to transparency (ms) */
  dissolve: number;
  /** Delay before sequence starts (ms) */
  delay: number;
};

export type FsmsPreset = {
  id: FsmsPresetId;
  label: string;
  timing: FsmsPhaseTiming;
  /** Total recommended duration (computed) */
  totalDuration: number;
  easing: string;
  sparkleDensity: number;
  sweepIntensity: number;
  bloom: number;
  loop: boolean;
};

export type FsmsLightingConfig = {
  sweepAngleDeg: number;
  highlightOpacity: number;
  bloomStrength: number;
  environmentShift: number;
};

export type FsmsSparkleSpec = {
  id: string;
  x: number;
  y: number;
  size: number;
  delayMs: number;
  durationMs: number;
  opacity: number;
};

export type FsmsBaseProps = {
  className?: string;
  style?: CSSProperties;
  preset?: FsmsPresetId | string;
  align?: FsmsAlign;
  duration?: number;
  delay?: number;
  loop?: boolean;
  /** When false, animation runs once on mount */
  autoPlay?: boolean;
  /** Accessible label when text is decorative */
  'aria-label'?: string;
};

export type CrystalTextProps = FsmsBaseProps & {
  text?: string;
  children?: ReactNode;
  /** Responsive clamp: min, preferred vw, max in px */
  size?: 'display' | 'title' | 'subtitle' | 'logo';
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
};
