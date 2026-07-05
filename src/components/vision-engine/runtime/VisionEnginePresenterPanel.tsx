import { useState } from 'react';
import type { VisionStop } from '../../../studio-os-core/vision-engine/types';

type Props = { stop: VisionStop };

export function VisionEnginePresenterPanel({ stop }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const p = stop.presenter;

  return (
    <aside className={`vision-engine-presenter ${collapsed ? 'is-collapsed' : ''}`}>
      <button type="button" className="vision-engine-presenter__toggle" onClick={() => setCollapsed((c) => !c)}>
        {collapsed ? 'PRESENTER NOTES' : '−'}
      </button>
      {!collapsed ? (
        <div className="vision-engine-presenter__body">
          <p className="vision-engine-presenter__label">NARRATION · ~30 SEC</p>
          <p className="vision-engine-presenter__voiceover">{p.voiceover}</p>
          <dl className="vision-engine-presenter__meta">
            <div>
              <dt>WHY THIS ROOM EXISTS</dt>
              <dd>{p.whyExists}</dd>
            </div>
            <div>
              <dt>PROBLEM SOLVED</dt>
              <dd>{p.problemSolved}</dd>
            </div>
            <div>
              <dt>EMOTIONAL RESPONSE</dt>
              <dd>{p.emotionalResponse}</dd>
            </div>
            <div>
              <dt>DESIGN PHILOSOPHY</dt>
              <dd>{p.designPhilosophy}</dd>
            </div>
            <div>
              <dt>CUSTOMER JOURNEY</dt>
              <dd>{p.customerJourney}</dd>
            </div>
            <div>
              <dt>FUTURE EXPANSION</dt>
              <dd>{p.futureExpansion}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </aside>
  );
}
