/**
 * Production Builder — automatic prompt assembly from approved assets.
 */

import type { ContentPackAssetSelection } from './adminStudioAssetDirectorDemo';
import {
  ASSET_DIRECTOR_AUDIO,
  ASSET_DIRECTOR_BRAND_MATERIALS,
  assemblePromptFromAssets,
} from './adminStudioAssetDirectorDemo';
import type { ProductionDraft, ProductionScene, ProductionSceneAssetSelection } from './adminStudioProductionBuilderDemo';
import { findProductionAsset } from './adminStudioProductionBuilderDemo';

function brandPrompt(ids: string[] | undefined): string[] {
  if (!ids?.length) return [];
  return ids
    .map((id) => {
      const b = ASSET_DIRECTOR_BRAND_MATERIALS.find((a) => a.id === id);
      return b ? `BRAND ELEMENT: ${b.name} — ${b.promptNotes ?? b.category}` : null;
    })
    .filter((x): x is string => Boolean(x));
}

function graphicsPrompt(graphicsId: string | undefined): string[] {
  if (!graphicsId) return [];
  const g = ASSET_DIRECTOR_BRAND_MATERIALS.find((a) => a.id === graphicsId);
  return g ? [`GRAPHICS: ${g.name} — ${g.promptNotes ?? 'EDITORIAL OVERLAY'}`] : [];
}

function voicePrompt(voiceId: string | undefined): string[] {
  if (!voiceId) return [];
  const v = ASSET_DIRECTOR_AUDIO.find((a) => a.id === voiceId);
  return v ? [`VOICE: ${v.name} — ${v.promptNotes ?? 'LUXURY NARRATION'}`] : [];
}

/** Extended assembly for a single scene (includes brand, graphics, voice). */
export function assembleScenePrompt(
  selection: ProductionSceneAssetSelection,
  meta?: { sceneName?: string; cta?: string; brand?: string; audience?: string }
): string {
  const baseSelection: ContentPackAssetSelection = { ...selection };
  const parts: string[] = [];

  if (meta?.sceneName) parts.push(`SCENE: ${meta.sceneName}`);
  parts.push(assemblePromptFromAssets(baseSelection).replace('APPROVED VISUAL ASSET PROMPT ASSEMBLY — DEMO ONLY\n', '').trim());

  parts.push(...brandPrompt(selection.brandElementIds));
  parts.push(...graphicsPrompt(selection.graphicsId));
  parts.push(...voicePrompt(selection.voiceId));

  if (meta?.brand) parts.push(`BRAND LANGUAGE: ${meta.brand} — WHITE MARBLE · LUXURY EDITORIAL · #EB1C24 ACCENT`);
  if (meta?.audience) parts.push(`TARGET AUDIENCE: ${meta.audience}`);
  if (meta?.cta) parts.push(`CTA: ${meta.cta}`);

  if (selection.moodboardId) {
    const mb = findProductionAsset(selection.moodboardId);
    if (mb) parts.push(`MOODBOARD: ${mb.name} — VISUAL DIRECTION REFERENCE`);
  }

  parts.push('DEMO ONLY — AI GENERATION NOT CONNECTED');
  return parts.filter(Boolean).join('\n');
}

/** Full production prompt across all scenes and outputs. */
export function assembleProductionPrompt(draft: ProductionDraft): string {
  const header = [
    `PRODUCTION: ${draft.productionName}`,
    `WORKSPACE: ${draft.workspace} · PROJECT: ${draft.project}`,
    `SHOW: ${draft.show} · EPISODE: ${draft.episode}`,
    draft.contentPackId ? `CONTENT PACK: ${draft.contentPackId}` : null,
    `OUTPUTS: ${draft.outputTypes.join(' · ').toUpperCase()}`,
  ].filter(Boolean);

  const sceneBlocks = [...draft.scenes]
    .sort((a, b) => a.order - b.order)
    .map((scene, idx) => {
      const block = assembleScenePrompt(scene.selection, {
        sceneName: scene.name,
        cta: draft.cta,
        brand: draft.brand,
        audience: draft.targetAudience,
      });
      return `--- SCENE ${idx + 1} ---\n${block}`;
    });

  return [...header, '', ...sceneBlocks].join('\n');
}

