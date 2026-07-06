import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createBlankDistributionPack,
  validateDistributionPack,
  type DistributionApprovalStatus,
  type DistributionCalendarSlotId,
  type DistributionChannel,
  type DistributionChannelFieldKey,
  type DistributionChannelId,
  type DistributionDeliveryStatus,
  type DistributionPack,
  type DistributionPackFieldKey,
} from '../utils/adminStudioDistributionNetworkDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import { getActiveModuleTenantId } from '../studio-os-core/organization-context';
import { STUDIO_OS_ORGANIZATION_BOUNDARY_CHANGED } from '../studio-os-core/organization-context';
import {
  getDistributionChannelDefaults,
  getDistributionPackDefaults,
} from '../utils/adminStudioDistributionNetworkOrgDefaults';

type PackPatch = Partial<DistributionPack>;
type PackPatchStore = Record<string, PackPatch>;
type ChannelPatchStore = Record<string, Partial<DistributionChannel>>;

function defaultPackIds(): Set<string> {
  return new Set(getDistributionPackDefaults(getActiveModuleTenantId()).map((p) => p.id));
}

function defaultChannelIds(): Set<string> {
  return new Set(getDistributionChannelDefaults(getActiveModuleTenantId()).map((c) => c.id));
}

function readPackPatches(): PackPatchStore {
  return readStudioJson<PackPatchStore>(ADMIN_STUDIO_STORAGE_KEYS.distributionNetwork) ?? {};
}

function readCustomPacks(): DistributionPack[] {
  return readStudioJson<DistributionPack[]>(ADMIN_STUDIO_STORAGE_KEYS.distributionNetworkCustom) ?? [];
}

function readChannelPatches(): ChannelPatchStore {
  return readStudioJson<ChannelPatchStore>(ADMIN_STUDIO_STORAGE_KEYS.distributionNetworkChannels) ?? {};
}

function writePackPatches(store: PackPatchStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.distributionNetwork, store);
}

function writeCustomPacks(packs: DistributionPack[]): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.distributionNetworkCustom, packs);
}

function writeChannelPatches(store: ChannelPatchStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.distributionNetworkChannels, store);
}

function mergePackDefaults(patches: PackPatchStore): DistributionPack[] {
  const defaults = getDistributionPackDefaults(getActiveModuleTenantId());
  return defaults.map((d) => {
    const patch = patches[d.id] ?? {};
    const merged = { ...d, ...patch, routingChannels: patch.routingChannels ?? d.routingChannels, channelVersions: patch.channelVersions ?? d.channelVersions };
    return { ...merged, validationPassed: validateDistributionPack(merged) };
  });
}

function mergeChannels(patches: ChannelPatchStore): DistributionChannel[] {
  return getDistributionChannelDefaults(getActiveModuleTenantId()).map((d) => ({ ...d, ...(patches[d.id] ?? {}) }));
}

export function listDistributionPacks(): DistributionPack[] {
  const patches = readPackPatches();
  const custom = readCustomPacks();
  const merged = mergePackDefaults(patches);
  const customOnly = custom.filter((c) => !defaultPackIds().has(c.id));
  return [...merged, ...customOnly.map((c) => ({ ...c, validationPassed: validateDistributionPack(c) }))];
}

export function listDistributionChannels(): DistributionChannel[] {
  return mergeChannels(readChannelPatches());
}

export function getDistributionPackById(packId: string): DistributionPack | undefined {
  return listDistributionPacks().find((p) => p.id === packId);
}

export function getDistributionChannelById(channelId: string): DistributionChannel | undefined {
  return listDistributionChannels().find((c) => c.id === channelId);
}

export function exportDistributionNetworkSnapshot() {
  return {
    packs: listDistributionPacks(),
    channels: listDistributionChannels(),
    source: 'distribution-network-local' as const,
  };
}

function patchPack(packId: string, patch: PackPatch): void {
  if (defaultPackIds().has(packId)) {
    const store = readPackPatches();
    store[packId] = { ...(store[packId] ?? {}), ...patch };
    writePackPatches(store);
    return;
  }
  const custom = readCustomPacks();
  const idx = custom.findIndex((p) => p.id === packId);
  if (idx >= 0) {
    custom[idx] = { ...custom[idx], ...patch };
    writeCustomPacks(custom);
  }
}

function patchChannel(channelId: string, patch: Partial<DistributionChannel>): void {
  const store = readChannelPatches();
  store[channelId] = { ...(store[channelId] ?? {}), ...patch };
  writeChannelPatches(store);
}

