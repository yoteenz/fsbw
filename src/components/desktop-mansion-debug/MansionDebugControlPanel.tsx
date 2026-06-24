import { useState } from 'react';
import {
  MANSION_DEBUG_FILTER_GROUP_LABELS,
  MANSION_DEBUG_FILTER_GROUPS,
  MANSION_DEBUG_PAGE_FILTER_OPTIONS,
} from '../../utils/desktopMansionDebug';
import type { MansionDebugDisplayMode } from '../../types/desktopMansionDebug';
import { DESKTOP_DEBUG_REGISTRY } from '../../constants/desktopDebugRegistry';
import { useMansionDebug } from './MansionDebugProvider';

const DISPLAY_MODE_OPTIONS: { id: MansionDebugDisplayMode; label: string }[] = [
  { id: 'full', label: 'Full' },
  { id: 'labels', label: 'Labels' },
  { id: 'boundaries', label: 'Bounds' },
];

export function MansionDebugControlPanel() {
  const debug = useMansionDebug();
  const [savedFlash, setSavedFlash] = useState(false);
  const [exportedFlash, setExportedFlash] = useState(false);

  if (!debug?.available) return null;

  const pageRegions = DESKTOP_DEBUG_REGISTRY.filter(
    (region) =>
      region.page === debug.viewport?.page &&
      (!region.pageZone || region.pageZone === debug.viewport?.pageZone),
  );

  return (
    <div className={`mansion-debug-panel${debug.enabled ? ' mansion-debug-panel--active' : ''}`}>
      <header className="mansion-debug-panel__header">
        <strong>Mansion Debug</strong>
        <button type="button" className="mansion-debug-panel__toggle" onClick={debug.toggleEnabled}>
          {debug.enabled ? 'ON (D)' : 'OFF (D)'}
        </button>
      </header>

      <p className="mansion-debug-panel__page">
        Current Page: <span>{debug.viewport?.pageLabel ?? '—'}</span>
      </p>

      {debug.enabled ? (
        <div className="mansion-debug-panel__section mansion-debug-panel__actions">
          <p className="mansion-debug-panel__section-title">Layout</p>
          <div className="mansion-debug-panel__action-row">
            <button
              type="button"
              className={
                debug.editMode
                  ? 'mansion-debug-panel__action mansion-debug-panel__action--active'
                  : 'mansion-debug-panel__action'
              }
              onClick={debug.toggleEditMode}
            >
              {debug.editMode ? 'Editing…' : 'Edit panels'}
            </button>
            <button
              type="button"
              className="mansion-debug-panel__action"
              onClick={() => {
                debug.saveLayout();
                setSavedFlash(true);
                window.setTimeout(() => setSavedFlash(false), 1800);
              }}
            >
              {savedFlash ? 'Saved' : 'Save'}
            </button>
            <button
              type="button"
              className="mansion-debug-panel__action"
              onClick={async () => {
                const ok = await debug.exportLayout();
                if (ok) {
                  setExportedFlash(true);
                  window.setTimeout(() => setExportedFlash(false), 1800);
                }
              }}
            >
              {exportedFlash ? 'Copied' : 'Export'}
            </button>
            <button type="button" className="mansion-debug-panel__action" onClick={debug.resetLayout}>
              Reset
            </button>
          </div>
          <p className="mansion-debug-panel__hint">
            Edit → drag panels · Save → browser storage · Export → paste into layout file
          </p>
          {debug.editMode && pageRegions.length > 0 ? (
            <div className="mansion-debug-panel__chips">
              {pageRegions.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  className={
                    debug.selectedRegionId === region.id
                      ? 'mansion-debug-panel__chip mansion-debug-panel__chip--active'
                      : 'mansion-debug-panel__chip'
                  }
                  onClick={() => debug.selectRegion(region.id)}
                >
                  {region.label.replace(/ Panel$/i, '')}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mansion-debug-panel__section">
        <p className="mansion-debug-panel__section-title">Show</p>
        <div className="mansion-debug-panel__chips">
          {MANSION_DEBUG_PAGE_FILTER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={
                debug.pageFilter === option.id
                  ? 'mansion-debug-panel__chip mansion-debug-panel__chip--active'
                  : 'mansion-debug-panel__chip'
              }
              onClick={() => debug.setPageFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mansion-debug-panel__section">
        <p className="mansion-debug-panel__section-title">Display</p>
        <div className="mansion-debug-panel__chips">
          {DISPLAY_MODE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={
                debug.displayMode === option.id
                  ? 'mansion-debug-panel__chip mansion-debug-panel__chip--active'
                  : 'mansion-debug-panel__chip'
              }
              onClick={() => debug.setDisplayMode(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mansion-debug-panel__hint">D toggle · Shift+D labels · Ctrl+D bounds · tap ON/OFF on phone</p>
      </div>

      <div className="mansion-debug-panel__section mansion-debug-panel__checks">
        {MANSION_DEBUG_FILTER_GROUPS.map((group) => (
          <label key={group} className="mansion-debug-panel__check">
            <input
              type="checkbox"
              checked={debug.filters[group]}
              onChange={(event) => debug.setFilterGroup(group, event.target.checked)}
            />
            <span>{MANSION_DEBUG_FILTER_GROUP_LABELS[group]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
