import {
  site00OriginBldrPanelIconUrl,
  site00OriginIdntyPanelIconUrl,
} from '../../config/origin-panel-icons';

type OriginPanelIconProps = {
  panel: 'idnty' | 'bldr';
  className?: string;
};

/** Approved production panel icon — Origin desktop IDNTY/BLDR collapsed cards. */
export function OriginPanelIcon({ panel, className = '' }: OriginPanelIconProps) {
  const src = panel === 'idnty' ? site00OriginIdntyPanelIconUrl() : site00OriginBldrPanelIconUrl();
  const alt = panel === 'idnty' ? 'IDNTY panel icon' : 'BLDR panel icon';

  return (
    <img
      src={src}
      alt={alt}
      className={`site00-origin-card__icon ${className}`.trim()}
      width={64}
      height={64}
      loading="lazy"
      decoding="async"
    />
  );
}
