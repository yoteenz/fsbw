import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

const TOOLS = [
  { id: 'arch', label: 'ARCHITECTURAL TOOLS', icon: '◎' },
  { id: 'materials', label: 'MATERIAL LIBRARY', icon: '◉' },
  { id: 'lighting', label: 'LIGHTING STUDIO', icon: '☀' },
  { id: 'camera', label: 'CAMERA STUDIO', icon: '▣' },
  { id: 'budget', label: 'BUDGET FORECAST', icon: '▥' },
  { id: 'permit', label: 'PERMIT CENTER', icon: '⬡' },
] as const;

type Props = {
  isMobile?: boolean;
};

/** Experience Lab workbench tool tray — separate from department dock. */
export function ExperienceLabWorkbenchDock({ isMobile }: Props) {
  return (
    <nav
      className={`elab-wb-dock${isMobile ? ' elab-wb-dock--mobile' : ''}`}
      {...{ [ELAB_V2_COMPOSITION.workbenchDock]: '' }}
      aria-label="Experience Lab workbench tools"
    >
      {TOOLS.map((tool) => (
        <button key={tool.id} type="button" className="elab-wb-dock__tool">
          <span className="elab-wb-dock__icon" aria-hidden>{tool.icon}</span>
          <span className="elab-wb-dock__label">{tool.label}</span>
        </button>
      ))}
    </nav>
  );
}
