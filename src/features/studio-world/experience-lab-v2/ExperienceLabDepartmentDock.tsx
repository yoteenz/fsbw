import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

const DEPT_ITEMS = [
  { id: 'elab', label: 'EXPERIENCE LAB', icon: '🏛', active: true },
  { id: 'world', label: 'STUDIO WORLD', icon: '🌐' },
  { id: 'assets', label: 'ASSET REFERENCE', icon: '▣' },
  { id: 'command', label: 'COMMAND CENTER', icon: '🏢' },
] as const;

/** Global Studio World department dock — persistent bottom navigation. */
export function ExperienceLabDepartmentDock() {
  return (
    <nav className="elab-dept-dock" {...{ [ELAB_V2_COMPOSITION.departmentDock]: '' }} aria-label="Studio World department dock">
      <div className="elab-dept-dock__left">
        {DEPT_ITEMS.slice(0, 2).map((item) => (
          <button key={item.id} type="button" className={`elab-dept-dock__item${'active' in item && item.active ? ' elab-dept-dock__item--active' : ''}`}>
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div className="elab-dept-dock__center" aria-hidden>
        <span className="elab-dept-dock__hex">FS</span>
      </div>
      <div className="elab-dept-dock__right">
        {DEPT_ITEMS.slice(2).map((item) => (
          <button key={item.id} type="button" className="elab-dept-dock__item">
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
