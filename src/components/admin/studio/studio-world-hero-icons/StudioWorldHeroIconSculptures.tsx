/**
 * Studio World Hero Icon Library™ — sculptural SVG renders.
 * Premium industrial design · glass · chrome · crystal · internal illumination.
 */

import type { ComponentType, ReactNode } from 'react';
import type { StudioWorldHeroIconId } from './studioWorldHeroIconTypes';

export type HeroSculptureProps = {
  size?: number;
  uid: string;
  className?: string;
};

function Frame({ size = 32, className, children }: HeroSculptureProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function SharedDefs({ uid }: { uid: string }) {
  return (
    <defs>
      <linearGradient id={`${uid}-chrome`} x1="4" y1="4" x2="44" y2="44">
        <stop offset="0%" stopColor="#fffaf5" stopOpacity="0.98" />
        <stop offset="35%" stopColor="#e8dcc8" stopOpacity="0.88" />
        <stop offset="55%" stopColor="#c9a962" stopOpacity="0.82" />
        <stop offset="100%" stopColor="#9a7a52" stopOpacity="0.9" />
      </linearGradient>
      <radialGradient id={`${uid}-crystal`} cx="32%" cy="28%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="45%" stopColor="#fff8f0" stopOpacity="0.42" />
        <stop offset="100%" stopColor="#d4c8b8" stopOpacity="0.12" />
      </radialGradient>
      <radialGradient id={`${uid}-glow`} cx="50%" cy="50%">
        <stop offset="0%" stopColor="#fff8eb" stopOpacity="1" />
        <stop offset="55%" stopColor="#c9a962" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#c9a962" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.72" />
        <stop offset="50%" stopColor="#e8f0ff" stopOpacity="0.28" />
        <stop offset="100%" stopColor="#fff0e0" stopOpacity="0.38" />
      </linearGradient>
      <linearGradient id={`${uid}-holo`} x1="0" y1="0" x2="48" y2="0">
        <stop offset="0%" stopColor="#c9a962" stopOpacity="0" />
        <stop offset="45%" stopColor="#c9a962" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#88c8ff" stopOpacity="0.65" />
      </linearGradient>
      <filter id={`${uid}-soft-glow`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id={`${uid}-depth`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.28" />
      </filter>
    </defs>
  );
}

/** World Atlas™ — crystal globe in concentric orbital rings */
export function HeroSculptureWorldAtlas({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <ellipse cx="24" cy="26" rx="16" ry="4.5" fill="#000" opacity="0.12" />
        <ellipse cx="24" cy="24" rx="17" ry="5.5" stroke={`url(#${uid}-chrome)`} strokeWidth="0.55" opacity="0.55" />
        <ellipse cx="24" cy="24" rx="14" ry="4" stroke="#c9a962" strokeWidth="0.45" opacity="0.42" transform="rotate(-22 24 24)" />
        <ellipse cx="24" cy="24" rx="11.5" ry="3.2" stroke="#fffaf0" strokeWidth="0.35" opacity="0.35" transform="rotate(38 24 24)" />
        <circle cx="24" cy="22" r="9.5" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <path d="M14.5 22c2.5-4 6.5-6 9.5-6s7 2 9.5 6" stroke="#fff" strokeWidth="0.35" opacity="0.45" />
        <path d="M14.5 22c2.5 4 6.5 6 9.5 6s7-2 9.5-6" stroke="#c9a962" strokeWidth="0.35" opacity="0.4" />
        <ellipse cx="24" cy="22" rx="9.5" ry="3.2" stroke="#fff" strokeWidth="0.3" opacity="0.35" />
        <circle cx="20" cy="19" r="2.8" fill="#fff" opacity="0.55" />
        <circle cx="24" cy="22" r="2.2" fill={`url(#${uid}-glow)`} filter={`url(#${uid}-soft-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Voice™ — chrome microphone with sound-wave ribbons */
export function HeroSculptureVoice({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <path
          d="M10 20 Q8 24 10 28"
          stroke={`url(#${uid}-holo)`}
          strokeWidth="0.8"
          fill="none"
          opacity="0.55"
          className="sw-hero-icon__wave"
        />
        <path
          d="M38 20 Q40 24 38 28"
          stroke={`url(#${uid}-holo)`}
          strokeWidth="0.8"
          fill="none"
          opacity="0.55"
          className="sw-hero-icon__wave sw-hero-icon__wave--alt"
        />
        <path d="M12 18 Q6 24 12 30" stroke="#c9a962" strokeWidth="0.45" fill="none" opacity="0.35" />
        <path d="M36 18 Q42 24 36 30" stroke="#c9a962" strokeWidth="0.45" fill="none" opacity="0.35" />
        <rect x="20" y="28" width="8" height="2.5" rx="0.6" fill={`url(#${uid}-chrome)`} />
        <rect x="17" y="30.5" width="14" height="1.8" rx="0.5" fill="#b89868" opacity="0.85" />
        <rect x="21" y="10" width="6" height="17" rx="3" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.7" />
        <rect x="21.8" y="11" width="2.2" height="12" rx="1" fill="#fff" opacity="0.65" />
        <line x1="22" y1="14" x2="26" y2="14" stroke="#c9a962" strokeWidth="0.35" opacity="0.5" />
        <line x1="22" y1="17" x2="26" y2="17" stroke="#c9a962" strokeWidth="0.35" opacity="0.45" />
        <line x1="22" y1="20" x2="26" y2="20" stroke="#c9a962" strokeWidth="0.35" opacity="0.4" />
        <circle cx="24" cy="13" r="1.4" fill={`url(#${uid}-glow)`} filter={`url(#${uid}-soft-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Daily Brief™ — illuminated architectural document with layered pages */
export function HeroSculptureDailyBrief({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <rect x="14" y="12" width="16" height="22" rx="1.2" fill={`url(#${uid}-glass)`} opacity="0.35" transform="rotate(-4 22 23)" />
        <rect x="12" y="10" width="16" height="22" rx="1.2" fill={`url(#${uid}-glass)`} opacity="0.5" transform="rotate(-2 20 21)" />
        <rect x="10" y="8" width="18" height="24" rx="1.5" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <rect x="13" y="12" width="10" height="1.4" rx="0.4" fill={`url(#${uid}-glow)`} opacity="0.9" />
        <rect x="13" y="15.5" width="8" height="0.7" rx="0.25" fill="#fff" opacity="0.45" />
        <rect x="13" y="18" width="9" height="0.7" rx="0.25" fill="#fff" opacity="0.35" />
        <rect x="13" y="20.5" width="7" height="0.7" rx="0.25" fill="#fff" opacity="0.28" />
        <path d="M13 24 L27 24 L27 28 L13 28 Z" fill="#c9a962" opacity="0.12" />
        <line x1="14" y1="25" x2="26" y2="25" stroke={`url(#${uid}-holo)`} strokeWidth="0.55" opacity="0.65" />
        <line x1="14" y1="27" x2="22" y2="27" stroke="#c9a962" strokeWidth="0.45" opacity="0.5" />
        <circle cx="26" cy="11" r="1.2" fill={`url(#${uid}-glow)`} filter={`url(#${uid}-soft-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Page Guide™ — holographic blueprint tablet */
export function HeroSculpturePageGuide({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <rect x="9" y="11" width="30" height="26" rx="2.5" fill={`url(#${uid}-glass)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" opacity="0.92" />
        <rect x="11" y="13" width="26" height="22" rx="1.5" fill="#000" opacity="0.08" />
        <line x1="13" y1="17" x2="35" y2="17" stroke={`url(#${uid}-holo)`} strokeWidth="0.45" opacity="0.55" />
        <line x1="13" y1="21" x2="35" y2="21" stroke="#c9a962" strokeWidth="0.35" opacity="0.4" />
        <line x1="13" y1="25" x2="35" y2="25" stroke="#88c8ff" strokeWidth="0.35" opacity="0.35" />
        <line x1="13" y1="29" x2="35" y2="29" stroke="#c9a962" strokeWidth="0.35" opacity="0.35" />
        <line x1="17" y1="15" x2="17" y2="33" stroke="#c9a962" strokeWidth="0.3" opacity="0.3" />
        <line x1="24" y1="15" x2="24" y2="33" stroke="#88c8ff" strokeWidth="0.3" opacity="0.28" />
        <line x1="31" y1="15" x2="31" y2="33" stroke="#c9a962" strokeWidth="0.3" opacity="0.3" />
        <path d="M15 19 L22 26 L30 18" stroke={`url(#${uid}-glow)`} strokeWidth="0.7" fill="none" opacity="0.75" />
        <circle cx="15" cy="19" r="1" fill="#c9a962" opacity="0.8" />
        <circle cx="22" cy="26" r="1" fill="#fff" opacity="0.85" />
        <circle cx="30" cy="18" r="1" fill="#88c8ff" opacity="0.75" />
        <rect x="11" y="13" width="3" height="3" rx="0.5" fill={`url(#${uid}-glow)`} opacity="0.6" className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Command Dock™ — crystal command pedestal with floating interface rings */
export function HeroSculptureCommandDock({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <ellipse cx="24" cy="34" rx="12" ry="3" fill="#000" opacity="0.14" />
        <path d="M14 34 L18 22 L30 22 L34 34 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <ellipse cx="24" cy="22" rx="8" ry="2.2" stroke="#c9a962" strokeWidth="0.45" opacity="0.5" />
        <ellipse cx="24" cy="18" rx="6.5" ry="1.8" stroke="#fff" strokeWidth="0.35" opacity="0.45" className="sw-hero-icon__orbit" />
        <ellipse cx="24" cy="14.5" rx="5" ry="1.4" stroke="#88c8ff" strokeWidth="0.35" opacity="0.4" className="sw-hero-icon__orbit sw-hero-icon__orbit--alt" />
        <circle cx="24" cy="16" r="3.2" fill={`url(#${uid}-glass)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.55" />
        <circle cx="24" cy="16" r="1.6" fill={`url(#${uid}-glow)`} filter={`url(#${uid}-soft-glow)`} className="sw-hero-icon__core-light" />
        <rect x="22" y="28" width="4" height="2" rx="0.4" fill="#c9a962" opacity="0.45" />
      </g>
    </Frame>
  );
}

/** Life & Culture™ — cultural compass medallion */
export function HeroSculptureLifeCulture({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <circle cx="24" cy="24" r="13" stroke={`url(#${uid}-chrome)`} strokeWidth="0.55" fill="none" opacity="0.55" />
        <circle cx="24" cy="24" r="10" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <path d="M24 14 L26 24 L24 34 L22 24 Z" fill={`url(#${uid}-glass)`} opacity="0.65" />
        <path d="M14 24 L24 22 L34 24 L24 26 Z" fill={`url(#${uid}-glass)`} opacity="0.55" />
        <circle cx="24" cy="24" r="2.5" fill={`url(#${uid}-glow)`} filter={`url(#${uid}-soft-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Mission Control™ — radar crystal with orbital sweep */
export function HeroSculptureMissionControl({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <path d="M16 32 L24 10 L32 32 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <ellipse cx="24" cy="20" rx="7" ry="2" stroke="#c9a962" strokeWidth="0.4" opacity="0.45" />
        <ellipse cx="24" cy="20" rx="4.5" ry="1.3" stroke="#fff" strokeWidth="0.35" opacity="0.4" />
        <circle cx="24" cy="20" r="1.8" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Knowledge Core™ — glowing data crystal */
export function HeroSculptureKnowledgeCore({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <path d="M24 8 L34 18 L24 40 L14 18 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <path d="M24 14 L28 18 L24 32 L20 18 Z" fill={`url(#${uid}-glass)`} opacity="0.55" />
        <line x1="24" y1="16" x2="24" y2="30" stroke={`url(#${uid}-holo)`} strokeWidth="0.5" opacity="0.6" />
        <circle cx="24" cy="20" r="2" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Constitution Hall™ — etched marble pillar */
export function HeroSculptureConstitutionHall({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <rect x="16" y="10" width="16" height="28" rx="1" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <rect x="14" y="8" width="20" height="4" rx="0.8" fill={`url(#${uid}-chrome)`} opacity="0.85" />
        <rect x="14" y="36" width="20" height="3" rx="0.6" fill="#b89868" opacity="0.8" />
        <line x1="19" y1="16" x2="29" y2="16" stroke="#c9a962" strokeWidth="0.45" opacity="0.55" />
        <line x1="19" y1="20" x2="27" y2="20" stroke="#fff" strokeWidth="0.35" opacity="0.35" />
        <circle cx="24" cy="28" r="2" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Creative Direction™ — miniature story table */
export function HeroSculptureCreativeDirection({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <ellipse cx="24" cy="30" rx="14" ry="4" fill="#000" opacity="0.1" />
        <ellipse cx="24" cy="26" rx="14" ry="5" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <rect x="22" y="18" width="4" height="8" fill={`url(#${uid}-chrome)`} opacity="0.7" />
        <circle cx="24" cy="16" r="2.5" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Marketplace™ — crystal arch portal */
export function HeroSculptureMarketplace({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <path d="M12 34 L12 18 Q24 8 36 18 L36 34" fill={`url(#${uid}-glass)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <path d="M16 34 L16 20 Q24 14 32 20 L32 34" fill={`url(#${uid}-crystal)`} opacity="0.45" />
        <circle cx="24" cy="22" r="2" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Warehouse™ — logistics nexus cube */
export function HeroSculptureWarehouse({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <path d="M10 22 L24 14 L38 22 L24 30 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <path d="M10 22 L10 32 L24 40 L24 30 Z" fill={`url(#${uid}-glass)`} opacity="0.55" />
        <path d="M38 22 L38 32 L24 40 L24 30 Z" fill="#c9a962" opacity="0.15" />
        <circle cx="24" cy="24" r="1.8" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Museum™ — glass vitrine pedestal */
export function HeroSculptureMuseum({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <rect x="14" y="30" width="20" height="4" rx="0.6" fill={`url(#${uid}-chrome)`} opacity="0.85" />
        <rect x="12" y="14" width="24" height="16" rx="1.5" fill={`url(#${uid}-glass)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <ellipse cx="24" cy="22" rx="6" ry="3" fill={`url(#${uid}-crystal)`} stroke="#c9a962" strokeWidth="0.45" />
        <circle cx="24" cy="21" r="1.6" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Innovation™ — crystal spark forge */
export function HeroSculptureInnovation({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <path d="M24 8 L28 20 L40 22 L30 30 L32 42 L24 36 L16 42 L18 30 L8 22 L20 20 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <circle cx="24" cy="24" r="3" fill={`url(#${uid}-glow)`} filter={`url(#${uid}-soft-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Finance™ — vault chamber */
export function HeroSculptureFinance({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <rect x="12" y="12" width="24" height="26" rx="2" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <circle cx="24" cy="25" r="7" stroke="#c9a962" strokeWidth="0.55" fill="none" opacity="0.55" />
        <circle cx="24" cy="25" r="3.5" fill={`url(#${uid}-glass)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.45" />
        <circle cx="24" cy="25" r="1.5" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Operations™ — chrome execution engine */
export function HeroSculptureOperations({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <circle cx="24" cy="24" r="11" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <circle cx="24" cy="24" r="5" fill={`url(#${uid}-glass)`} stroke="#c9a962" strokeWidth="0.45" />
        <rect x="22" y="10" width="4" height="6" rx="0.5" fill={`url(#${uid}-chrome)`} opacity="0.8" />
        <rect x="22" y="32" width="4" height="6" rx="0.5" fill={`url(#${uid}-chrome)`} opacity="0.8" />
        <rect x="10" y="22" width="6" height="4" rx="0.5" fill={`url(#${uid}-chrome)`} opacity="0.8" />
        <rect x="32" y="22" width="6" height="4" rx="0.5" fill={`url(#${uid}-chrome)`} opacity="0.8" />
        <circle cx="24" cy="24" r="1.8" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Hiring™ — talent observatory lens */
export function HeroSculptureHiring({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <path d="M18 32 L24 12 L30 32" fill={`url(#${uid}-chrome)`} opacity="0.75" />
        <ellipse cx="24" cy="22" rx="8" ry="5" fill={`url(#${uid}-glass)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <circle cx="24" cy="22" r="2.2" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Legal™ — etched crystal charter block */
export function HeroSculptureLegal({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <rect x="13" y="14" width="22" height="20" rx="1.2" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <path d="M17 18 L31 18 M17 22 L29 22 M17 26 L27 26" stroke="#c9a962" strokeWidth="0.45" opacity="0.5" />
        <rect x="20" y="10" width="8" height="4" rx="0.5" fill={`url(#${uid}-chrome)`} opacity="0.8" />
        <circle cx="24" cy="24" r="1.8" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Marketing™ — broadcast crystal lens */
export function HeroSculptureMarketing({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <circle cx="24" cy="24" r="12" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <circle cx="24" cy="24" r="6" fill={`url(#${uid}-glass)`} stroke="#c9a962" strokeWidth="0.45" />
        <path d="M24 12 L26 20 L34 22 L26 24 L24 32 L22 24 L14 22 L22 20 Z" fill={`url(#${uid}-glow)`} opacity="0.35" />
        <circle cx="24" cy="24" r="2" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Product™ — floating product pedestal */
export function HeroSculptureProduct({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <ellipse cx="24" cy="32" rx="10" ry="2.5" fill="#000" opacity="0.1" />
        <rect x="16" y="28" width="16" height="3" rx="0.6" fill={`url(#${uid}-chrome)`} opacity="0.85" />
        <rect x="18" y="16" width="12" height="12" rx="2" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <ellipse cx="24" cy="14" rx="7" ry="2" stroke="#c9a962" strokeWidth="0.4" opacity="0.45" className="sw-hero-icon__orbit" />
        <circle cx="24" cy="22" r="2" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Customer Experience™ — relationship crystal node */
export function HeroSculptureCustomerExperience({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`}>
        <circle cx="24" cy="24" r="4" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
        <circle cx="14" cy="18" r="2.5" fill={`url(#${uid}-glass)`} stroke="#c9a962" strokeWidth="0.4" />
        <circle cx="34" cy="18" r="2.5" fill={`url(#${uid}-glass)`} stroke="#c9a962" strokeWidth="0.4" />
        <circle cx="24" cy="36" r="2.5" fill={`url(#${uid}-glass)`} stroke="#c9a962" strokeWidth="0.4" />
        <line x1="21" y1="22" x2="16" y2="19" stroke="#c9a962" strokeWidth="0.4" opacity="0.45" />
        <line x1="27" y1="22" x2="32" y2="19" stroke="#c9a962" strokeWidth="0.4" opacity="0.45" />
        <line x1="24" y1="28" x2="24" y2="33" stroke="#c9a962" strokeWidth="0.4" opacity="0.45" />
        <circle cx="24" cy="24" r="1.5" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
      </g>
    </Frame>
  );
}

/** Dormant — inactive crystal shard */
export function HeroSculptureDormant({ size, uid, className }: HeroSculptureProps) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <SharedDefs uid={uid} />
      <g filter={`url(#${uid}-depth)`} opacity="0.45">
        <path d="M24 10 L32 24 L24 38 L16 24 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.55" />
        <circle cx="24" cy="24" r="1.5" fill={`url(#${uid}-glow)`} opacity="0.5" />
      </g>
    </Frame>
  );
}

export const HERO_SCULPTURE_MAP: Record<StudioWorldHeroIconId, ComponentType<HeroSculptureProps>> = {
  'world-atlas': HeroSculptureWorldAtlas,
  voice: HeroSculptureVoice,
  'daily-brief': HeroSculptureDailyBrief,
  'page-guide': HeroSculpturePageGuide,
  'command-dock': HeroSculptureCommandDock,
  'life-culture': HeroSculptureLifeCulture,
  'mission-control': HeroSculptureMissionControl,
  'knowledge-core': HeroSculptureKnowledgeCore,
  'constitution-hall': HeroSculptureConstitutionHall,
  'creative-direction': HeroSculptureCreativeDirection,
  marketplace: HeroSculptureMarketplace,
  warehouse: HeroSculptureWarehouse,
  museum: HeroSculptureMuseum,
  innovation: HeroSculptureInnovation,
  finance: HeroSculptureFinance,
  operations: HeroSculptureOperations,
  hiring: HeroSculptureHiring,
  legal: HeroSculptureLegal,
  marketing: HeroSculptureMarketing,
  product: HeroSculptureProduct,
  'customer-experience': HeroSculptureCustomerExperience,
  dormant: HeroSculptureDormant,
};
