import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';

const TIMELINE = [
  'Queued',
  'Running',
  'Rendered',
  'Validated',
  'Founder Approved',
  'Canonical',
  'Marketplace',
] as const;

/** Visual production timeline — always visible in left rail. */
export function V3ProductionTimelinePanel() {
  const { state } = useExperienceLabV3Store();
  const activeIdx = Math.min(
    TIMELINE.length - 1,
    Math.floor(state.workspace.revision / 4)
  );

  return (
    <section className="elab-v3-timeline" data-elab-v3-production-timeline>
      {TIMELINE.map((label, i) => (
        <div key={label} className="elab-v3-timeline__node-wrap">
          {i > 0 && <span className="elab-v3-timeline__line" aria-hidden />}
          <div className={`elab-v3-timeline__node${i <= activeIdx ? ' is-complete' : ''}${i === activeIdx ? ' is-active' : ''}`}>
            <span>{label}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
