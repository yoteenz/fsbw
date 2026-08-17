type Site00LoaderEnvironmentProps = {
  backgroundUrl: string;
  /** Background image decoded and ready to paint. */
  ready?: boolean;
};

/** Full-stage architectural environment — fills background region (711×1536 map). */
export function Site00LoaderEnvironment({ backgroundUrl, ready = false }: Site00LoaderEnvironmentProps) {
  return (
    <div className={`site00-loader-env ${ready ? 'site00-loader-env--ready' : ''}`} aria-hidden="true">
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
