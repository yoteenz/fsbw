import { computeFactoryReadiness } from '../../../../utils/adminStudioBlueprintManagerCompute';
import type { BlueprintDefinition } from '../../../../utils/adminStudioBlueprintManagerDemo';
import { BP_VISUAL, bpCaption, bpGrace, bpPanelStyle, bpSectionTitle } from './blueprintManagerTheme';

type BlueprintReadinessPanelProps = {
  blueprint: BlueprintDefinition;
};

export function BlueprintReadinessPanel({ blueprint }: BlueprintReadinessPanelProps) {
  const { dimensions, overall, eligible } = computeFactoryReadiness(blueprint);

  return (
    <section style={{ ...bpPanelStyle, padding: '12px' }}>
      <p style={bpSectionTitle}>FACTORY READINESS</p>
      <p style={{ ...bpGrace, fontSize: '24px', color: BP_VISUAL.red }}>{overall}%</p>
      <p style={bpCaption}>
        {eligible ? 'ELIGIBLE FOR ASSET FACTORY (APPROVED + READY)' : 'NOT YET ELIGIBLE — SPECIFICATION ONLY · NO GENERATION'}
      </p>
      <div className="space-y-2 mt-3">
        {dimensions.map((d) => (
          <div key={d.id}>
            <div className="flex justify-between">
              <p style={{ ...bpCaption, color: BP_VISUAL.black, fontSize: '8px' }}>{d.label}</p>
              <p style={{ ...bpCaption, color: d.complete ? BP_VISUAL.pass : BP_VISUAL.warn }}>{d.score}%</p>
            </div>
            <div className="h-1 w-full mt-1" style={{ background: '#eee' }}>
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${d.score}%`, background: d.complete ? BP_VISUAL.pass : BP_VISUAL.warn }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
