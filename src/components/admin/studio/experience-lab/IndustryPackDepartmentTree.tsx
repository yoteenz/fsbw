import type { IndustryPack } from '../../../../studio-os-core/industry-packs';
import type { HeadquartersGenerationPlan } from '../../../../studio-os-core/industry-packs/contract';

const sectionStyle = {
  padding: '16px',
  borderBottom: '1px solid #e5e7eb',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '12px',
};

type Props = {
  pack: IndustryPack;
  plan: HeadquartersGenerationPlan | null;
};

/** Hierarchical department tree from selected Industry Pack. */
export function IndustryPackDepartmentTree({ pack, plan }: Props) {
  return (
    <section style={sectionStyle} data-industry-pack-tree>
      <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', color: '#64748b' }}>
        DEPARTMENT TREE — {pack.name}
      </p>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
        {pack.defaultDepartments.map((slot) => {
          const deptPlan = plan?.departments.find((d) => d.slotId === slot.slotId);
          const reuse = deptPlan?.reuse.action === 'reuse' ? '♻ shared' : '⚡ generate';
          return (
            <li key={slot.slotId}>
              <strong>{slot.displayName}</strong>
              <span style={{ color: '#64748b', fontSize: '10px' }}>
                {' '}
                · {slot.templateId} {slot.pinnedVersion} · {reuse}
              </span>
            </li>
          );
        })}
      </ul>
      {plan ? (
        <p style={{ margin: '12px 0 0', fontSize: '10px', color: '#64748b' }}>
          Reuse {plan.estimatedReusedDepartments} · Generate {plan.estimatedNewGenerations} · Pack {pack.packId}
        </p>
      ) : null}
    </section>
  );
}
