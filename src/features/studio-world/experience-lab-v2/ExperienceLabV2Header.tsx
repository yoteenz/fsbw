import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import { testModeLabel } from './experience-lab-v2-test-modes';

type Props = {
  model: ExperienceLabV2ViewModel;
  onSearch?: () => void;
};

/** Top command dock — data-driven Studio World Admin context. */
export function ExperienceLabV2Header({ model, onSearch }: Props) {
  return (
    <header className="elab-v2__command" data-elab-command-dock>
      <div style={{ padding: '12px 16px 8px' }}>
        <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--elab-accent)' }}>
          STUDIO WORLD ADMIN — EXPERIENCE LAB™
        </p>
        <h1 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700 }}>Experience Lab Command</h1>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 8,
          padding: '0 16px 12px',
          fontSize: 10,
        }}
      >
        <div>
          <span style={{ color: 'var(--elab-text-muted)' }}>Program</span>
          <p style={{ margin: '2px 0 0', fontWeight: 700 }}>{model.program === 'studio-world' ? 'Studio World' : 'Industry Packs'}</p>
        </div>
        <div>
          <span style={{ color: 'var(--elab-text-muted)' }}>Department</span>
          <p style={{ margin: '2px 0 0', fontWeight: 700 }}>{model.departmentName}</p>
        </div>
        <div>
          <span style={{ color: 'var(--elab-text-muted)' }}>Revision</span>
          <p style={{ margin: '2px 0 0', fontWeight: 700 }}>r{model.revision}</p>
        </div>
        <div>
          <span style={{ color: 'var(--elab-text-muted)' }}>Approval</span>
          <p style={{ margin: '2px 0 0', fontWeight: 700 }}>{model.approvalStatus}</p>
        </div>
        <div>
          <span style={{ color: 'var(--elab-text-muted)' }}>Permit</span>
          <p style={{ margin: '2px 0 0', fontWeight: 700 }}>{model.permitStatus}</p>
        </div>
        <div>
          <span style={{ color: 'var(--elab-text-muted)' }}>Est. cost</span>
          <p style={{ margin: '2px 0 0', fontWeight: 700 }}>{model.costEstimate}</p>
        </div>
        <div>
          <span style={{ color: 'var(--elab-text-muted)' }}>Test mode</span>
          <p style={{ margin: '2px 0 0', fontWeight: 700 }}>{testModeLabel(model.testMode)}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'end', gap: 6 }}>
          <button type="button" className="elab-v2__mode-btn" onClick={onSearch} aria-label="Search">
            Search
          </button>
        </div>
      </div>
    </header>
  );
}
