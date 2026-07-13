import { REGISTRY_TREE, ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

type Props = {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
};

/** Desktop left registry tree — Studio World hierarchy. */
export function ExperienceLabRegistrySidebar({ searchQuery = '', onSearchChange }: Props) {
  return (
    <aside className="elab-registry" {...{ [ELAB_V2_COMPOSITION.registrySidebar]: '' }} aria-label="Studio World Registry">
      <p className="elab-side__heading">STUDIO WORLD REGISTRY</p>
      <input
        type="search"
        className="elab-registry__search"
        placeholder="Search scenes, departments, rooms…"
        value={searchQuery}
        onChange={(e) => onSearchChange?.(e.target.value)}
        aria-label="Search registry"
      />
      <div className="elab-registry__tree">
        {REGISTRY_TREE.map((group) => (
          <div key={group.id} className="elab-registry__group">
            <p className="elab-registry__group-label">{group.label}</p>
            {group.children.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`elab-registry__item${'active' in item && item.active ? ' elab-registry__item--active' : ''}`}
              >
                <span className="elab-registry__dot" />
                {item.label}
                <span className="elab-registry__rev">REV {item.revision}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="elab-registry__city-status">
        <p className="elab-side__heading">CITY STATUS</p>
        <p><span className="elab-status--ok">HEALTHY</span> · Permits 3 · Depts 24/24</p>
        <p>Budget <strong>12,450.75</strong></p>
      </div>
    </aside>
  );
}
