import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

const DEPT_ITEMS = [
  { id: 'elab', label: 'EXPERIENCE LAB', short: 'ELAB', icon: '🏛', active: true },
  { id: 'world', label: 'STUDIO WORLD', short: 'WORLD', icon: '🌐' },
  { id: 'assets', label: 'ASSET REFERENCE', short: 'ASSETS', icon: '▣' },
  { id: 'command', label: 'COMMAND CENTER', short: 'CMD', icon: '🏢' },
] as const;

type Props = {
  onGovernanceOpen?: () => void;
  isCompact?: boolean;
};

/** Global Studio World department dock — fixed bottom navigation. */
export function ExperienceLabDepartmentDock({ onGovernanceOpen, isCompact }: Props) {
  return (
    <nav className={`elab-dept-dock${isCompact ? ' elab-dept-dock--compact' : ''}`} {...{ [ELAB_V2_COMPOSITION.departmentDock]: '' }} aria-label="Studio World department dock">
      <div className="elab-dept-dock__left">
        {DEPT_ITEMS.slice(0, 2).map((item) => (
          <button key={item.id} type="button" className={`elab-dept-dock__item${'active' in item && item.active ? ' elab-dept-dock__item--active' : ''}`}>
            <span aria-hidden>{item.icon}</span>
            {isCompact ? item.short : item.label}
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
            {isCompact ? item.short : item.label}
          </button>
        ))}
        {onGovernanceOpen ? (
          <button type="button" className="elab-dept-dock__item" onClick={onGovernanceOpen} aria-label="Governance">
            <span aria-hidden>⬡</span>
            {isCompact ? 'GOV' : 'GOVERNANCE'}
          </button>
        ) : null}
      </div>
    </nav>
  );
}