export function useAdminStudioDistributionNetwork(packId?: string, channelId?: string) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const onOrgChanged = () => setVersion((v) => v + 1);
    window.addEventListener(STUDIO_OS_ORGANIZATION_BOUNDARY_CHANGED, onOrgChanged);
    window.addEventListener('studio-os-workspace-changed', onOrgChanged);
    return () => {
      window.removeEventListener(STUDIO_OS_ORGANIZATION_BOUNDARY_CHANGED, onOrgChanged);
      window.removeEventListener('studio-os-workspace-changed', onOrgChanged);
    };
  }, []);

  const packs = useMemo(() => {
    void version;
    return listDistributionPacks();
  }, [version]);

  const channels = useMemo(() => {
    void version;
    return listDistributionChannels();
  }, [version]);

  const selectedPack = useMemo(() => {
    if (!packId) return undefined;
    return packs.find((p) => p.id === packId);
  }, [packs, packId]);

  const selectedChannel = useMemo(() => {
    if (!channelId) return undefined;
    return channels.find((c) => c.id === channelId);
  }, [channels, channelId]);

  const packsBySlot = useMemo(() => {
    const map: Record<string, DistributionPack[]> = {};
    packs.forEach((p) => {
      if (!map[p.calendarSlot]) map[p.calendarSlot] = [];
      map[p.calendarSlot].push(p);
    });
    return map;
  }, [packs]);

  const updatePackField = useCallback(
    (id: string, key: DistributionPackFieldKey, value: string) => {
      patchPack(id, { [key]: value, lastUpdated: 'NOW' });
      bump();
    },
    [bump]
  );

  const updateChannelField = useCallback(
    (id: string, key: DistributionChannelFieldKey, value: string) => {
      if (!defaultChannelIds().has(id as DistributionChannelId)) return;
      patchChannel(id, { [key]: value });
      bump();
    },
    [bump]
  );

  const setApprovalStatus = useCallback(
    (id: string, status: DistributionApprovalStatus) => {
      patchPack(id, { approvalStatus: status, lastUpdated: 'NOW' });
      bump();
    },
    [bump]
  );

  const setDeliveryStatus = useCallback(
    (id: string, status: DistributionDeliveryStatus) => {
      patchPack(id, { deliveryStatus: status, lastUpdated: 'NOW' });
      bump();
    },
    [bump]
  );

  const toggleRoutingChannel = useCallback(
    (id: string, channel: DistributionChannelId) => {
      const pack = getDistributionPackById(id);
      if (!pack) return;
      const has = pack.routingChannels.includes(channel);
      const routingChannels = has
        ? pack.routingChannels.filter((c) => c !== channel)
        : [...pack.routingChannels, channel];
      patchPack(id, { routingChannels, lastUpdated: 'NOW' });
      bump();
    },
    [bump]
  );

  const moveToSlot = useCallback(
    (id: string, slot: DistributionCalendarSlotId) => {
      patchPack(id, { calendarSlot: slot, approvalStatus: 'scheduled', lastUpdated: 'NOW' });
      bump();
    },
    [bump]
  );

  const updateChannelVersion = useCallback(
    (packId: string, channel: DistributionChannelId, field: 'caption' | 'cta' | 'thumbnail' | 'metadata', value: string) => {
      const pack = getDistributionPackById(packId);
      if (!pack) return;
      const channelVersions = { ...pack.channelVersions };
      channelVersions[channel] = {
        caption: '',
        cta: '',
        thumbnail: '',
        metadata: '',
        ...channelVersions[channel],
        [field]: value,
      };
      patchPack(packId, { channelVersions, lastUpdated: 'NOW' });
      bump();
    },
    [bump]
  );

  const addPack = useCallback(
    (title: string) => {
      const pack = createBlankDistributionPack(title);
      writeCustomPacks([...readCustomPacks(), pack]);
      bump();
      return pack.id;
    },
    [bump]
  );

  const [draggedPackId, setDraggedPackId] = useState<string | null>(null);

  return {
    packs,
    channels,
    selectedPack,
    selectedChannel,
    packsBySlot,
    updatePackField,
    updateChannelField,
    setApprovalStatus,
    setDeliveryStatus,
    toggleRoutingChannel,
    moveToSlot,
    updateChannelVersion,
    addPack,
    draggedPackId,
    setDraggedPackId,
  };
}
