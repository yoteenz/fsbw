import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import type { WorkbenchToolId } from '../experience-lab-v3.types';

const TOOL_COPY: Record<WorkbenchToolId, { title: string; body: string }> = {
  'architectural-tools': { title: 'Architectural Tools', body: 'Spatial DNA, shell specs, and blueprint dependencies.' },
  materials: { title: 'Material Library', body: 'Surface profiles, finishes, and reference swaps.' },
  lighting: { title: 'Lighting', body: 'Key/fill/rim rigs and exposure targets.' },
  construction: { title: 'Construction', body: 'Assembly layers and structural validation.' },
  camera: { title: 'Camera', body: 'Shot framing, focal length, and hero angles.' },
  budget: { title: 'Budget Forecast', body: 'Estimate, actual cost, and cache savings.' },
  permit: { title: 'Permit Center', body: 'Readiness percent, blockers, and approval gates.' },
  packaging: { title: 'Packaging', body: 'Marketplace presentation and listing shells.' },
  pricing: { title: 'Pricing', body: 'Tier economics and revenue projections.' },
  listings: { title: 'Listings', body: 'Catalog entries and publish readiness.' },
  collectibles: { title: 'Collectibles', body: 'Reward artifacts and rarity tiers.' },
  points: { title: 'Points', body: 'Loyalty accrual and redemption rules.' },
  unlockables: { title: 'Unlockables', body: 'Gated content and membership bridges.' },
  workforce: { title: 'Workforce Center', body: 'Scheduler jobs, workers, and retries.' },
};

/** ONE contextual panel — replaces contents on tool change, never stacks. */
export function V3ContextInspectorPanel() {
  const { state } = useExperienceLabV3Store();
  const tool = state.activeWorkbenchTool;
  const copy = tool ? TOOL_COPY[tool] : null;

  return (
    <section className="elab-v3-context-panel" data-elab-v3-context-inspector key={tool ?? 'none'}>
      {copy ? (
        <>
          <h3>{copy.title}</h3>
          <p>{copy.body}</p>
          <dl className="elab-v3-context-panel__meta">
            <div><dt>Package</dt><dd>{state.activePackage?.packageId ?? '—'}</dd></div>
            <div><dt>Department</dt><dd>{state.workspace.departmentLabel}</dd></div>
            <div><dt>Revision</dt><dd>R{state.workspace.revision}</dd></div>
          </dl>
        </>
      ) : (
        <p className="elab-v3-context-panel__empty">Select a workbench tool</p>
      )}
    </section>
  );
}
