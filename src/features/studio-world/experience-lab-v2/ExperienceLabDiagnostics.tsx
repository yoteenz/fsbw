import type { ExperienceLabV2MigrationReadiness, ExperienceLabV2TestMode } from './experience-lab-v2.types';
import { EXPERIENCE_LAB_V2_TEST_MODES } from './experience-lab-v2.types';
import { testModeLabel, writeExperienceLabV2TestMode } from './experience-lab-v2-test-modes';
import type { PanelOrchestratorDiagnostics } from './experience-lab-v2-panel-orchestrator';
import { ExperienceLabIcon } from '../icons/ExperienceLabIcon';
import { DIAGNOSTICS_ICONS } from './experience-lab-v2-icon-bindings';

type Props = {
  testMode: ExperienceLabV2TestMode;
  onTestModeChange: (mode: ExperienceLabV2TestMode) => void;
  migration: ExperienceLabV2MigrationReadiness;
  panelDiagnostics?: PanelOrchestratorDiagnostics;
  onResetLayout?: () => void;
  open?: boolean;
  onToggle?: () => void;
  compact?: boolean;
};

const READINESS_KEYS: Array<keyof ExperienceLabV2MigrationReadiness> = [
  'mobileApproved', 'desktopApproved', 'viewportApproved', 'dataParityApproved',
  'generationParityApproved', 'accessibilityApproved', 'performanceApproved', 'productionNavigationApproved',
];

/** Diagnostics drawer — not stacked dashboard cards. */
export function ExperienceLabDiagnostics({
  testMode,
  onTestModeChange,
  migration,
  panelDiagnostics,
  onResetLayout,
  open,
  onToggle,
  compact,
}: Props) {
  if (!open) {
    return (
      <button type="button" className={`elab-diag-toggle${compact ? ' elab-diag-toggle--compact' : ''}`} onClick={onToggle}>
        <ExperienceLabIcon name={DIAGNOSTICS_ICONS.diagnostics} size="xs" decorative />
        {compact ? 'DIAG' : 'Diagnostics & migration readiness'}
      </button>
    );
  }

  return (
    <aside className="elab-diag-drawer" data-elab-diagnostics>
      <div className="elab-diag-drawer__head">
        <strong>DIAGNOSTICS</strong>
        <button type="button" className="elab-diag-drawer__close" onClick={onToggle}>✕</button>
      </div>
      <div className="elab-diag-drawer__modes">
        {EXPERIENCE_LAB_V2_TEST_MODES.map((mode: ExperienceLabV2TestMode) => (
          <button
            key={mode}
            type="button"
            className={`elab-diag-drawer__mode${testMode === mode ? ' elab-diag-drawer__mode--on' : ''}`}
            onClick={() => {
              writeExperienceLabV2TestMode(mode);
              onTestModeChange(mode);
            }}
          >
            {testModeLabel(mode)}
          </button>
        ))}
      </div>
      <ul className="elab-diag-drawer__readiness">
        {READINESS_KEYS.map((key) => (
          <li key={key}>{key}: {migration[key] ? '✓' : 'pending'}</li>
        ))}
      </ul>
      {panelDiagnostics ? (
        <dl className="elab-diag-drawer__panels" data-elab-panel-diagnostics>
          <div><dt>Visible panels</dt><dd>{panelDiagnostics.visiblePanels.join(', ') || 'none'}</dd></div>
          <div><dt>Active inspector</dt><dd>{panelDiagnostics.activeInspector}</dd></div>
          <div><dt>Expanded</dt><dd>{panelDiagnostics.expandedPanel ?? 'none'}</dd></div>
          <div><dt>Safe zone</dt><dd>{panelDiagnostics.viewportSafeZonePct}%</dd></div>
          <div><dt>Collisions prevented</dt><dd>{panelDiagnostics.collisionsPrevented}</dd></div>
          <div><dt>Breakpoint</dt><dd>{panelDiagnostics.breakpoint}</dd></div>
        </dl>
      ) : null}
      {onResetLayout ? (
        <button type="button" className="elab-diag-drawer__reset" onClick={onResetLayout}>
          RESET EXPERIENCE LAB LAYOUT
        </button>
      ) : null}
    </aside>
  );
}
