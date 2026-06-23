import { useId, useMemo } from 'react';

export type MetallicFoilVariant = 'title' | 'subtitle';

type Props = {
  text: string;
  variant: MetallicFoilVariant;
};

/**
 * Luxury red-foil stamped room signage — SVG gradients + lighting filters only
 * (no flat CSS text fills). Typography metrics match legacy DesktopRoomTitle CSS.
 */
export function DesktopRoomTitleMetallicSvg({ text, variant }: Props) {
  const rawId = useId();
  const uid = useMemo(() => rawId.replace(/:/g, ''), [rawId]);
  const isTitle = variant === 'title';

  const ids = {
    body: `${uid}-body`,
    edge: `${uid}-edge`,
    streak: `${uid}-streak`,
    gloss: `${uid}-gloss`,
    inner: `${uid}-inner`,
    shadow: `${uid}-shadow`,
    depth: `${uid}-depth`,
    bevel: `${uid}-bevel`,
    acrylicGrad: `${uid}-acrylic-grad`,
    acrylicFilter: `${uid}-acrylic-filter`,
    chrome: `${uid}-chrome`,
  };

  const textClass = isTitle
    ? 'desktop-room-title__foil-text desktop-room-title__foil-text--title'
    : 'desktop-room-title__foil-text desktop-room-title__foil-text--subtitle';

  const svgClass = isTitle
    ? 'desktop-room-title__foil-svg desktop-room-title__foil-svg--title'
    : 'desktop-room-title__foil-svg desktop-room-title__foil-svg--subtitle';

  const shadowDy = isTitle ? 0.14 : 0.18;
  const depthDy = isTitle ? 0.05 : 0.07;
  const strokeW = isTitle ? 0.045 : 0.055;

  return (
    <svg className={svgClass} aria-hidden overflow="visible" role="presentation">
      <defs>
        <linearGradient id={ids.body} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a080c" />
          <stop offset="12%" stopColor="#7a1016" />
          <stop offset="28%" stopColor="#b8181f" />
          <stop offset="42%" stopColor="#eb1c24" />
          <stop offset="50%" stopColor="#ff7a7f" />
          <stop offset="58%" stopColor="#f02e35" />
          <stop offset="72%" stopColor="#c4181f" />
          <stop offset="88%" stopColor="#8f1218" />
          <stop offset="100%" stopColor="#4a080c" />
        </linearGradient>

        <linearGradient id={ids.edge} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a0507" />
          <stop offset="35%" stopColor="#5c0c11" />
          <stop offset="100%" stopColor="#1a0304" />
        </linearGradient>

        <linearGradient id={ids.streak} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="38%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="48%" stopColor="#ffffff" stopOpacity="0.72" />
          <stop offset="52%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={ids.gloss} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
          <stop offset="22%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={ids.inner} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#ff9a9e" stopOpacity="0.45" />
          <stop offset="45%" stopColor="#eb1c24" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#3d080c" stopOpacity="0.35" />
        </linearGradient>

        <linearGradient id={ids.chrome} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="18%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="24%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="76%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="84%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={ids.acrylicGrad} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="12%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <filter id={ids.shadow} x="-40%" y="-40%" width="180%" height="200%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#0a0002" floodOpacity="0.58" />
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.42" />
        </filter>

        <filter id={ids.depth} x="-30%" y="-30%" width="160%" height="180%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.35" result="blur" />
          <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
          <feFlood floodColor="#1a0304" floodOpacity="0.85" result="depthColor" />
          <feComposite in="depthColor" in2="offsetBlur" operator="in" result="depthShadow" />
          <feMerge>
            <feMergeNode in="depthShadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={ids.bevel} x="-25%" y="-25%" width="150%" height="160%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale={isTitle ? 3.5 : 2.8}
            specularConstant="0.85"
            specularExponent={isTitle ? 22 : 18}
            lightingColor="#fff8f8"
            result="spec"
          >
            <fePointLight x={isTitle ? -120 : -80} y={isTitle ? -140 : -90} z={220} />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specClipped" />
          <feComposite in="SourceGraphic" in2="specClipped" operator="arithmetic" k1="0" k2="1" k3="0.65" k4="0" />
        </filter>

        <filter id={ids.acrylicFilter} x="-20%" y="-20%" width="140%" height="150%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.25" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="2"
            specularConstant="0.55"
            specularExponent="35"
            lightingColor="#ffffff"
            result="glass"
          >
            <fePointLight x="40" y="-60" z="160" />
          </feSpecularLighting>
          <feComposite in="glass" in2="SourceAlpha" operator="in" result="glassClipped" />
          <feBlend in="SourceGraphic" in2="glassClipped" mode="screen" />
        </filter>
      </defs>

      <g className="desktop-room-title__foil-stack" textAnchor="middle">
        <text className={textClass} y="0" dy={`${shadowDy}em`} fill="#120203" filter={`url(#${ids.shadow})`}>
          {text}
        </text>

        <text className={textClass} y="0" dy={`${depthDy}em`} fill={`url(#${ids.edge})`} opacity="0.92">
          {text}
        </text>

        <text
          className={textClass}
          y="0"
          fill={`url(#${ids.body})`}
          stroke={`url(#${ids.edge})`}
          strokeWidth={strokeW}
          paintOrder="stroke fill"
          filter={`url(#${ids.depth})`}
        >
          {text}
        </text>

        <text className={textClass} y="0" fill={`url(#${ids.inner})`} opacity="0.55">
          {text}
        </text>

        <text className={textClass} y="0" fill={`url(#${ids.body})`} filter={`url(#${ids.bevel})`} opacity="0.98">
          {text}
        </text>

        <text className={textClass} y="0" fill={`url(#${ids.streak})`} opacity="0.62">
          {text}
        </text>

        <text className={textClass} y="0" fill={`url(#${ids.chrome})`} opacity="0.48">
          {text}
        </text>

        <text className={textClass} y="0" fill={`url(#${ids.gloss})`} opacity="0.42">
          {text}
        </text>

        <text
          className={textClass}
          y="0"
          fill={`url(#${ids.acrylicGrad})`}
          filter={`url(#${ids.acrylicFilter})`}
          opacity="0.36"
        >
          {text}
        </text>
      </g>
    </svg>
  );
}
