import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { CANONICAL_EXPERIENCE_RUNTIME_CONTRACT } from './constants';
import { resolveExperienceRuntime } from './DNAResolver';
import { RuntimeInspector } from './RuntimeInspector';
import { SceneAssembler } from './SceneAssembler';
import type { ExperienceRuntimeInput } from './types';

type Props = {
  /** Override canonical contract for playground experiments */
  input?: Partial<ExperienceRuntimeInput>;
};

const headerStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '10px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: '#EB1C24',
  margin: '0 0 4px',
};

const subStyle: CSSProperties = {
  fontFamily: '"Futura PT Book", sans-serif',
  fontSize: '13px',
  color: '#1A1A1A',
  margin: '0 0 20px',
  lineHeight: 1.5,
};

function buildInput(override?: Partial<ExperienceRuntimeInput>): ExperienceRuntimeInput {
  const c = CANONICAL_EXPERIENCE_RUNTIME_CONTRACT;
  return {
    brandId: override?.brandId ?? c.brandId,
    departmentSlug: override?.departmentSlug ?? c.departmentSlug,
    sceneId: override?.sceneId ?? c.sceneId,
    templateId: override?.templateId ?? c.templateId,
    designDnaVersion: override?.designDnaVersion ?? c.designDnaVersion,
  };
}

/**
 * ExperienceRuntime™ — composes brand + department + scene + template + designDNA
 * and mounts SceneAssembler + RuntimeInspector (playground spine).
 */
export function ExperienceRuntime({ input: inputOverride }: Props) {
  const input = useMemo(() => buildInput(inputOverride), [inputOverride]);
  const resolved = useMemo(() => resolveExperienceRuntime(input), [input]);

  return (
    <div className="experience-runtime-root">
      <header style={{ marginBottom: 20 }}>
        <p style={headerStyle}>Experience Runtime™ · Phase 1</p>
        <p style={subStyle}>
          Assembled scene from registries + Design DNA metadata — not the live Executive Headquarters shell.
          Canonical contract: Studio OS · Executive · Executive Headquarters · hq-master-scene-v1 · designDNA v1.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 340px)',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <SceneAssembler resolved={resolved} />
        <RuntimeInspector resolved={resolved} />
      </div>
    </div>
  );
}
