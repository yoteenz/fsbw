import type { XpsPublishingStatus } from '../types';
import { XPS_PLATFORM_LABELS, type XpsPlatform } from '../constants';
import type { XniNarrativeBlueprint } from '../../narrative-intelligence/types';

/** Distribution Engine™ — platform publishing packages from narrative blueprint */
export function buildPublishingPlan(
  blueprint: XniNarrativeBlueprint,
  primaryPlatform: XpsPlatform
): XpsPublishingStatus[] {
  const fromBlueprint = blueprint.distributionPlan.map((d) => ({
    platform: mapChannelToPlatform(d.channelId),
    label: d.label,
    status: 'planned' as const,
    format: d.format,
  }));

  const primary: XpsPublishingStatus = {
    platform: primaryPlatform,
    label: XPS_PLATFORM_LABELS[primaryPlatform],
    status: 'planned',
    format: formatForPlatform(primaryPlatform),
  };

  const merged = [primary, ...fromBlueprint];
  const seen = new Set<string>();
  return merged.filter((p) => {
    if (seen.has(p.platform)) return false;
    seen.add(p.platform);
    return true;
  });
}

function mapChannelToPlatform(channelId: string): XpsPlatform {
  const map: Record<string, XpsPlatform> = {
    hq: 'headquarters',
    email: 'email',
    social: 'instagram',
    youtube: 'youtube',
    tiktok: 'tiktok',
    podcast: 'podcast',
    newsletter: 'newsletter',
    blog: 'blog',
    course: 'course',
    community: 'community',
  };
  return map[channelId] ?? 'youtube';
}

function formatForPlatform(platform: XpsPlatform): string {
  const formats: Record<XpsPlatform, string> = {
    youtube: 'Long-form or mid-form video',
    tiktok: 'Vertical hook-first cut',
    instagram: 'Reel + carousel',
    podcast: 'Audio episode + show notes',
    newsletter: 'Essay + embed',
    blog: 'SEO article + images',
    course: 'Lesson module + checklist',
    community: 'Discussion post + recap',
    email: 'Campaign sequence',
    headquarters: 'In-app experience',
  };
  return formats[platform];
}

export function markPublishingReady(
  publishing: XpsPublishingStatus[],
  platform: XpsPlatform
): XpsPublishingStatus[] {
  return publishing.map((p) => (p.platform === platform ? { ...p, status: 'ready' } : p));
}
