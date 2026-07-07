/**
 * Distribution bridge — links ndxbook pages to distribution packs for social publishing.
 */

import {
  createDistributionPack,
  validateDistributionPack,
  type DistributionPack,
} from '../../utils/adminStudioDistributionNetworkDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../../utils/adminStudioStorage';
import { getActiveModuleTenantId } from '../organization-context';
import { getDistributionPackDefaults } from '../../utils/adminStudioDistributionNetworkOrgDefaults';
import type { NdxbookPage } from './types';

export const PAGE_001_DISTRIBUTION_PACK_ID = 'dist-ndx-page-001';

function readCustomPacks(): DistributionPack[] {
  return readStudioJson<DistributionPack[]>(ADMIN_STUDIO_STORAGE_KEYS.distributionNetworkCustom) ?? [];
}

function writeCustomPacks(packs: DistributionPack[]): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.distributionNetworkCustom, packs);
}

function readPackPatches(): Record<string, Partial<DistributionPack>> {
  return readStudioJson<Record<string, Partial<DistributionPack>>>(ADMIN_STUDIO_STORAGE_KEYS.distributionNetwork) ?? {};
}

function writePackPatches(store: Record<string, Partial<DistributionPack>>): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.distributionNetwork, store);
}

function defaultPackIds(): Set<string> {
  return new Set(getDistributionPackDefaults(getActiveModuleTenantId()).map((p) => p.id));
}

export function listPageDistributionPacks(): DistributionPack[] {
  const defaults = getDistributionPackDefaults(getActiveModuleTenantId());
  const patches = readPackPatches();
  const custom = readCustomPacks();
  const mergedDefaults = defaults.map((d) => {
    const patch = patches[d.id] ?? {};
    const merged = {
      ...d,
      ...patch,
      routingChannels: patch.routingChannels ?? d.routingChannels,
      channelVersions: patch.channelVersions ?? d.channelVersions,
    };
    return { ...merged, validationPassed: validateDistributionPack(merged) };
  });
  const customOnly = custom.filter((c) => !defaultPackIds().has(c.id));
  return [...mergedDefaults, ...customOnly.map((c) => ({ ...c, validationPassed: validateDistributionPack(c) }))];
}

export function getPageDistributionPack(packId: string): DistributionPack | undefined {
  return listPageDistributionPacks().find((p) => p.id === packId);
}

function upsertPack(pack: DistributionPack): DistributionPack {
  const validated = { ...pack, validationPassed: validateDistributionPack(pack) };

  if (defaultPackIds().has(pack.id)) {
    const patches = readPackPatches();
    patches[pack.id] = { ...(patches[pack.id] ?? {}), ...validated };
    writePackPatches(patches);
    return validated;
  }

  const custom = readCustomPacks();
  const idx = custom.findIndex((p) => p.id === pack.id);
  if (idx >= 0) {
    custom[idx] = validated;
  } else {
    custom.push(validated);
  }
  writeCustomPacks(custom);
  return validated;
}

export function buildPageDistributionPack(page: NdxbookPage): DistributionPack {
  const scheduledDate = new Date().toISOString().slice(0, 10);
  return createDistributionPack({
    id: PAGE_001_DISTRIBUTION_PACK_ID,
    title: `${page.pageLabel.toUpperCase()} — ${page.hook.toUpperCase()}`,
    accentHex: '#6366F1',
    contentPackRef: page.id,
    showName: 'NDXBOOK PAGES',
    campaignName: 'PILOT · FIRST POST',
    approvalStatus: 'ready',
    deliveryStatus: 'queued',
    calendarSlot: 'tue-pm',
    scheduledDate,
    scheduledTime: '6:00 PM ET',
    routingChannels: page.platforms.filter((p) => p === 'instagram'),
    channelVersions: {
      instagram: {
        caption: page.caption || page.hook,
        cta: 'LEARN MORE',
        thumbnail: page.thumbnail || 'v1.0',
        metadata: `${page.pageLabel.toUpperCase()} · NDXBOOK`,
      },
    },
    validationPassed: true,
    validationThumbnail: 'PASS',
    validationCta: 'PASS',
    validationMetadata: 'PASS',
    validationProducts: 'N/A',
    validationMembership: 'N/A',
    validationRewards: 'N/A',
    validationSeo: 'N/A',
    validationTranscript: 'PASS',
    previewInstagram: `CAROUSEL · ${page.pageLabel.toUpperCase()} · EDUCATIONAL`,
  });
}

export function ensurePageDistributionPack(page: NdxbookPage): DistributionPack {
  const existing = getPageDistributionPack(PAGE_001_DISTRIBUTION_PACK_ID);
  if (existing && existing.contentPackRef === page.id) {
    return upsertPack({
      ...existing,
      title: `${page.pageLabel.toUpperCase()} — ${page.hook.toUpperCase()}`,
      channelVersions: {
        ...existing.channelVersions,
        instagram: {
          caption: page.caption || page.hook,
          cta: 'LEARN MORE',
          thumbnail: page.thumbnail || 'v1.0',
          metadata: `${page.pageLabel.toUpperCase()} · NDXBOOK`,
          ...existing.channelVersions?.instagram,
        },
      },
      routingChannels: page.platforms.filter((p) => p === 'instagram'),
      lastUpdated: 'NOW',
    });
  }
  return upsertPack(buildPageDistributionPack(page));
}

export function approvePageDistributionPack(packId: string): void {
  const pack = getPageDistributionPack(packId);
  if (!pack) return;
  upsertPack({ ...pack, approvalStatus: 'approved', lastUpdated: 'NOW' });
}

export function markPageDistributionScheduled(packId: string, scheduledAt: string): void {
  const pack = getPageDistributionPack(packId);
  if (!pack) return;
  const date = scheduledAt.slice(0, 10);
  const time = new Date(scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  upsertPack({
    ...pack,
    approvalStatus: 'scheduled',
    deliveryStatus: 'queued',
    scheduledDate: date,
    scheduledTime: time,
    lastUpdated: 'NOW',
  });
}

export function markPageDistributionPublished(packId: string): void {
  const pack = getPageDistributionPack(packId);
  if (!pack) return;
  upsertPack({
    ...pack,
    approvalStatus: 'published',
    deliveryStatus: 'published',
    analyticsPublished: '1',
    lastUpdated: 'NOW',
  });
}
