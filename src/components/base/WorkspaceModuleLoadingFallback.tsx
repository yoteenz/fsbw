/** Centered lazy-module loading state for Studio OS workspace routes. */
export default function WorkspaceModuleLoadingFallback() {
  return (
    <div
      className="workspace-module-loading"
      role="status"
      aria-live="polite"
      aria-label="Loading workspace module"
    >
      <div className="workspace-module-loading__content">
        <p className="workspace-module-loading__label">LOADING WORKSPACE MODULE…</p>
        <div className="workspace-module-loading__bar" aria-hidden="true">
          <div className="workspace-module-loading__bar-fill" />
        </div>
      </div>
    </div>
  );
}