export function sceneSelectionToContentPack(selection: ProductionSceneAssetSelection): ContentPackAssetSelection {
  const { brandElementIds: _b, graphicsId: _g, ctaId: _c, voiceId: _v, moodboardId: _m, ...rest } = selection;
  void _b;
  void _g;
  void _c;
  void _v;
  void _m;
  return rest;
}

export function getPromptStatusLabel(status: ProductionDraft['promptStatus']): string {
  switch (status) {
    case 'draft':
      return 'DRAFT — ADD ASSETS';
    case 'assembled':
      return 'ASSEMBLED FROM ASSETS';
    case 'edited':
      return 'MANUALLY EDITED';
    case 'ready':
      return 'READY FOR GENERATION';
    default:
      return status;
  }
}

export function summarizeSceneForInspector(scene: ProductionScene): Array<{ label: string; value: string }> {
  const s = scene.selection;
  const row = (label: string, id: string | undefined) => ({
    label,
    value: id ? (findProductionAsset(id)?.name ?? id) : '—',
  });
  const rows = [
    row('STUDIO', s.studioId),
    row('TALENT', s.talentId),
    row('WARDROBE', s.wardrobeId),
    row('POSE', s.poseId),
    row('EXPRESSION', s.expressionId),
    row('CAMERA', s.cameraId),
    row('LIGHTING', s.lightingId),
    row('MUSIC', s.musicId),
    row('ANIMATION', s.animationId),
    row('GRAPHICS', s.graphicsId),
    row('VOICE', s.voiceId),
  ];
  if (s.propIds?.length) {
    rows.push({
      label: 'PROPS',
      value: s.propIds.map((id) => findProductionAsset(id)?.name ?? id).join(' · '),
    });
  }
  if (s.materialIds?.length) {
    rows.push({
      label: 'MATERIALS',
      value: s.materialIds.map((id) => findProductionAsset(id)?.name ?? id).join(' · '),
    });
  }
  if (s.brandElementIds?.length) {
    rows.push({
      label: 'BRAND ELEMENTS',
      value: s.brandElementIds.map((id) => findProductionAsset(id)?.name ?? id).join(' · '),
    });
  }
  return rows;
}

/** Map drag-drop asset category to selection field. */
export function assetCategoryToSelectionKey(
  category: string
): keyof ProductionSceneAssetSelection | 'prop' | 'material' | 'brand' | null {
  switch (category) {
    case 'studios':
      return 'studioId';
    case 'talent':
      return 'talentId';
    case 'wardrobe':
      return 'wardrobeId';
    case 'expressions':
      return 'expressionId';
    case 'poses':
      return 'poseId';
    case 'lighting':
      return 'lightingId';
    case 'camera':
      return 'cameraId';
    case 'animations':
      return 'animationId';
    case 'audio':
      return 'musicId';
    case 'props':
      return 'prop';
    case 'materials':
      return 'material';
    case 'brand':
      return 'brand';
    case 'moodboards':
      return 'moodboardId';
    default:
      return null;
  }
}

export function applyAssetToSelection(
  selection: ProductionSceneAssetSelection,
  category: string,
  assetId: string
): ProductionSceneAssetSelection {
  const key = assetCategoryToSelectionKey(category);
  if (!key) return selection;
  const next = { ...selection };
  if (key === 'prop') {
    const ids = next.propIds ?? [];
    next.propIds = ids.includes(assetId) ? ids : [...ids, assetId];
    return next;
  }
  if (key === 'material') {
    const ids = next.materialIds ?? [];
    next.materialIds = ids.includes(assetId) ? ids : [...ids, assetId];
    return next;
  }
  if (key === 'brand') {
    const ids = next.brandElementIds ?? [];
    next.brandElementIds = ids.includes(assetId) ? ids : [...ids, assetId];
    return next;
  }
  (next as Record<string, unknown>)[key] = assetId;
  return next;
}
