import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';

type Props = {
  model: ExperienceLabV2ViewModel;
};

export function ExperienceLabWorkbench({ model }: Props) {
  const fr = model.founderRender;
  return (
    <section className="elab-v2__panel" data-elab-workbench aria-label="Founder review workbench">
      <p style={{ padding: '10px 12px 0', margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--elab-accent)' }}>
        FOUNDER REVIEW WORKBENCH
      </p>
      <div className="elab-v2__workbench">
        <div className="elab-v2__panel" style={{ padding: 10 }}>
          <strong style={{ fontSize: 10 }}>View Angles</strong>
          <p style={{ fontSize: 9, marginTop: 6, color: 'var(--elab-text-muted)' }}>Landscape hero · Portrait hero · Desktop wide · Mobile hero</p>
        </div>
        <div className="elab-v2__panel" style={{ padding: 10 }}>
          <strong style={{ fontSize: 10 }}>Design Brief</strong>
          <p style={{ fontSize: 9, marginTop: 6 }}>{model.charterSummary}</p>
        </div>
        <div className="elab-v2__panel" style={{ padding: 10 }}>
          <strong style={{ fontSize: 10 }}>Founder Review</strong>
          <p style={{ fontSize: 9, marginTop: 6 }}>{fr?.status ?? 'no_preview'} · {fr?.roomDisplayName ?? model.departmentName}</p>
          {fr?.previewArtifactUrl ? (
            <img src={fr.previewArtifactUrl} alt="Founder render thumbnail" style={{ marginTop: 8, maxWidth: '100%', borderRadius: 6, maxHeight: 80, objectFit: 'cover' }} />
          ) : null}
        </div>
        <div className="elab-v2__panel" style={{ padding: 10 }}>
          <strong style={{ fontSize: 10 }}>Revision Timeline</strong>
          <p style={{ fontSize: 9, marginTop: 6 }}>r{model.revision} · {model.approvalStatus}</p>
          {model.isStale ? <p style={{ fontSize: 9, color: '#eb1c24', marginTop: 4 }}>Stale reference warning</p> : null}
        </div>
        <div className="elab-v2__panel" style={{ padding: 10 }}>
          <strong style={{ fontSize: 10 }}>Diagnostics / Cost</strong>
          <p style={{ fontSize: 9, marginTop: 6 }}>{model.costEstimate} · {fr?.modelRoute ?? '—'}</p>
        </div>
      </div>
    </section>
  );
}
