type Site00LoaderEnvironmentProps = {
  backgroundUrl: string;
  /** Background image decoded and ready to paint. */
  ready?: boolean;
};

/** Approved environment layer — absolute inset 0 inside the 711×1536 artboard. */
export function Site00LoaderEnvironment({ backgroundUrl, ready = false }: Site00LoaderEnvironmentProps) {
  return (
    <div className={`site00-loader-env ${ready ? 'site00-loader-env--ready' : ''}`.trim()} aria-hidden="true">
      <img
        className="site00-loader-env__img"
        src={backgroundUrl}
        alt=""
        decoding="async"
        fetchPriority="high"
        loading="eager"
        draggable={false}
      />
    </div>
  );
}
