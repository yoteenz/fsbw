import { useMemo, useState } from 'react';
import {
  studioWorldIconStateEngine,
  STUDIO_WORLD_ICON_STATES,
  STUDIO_WORLD_ICON_THEMES,
  type StudioWorldIconProceduralState,
  type StudioWorldIconTheme,
} from '../../../../studio-os-core/icon-state-engine';
import { StudioWorldIconProvider, useStudioWorldIconSystem } from '../StudioWorldIconProvider';
import { StudioIcon } from './StudioIcon';
import './icon-state-qa.css';

const MATRIX_SIZES = [24, 32] as const;

function MatrixBody() {
  const { manifest } = useStudioWorldIconSystem();
  const allIconIds = useMemo(
    () => manifest?.icons?.map((i) => i.id) ?? ['search', 'blueprint', 'camera'],
    [manifest]
  );

  const [selectedIcons, setSelectedIcons] = useState<string[]>(allIconIds.slice(0, 3));
  const [filterState, setFilterState] = useState<StudioWorldIconProceduralState | 'all'>('all');
  const [filterTheme, setFilterTheme] = useState<StudioWorldIconTheme | 'all'>('all');
  const [matrixSize, setMatrixSize] = useState<number>(24);

  const matrix = useMemo(
    () =>
      studioWorldIconStateEngine.buildStateMatrix(selectedIcons, {
        states: filterState === 'all' ? STUDIO_WORLD_ICON_STATES : [filterState],
        themes: filterTheme === 'all' ? STUDIO_WORLD_ICON_THEMES : [filterTheme],
        sizes: [matrixSize],
        animated: false,
      }),
    [selectedIcons, filterState, filterTheme, matrixSize]
  );

  const toggleIcon = (id: string) => {
    setSelectedIcons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(0, 8)
    );
  };

  return (
    <div className="swi-qa swi-qa--matrix">
      <header className="swi-qa__header">
        <h1>Icon State Matrix</h1>
        <p>Regression previews — every icon × state × theme × size. QA only.</p>
      </header>

      <section className="swi-qa__matrix-filters">
        <label>
          State filter
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value as StudioWorldIconProceduralState | 'all')}
          >
            <option value="all">All states</option>
            {STUDIO_WORLD_ICON_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          Theme filter
          <select
            value={filterTheme}
            onChange={(e) => setFilterTheme(e.target.value as StudioWorldIconTheme | 'all')}
          >
            <option value="all">All themes</option>
            {STUDIO_WORLD_ICON_THEMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label>
          Size
          <select value={matrixSize} onChange={(e) => setMatrixSize(Number(e.target.value))}>
            {MATRIX_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}px
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="swi-qa__icon-pick">
        <span>Icons (max 8):</span>
        {allIconIds.slice(0, 20).map((id) => (
          <button
            key={id}
            type="button"
            className={selectedIcons.includes(id) ? 'swi-qa__pick--active' : ''}
            onClick={() => toggleIcon(id)}
          >
            {id}
          </button>
        ))}
      </section>

      <p className="swi-qa__matrix-meta">
        {matrix.cells.length} cells · version {matrix.version}
      </p>

      <div className="swi-qa__matrix-grid">
        {matrix.cells.map((cell) => (
          <div
            key={`${cell.iconId}-${cell.state}-${cell.theme}-${cell.sizePx}`}
            className={`swi-qa__matrix-cell swi-qa__stage--${cell.theme}`}
            title={`${cell.iconId} / ${cell.state} / ${cell.theme}`}
          >
            <StudioIcon
              id={cell.iconId}
              state={cell.state as StudioWorldIconProceduralState}
              theme={cell.theme as StudioWorldIconTheme}
              size={cell.sizePx}
              animated={false}
              decorative
            />
            <span className="swi-qa__matrix-label">{cell.state}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function IconStateMatrixShell() {
  return (
    <StudioWorldIconProvider>
      <MatrixBody />
    </StudioWorldIconProvider>
  );
}
