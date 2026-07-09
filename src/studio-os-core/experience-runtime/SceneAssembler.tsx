import type { CSSProperties } from 'react';
import type { DdnaSceneLayerId } from '../genesis/studio-os-design-dna/constants';
import { DDNA_SCENE_LAYER_LABELS } from '../genesis/studio-os-design-dna/constants';
import { LAYER_PLACEHOLDER_LAYOUT } from './constants';
import type { ResolvedExperienceRuntime } from './types';

type Props = {
  resolved: ResolvedExperienceRuntime;
};

const labelStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '9px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  margin: 0,
};

const metaStyle: CSSProperties = {
  fontFamily: '"Futura PT Book", sans-serif',
  fontSize: '10px',
  margin: '4px 0 0',
  opacity: 0.85,
};

function layerChrome(layerId: DdnaSceneLayerId, zIndex: number, deptPrimary: string): CSSProperties {
  const region = LAYER_PLACEHOLDER_LAYOUT[layerId];
  const isHero = layerId === 'hero-environment';

  return {
    position: 'absolute',
    ...region,
    zIndex,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: isHero ? 'flex-end' : 'flex-start',
    padding: isHero ? '16px' : '10px',
    border: isHero ? 'none' : `1.5px dashed ${deptPrimary}66`,
    borderRadius: isHero ? 0 : 8,
    background: isHero
      ? 'var(--studio-ddna-lighting-ambient-warm, linear-gradient(165deg, #f8f6f3, #efeae4))'
      : 'rgba(255,255,255,0.42)',
    backdropFilter: isHero ? undefined : 'blur(8px)',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };
}

/**
 * SceneAssembler™ — reads scene template metadata and mounts visible placeholder layers.
 * Playground-only assembly; not wired to live Executive Headquarters shell.
 */
export function SceneAssembler({ resolved }: Props) {
  const { dnaProfile, activeLayers, template, scene } = resolved;
  const deptPrimary =
    dnaProfile.cssVariables['--studio-ddna-dept-primary'] ??
    dnaProfile.departmentTheme.primaryColor;

  const sorted = [...activeLayers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className="experience-runtime-scene"
      data-er-scene={scene.sceneId}
      data-er-template={template.templateId}
      data-ddna-scene={template.templateId}
      data-ddna-department={dnaProfile.departmentId}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'min(72vh, 720px)',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.1)',
        background: dnaProfile.lightingPreset.horizonGradient,
        boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
        ...Object.fromEntries(
          Object.entries(dnaProfile.cssVariables).map(([k, v]) => [k, v])
        ),
      } as CSSProperties}
    >
      {sorted.map((layer) => (
        <div
          key={layer.slotId}
          data-er-layer={layer.slotId}
          data-ddna-layer={layer.templateLayerId}
          style={layerChrome(layer.templateLayerId, layer.zIndex, deptPrimary)}
          aria-label={`${layer.label} placeholder`}
        >
          {!isFullBleed(layer.templateLayerId) ? (
            <>
              <p style={{ ...labelStyle, color: deptPrimary }}>{layer.label}</p>
              <p style={metaStyle}>
                {DDNA_SCENE_LAYER_LABELS[layer.templateLayerId]} · z{layer.zIndex}
              </p>
            </>
          ) : (
            <div
              style={{
                alignSelf: 'flex-start',
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.55)',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <p style={{ ...labelStyle, color: deptPrimary }}>{layer.label}</p>
              <p style={metaStyle}>Template layer · z{layer.zIndex}</p>
            </div>
          )}
        </div>
      ))}

      <div
        style={{
          position: 'absolute',
          left: 12,
          bottom: 12,
          zIndex: 500,
          padding: '6px 10px',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: 4,
          fontFamily: '"Futura PT Book", sans-serif',
          fontSize: '9px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#1A1A1A',
        }}
      >
        SceneAssembler™ · {sorted.length} active layers · {template.officialName}
      </div>
    </div>
  );
}

function isFullBleed(layerId: DdnaSceneLayerId): boolean {
  return layerId === 'hero-environment';
}
