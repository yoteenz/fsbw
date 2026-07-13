import { LEFT_INSPECTOR_MODULES } from './experience-lab-v2.config';
import type { StudioViewportMode } from './experience-lab-v2.types';

type Props = {
  selectedId: string;
  onSelect: (id: string, mode: StudioViewportMode) => void;
  charterSummary: string;
};

export function ExperienceLabLeftInspector({ selectedId, onSelect, charterSummary }: Props) {
  return (
    <aside className="elab-v2__panel elab-v2__side" data-elab-left-inspector aria-label="Left inspector">
      <p style={{ padding: '10px 12px', margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--elab-accent)' }}>
        LEFT INSPECTOR
      </p>
      {LEFT_INSPECTOR_MODULES.map((mod) => (
        <button
          key={mod.id}
          type="button"
          className="elab-v2__inspector-module"
          aria-selected={selectedId === mod.id}
          onClick={() => onSelect(mod.id, mod.viewportMode as StudioViewportMode)}
        >
          <strong style={{ fontSize: 11 }}>{mod.label}</strong>
          <p style={{ margin: '4px 0 0', fontSize: 9, color: 'var(--elab-text-muted)' }}>{mod.summary}</p>
        </button>
      ))}
      <div style={{ padding: 12, fontSize: 9, color: 'var(--elab-text-muted)', lineHeight: 1.45 }}>{charterSummary}</div>
    </aside>
  );
}
