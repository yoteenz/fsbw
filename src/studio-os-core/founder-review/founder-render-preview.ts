/**
 * Founder Review™ — Blueprint Preview Output A (Founder Render).
 * Photoreal-style representative preview — NOT engineering blueprint.
 */
import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';

export const FOUNDER_RENDER_VERSION = 'founder-render.v1';

export type FounderRenderVariantId = 'current' | 'luxury' | 'minimal' | 'editorial' | 'signature';

export type FounderRenderVariant = {
  id: FounderRenderVariantId;
  label: string;
  mood: string;
  colorGrade: {
    warmth: number;
    contrast: number;
    saturation: number;
    accent: string;
  };
};

export const FOUNDER_RENDER_VARIANTS: FounderRenderVariant[] = [
  { id: 'current', label: 'Current', mood: 'Balanced luxury reception', colorGrade: { warmth: 0.55, contrast: 0.5, saturation: 0.6, accent: '#c9a962' } },
  { id: 'luxury', label: 'Luxury', mood: 'Warm gold · deep marble', colorGrade: { warmth: 0.85, contrast: 0.65, saturation: 0.75, accent: '#d4af37' } },
  { id: 'minimal', label: 'Minimal', mood: 'High-key · clean lines', colorGrade: { warmth: 0.35, contrast: 0.35, saturation: 0.25, accent: '#e8e8e8' } },
  { id: 'editorial', label: 'Editorial', mood: 'Cool contrast · gallery light', colorGrade: { warmth: 0.25, contrast: 0.8, saturation: 0.45, accent: '#94a3b8' } },
  { id: 'signature', label: 'Signature', mood: 'Founder marble · brand presence', colorGrade: { warmth: 0.6, contrast: 0.7, saturation: 0.7, accent: '#eb1c24' } },
];

export type FounderRenderAssetVisual = {
  assetId: string;
  label: string;
  role: 'architecture' | 'hero' | 'furniture' | 'decor' | 'lighting' | 'atmosphere';
  bounds: { left: string; top: string; width: string; height: string };
  visualStyle: 'marble-floor' | 'wall-panel' | 'desk' | 'sculpture' | 'seating' | 'table' | 'glass' | 'light-glow' | 'plant' | 'atmosphere';
  visible: boolean;
};

export type FounderRenderModel = {
  renderVersion: typeof FOUNDER_RENDER_VERSION;
  planId: string;
  roomDisplayName: string;
  variant: FounderRenderVariant;
  architectureLabel: string;
  materialLibrary: string;
  lightingProfile: string;
  cameraLabel: string;
  assets: FounderRenderAssetVisual[];
  marbleTextureUrl: string;
  generationOccurred: false;
};

const ASSET_VISUAL_MAP: Record<string, FounderRenderAssetVisual['visualStyle']> = {
  ReceptionDeskSocket: 'desk',
  LandmarkSocket: 'sculpture',
  LeftSeatingSocket: 'seating',
  RightSeatingSocket: 'seating',
  CoffeeTableSocket: 'table',
  MonitorSocket: 'glass',
  ReceptionLightingSocket: 'light-glow',
  DecorationSocket: 'plant',
  NavigationSocket: 'atmosphere',
};

function labelForAsset(assetId: string, socketLabel?: string): string {
  if (socketLabel) return socketLabel;
  return assetId.replace(/([A-Z])/g, ' $1').trim();
}

export function buildFounderRenderModel(input: {
  plan: ConstructionPlan;
  variantId?: FounderRenderVariantId;
  installedAssetIds?: string[];
}): FounderRenderModel {
  const variant =
    FOUNDER_RENDER_VARIANTS.find((v) => v.id === input.variantId) ?? FOUNDER_RENDER_VARIANTS[0];
  const installed = new Set(input.installedAssetIds ?? []);

  const assets: FounderRenderAssetVisual[] = [
    {
      assetId: input.plan.architecture.architectureId,
      label: input.plan.architecture.architectureId,
      role: 'architecture',
      bounds: { left: '6%', top: '12%', width: '88%', height: '78%' },
      visualStyle: 'wall-panel',
      visible: true,
    },
    {
      assetId: 'floor-plane',
      label: 'Marble floor',
      role: 'architecture',
      bounds: { left: '8%', top: '68%', width: '84%', height: '28%' },
      visualStyle: 'marble-floor',
      visible: true,
    },
    ...[...input.plan.heroAssets, ...input.plan.furnitureSet.assets, ...input.plan.decorSet.assets].map((asset) => {
      const socket = input.plan.assetSockets.find((s) => s.socketId === asset.socketId);
      return {
        assetId: asset.assetId,
        label: labelForAsset(asset.assetId, socket?.label),
        role: (socket?.role === 'lighting' ? 'lighting' : socket?.role === 'decor' ? 'decor' : socket?.role === 'furniture' ? 'furniture' : 'hero') as FounderRenderAssetVisual['role'],
        bounds: socket?.bounds ?? { left: '40%', top: '50%', width: '20%', height: '20%' },
        visualStyle: ASSET_VISUAL_MAP[asset.socketId] ?? 'desk',
        visible: installed.size === 0 || installed.has(asset.assetId),
      };
    }),
    {
      assetId: 'atmosphere-layer',
      label: 'Atmosphere',
      role: 'atmosphere',
      bounds: { left: '0%', top: '0%', width: '100%', height: '100%' },
      visualStyle: 'atmosphere',
      visible: installed.size > 0,
    },
  ];

  const primaryCamera = input.plan.cameraAnchors[0];

  return {
    renderVersion: FOUNDER_RENDER_VERSION,
    planId: input.plan.planId,
    roomDisplayName: input.plan.room.displayName,
    variant,
    architectureLabel: input.plan.architecture.architectureId,
    materialLibrary: input.plan.materialSet.materialSetId,
    lightingProfile: input.plan.lightingProfile.profileId,
    cameraLabel: primaryCamera?.label ?? 'Hero camera',
    assets,
    marbleTextureUrl: '/assets/marble-half.png',
    generationOccurred: false,
  };
}

export function getVariantById(id: FounderRenderVariantId): FounderRenderVariant {
  return FOUNDER_RENDER_VARIANTS.find((v) => v.id === id) ?? FOUNDER_RENDER_VARIANTS[0];
}
