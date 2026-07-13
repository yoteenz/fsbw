import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

const TOOLS = [
  { id: 'arch', label: 'ARCH', fullLabel: 'ARCHITECTURAL TOOLS', icon: '◎' },
  { id: 'materials', label: 'MATERIALS', fullLabel: 'MATERIAL LIBRARY', icon: '◉' },
  { id: 'lighting', label: 'LIGHTING', fullLabel: 'LIGHTING STUDIO', icon: '☀' },
  { id: 'camera', label: 'CAMERA', fullLabel: 'CAMERA STUDIO', icon: '▣' },
  { id: 'budget', label: 'BUDGET', fullLabel: 'BUDGET FORECAST', icon: '▥' },
  { id: 'permit', label: 'PERMIT', fullLabel: 'PERMIT CENTER', icon: '⬡' },
] as const;

type Props = {
  onMoreOpen?: () => void;
};

/** Application tool bar — attached workstation controls (desktop + mobile parity). */
export function ExperienceLabWorkbenchDock({ onMoreOpen }: Props) {
  return (
    <nav className="elab-wb-dock elab-wb-dock--pro" {...{ [ELAB_V2_COMPOSITION.workbenchDock]: '' }} aria-label="Experience Lab tools">
      <div className="elab-wb-dock__bar">
        {TOOLS.map((tool) => (
          <button key={tool.id} type="button" className="elab-wb-dock__tool" title={tool.fullLabel}>
            <span className="elab-wb-dock__icon" aria-hidden>{tool.icon}</span>
            <span className="elab-wb-dock__label">{tool.label}</span>
          </button>
        ))}
        {onMoreOpen ? (
          <button type="button" className="elab-wb-dock__tool elab-wb-dock__tool--more" onClick={onMoreOpen} title="More tools">
            <span className="elab-wb-dock__icon" aria-hidden>+</span>
            <span className="elab-wb-dock__label">MORE</span>
          </button>
        ) : null}
      </div>
    </nav>
  );
}
