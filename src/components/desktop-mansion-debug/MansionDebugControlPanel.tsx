import { useEffect, useRef, useState } from 'react';
import {
  MANSION_DEBUG_FILTER_GROUP_LABELS,
  MANSION_DEBUG_FILTER_GROUPS,
  MANSION_DEBUG_PAGE_FILTER_OPTIONS,
} from '../../utils/desktopMansionDebug';
import type { MansionDebugDisplayMode } from '../../types/desktopMansionDebug';
import { DESKTOP_DEBUG_REGISTRY } from '../../constants/desktopDebugRegistry';
import { useMansionDebug } from './MansionDebugProvider';
import { useMansionDebugPanelDrag } from './useMansionDebugPanelDrag';

const DISPLAY_MODE_OPTIONS: { id: MansionDebugDisplayMode; label: string }[] = [
  { id: 'full', label: 'Full' },
  { id: 'labels', label: 'Labels' },
  { id: 'boundaries', label: 'Bounds' },
];

const PAGE_FILTER_SHORT: Record<string, string> = {
  all: 'All',
  lobby: 'Lobby',
  gallery: 'Gallery',
  penthouse: 'PH',
  concierge: 'Con',
};

const FILTER_SHORT: Partial<Record<(typeof MANSION_DEBUG_FILTER_GROUPS)[number], string>> = {
  'membership-panels': 'Member',
  'economy-panels': 'Economy',
  'directory-panels': 'Dir',
  'welcome-panels': 'Welcome',
  'house-information-panels': 'Info',
  'elevator-areas': 'Elev',
  'room-hotspots': 'Rooms',
  'navigation-areas': 'Nav',
};

export function MansionDebugControlPanel() {
  const debug = useMansionDebug();
  const panelRef = useRef<HTMLDivElement>(null);
  const { isDraggable, dragging, panelStyle, onDragHandlePointerDown } = useMansionDebugPanelDrag(panelRef);
  const [savedFlash, setSavedFlash] = useState(false);
  const [exportedFlash, setExportedFlash] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (debug?.editMode) setExpanded(false);
  }, [debug?.editMode]);

  if (!debug?.available) return null;

  const pageRegions = DESKTOP_DEBUG_REGISTRY.filter(
    (region) =>
      region.page === debug.viewport?.page &&
      (!region.pageZone || region.pageZone === debug.viewport?.pageZone),
  );

  const panelClass = [
    'mansion-debug-panel',
    debug.enabled ? 'mansion-debug-panel--active' : '',
    debug.editMode ? 'mansion-debug-panel--editing' : '',
    expanded ? 'mansion-debug-panel--expanded' : 'mansion-debug-panel--collapsed',
    isDraggable ? 'mansion-debug-panel--draggable' : '',
    dragging ? 'mansion-debug-panel--dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={panelRef} className={panelClass} style={panelStyle}>
      <header className="mansion-debug-panel__header">
        {isDraggable ? (
          <div
            className="mansion-debug-panel__drag-handle"
            onPointerDown={onDragHandlePointerDown}
            aria-label="Drag debug panel"
            title="Drag to move"
          >
            <span aria-hidden>⋮⋮</span>
          </div>
        ) : null}
        <button
          type="button"
          className="mansion-debug-panel__title-btn"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          <strong>Debug</strong>
          <span className="mansion-debug-panel__page-inline">{debug.viewport?.pageLabel ?? '—'}</span>
          <span className="mansion-debug-panel__chevron" aria-hidden>
            {expanded ? '▲' : '▼'}
          </span>
        </button>
        <button type="button" className="mansion-debug-panel__toggle" onClick={debug.toggleEnabled}>
          {debug.enabled ? 'ON' : 'OFF'}
        </button>
      </header>

      {debug.enabled ? (
        <div className="mansion-debug-panel__toolbar">
          <button
            type="button"
            className={
              debug.editMode
                ? 'mansion-debug-panel__action mansion-debug-panel__action--active'
                : 'mansion-debug-panel__action'
            }
            onClick={debug.toggleEditMode}
          >
            {debug.editMode ? 'Editing' : 'Edit'}
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
            {savedFlash ? '✓' : 'Save'}
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
            {exportedFlash ? '✓' : 'Copy'}
          </button>
          <button type="button" className="mansion-debug-panel__action" onClick={debug.resetLayout}>
            Reset
          </button>
        </div>
      ) : null}

      {expanded ? (
        <div className="mansion-debug-panel__body">
          {debug.enabled && debug.editMode && pageRegions.length > 0 ? (
            <div className="mansion-debug-panel__section mansion-debug-panel__section--tight">
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
                    {region.label.replace(/ Panel$/i, '').replace(/^Welcome to the /i, '')}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mansion-debug-panel__section mansion-debug-panel__section--tight">
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
                  {PAGE_FILTER_SHORT[option.id] ?? option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mansion-debug-panel__section mansion-debug-panel__section--tight">
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
          </div>

          <div className="mansion-debug-panel__section mansion-debug-panel__checks">
            {MANSION_DEBUG_FILTER_GROUPS.map((group) => (
              <label key={group} className="mansion-debug-panel__check">
                <input
                  type="checkbox"
                  checked={debug.filters[group]}
                  onChange={(event) => debug.setFilterGroup(group, event.target.checked)}
                />
                <span>{FILTER_SHORT[group] ?? MANSION_DEBUG_FILTER_GROUP_LABELS[group]}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
