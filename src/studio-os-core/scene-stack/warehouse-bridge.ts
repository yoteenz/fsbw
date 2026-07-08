/**
 * Studio Warehouse™ → Scene Stack™ bridge.
 * Mounts persisted registry / warehouse assets instead of re-running FAL on refresh.
 */

import type { WarehouseAsset } from '../studio-warehouse/types';
import type { StudioAssetRegistryEntry } from '../studio-builder/types';
import {
  getRegistryAsset,
  listRegistryAssets,
} from '../studio-builder/registry-store';
import { getSceneStackStation } from './station-manifest';
import { getSceneStackLayerRecord, saveSceneStackLayerRecord } from './store';
import { SCENE_STACK_LAYER_ORDER, SCENE_STACK_PROMPT_VERSION, type SceneStackLayerId, type SceneStackLayerRecord } from './types';

export const SCENE_STACK_HYDRATED_EVENT = 'studio-os-scene-stack-hydrated';

const LAYER_IDS_LONGEST_FIRST = [...SCENE_STACK_LAYER_ORDER].sort((a, b) => b.length - a.length);

const CDS_DEPARTMENT_ID = 'creative-direction';

export function dispatchSceneStackHydrated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SCENE_STACK_HYDRATED_EVENT));
}

/** Parse legacy registry assetIds: scene-stack-{stationId}-{layerId}-v{N} */
export function parseSceneStackRegistryAssetId(
  assetId: string
): { stationId: string; layerId: SceneStackLayerId } | null {
  const prefix = 'scene-stack-';
  if (!assetId.startsWith(prefix)) return null;
  const rest = assetId.slice(prefix.length).replace(/-v\d+$/, '');
  for (const layerId of LAYER_IDS_LONGEST_FIRST) {
    const suffix = `-${layerId}`;
    if (rest.endsWith(suffix)) {
      const stationId = rest.slice(0, -suffix.length);
      if (stationId) return { stationId, layerId };
    }
  }
  return null;
}

export function warehouseSlotRoleToLayerId(slotRole: string): SceneStackLayerId | null {
  const role = slotRole.toLowerCase();
  if (role.includes('environment')) return 'environment-shell';
  if (role.includes('light')) return 'lighting-systems';
  if (role.includes('furniture')) return 'furniture-objects';
  if (role.includes('material')) return 'surface-materials';
  if (role.includes('atmosphere') || role.includes('particle')) return 'atmospheric-systems';
  if (role.includes('hero') || role.includes('landmark')) return 'signature-landmark';
  if (role.includes('runtime')) return 'runtime-effects';
  if (role.includes('motion') || role.includes('ambient')) return 'ambient-motion';
  return null;
}

export function warehouseCategoryToLayerId(category: WarehouseAsset['category']): SceneStackLayerId | null {
  switch (category) {
    case 'environment-shell':
    case 'architecture':
      return 'environment-shell';
    case 'lighting-pack':
      return 'lighting-systems';
    case 'furniture':
      return 'furniture-objects';
    case 'materials':
      return 'surface-materials';
    case 'atmosphere':
    case 'particles':
      return 'atmospheric-systems';
    case 'hero-object':
      return 'signature-landmark';
    case 'animation':
      return 'ambient-motion';
    case 'runtime-fx':
      return 'runtime-effects';
    default:
      return null;
  }
}

function resolveRegistryStationAndLayer(
  entry: StudioAssetRegistryEntry
): { stationId: string; layerId: SceneStackLayerId } | null {
  if (entry.stationId && entry.layerId) {
    const layerId = entry.layerId as SceneStackLayerId;
    if (SCENE_STACK_LAYER_ORDER.includes(layerId)) {
      return { stationId: entry.stationId, layerId };
    }
  }
  const fromAssetId = parseSceneStackRegistryAssetId(entry.assetId);
  if (fromAssetId) return fromAssetId;
  const groupPrefix = 'scene-stack-';
  if (entry.productionGroupId.startsWith(groupPrefix)) {
    const rest = entry.productionGroupId.slice(groupPrefix.length);
    for (const layerId of LAYER_IDS_LONGEST_FIRST) {
      const suffix = `-${layerId}`;
      if (rest.endsWith(suffix)) {
        const stationId = rest.slice(0, -suffix.length);
        if (stationId) return { stationId, layerId };
      }
    }
  }
  return null;
}

function stationExists(departmentId: string, stationId: string): boolean {
  return Boolean(getSceneStackStation(departmentId, stationId));
}

function mountLayerRecord(input: {
  departmentId: string;
  projectId: string;
  stationId: string;
  layerId: SceneStackLayerId;
  publicUrl: string;
  storagePath?: string;
  model?: string;
  productionGroupId: string;
  heroAssetId: string;
  source: 'registry' | 'warehouse';
}): SceneStackLayerRecord | null {
  if (!stationExists(input.departmentId, input.stationId)) return null;

  const station = getSceneStackStation(input.departmentId, input.stationId);
  const layerPrompt = station?.layerPrompts[input.layerId];
  const existing = getSceneStackLayerRecord(
    input.departmentId,
    input.projectId,
    input.stationId,
    input.layerId
  );
  if (existing?.publicUrl) return existing;

  const now = new Date().toISOString();
  const record = saveSceneStackLayerRecord({
    departmentId: input.departmentId,
    projectId: input.projectId,
    stationId: input.stationId,
    layerId: input.layerId,
    version: (existing?.version ?? 0) + 1,
    status: 'approved',
    publicUrl: input.publicUrl,
    storagePath: input.storagePath,
    model: input.model,
    generatedAt: now,
    approvedAt: now,
    promptVersion: SCENE_STACK_PROMPT_VERSION,
    productionGroupId: layerPrompt?.productionGroupId ?? input.productionGroupId,
    heroAssetId: layerPrompt?.heroAssetId ?? input.heroAssetId,
  });

  void input.source;
  return record;
}

