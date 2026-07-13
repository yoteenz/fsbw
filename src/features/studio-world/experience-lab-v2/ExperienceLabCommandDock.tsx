import { useState } from 'react';
import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import {
  commandDockLocationSubtitle,
  commandDockStatusClass,
  EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS,
  formatCommandDockApprovalStatus,
  formatCommandDockPermitStatus,
  resolveExperienceLabCommandDockLogoUrl,
  type CommandDockLocationId,
} from './experience-lab-v2-command-dock-locations';
import { ExperienceLabSheet } from './ExperienceLabSheet';

type Props = {
  model: ExperienceLabV2ViewModel;
  onStatusOpen?: () => void;
  onSearch?: () => void;
};

/** Three-row Command Dock — identity · HQ location tabs · status line. */
export function ExperienceLabCommandDock({ model, onStatusOpen, onSearch }: Props) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [activeLocation, setActiveLocation] = useState<CommandDockLocationId>('experience-lab');

  const statusLabel = formatCommandDockApprovalStatus(model.approvalStatus);
  const permitLabel = formatCommandDockPermitStatus(model.permitStatus);
  const costDisplay = model.costEstimate.startsWith('$') ? model.costEstimate : `$${model.costEstimate}`;

  const openStatus = () => {
    onStatusOpen?.();
    setStatusOpen(true);
  };

  return (
    <>
      <header
        className="elab-cmd elab-cmd--pro elab-cmd--tiered"
        {...{ [ELAB_V2_COMPOSITION.commandDock]: '' }}
      >
        <div className="elab-cmd__row elab-cmd__row--identity">
          <img
            className="elab-cmd__logo-img"
            src={resolveExperienceLabCommandDockLogoUrl()}
            alt=""
            aria-hidden
            decoding="async"
          />
          <div className="elab-cmd__title-block">
            <span className="elab-cmd__title">EXPERIENCE LAB</span>
            <span className="elab-cmd__subtitle">ARCHITECTURE STUDIO</span>
          </div>
          <div className="elab-cmd__actions">
            <button type="button" className="elab-cmd__icon-btn" aria-label="Search" onClick={onSearch}>
              <span className="elab-cmd__icon-glyph" aria-hidden>⌕</span>
            </button>
            <button type="button" className="elab-cmd__icon-btn elab-cmd__icon-btn--badge" aria-label="Alerts">
              <span className="elab-cmd__icon-glyph" aria-hidden>🔔</span>
              <span className="elab-cmd__badge-count">3</span>
            </button>
            <button type="button" className="elab-cmd__avatar" aria-label="Client account">
              FS
            </button>
          </div>
        </div>

        <div className="elab-cmd__row elab-cmd__row--locations">
          <nav className="elab-cmd__locations" aria-label="Primary headquarters locations">
            {EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS.map((tab) => {
              const active = tab.id === activeLocation;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`elab-cmd__location-tab${active ? ' elab-cmd__location-tab--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setActiveLocation(tab.id)}
                >
                  {tab.id === 'frontal-slayer-hq' ? (
                    <span className="elab-cmd__location-icon" aria-hidden>
                      <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
                        <path
                          d="M2 14V6l6-4 6 4v8H9v-4H7v4H2z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                      </svg>
                    </span>
                  ) : null}
                  <span className="elab-cmd__location-copy">
                    <span className="elab-cmd__location-title">{tab.title}</span>
                    <span className="elab-cmd__location-subtitle">
                      {commandDockLocationSubtitle(tab, model.revision)}
                    </span>
                  </span>
                  {tab.showLiveIndicator ? (
                    <span className="elab-cmd__location-live" aria-label="Live status">
                      <span className="elab-cmd__location-live-dot" />
                    </span>
                  ) : null}
                  {active ? <span className="elab-cmd__location-chev" aria-hidden>›</span> : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="elab-cmd__row elab-cmd__row--status">
          <div className="elab-cmd__status-center">
            <button type="button" className="elab-cmd__status-item" onClick={openStatus}>
              STATUS:{' '}
              <strong className={commandDockStatusClass(statusLabel)}>{statusLabel}</strong>
            </button>
            <span className="elab-cmd__status-divider" aria-hidden />
            <button type="button" className="elab-cmd__status-item" onClick={openStatus}>
              PERMIT:{' '}
              <strong className={commandDockStatusClass(permitLabel)}>{permitLabel}</strong>
            </button>
            <span className="elab-cmd__status-divider" aria-hidden />
            <span className="elab-cmd__status-item elab-cmd__status-item--static">
              AI COST (EST.) {costDisplay}
            </span>
          </div>
          <button type="button" className="elab-cmd__overflow" aria-label="More status options" onClick={openStatus}>
            …
          </button>
        </div>
      </header>

      <ExperienceLabSheet open={statusOpen} title="Status & metadata" onClose={() => setStatusOpen(false)}>
        <dl className="elab-sheet-dl">
          <div>
            <dt>Status</dt>
            <dd className={commandDockStatusClass(statusLabel)}>{statusLabel}</dd>
          </div>
          <div>
            <dt>Permit</dt>
            <dd className={commandDockStatusClass(permitLabel)}>{permitLabel}</dd>
          </div>
          <div>
            <dt>AI cost (est.)</dt>
            <dd>{costDisplay}</dd>
          </div>
          <div>
            <dt>Revision</dt>
            <dd>r{model.revision}</dd>
          </div>
        </dl>
      </ExperienceLabSheet>
    </>
  );
}
