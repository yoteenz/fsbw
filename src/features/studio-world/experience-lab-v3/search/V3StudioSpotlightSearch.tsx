import { useMemo, useState } from 'react';
import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';

/** Global Spotlight search — departments, packages, work orders, workspaces. */
export function V3StudioSpotlightSearch() {
  const { state, dispatch } = useExperienceLabV3Store();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const hits: Array<{ id: string; kind: string; title: string; subtitle: string }> = [];
    for (const wo of state.workOrders) {
      if (wo.title.toLowerCase().includes(q)) {
        hits.push({ id: wo.id, kind: 'work-order', title: wo.title, subtitle: wo.status });
      }
    }
    if (state.workspace.departmentLabel.toLowerCase().includes(q)) {
      hits.push({
        id: state.workspace.departmentId,
        kind: 'department',
        title: state.workspace.departmentLabel,
        subtitle: 'Department',
      });
    }
    if (state.activePackage?.packageId.toLowerCase().includes(q)) {
      hits.push({
        id: state.activePackage.packageId,
        kind: 'package',
        title: state.activePackage.packageId,
        subtitle: `Revision R${state.activePackage.revision}`,
      });
    }
    return hits.slice(0, 12);
  }, [query, state.workOrders, state.workspace, state.activePackage]);

  if (!state.spotlightOpen) return null;

  return (
    <div className="elab-v3-spotlight" data-elab-v3-spotlight role="dialog" aria-label="Studio search">
      <div className="elab-v3-spotlight__backdrop" onClick={() => dispatch({ type: 'SET_SPOTLIGHT', open: false })} />
      <div className="elab-v3-spotlight__panel">
        <input
          autoFocus
          className="elab-v3-spotlight__input"
          placeholder="Search departments, packages, work orders, workspaces…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="elab-v3-spotlight__results">
          {results.map((r) => (
            <li key={`${r.kind}-${r.id}`}>
              <button type="button" className="elab-v3-spotlight__result">
                <span className="elab-v3-spotlight__kind">{r.kind}</span>
                <span className="elab-v3-spotlight__title">{r.title}</span>
                <span className="elab-v3-spotlight__sub">{r.subtitle}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
