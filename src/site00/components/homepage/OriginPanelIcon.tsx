import {
  site00OriginBldrPanelIconUrl,
  site00OriginIdntyPanelIconUrl,
} from '../../config/origin-panel-icons';

type OriginPanelIconProps = {
  panel: 'idnty' | 'bldr';
  size?: 'md' | 'lg';
  className?: string;
};

const SIZE_PX = { md: 80, lg: 88 } as const;

/** Approved production panel icon — Origin desktop IDNTY/BLDR panels (black-bg PNG, screen blend). */
export function OriginPanelIcon({ panel, size = 'md', className = '' }: OriginPanelIconProps) {
  const dim = SIZE_PX[size];
  const src = panel === 'idnty' ? site00OriginIdntyPanelIconUrl() : site00OriginBldrPanelIconUrl();
  const alt = panel === 'idnty' ? 'IDNTY panel icon' : 'BLDR panel icon';

  return (
    <img
      src={src}
      alt={alt}
      className={`site00-origin-card__icon ${size === 'lg' ? 'site00-origin-card__icon--lg' : ''} ${className}`.trim()}
      width={dim}
      height={dim}
      loading="eager"
      decoding="async"
    />
  );
}
