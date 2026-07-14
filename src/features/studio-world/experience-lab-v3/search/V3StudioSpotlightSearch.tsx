import { useState } from 'react';
import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';

/** Global Spotlight search — departments, packages, work orders, etc. */
export function V3StudioSpotlightSearch() {
  const { state, dispatch, searchSpotlight } = useExperienceLabV3Store();
  const [query, setQuery] = useState('');
  const results = searchSpotlight(query);

  if (!state.spotlightOpen) return null;

  return (
    <div className="elab-v3-spotlight" data-elab-v3-spotlight role="dialog" aria-label="Studio search">
      <div className="elab-v3-spotlight__backdrop" onClick={() => dispatch({ type: 'SET_SPOTLIGHT', open: false })} />
      <div className="elab-v3-spotlight__panel">
        <input
          autoFocus
          className="elab-v3-spotlight__input"
          placeholder="Search departments, packages, work orders, blueprints…"
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
