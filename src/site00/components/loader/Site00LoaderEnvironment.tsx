import { useEffect } from 'react';
import { loaderLifecycleLog } from './loaderLifecycleLog';

type Site00LoaderEnvironmentProps = {
  backgroundUrl: string;
};

/** Approved environment — full viewport cover, always paints immediately (never render-gated). */
export function Site00LoaderEnvironment({ backgroundUrl }: Site00LoaderEnvironmentProps) {
  useEffect(() => {
    loaderLifecycleLog('BACKGROUND_SOURCE_RESOLVED', { url: backgroundUrl });
  }, [backgroundUrl]);

  return (
    <div className="site00-loader-env" aria-hidden="true">
      <img
        className="site00-loader-env__img"
        src={backgroundUrl}
        alt=""
        decoding="async"
        fetchPriority="high"
        loading="eager"
        draggable={false}
        onLoad={() => loaderLifecycleLog('BACKGROUND_LOADED')}
        onError={() => loaderLifecycleLog('BACKGROUND_ERROR', { url: backgroundUrl })}
      />
    </div>
  );
}