function bestRegistryEntryForLayer(
  departmentId: string,
  projectId: string,
  stationId: string,
  layerId: SceneStackLayerId
): StudioAssetRegistryEntry | null {
  const matches = listRegistryAssets(departmentId, projectId).filter((entry) => {
    if (!entry.publicUrl?.startsWith('http')) return false;
    const resolved = resolveRegistryStationAndLayer(entry);
    return resolved?.stationId === stationId && resolved.layerId === layerId;
  });
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))[0] ?? null;
}

/** Restore Scene Stack layers from persisted Studio Builder registry (Warehouse source of truth). */
export function hydrateSceneStackFromBuilderRegistry(
  departmentId: string,
  projectId: string
): number {
  let mounted = 0;
  for (const entry of listRegistryAssets(departmentId, projectId)) {
    if (!entry.publicUrl?.startsWith('http')) continue;
    const resolved = resolveRegistryStationAndLayer(entry);
    if (!resolved) continue;
    const { stationId, layerId } = resolved;
    const before = getSceneStackLayerRecord(departmentId, projectId, stationId, layerId);
    const record = mountLayerRecord({
      departmentId,
      projectId,
      stationId,
      layerId,
      publicUrl: entry.publicUrl,
      storagePath: entry.storagePath,
      model: entry.model,
      productionGroupId: entry.productionGroupId,
      heroAssetId: entry.assetId,
      source: 'registry',
    });
    if (record && !before?.publicUrl) mounted += 1;
  }
  if (mounted > 0) dispatchSceneStackHydrated();
  return mounted;
}

/** Mount a warehouse asset onto a Scene Stack layer (no FAL). */
export function applyWarehouseAssetToSceneStack(input: {
  departmentId: string;
  projectId: string;
  stationId: string;
  layerId: SceneStackLayerId;
  asset: Pick<WarehouseAsset, 'previewUrl' | 'name' | 'id'>;
}): { ok: boolean; reason?: string } {
  const publicUrl = input.asset.previewUrl?.trim();
  if (!publicUrl?.startsWith('http')) {
    return { ok: false, reason: 'Asset has no stored preview URL — generate or pick a pipeline-registered object.' };
  }

  const record = mountLayerRecord({
    departmentId: input.departmentId,
    projectId: input.projectId,
    stationId: input.stationId,
    layerId: input.layerId,
    publicUrl,
    productionGroupId: `scene-stack-${input.stationId}-${input.layerId}`,
    heroAssetId: input.asset.id,
    source: 'warehouse',
  });

  if (!record) return { ok: false, reason: 'Unknown workspace station for this department.' };
  dispatchSceneStackHydrated();
  return { ok: true };
}

/** Apply warehouse asset using its category + first compatible scene pack. */
export function applyWarehouseAssetByCategory(input: {
  departmentId: string;
  projectId: string;
  asset: WarehouseAsset;
}): { ok: boolean; reason?: string; stationId?: string; layerId?: SceneStackLayerId } {
  const layerId = warehouseCategoryToLayerId(input.asset.category);
  if (!layerId) return { ok: false, reason: 'This asset category cannot map to a Scene Stack layer.' };

  const stationId =
    input.asset.compatibleScenePackIds.find((id) => stationExists(input.departmentId, id)) ??
    (input.departmentId === CDS_DEPARTMENT_ID ? 'story-table' : null);
  if (!stationId) return { ok: false, reason: 'No compatible workspace station for this asset.' };

  const result = applyWarehouseAssetToSceneStack({
    departmentId: input.departmentId,
    projectId: input.projectId,
    stationId,
    layerId,
    asset: input.asset,
  });
  return { ...result, stationId, layerId };
}

/** Before FAL: mount from registry if Scene Stack layer is empty but Warehouse has the asset. */
export function tryMountSceneStackLayerFromRegistry(
  departmentId: string,
  projectId: string,
  stationId: string,
  layerId: SceneStackLayerId
): boolean {
  const existing = getSceneStackLayerRecord(departmentId, projectId, stationId, layerId);
  if (existing?.publicUrl) return true;

  const entry = bestRegistryEntryForLayer(departmentId, projectId, stationId, layerId);
  if (!entry?.publicUrl) return false;

  const record = mountLayerRecord({
    departmentId,
    projectId,
    stationId,
    layerId,
    publicUrl: entry.publicUrl,
    storagePath: entry.storagePath,
    model: entry.model,
    productionGroupId: entry.productionGroupId,
    heroAssetId: entry.assetId,
    source: 'registry',
  });
  if (record) dispatchSceneStackHydrated();
  return Boolean(record);
}

export function getRegistryAssetForSceneLayer(
  departmentId: string,
  projectId: string,
  stationId: string,
  layerId: SceneStackLayerId
): StudioAssetRegistryEntry | null {
  return bestRegistryEntryForLayer(departmentId, projectId, stationId, layerId) ?? getRegistryAsset(
    departmentId,
    projectId,
    `scene-stack-${stationId}-${layerId}-v1`
  );
}
