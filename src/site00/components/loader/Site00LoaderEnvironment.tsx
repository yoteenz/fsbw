type Site00LoaderEnvironmentProps = {
  backgroundUrl: string;
  /** Background image decoded and ready to paint. */
  ready?: boolean;
  /** Full-viewport cover (edge-to-edge) — not confined to letterboxed artboard. */
  cover?: boolean;
};

/** Full-stage architectural environment — fills background region (711×1536 map) or viewport when cover. */
export function Site00LoaderEnvironment({
  backgroundUrl,
  ready = false,
  cover = false,
}: Site00LoaderEnvironmentProps) {
  return (
    <div
      className={`site00-loader-env ${ready ? 'site00-loader-env--ready' : ''} ${cover ? 'site00-loader-env--cover' : ''}`.trim()}
      aria-hidden="true"
    >
      <img
        className={`site00-loader-env__img ${cover ? 'site00-loader-env__img--cover' : ''}`.trim()}
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
