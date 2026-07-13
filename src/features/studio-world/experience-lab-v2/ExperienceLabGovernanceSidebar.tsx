import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

type Props = {
  model: ExperienceLabV2ViewModel;
  embedded?: boolean;
};

/** Desktop right governance stack — scene overview, performance, permits, immune. */
export function ExperienceLabGovernanceSidebar({ model, embedded }: Props) {
  const Tag = embedded ? 'div' : 'aside';
  return (
    <Tag className={`elab-governance${embedded ? ' elab-governance--embedded' : ''}`} {...(embedded ? {} : { [ELAB_V2_COMPOSITION.governanceSidebar]: '' })} aria-label="Scene governance">
      <section className="elab-gov-panel">
        <p className="elab-side__heading">SCENE OVERVIEW</p>
        <dl className="elab-gov-dl">
          <div><dt>Department</dt><dd>FS-REC-001</dd></div>
          <div><dt>Parent</dt><dd>Ground Floor</dd></div>
          <div><dt>Designer</dt><dd>Experience Lab AI</dd></div>
          <div><dt>Revision</dt><dd>r{model.revision}</dd></div>
          <div><dt>Founder</dt><dd className="elab-status--ok">{model.approvalStatus.toUpperCase()}</dd></div>
        </dl>
      </section>
      <section className="elab-gov-panel">
        <p className="elab-side__heading">PERFORMANCE IMPACT</p>
        <dl className="elab-gov-dl">
          <div><dt>AI Cost</dt><dd>{model.costEstimate}</dd></div>
          <div><dt>GPU Time</dt><dd>2m 18s</dd></div>
          <div><dt>Storage</dt><dd>1.24 GB</dd></div>
          <div><dt>Complexity</dt><dd>MEDIUM</dd></div>
        </dl>
      </section>
      <section className="elab-gov-panel">
        <p className="elab-side__heading">PERMITS & APPROVALS</p>
        <ul className="elab-gov-checklist">
          <li className="elab-status--ok">Building Permit ✓</li>
          <li className="elab-status--ok">Zoning ✓</li>
          <li className="elab-status--ok">Safety ✓</li>
          <li className="elab-status--warn">Occupancy · PENDING</li>
        </ul>
      </section>
      <section className="elab-gov-panel elab-gov-panel--immune">
        <p className="elab-side__heading">IMMUNE SYSTEM</p>
        <p className="elab-status--ok">⬡ No issues detected</p>
      </section>
    </Tag>
  );
}
