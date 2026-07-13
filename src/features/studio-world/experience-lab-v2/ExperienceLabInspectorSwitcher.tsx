import { INSPECTOR_PANELS, type InspectorPanelId } from './experience-lab-v2-panel-orchestrator';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

type Props = {
  activeInspector: InspectorPanelId;
  open: boolean;
  onToggle: () => void;
  onSelect: (id: InspectorPanelId) => void;
  compact?: boolean;
};

/** Compact viewport chrome control — one active inspector, tap for picker. */
export function ExperienceLabInspectorSwitcher({ activeInspector, open, onToggle, onSelect, compact }: Props) {
  const active = INSPECTOR_PANELS.find((p) => p.id === activeInspector);

  return (
    <div
      className={`elab-inspector-switcher${compact ? ' elab-inspector-switcher--compact' : ''}`}
      {...{ [ELAB_V2_COMPOSITION.inspectorSwitcher]: '' }}
    >
      <button
        type="button"
        className="elab-inspector-switcher__trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Inspector: ${active?.label ?? 'Blueprint'}. Open inspector picker`}
        onClick={onToggle}
      >
        <span className="elab-inspector-switcher__label">{active?.shortLabel ?? 'BP'}</span>
        <span className="elab-inspector-switcher__name">{active?.label ?? 'Blueprint'}</span>
        <span className="elab-inspector-switcher__chev" aria-hidden>{open ? '⌃' : '⌄'}</span>
      </button>

      {open ? (
        <div className="elab-inspector-switcher__picker" role="listbox" aria-label="Select inspector">
          {INSPECTOR_PANELS.map((panel) => (
            <button
              key={panel.id}
              type="button"
              role="option"
              aria-selected={panel.id === activeInspector}
              className={`elab-inspector-switcher__option${panel.id === activeInspector ? ' elab-inspector-switcher__option--active' : ''}`}
              onClick={() => onSelect(panel.id)}
            >
              <span className="elab-inspector-switcher__option-label">{panel.shortLabel}</span>
              <span>{panel.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
