import { useState } from 'react';
import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import { testModeLabel } from './experience-lab-v2-test-modes';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import { ExperienceLabSheet } from './ExperienceLabSheet';

type Props = {
  model: ExperienceLabV2ViewModel;
  onStatusOpen?: () => void;
  onSearch?: () => void;
};

const NAV = ['STUDIO WORLD', 'BLUEPRINTS', 'RENDERS', 'MATERIALS', 'LIGHTING', 'CAMERAS', 'HISTORY', 'APPROVALS'] as const;

/** Unified dense command dock — desktop master layout, responsive scaling. */
export function ExperienceLabCommandDock({ model, onStatusOpen, onSearch }: Props) {
  const [statusOpen, setStatusOpen] = useState(false);

  const openStatus = () => {
    onStatusOpen?.();
    setStatusOpen(true);
  };

  return (
    <>
      <header className="elab-cmd elab-cmd--pro" {...{ [ELAB_V2_COMPOSITION.commandDock]: '' }}>
        <div className="elab-cmd__pro-row">
          <span className="elab-cmd__logo">FE</span>
          <div className="elab-cmd__title-block">
            <span className="elab-cmd__title">EXPERIENCE LAB</span>
            <span className="elab-cmd__subtitle">ARCHITECTURE STUDIO</span>
          </div>
          <nav className="elab-cmd__nav" aria-label="Studio World navigation">
            {NAV.map((item) => (
              <button key={item} type="button" className="elab-cmd__nav-link">{item}</button>
            ))}
          </nav>
          <div className="elab-cmd__meta">
            <span className="elab-cmd__meta-chip">{model.departmentName}</span>
            <span className="elab-cmd__meta-chip">r{model.revision}</span>
            <button type="button" className="elab-cmd__meta-chip elab-status--ok" onClick={openStatus}>
              {model.approvalStatus.toUpperCase()}
            </button>
            <span className="elab-cmd__meta-chip">{model.costEstimate}</span>
            <span className="elab-cmd__mode-tag">{testModeLabel(model.testMode)}</span>
          </div>
          <div className="elab-cmd__actions">
            <button type="button" className="elab-cmd__icon-btn" aria-label="Search" onClick={onSearch}>⌕</button>
            <button type="button" className="elab-cmd__icon-btn elab-cmd__icon-btn--badge" aria-label="Notifications">🔔<span>3</span></button>
            <button type="button" className="elab-cmd__avatar" aria-label="Profile">FS</button>
          </div>
        </div>
      </header>
      <ExperienceLabSheet open={statusOpen} title="Status & metadata" onClose={() => setStatusOpen(false)}>
        <dl className="elab-sheet-dl">
          <div><dt>Status</dt><dd className="elab-status--ok">{model.approvalStatus.toUpperCase()}</dd></div>
          <div><dt>Permit</dt><dd className="elab-status--ok">{model.permitStatus.toUpperCase()}</dd></div>
          <div><dt>AI cost</dt><dd>{model.costEstimate}</dd></div>
          <div><dt>Test mode</dt><dd>{testModeLabel(model.testMode)}</dd></div>
        </dl>
      </ExperienceLabSheet>
    </>
  );
}
