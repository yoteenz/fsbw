import { useId, type CSSProperties } from 'react';
import { acrylicGradientDefs, ACRYLIC_EDGE_STROKE } from './acrylicGlyphDefs';

export type AcrylicGlyphMode = 'play' | 'pause';

type Props = {
  mode: AcrylicGlyphMode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Thick extruded clear-acrylic Play / Pause — static SVG structure only.
 * Paused light animation lives on `.acrylic-media-control` CSS pseudo-elements.
 */
export function AcrylicMediaPlayPauseGlyph({ mode, className, style }: Props) {
  const uid = useId().replace(/:/g, '');
  const { id, defs } = acrylicGradientDefs(uid);
  const pause = mode === 'pause';

  /** Bar slab: front w=11, extrusion depth=9 (reference-style thick acrylic). */
  const renderPauseBar = (frontX: number, sideKey: 'left' | 'right') => {
    const fx = frontX;
    const fy = 10;
    const fw = 11;
    const fh = 44;
    const depth = 9;
    const sx = fx + fw;
    const sy = fy + 2;

    return (
      <g key={sideKey} className={`acrylic-glyph-structure acrylic-glyph-bar acrylic-glyph-bar--${sideKey}`}>
        {/* Extruded side face — dark thickness reads as physical depth */}
        <path
          d={`M ${sx} ${fy} L ${sx + depth} ${sy} L ${sx + depth} ${sy + fh - 4} L ${sx} ${fy + fh} Z`}
          fill={`url(#${id('side')})`}
        />
        {/* Bottom depth chamfer */}
        <path
          d={`M ${fx} ${fy + fh} L ${sx} ${fy + fh} L ${sx + depth} ${sy + fh - 4} L ${fx + 2} ${fy + fh - 2} Z`}
          fill={`url(#${id('side-vertical')})`}
          opacity="0.85"
        />
        {/* Front crystal face — legible on dark + light footage */}
        <rect
          x={fx}
          y={fy}
          width={fw}
          height={fh}
          fill={`url(#${id('face')})`}
          stroke="#ffffff"
          strokeWidth={1.2}
          strokeOpacity={0.85}
        />
        {/* Top bevel — bright polished lip */}
        <rect x={fx} y={fy} width={fw + 1} height={3.5} fill={`url(#${id('bevel-top')})`} />
        {/* Front-right polished edge — thick highlight (animated via CSS stroke opacity only) */}
        <line
          className="acrylic-glyph-edge acrylic-glyph-edge--bright"
          x1={sx}
          y1={fy}
          x2={sx}
          y2={fy + fh}
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={2.8}
          opacity={0.98}
        />
        {/* Front-left edge */}
        <line
          x1={fx}
          y1={fy}
          x2={fx}
          y2={fy + fh}
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={1.8}
          opacity={0.55}
        />
        {/* Top edge catch */}
        <line
          x1={fx}
          y1={fy}
          x2={sx + depth * 0.35}
          y2={fy}
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={2.4}
          opacity={0.95}
        />
        {/* Side-bottom edge */}
        <line
          x1={sx}
          y1={fy + fh}
          x2={sx + depth}
          y2={sy + fh - 4}
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={1.6}
          opacity={0.7}
        />
        {/* Inner refraction streak — static, no CSS animation */}
        <rect
          x={fx + 2}
          y={fy + 5}
          width={fw - 4}
          height={fh - 10}
          fill="#ffffff"
          opacity={0.08}
        />
        <line
          x1={fx + 3.5}
          y1={fy + 8}
          x2={fx + 3.5}
          y2={fy + fh - 8}
          stroke="#ffffff"
          strokeWidth={1.2}
          opacity={0.22}
        />
      </g>
    );
  };

  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>{defs}</defs>

      {pause ? (
        <>
          {renderPauseBar(10, 'left')}
          {renderPauseBar(43, 'right')}
        </>
      ) : (
        <g className="acrylic-glyph-structure acrylic-glyph-play">
          {/* Play prism — thick extruded triangle */}
          <path
            d="M16 10 L16 54 L22 54 L22 16 L48 32 L48 26 L22 10 Z"
            fill={`url(#${id('side')})`}
          />
          <path d="M14 10 L14 54 L46 32 Z" fill={`url(#${id('face')})`} />
          <path d="M14 10 L46 32 L43 30 L14 13 Z" fill={`url(#${id('bevel-top')})`} opacity="0.95" />
          <path
            d="M14 10 L46 32"
            {...ACRYLIC_EDGE_STROKE.bright}
            strokeWidth={2.6}
            opacity={0.96}
          />
          <path
            d="M14 10 L14 54"
            {...ACRYLIC_EDGE_STROKE.bright}
            strokeWidth={1.8}
            opacity={0.52}
          />
          <path
            d="M14 54 L46 32"
            {...ACRYLIC_EDGE_STROKE.bright}
            strokeWidth={2}
            opacity={0.78}
          />
        </g>
      )}
    </svg>
  );
}
