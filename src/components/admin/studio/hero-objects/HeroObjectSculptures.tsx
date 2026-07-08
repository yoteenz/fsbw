/**
 * Hero Objects™ — unique sculptural silhouettes (ARTICLE-D09).
 * Each object has a distinct profile recognizable without labels.
 */

import type { ComponentType } from 'react';
import {
  HeroSculptureCommandDock,
  HeroSculptureDailyBrief,
  HeroSculptureKnowledgeCore,
  HeroSculptureMarketplace,
  HeroSculptureMissionControl,
  HeroSculpturePageGuide,
  HeroSculptureVoice,
  HeroSculptureWorldAtlas,
  type HeroSculptureProps,
} from '../studio-world-hero-icons/StudioWorldHeroIconSculptures';
import { HeroObjectSculptureD09 } from './HeroObjectSculptureD09';

export type { HeroSculptureProps as HeroObjectSculptureProps };

export const HERO_OBJECT_SCULPTURE_MAP: Record<string, ComponentType<HeroSculptureProps>> = {
  'world-atlas-globe': HeroSculptureWorldAtlas,
  'mission-control-console': HeroSculptureMissionControl,
  'daily-brief-lens': HeroSculptureDailyBrief,
  'knowledge-core-crystal': HeroSculptureKnowledgeCore,
  'production-board-slate': (props) => (
    <HeroObjectSculptureD09 variant="production-board-slate" {...props} />
  ),
  'story-table-relic': (props) => <HeroObjectSculptureD09 variant="story-table-relic" {...props} />,
  'mood-wall-prism': (props) => <HeroObjectSculptureD09 variant="mood-wall-prism" {...props} />,
  'studio-foundry-crucible': (props) => (
    <HeroObjectSculptureD09 variant="studio-foundry-crucible" {...props} />
  ),
  'asset-registry-vault': (props) => <HeroObjectSculptureD09 variant="asset-registry-vault" {...props} />,
  'golden-review-marquee': (props) => <HeroObjectSculptureD09 variant="golden-review-marquee" {...props} />,
  'generation-bay-engine': (props) => <HeroObjectSculptureD09 variant="generation-bay-engine" {...props} />,
  'materials-library-tower': (props) => <HeroObjectSculptureD09 variant="materials-library-tower" {...props} />,
  'blueprint-archive-scroll': (props) => (
    <HeroObjectSculptureD09 variant="blueprint-archive-scroll" {...props} />
  ),
  'marketplace-pavilion-arch': HeroSculptureMarketplace,
  'hero-object-vault': (props) => <HeroObjectSculptureD09 variant="hero-object-vault" {...props} />,
  'campaign-studio-beacon': (props) => <HeroObjectSculptureD09 variant="campaign-studio-beacon" {...props} />,
  'launch-theater-marquee': (props) => <HeroObjectSculptureD09 variant="launch-theater-marquee" {...props} />,
  'social-media-lab-signal': (props) => <HeroObjectSculptureD09 variant="social-media-lab-signal" {...props} />,
  'brand-partnerships-handshake': (props) => (
    <HeroObjectSculptureD09 variant="brand-partnerships-handshake" {...props} />
  ),
  'performance-wall-monolith': (props) => (
    <HeroObjectSculptureD09 variant="performance-wall-monolith" {...props} />
  ),
  'page-guide': HeroSculpturePageGuide,
  voice: HeroSculptureVoice,
  'command-dock': HeroSculptureCommandDock,
};

export function HeroObjectSculpture({
  heroObjectId,
  size = 48,
  className,
  selected,
}: {
  heroObjectId: string;
  size?: number;
  className?: string;
  selected?: boolean;
}) {
  const Sculpture = HERO_OBJECT_SCULPTURE_MAP[heroObjectId];
  const uid = `ho-${heroObjectId.replace(/[^a-z0-9]/gi, '-')}`;
  if (!Sculpture) {
    return <HeroObjectSculptureD09 variant="hero-object-vault" size={size} uid={uid} className={className} />;
  }
  return (
    <Sculpture
      size={size}
      uid={uid}
      className={`ho-sculpture${selected ? ' ho-sculpture--selected' : ''}${className ? ` ${className}` : ''}`}
    />
  );
}

/** Acrylic tile fill target — Hero Object occupies ~75–85% of tile. */
export const HERO_OBJECT_ORB_TILE_PX = 64;
export const HERO_OBJECT_ORB_SCULPTURE_PX = 50;
