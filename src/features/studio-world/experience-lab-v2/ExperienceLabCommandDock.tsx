import { useState } from 'react';
import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import {
  commandDockStatusClass,
  formatCommandDockApprovalStatus,
  formatCommandDockPermitStatus,
  resolveExperienceLabCommandDockLogoUrl,
} from './experience-lab-v2-command-dock-locations';
import { ExperienceLabSheet } from './ExperienceLabSheet';
import { ExperienceLabIcon } from '../icons/ExperienceLabIcon';
import { ProgramSelector } from './command-dock/ProgramSelector';
import { PipelineSelectorRow } from './command-dock/PipelineSelectorRow';
import { ActiveContextBreadcrumb } from './command-dock/ActiveContextBreadcrumb';

type Props = {
  model: ExperienceLabV2ViewModel;
  onStatusOpen?: () => void;
  onSearch?: () => void;
};

/** Command Dock — program · pipeline scope · breadcrumb · status (no duplicate department nav). */
export function ExperienceLabCommandDock({ model, onStatusOpen, onSearch }: Props) {
  const [statusOpen, setStatusOpen] = useState(false);

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
            <button type="button" className="elab-cmd__icon-btn" aria-label="SEARCH" onClick={onSearch}>
              <ExperienceLabIcon name="zoomIn" size="sm" decorative />
            </button>
            <button type="button" className="elab-cmd__icon-btn elab-cmd__icon-btn--badge" aria-label="ALERTS">
              <ExperienceLabIcon name="notifications" size="sm" decorative />
              <span className="elab-cmd__badge-count">3</span>
            </button>
            <button type="button" className="elab-cmd__avatar" aria-label="CLIENT ACCOUNT">
              <ExperienceLabIcon name="users" size="sm" decorative />
            </button>
          </div>
        </div>

        <div className="elab-cmd__row elab-cmd__row--programs">
          <ProgramSelector />
        </div>

        <div className="elab-cmd__row elab-cmd__row--pipeline">
          <PipelineSelectorRow />
        </div>

        <div className="elab-cmd__row elab-cmd__row--breadcrumb">
          <ActiveContextBreadcrumb />
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
          <button type="button" className="elab-cmd__overflow" aria-label="MORE STATUS OPTIONS" onClick={openStatus}>
            <span className="elab-cmd__overflow-dots" aria-hidden>…</span>
          </button>
        </div>
      </header>

      <ExperienceLabSheet open={statusOpen} title="STATUS & METADATA" onClose={() => setStatusOpen(false)}>
        <dl className="elab-sheet-dl">
          <div>
            <dt>STATUS</dt>
            <dd className={commandDockStatusClass(statusLabel)}>{statusLabel}</dd>
          </div>
          <div>
            <dt>PERMIT</dt>
            <dd className={commandDockStatusClass(permitLabel)}>{permitLabel}</dd>
          </div>
          <div>
            <dt>AI COST (EST.)</dt>
            <dd>{costDisplay}</dd>
          </div>
          <div>
            <dt>REVISION</dt>
            <dd>r{model.revision}</dd>
          </div>
        </dl>
      </ExperienceLabSheet>
    </>
  );
}
