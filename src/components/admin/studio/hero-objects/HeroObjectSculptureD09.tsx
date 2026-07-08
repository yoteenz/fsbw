/**
 * D09 Hero Object silhouettes — unique museum-grade optical crystal forms.
 */

import type { ReactNode } from 'react';
import type { HeroSculptureProps } from '../studio-world-hero-icons/StudioWorldHeroIconSculptures';

export type HeroObjectD09Variant =
  | 'production-board-slate'
  | 'story-table-relic'
  | 'mood-wall-prism'
  | 'studio-foundry-crucible'
  | 'asset-registry-vault'
  | 'golden-review-marquee'
  | 'generation-bay-engine'
  | 'materials-library-tower'
  | 'blueprint-archive-scroll'
  | 'hero-object-vault'
  | 'campaign-studio-beacon'
  | 'launch-theater-marquee'
  | 'social-media-lab-signal'
  | 'brand-partnerships-handshake'
  | 'performance-wall-monolith';

type Props = HeroSculptureProps & { variant: HeroObjectD09Variant };

function Frame({ size = 48, className, children }: HeroSculptureProps & { children: ReactNode }) {
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

function Defs({ uid }: { uid: string }) {
  return (
    <defs>
      <linearGradient id={`${uid}-chrome`} x1="4" y1="4" x2="44" y2="44">
        <stop offset="0%" stopColor="#fffaf5" stopOpacity="0.98" />
        <stop offset="40%" stopColor="#e8dcc8" stopOpacity="0.9" />
        <stop offset="60%" stopColor="#c9a962" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#8a7048" stopOpacity="0.92" />
      </linearGradient>
      <radialGradient id={`${uid}-crystal`} cx="32%" cy="26%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
        <stop offset="50%" stopColor="#fff8f0" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#c8b8a8" stopOpacity="0.1" />
      </radialGradient>
      <radialGradient id={`${uid}-glow`} cx="50%" cy="50%">
        <stop offset="0%" stopColor="#fff8eb" stopOpacity="1" />
        <stop offset="55%" stopColor="#c9a962" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#c9a962" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
        <stop offset="50%" stopColor="#e8f0ff" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#fff0e0" stopOpacity="0.4" />
      </linearGradient>
      <linearGradient id={`${uid}-holo`} x1="0" y1="0" x2="48" y2="0">
        <stop offset="0%" stopColor="#c9a962" stopOpacity="0" />
        <stop offset="50%" stopColor="#c9a962" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#88c8ff" stopOpacity="0.7" />
      </linearGradient>
      <filter id={`${uid}-depth`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.8" stdDeviation="1.4" floodColor="#000" floodOpacity="0.32" />
      </filter>
      <filter id={`${uid}-soft-glow`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function Silhouette({ uid, variant }: { uid: string; variant: HeroObjectD09Variant }) {
  switch (variant) {
    case 'production-board-slate':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <path d="M10 14 L38 12 L36 36 L8 34 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.7" />
          <path d="M10 14 L38 12" stroke="#c9a962" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="10" cy="14" r="1.4" fill={`url(#${uid}-chrome)`} />
          <circle cx="38" cy="12" r="1.4" fill={`url(#${uid}-chrome)`} />
          <rect x="14" y="18" width="18" height="1" rx="0.3" fill={`url(#${uid}-holo)`} opacity="0.7" />
          <rect x="14" y="22" width="14" height="0.7" rx="0.25" fill="#fff" opacity="0.4" />
          <rect x="14" y="25" width="16" height="0.7" rx="0.25" fill="#88c8ff" opacity="0.35" />
          <rect x="14" y="28" width="12" height="0.7" rx="0.25" fill="#c9a962" opacity="0.4" />
          <circle cx="30" cy="30" r="2" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
        </g>
      );
    case 'story-table-relic':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <ellipse cx="24" cy="34" rx="16" ry="3" fill="#000" opacity="0.12" />
          <path d="M6 28 L42 28 L40 32 L8 32 Z" fill="#8a7048" opacity="0.55" />
          <rect x="8" y="18" width="32" height="10" rx="1.2" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
          <circle cx="10" cy="20" r="1.5" fill={`url(#${uid}-glow)`} filter={`url(#${uid}-soft-glow)`} />
          <circle cx="38" cy="20" r="1.5" fill={`url(#${uid}-glow)`} filter={`url(#${uid}-soft-glow)`} />
          <rect x="14" y="21" width="20" height="1" rx="0.3" fill={`url(#${uid}-holo)`} opacity="0.65" />
          <rect x="16" y="24" width="14" height="0.6" rx="0.2" fill="#fff" opacity="0.35" />
        </g>
      );
    case 'mood-wall-prism':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <rect x="14" y="8" width="20" height="32" rx="2" fill={`url(#${uid}-glass)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
          <path d="M16 12 L32 12 L30 36 L18 36 Z" fill="#000" opacity="0.06" />
          <rect x="17" y="14" width="5" height="8" rx="0.8" fill="#c9a962" opacity="0.45" className="sw-hero-icon__core-light" />
          <rect x="23" y="16" width="5" height="8" rx="0.8" fill="#88c8ff" opacity="0.4" />
          <rect x="20" y="26" width="5" height="8" rx="0.8" fill="#fff" opacity="0.35" />
          <line x1="14" y1="8" x2="34" y2="8" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
        </g>
      );
    case 'studio-foundry-crucible':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <ellipse cx="24" cy="36" rx="10" ry="2.5" fill="#000" opacity="0.14" />
          <path d="M14 22 Q24 14 34 22 L32 34 Q24 38 16 34 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.7" />
          <ellipse cx="24" cy="22" rx="8" ry="2" stroke="#c9a962" strokeWidth="0.5" opacity="0.55" />
          <circle cx="24" cy="26" r="4" fill={`url(#${uid}-glow)`} filter={`url(#${uid}-soft-glow)`} className="sw-hero-icon__core-light" />
          <path d="M20 30 Q24 34 28 30" stroke="#ff8844" strokeWidth="0.6" opacity="0.55" fill="none" />
        </g>
      );
    case 'asset-registry-vault':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <circle cx="24" cy="24" r="15" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.75" />
          <circle cx="24" cy="24" r="11" stroke="#c9a962" strokeWidth="0.55" opacity="0.45" fill="none" />
          <rect x="21" y="18" width="6" height="12" rx="1" fill={`url(#${uid}-glass)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.5" />
          <circle cx="24" cy="24" r="1.8" fill={`url(#${uid}-glow)`} />
          <circle cx="32" cy="20" r="1.2" fill="#c9a962" opacity="0.7" />
          <circle cx="16" cy="28" r="1.2" fill="#88c8ff" opacity="0.6" />
        </g>
      );
    case 'golden-review-marquee':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <path d="M8 20 L40 20 L38 32 L10 32 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
          <rect x="10" y="14" width="28" height="6" rx="1" fill={`url(#${uid}-glass)`} stroke="#c9a962" strokeWidth="0.45" />
          <circle cx="14" cy="17" r="1" fill={`url(#${uid}-glow)`} />
          <circle cx="24" cy="17" r="1" fill={`url(#${uid}-glow)`} />
          <circle cx="34" cy="17" r="1" fill={`url(#${uid}-glow)`} />
          <rect x="14" y="23" width="20" height="1" rx="0.3" fill={`url(#${uid}-holo)`} opacity="0.75" />
          <rect x="16" y="27" width="14" height="0.6" rx="0.2" fill="#fff" opacity="0.35" />
        </g>
      );
    case 'generation-bay-engine':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <rect x="10" y="14" width="28" height="22" rx="2" fill={`url(#${uid}-glass)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
          <circle cx="24" cy="25" r="8" stroke="#c9a962" strokeWidth="0.55" fill="none" opacity="0.5" className="sw-hero-icon__orbit" />
          <circle cx="24" cy="25" r="4" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.5" />
          <path d="M24 21 L24 29 M20 25 L28 25" stroke="#fff" strokeWidth="0.45" opacity="0.45" />
          <circle cx="24" cy="25" r="1.5" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
          <rect x="14" y="16" width="4" height="2" rx="0.4" fill="#ff8844" opacity="0.45" />
          <rect x="30" y="16" width="4" height="2" rx="0.4" fill="#88c8ff" opacity="0.4" />
        </g>
      );
    case 'materials-library-tower':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <rect x="18" y="10" width="12" height="28" rx="1.5" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
          <rect x="20" y="13" width="8" height="4" rx="0.5" fill={`url(#${uid}-glass)`} opacity="0.8" />
          <rect x="20" y="19" width="8" height="4" rx="0.5" fill="#c9a962" opacity="0.25" />
          <rect x="20" y="25" width="8" height="4" rx="0.5" fill="#88c8ff" opacity="0.22" />
          <rect x="20" y="31" width="8" height="4" rx="0.5" fill="#fff" opacity="0.2" />
          <line x1="18" y1="10" x2="30" y2="10" stroke="#fff" strokeWidth="0.45" opacity="0.55" />
        </g>
      );
    case 'blueprint-archive-scroll':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <ellipse cx="14" cy="24" rx="4" ry="10" fill={`url(#${uid}-chrome)`} opacity="0.75" />
          <ellipse cx="34" cy="24" rx="4" ry="10" fill={`url(#${uid}-chrome)`} opacity="0.75" />
          <rect x="14" y="14" width="20" height="20" rx="1" fill={`url(#${uid}-glass)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.55" />
          <line x1="17" y1="18" x2="31" y2="18" stroke="#88c8ff" strokeWidth="0.4" opacity="0.5" />
          <line x1="17" y1="22" x2="31" y2="22" stroke="#c9a962" strokeWidth="0.35" opacity="0.45" />
          <line x1="17" y1="26" x2="28" y2="26" stroke="#fff" strokeWidth="0.35" opacity="0.35" />
          <line x1="17" y1="30" x2="31" y2="30" stroke="#88c8ff" strokeWidth="0.35" opacity="0.4" />
        </g>
      );
    case 'hero-object-vault':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <path d="M12 16 L36 16 L34 36 L14 36 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.7" />
          <path d="M18 16 L18 10 L30 10 L30 16" stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" fill="none" />
          <rect x="20" y="22" width="8" height="10" rx="1" fill={`url(#${uid}-glass)`} stroke="#c9a962" strokeWidth="0.45" />
          <circle cx="24" cy="27" r="1.5" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
          <path d="M14 20 H34" stroke={`url(#${uid}-holo)`} strokeWidth="0.5" opacity="0.55" />
        </g>
      );
    case 'campaign-studio-beacon':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <path d="M24 8 L28 20 L24 18 L20 20 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
          <rect x="20" y="20" width="8" height="14" rx="1" fill={`url(#${uid}-glass)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.55" />
          <circle cx="24" cy="26" r="2.5" fill={`url(#${uid}-glow)`} filter={`url(#${uid}-soft-glow)`} className="sw-hero-icon__core-light" />
          <path d="M16 24 Q12 26 16 28" stroke={`url(#${uid}-holo)`} strokeWidth="0.5" fill="none" opacity="0.55" className="sw-hero-icon__wave" />
          <path d="M32 24 Q36 26 32 28" stroke={`url(#${uid}-holo)`} strokeWidth="0.5" fill="none" opacity="0.55" className="sw-hero-icon__wave sw-hero-icon__wave--alt" />
        </g>
      );
    case 'launch-theater-marquee':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <path d="M6 22 L42 22 L40 34 L8 34 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
          <path d="M8 22 Q24 12 40 22" stroke="#c9a962" strokeWidth="0.55" fill="none" opacity="0.55" />
          <rect x="12" y="24" width="24" height="8" rx="0.8" fill="#000" opacity="0.08" />
          <circle cx="16" cy="28" r="1" fill={`url(#${uid}-glow)`} />
          <circle cx="24" cy="28" r="1.2" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
          <circle cx="32" cy="28" r="1" fill={`url(#${uid}-glow)`} />
        </g>
      );
    case 'social-media-lab-signal':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <rect x="20" y="28" width="8" height="10" rx="1" fill={`url(#${uid}-chrome)`} opacity="0.85" />
          <line x1="24" y1="28" x2="24" y2="14" stroke={`url(#${uid}-chrome)`} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="24" cy="12" r="3" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.55" />
          <circle cx="24" cy="12" r="1.2" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
          <path d="M12 18 Q8 24 12 30" stroke={`url(#${uid}-holo)`} strokeWidth="0.55" fill="none" opacity="0.5" className="sw-hero-icon__wave" />
          <path d="M36 18 Q40 24 36 30" stroke={`url(#${uid}-holo)`} strokeWidth="0.55" fill="none" opacity="0.5" className="sw-hero-icon__wave sw-hero-icon__wave--alt" />
        </g>
      );
    case 'brand-partnerships-handshake':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <path d="M14 26 C16 22 20 20 24 22 C28 20 32 22 34 26 L32 30 C30 28 26 27 24 28 C22 27 18 28 16 30 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" />
          <path d="M12 24 L16 20 M36 24 L32 20" stroke={`url(#${uid}-chrome)`} strokeWidth="0.65" strokeLinecap="round" />
          <circle cx="24" cy="25" r="2" fill={`url(#${uid}-glow)`} filter={`url(#${uid}-soft-glow)`} className="sw-hero-icon__core-light" />
          <path d="M18 26 L30 26" stroke={`url(#${uid}-holo)`} strokeWidth="0.45" opacity="0.55" />
        </g>
      );
    case 'performance-wall-monolith':
      return (
        <g filter={`url(#${uid}-depth)`}>
          <path d="M14 10 L34 10 L32 38 L16 38 Z" fill={`url(#${uid}-crystal)`} stroke={`url(#${uid}-chrome)`} strokeWidth="0.7" />
          <path d="M16 14 L30 14 L29 34 L17 34 Z" fill="#000" opacity="0.06" />
          <path d="M17 30 Q24 26 31 30" stroke={`url(#${uid}-holo)`} strokeWidth="0.65" fill="none" opacity="0.7" className="sw-hero-icon__wave" />
          <path d="M17 24 Q24 20 31 24" stroke="#c9a962" strokeWidth="0.45" fill="none" opacity="0.45" />
          <rect x="20" y="16" width="8" height="1" rx="0.3" fill="#fff" opacity="0.45" />
          <circle cx="24" cy="32" r="1.5" fill={`url(#${uid}-glow)`} className="sw-hero-icon__core-light" />
        </g>
      );
    default:
      return null;
  }
}

export function HeroObjectSculptureD09({ variant, size, uid, className }: Props) {
  return (
    <Frame size={size} uid={uid} className={className}>
      <Defs uid={uid} />
      <Silhouette uid={uid} variant={variant} />
    </Frame>
  );
}
