import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';

/** Package-centric operational view — every output with status. */
export function V3PackageViewPanel() {
  const { state } = useExperienceLabV3Store();
  const pkg = state.activePackage;
  if (!pkg) return null;

  return (
    <section className="elab-v3-package" data-elab-v3-package-view>
      <header>
        <h2>{pkg.variantLabel}</h2>
        <span>R{pkg.revision} · {pkg.lifecycleStatus}</span>
      </header>
      <ul className="elab-v3-package__outputs">
        {pkg.outputs.map((out) => (
          <li key={out.id} className={`elab-v3-package__out elab-v3-package__out--${out.status}`}>
            <span className="elab-v3-package__out-label">{out.label}</span>
            <span className="elab-v3-package__out-status">{out.status}</span>
            <span className="elab-v3-package__out-progress">{out.progress}%</span>
            <span className="elab-v3-package__out-provider">{out.provider}</span>
            <span className="elab-v3-package__out-credits">{out.credits} cr</span>
            {out.cached && <span className="elab-v3-package__out-cache">cached</span>}
            {out.derivedFrom && <span className="elab-v3-package__out-derived">← {out.derivedFrom}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
