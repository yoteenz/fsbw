import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

const PRIMARY_TOOLS = [
  { id: 'arch', label: 'ARCH', fullLabel: 'ARCHITECTURAL TOOLS', icon: '◎' },
  { id: 'materials', label: 'MATERIALS', fullLabel: 'MATERIAL LIBRARY', icon: '◉' },
  { id: 'lighting', label: 'LIGHTING', fullLabel: 'LIGHTING STUDIO', icon: '☀' },
] as const;

const SECONDARY_TOOLS = [
  { id: 'camera', label: 'CAMERA', fullLabel: 'CAMERA STUDIO', icon: '▣' },
  { id: 'budget', label: 'BUDGET', fullLabel: 'BUDGET FORECAST', icon: '▥' },
  { id: 'permit', label: 'PERMIT', fullLabel: 'PERMIT CENTER', icon: '⬡' },
] as const;

type Props = {
  isCompact?: boolean;
  onMoreOpen?: () => void;
};

/** Experience Lab workbench tool tray — horizontal scroll on compact layouts. */
export function ExperienceLabWorkbenchDock({ isCompact, onMoreOpen }: Props) {
  if (isCompact) {
    return (
      <nav
        className="elab-wb-dock elab-wb-dock--compact-tray"
        {...{ [ELAB_V2_COMPOSITION.workbenchDock]: '' }}
        aria-label="Experience Lab workbench tools"
      >
        <div className="elab-wb-dock__scroll">
          {PRIMARY_TOOLS.map((tool) => (
            <button key={tool.id} type="button" className="elab-wb-dock__tool elab-wb-dock__tool--compact">
              <span className="elab-wb-dock__icon" aria-hidden>{tool.icon}</span>
              <span className="elab-wb-dock__label">{tool.label}</span>
            </button>
          ))}
          <button type="button" className="elab-wb-dock__tool elab-wb-dock__tool--more" onClick={onMoreOpen}>
            <span className="elab-wb-dock__icon" aria-hidden>+</span>
            <span className="elab-wb-dock__label">MORE</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="elab-wb-dock" {...{ [ELAB_V2_COMPOSITION.workbenchDock]: '' }} aria-label="Experience Lab workbench tools">
      {[...PRIMARY_TOOLS, ...SECONDARY_TOOLS].map((tool) => (
        <button key={tool.id} type="button" className="elab-wb-dock__tool">
          <span className="elab-wb-dock__icon" aria-hidden>{tool.icon}</span>
          <span className="elab-wb-dock__label">{tool.fullLabel}</span>
        </button>
      ))}
    </nav>
  );
}
