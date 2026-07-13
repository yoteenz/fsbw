import type { ExperienceLabV2MigrationReadiness, ExperienceLabV2TestMode } from './experience-lab-v2.types';
import { EXPERIENCE_LAB_V2_TEST_MODES } from './experience-lab-v2.types';
import { testModeLabel, writeExperienceLabV2TestMode } from './experience-lab-v2-test-modes';

type Props = {
  testMode: ExperienceLabV2TestMode;
  onTestModeChange: (mode: ExperienceLabV2TestMode) => void;
  migration: ExperienceLabV2MigrationReadiness;
  open?: boolean;
  onToggle?: () => void;
};

const READINESS_KEYS: Array<keyof ExperienceLabV2MigrationReadiness> = [
  'mobileApproved',
  'desktopApproved',
  'viewportApproved',
  'dataParityApproved',
  'generationParityApproved',
  'accessibilityApproved',
  'performanceApproved',
  'productionNavigationApproved',
];

export function ExperienceLabDiagnostics({ testMode, onTestModeChange, migration, open, onToggle }: Props) {
  if (!open) {
    return (
      <button type="button" className="elab-v2__mode-btn" onClick={onToggle} style={{ margin: '0 12px 8px' }}>
        Open diagnostics drawer
      </button>
    );
  }

  return (
    <aside className="elab-v2__panel" style={{ margin: '0 12px 12px', padding: 12 }} data-elab-diagnostics>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: 10, letterSpacing: '0.08em' }}>DIAGNOSTICS & MIGRATION READINESS</strong>
        <button type="button" className="elab-v2__mode-btn" onClick={onToggle}>
          Close
        </button>
      </div>
      <p style={{ fontSize: 9, margin: '8px 0', color: 'var(--elab-text-muted)' }}>Test mode (no auto-migration)</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {EXPERIENCE_LAB_V2_TEST_MODES.map((mode: ExperienceLabV2TestMode) => (
          <button
            key={mode}
            type="button"
            className="elab-v2__mode-btn"
            aria-pressed={testMode === mode}
            onClick={() => {
              writeExperienceLabV2TestMode(mode);
              onTestModeChange(mode);
            }}
          >
            {testModeLabel(mode)}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 9, fontWeight: 700, margin: '0 0 6px' }}>Cutover readiness (founder review only)</p>
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 9 }}>
        {READINESS_KEYS.map((key) => (
          <li key={key} style={{ marginBottom: 4 }}>
            {key}: {migration[key] ? 'approved' : 'pending'}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 8, marginTop: 10, color: 'var(--elab-text-muted)' }}>
        Production route /admin/studio/experience-lab unchanged until explicit Founder cutover sprint.
      </p>
    </aside>
  );
}
