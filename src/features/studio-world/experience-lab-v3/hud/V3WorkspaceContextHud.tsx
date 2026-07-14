import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import type { ExperienceLabV3State } from '../experience-lab-v3.types';

const CRUMBS: Array<(s: ExperienceLabV3State) => string | null> = [
  (s) => (s.workspace.programId === 'studio-world' ? 'Studio World' : 'Industry Packs'),
  () => 'Experience Lab',
  (s) => s.workspace.departmentLabel,
  (s) => s.workspace.variantLabel,
  (s) => `Revision R${s.workspace.revision}`,
  (s) =>
    s.workspace.companionDevice ? `${s.workspace.companionDevice[0]!.toUpperCase()}${s.workspace.companionDevice.slice(1)} Companion` : null,
  (s) => s.workspace.lifecycleStatus,
];

/** One-glance workspace context — always visible. */
export function V3WorkspaceContextHud() {
  const { state } = useExperienceLabV3Store();
  const segments = CRUMBS.map((fn) => fn(state)).filter((seg): seg is string => Boolean(seg));

  return (
    <nav className="elab-v3-context" data-elab-v3-workspace-context aria-label="Workspace context">
      {segments.map((seg, i) => (
        <span key={`${seg}-${i}`} className="elab-v3-context__seg">
          {i > 0 && <span className="elab-v3-context__sep" aria-hidden>↓</span>}
          <span className="elab-v3-context__label">{seg}</span>
        </span>
      ))}
    </nav>
  );
}
