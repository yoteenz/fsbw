import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import { testModeLabel } from './experience-lab-v2-test-modes';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

type Props = {
  model: ExperienceLabV2ViewModel;
  isMobile: boolean;
  onSearch?: () => void;
};

const DESKTOP_NAV = ['STUDIO WORLD', 'BLUEPRINTS', 'RENDERS', 'MATERIALS', 'LIGHTING', 'CAMERAS', 'HISTORY', 'APPROVALS'] as const;

/** Unified architectural command dock — not a page header. */
export function ExperienceLabCommandDock({ model, isMobile, onSearch }: Props) {
  if (isMobile) {
    return (
      <header className="elab-cmd" {...{ [ELAB_V2_COMPOSITION.commandDock]: '' }}>
        <div className="elab-cmd__row elab-cmd__row--identity">
          <span className="elab-cmd__logo">FE</span>
          <div className="elab-cmd__title-block">
            <span className="elab-cmd__title">EXPERIENCE LAB</span>
            <span className="elab-cmd__subtitle">ARCHITECTURE STUDIO</span>
          </div>
          <div className="elab-cmd__actions">
            <button type="button" className="elab-cmd__icon-btn" aria-label="Search" onClick={onSearch}>⌕</button>
            <button type="button" className="elab-cmd__icon-btn elab-cmd__icon-btn--badge" aria-label="Notifications">🔔<span>3</span></button>
            <button type="button" className="elab-cmd__avatar" aria-label="Profile">FS</button>
          </div>
        </div>
        <div className="elab-cmd__row elab-cmd__row--context">
          <span className="elab-cmd__pill">🏛 FRONTAL SLAYER HQ</span>
          <span className="elab-cmd__pill elab-cmd__pill--active">EXPERIENCE LAB</span>
          <span className="elab-cmd__pill">RECEPTION · r{model.revision}</span>
        </div>
        <div className="elab-cmd__row elab-cmd__row--status">
          <span>STATUS: <strong className="elab-status--ok">{model.approvalStatus.toUpperCase()}</strong></span>
          <span>PERMIT: <strong className="elab-status--ok">{model.permitStatus.toUpperCase()}</strong></span>
          <span>AI COST: <strong>{model.costEstimate}</strong></span>
          <span className="elab-cmd__mode-tag">{testModeLabel(model.testMode)}</span>
        </div>
      </header>
    );
  }

  return (
    <header className="elab-cmd elab-cmd--desktop" {...{ [ELAB_V2_COMPOSITION.commandDock]: '' }}>
      <div className="elab-cmd__desktop-top">
        <div className="elab-cmd__brand">
          <span className="elab-cmd__logo">FE</span>
          <div>
            <span className="elab-cmd__title">EXPERIENCE LAB</span>
            <span className="elab-cmd__subtitle">ARCHITECTURE STUDIO</span>
          </div>
        </div>
        <nav className="elab-cmd__nav" aria-label="Studio World navigation">
          {DESKTOP_NAV.map((item) => (
            <button key={item} type="button" className="elab-cmd__nav-link">{item}</button>
          ))}
        </nav>
        <div className="elab-cmd__actions">
          <button type="button" className="elab-cmd__icon-btn" aria-label="Search" onClick={onSearch}>⌕</button>
          <button type="button" className="elab-cmd__icon-btn elab-cmd__icon-btn--badge" aria-label="Notifications">🔔<span>3</span></button>
          <button type="button" className="elab-cmd__avatar" aria-label="Profile">FS</button>
        </div>
      </div>
      <div className="elab-cmd__desktop-meta">
        <span>STUDIO WORLD ADMIN</span>
        <span>{model.departmentName}</span>
        <span>REVISION {model.revision}</span>
        <span className="elab-status--ok">{model.approvalStatus.toUpperCase()}</span>
        <span>PERMIT {model.permitStatus.toUpperCase()}</span>
        <span>AI {model.costEstimate}</span>
        <span className="elab-cmd__mode-tag">{testModeLabel(model.testMode)}</span>
      </div>
    </header>
  );
}
