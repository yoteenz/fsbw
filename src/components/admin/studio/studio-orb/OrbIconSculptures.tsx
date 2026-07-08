/**
 * Orb Icon Sculptures™ — premium 3D acrylic/chrome assets (SVG).
 * Collectible desktop sculptures — never emoji.
 */

import type { ComponentType, ReactNode } from 'react';
import type { StudioOrbIconId } from './studioOrbTypes';

type IconProps = {
  size?: number;
  className?: string;
};

function IconFrame({ size = 28, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function OrbIconAtlas({ size, className }: IconProps) {
  return (
    <IconFrame size={size} className={className}>
      <circle cx="16" cy="16" r="11" stroke="url(#orb-chrome)" strokeWidth="0.8" fill="url(#orb-acrylic)" opacity="0.92" />
      <ellipse cx="16" cy="16" rx="11" ry="4.5" stroke="rgba(201,169,98,0.55)" strokeWidth="0.5" fill="none" />
      <path d="M5 16h22" stroke="rgba(255,248,240,0.35)" strokeWidth="0.4" />
      <circle cx="16" cy="16" r="2.2" fill="url(#orb-warm-glow)" />
      <defs>
        <OrbGradients />
      </defs>
    </IconFrame>
  );
}

export function OrbIconVoice({ size, className }: IconProps) {
  return (
    <IconFrame size={size} className={className}>
      <rect x="13" y="8" width="6" height="12" rx="3" fill="url(#orb-acrylic)" stroke="url(#orb-chrome)" strokeWidth="0.7" />
      <path d="M10 15c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="rgba(201,169,98,0.7)" strokeWidth="0.7" fill="none" />
      <line x1="16" y1="21" x2="16" y2="24" stroke="url(#orb-chrome)" strokeWidth="0.8" />
      <line x1="12" y1="24" x2="20" y2="24" stroke="url(#orb-chrome)" strokeWidth="0.8" />
      <circle cx="16" cy="12" r="1" fill="url(#orb-warm-glow)" />
      <defs>
        <OrbGradients />
      </defs>
    </IconFrame>
  );
}

export function OrbIconDailyBrief({ size, className }: IconProps) {
  return (
    <IconFrame size={size} className={className}>
      <rect x="9" y="7" width="14" height="18" rx="1.5" fill="url(#orb-leather)" stroke="url(#orb-bronze)" strokeWidth="0.8" />
      <rect x="11" y="10" width="10" height="1.2" rx="0.4" fill="url(#orb-warm-glow)" opacity="0.85" />
      <rect x="11" y="13" width="8" height="0.8" rx="0.3" fill="rgba(255,248,240,0.45)" />
      <rect x="11" y="15.5" width="9" height="0.8" rx="0.3" fill="rgba(255,248,240,0.35)" />
      <defs>
        <OrbGradients />
      </defs>
    </IconFrame>
  );
}

export function OrbIconCommandDock({ size, className }: IconProps) {
  return (
    <IconFrame size={size} className={className}>
      <path d="M8 22 L16 8 L24 22 Z" fill="url(#orb-acrylic)" stroke="url(#orb-chrome)" strokeWidth="0.7" opacity="0.9" />
      <path d="M11 20h10" stroke="rgba(201,169,98,0.6)" strokeWidth="0.5" />
      <rect x="14.5" y="14" width="3" height="3" fill="url(#orb-warm-glow)" opacity="0.9" />
      <defs>
        <OrbGradients />
      </defs>
    </IconFrame>
  );
}

export function OrbIconPageGuide({ size, className }: IconProps) {
  return (
    <IconFrame size={size} className={className}>
      <path d="M10 8h8l4 4v14H10V8z" fill="url(#orb-crystal)" stroke="url(#orb-chrome)" strokeWidth="0.7" />
      <path d="M18 8v4h4" stroke="rgba(201,169,98,0.55)" strokeWidth="0.5" fill="none" />
      <line x1="12" y1="16" x2="20" y2="16" stroke="url(#orb-warm-glow)" strokeWidth="0.6" opacity="0.7" />
      <line x1="12" y1="19" x2="18" y2="19" stroke="rgba(255,248,240,0.4)" strokeWidth="0.5" />
      <defs>
        <OrbGradients />
      </defs>
    </IconFrame>
  );
}

export function OrbIconLifeCulture({ size, className }: IconProps) {
  return (
    <IconFrame size={size} className={className}>
      <circle cx="16" cy="16" r="9" stroke="url(#orb-chrome)" strokeWidth="0.6" fill="none" opacity="0.7" />
      <path d="M16 7v18M7 16h18" stroke="rgba(201,169,98,0.45)" strokeWidth="0.4" />
      <circle cx="16" cy="16" r="3.5" fill="url(#orb-acrylic)" stroke="url(#orb-bronze)" strokeWidth="0.6" />
      <circle cx="16" cy="16" r="1.2" fill="url(#orb-warm-glow)" />
      <defs>
        <OrbGradients />
      </defs>
    </IconFrame>
  );
}

export function OrbIconMuseum({ size, className }: IconProps) {
  return (
    <IconFrame size={size} className={className}>
      <rect x="10" y="18" width="12" height="3" fill="url(#orb-bronze)" />
      <rect x="12" y="12" width="8" height="6" fill="url(#orb-leather)" stroke="url(#orb-bronze)" strokeWidth="0.6" />
      <ellipse cx="16" cy="11" rx="5" ry="2" fill="url(#orb-acrylic)" stroke="url(#orb-chrome)" strokeWidth="0.5" />
      <defs>
        <OrbGradients />
      </defs>
    </IconFrame>
  );
}

function OrbGradients() {
  return (
    <>
      <linearGradient id="orb-chrome" x1="0" y1="0" x2="32" y2="32">
        <stop offset="0%" stopColor="rgba(255,252,248,0.95)" />
        <stop offset="50%" stopColor="rgba(201,169,98,0.75)" />
        <stop offset="100%" stopColor="rgba(180,160,140,0.85)" />
      </linearGradient>
      <radialGradient id="orb-acrylic" cx="35%" cy="30%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.92)" />
        <stop offset="55%" stopColor="rgba(255,248,240,0.35)" />
        <stop offset="100%" stopColor="rgba(220,210,200,0.15)" />
      </radialGradient>
      <radialGradient id="orb-warm-glow" cx="50%" cy="50%">
        <stop offset="0%" stopColor="rgba(255,248,235,0.95)" />
        <stop offset="100%" stopColor="rgba(201,169,98,0.45)" />
      </radialGradient>
      <linearGradient id="orb-bronze" x1="0" y1="0" x2="0" y2="32">
        <stop offset="0%" stopColor="rgba(201,169,98,0.9)" />
        <stop offset="100%" stopColor="rgba(140,110,80,0.85)" />
      </linearGradient>
      <linearGradient id="orb-leather" x1="0" y1="0" x2="32" y2="32">
        <stop offset="0%" stopColor="rgba(90,70,55,0.85)" />
        <stop offset="100%" stopColor="rgba(60,45,35,0.9)" />
      </linearGradient>
      <linearGradient id="orb-crystal" x1="0" y1="0" x2="32" y2="32">
        <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
        <stop offset="100%" stopColor="rgba(200,220,240,0.25)" />
      </linearGradient>
    </>
  );
}

const ICON_MAP: Record<StudioOrbIconId, ComponentType<IconProps>> = {
  atlas: OrbIconAtlas,
  voice: OrbIconVoice,
  'daily-brief': OrbIconDailyBrief,
  'command-dock': OrbIconCommandDock,
  'page-guide': OrbIconPageGuide,
  'life-culture': OrbIconLifeCulture,
  museum: OrbIconMuseum,
  marketplace: OrbIconCommandDock,
  knowledge: OrbIconPageGuide,
  innovation: OrbIconLifeCulture,
  disabled: OrbIconLifeCulture,
};

export function OrbIconSculpture({ iconId, size, className }: { iconId: StudioOrbIconId; size?: number; className?: string }) {
  const Component = ICON_MAP[iconId] ?? OrbIconLifeCulture;
  return <Component size={size} className={className} />;
}
