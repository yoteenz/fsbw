import { useState } from 'react';
import type { GuidedTourStop } from './types';

type Props = { stop: GuidedTourStop };

/** Presenter panel — only rendered when Creative Partner mode is on. */
export function GuidedTourPresenterPanel({ stop }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const p = stop.presenter;

  return (
    <aside className={`guided-tour-presenter ${collapsed ? 'is-collapsed' : ''}`}>
      <button type="button" className="guided-tour-presenter__toggle" onClick={() => setCollapsed((c) => !c)}>
        {collapsed ? 'Presenter Notes' : '−'}
      </button>
      {!collapsed ? (
        <div className="guided-tour-presenter__body">
          <p className="guided-tour-presenter__label">VOICEOVER · ~30 SEC</p>
          <p className="guided-tour-presenter__voiceover">{p.voiceover}</p>
          <dl className="guided-tour-presenter__meta">
            <div>
              <dt>Why this room exists</dt>
              <dd>{p.whyExists}</dd>
            </div>
            <div>
              <dt>Problem solved</dt>
              <dd>{p.problemSolved}</dd>
            </div>
            <div>
              <dt>Emotional response</dt>
              <dd>{p.emotionalResponse}</dd>
            </div>
            <div>
              <dt>Design philosophy</dt>
              <dd>{p.designPhilosophy}</dd>
            </div>
            <div>
              <dt>Customer journey</dt>
              <dd>{p.customerJourney}</dd>
            </div>
            <div>
              <dt>Future expansion</dt>
              <dd>{p.futureExpansion}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </aside>
  );
}
