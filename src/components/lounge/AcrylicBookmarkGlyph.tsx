import { useId, type CSSProperties } from 'react';
import { LOUNGE_TV_BRAND_RED } from './loungeTvTheme';
import { acrylicGradientDefs, ACRYLIC_EDGE_STROKE } from './acrylicGlyphDefs';

type Props = {
  saved?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Thick extruded acrylic bookmark — bold borders readable at compact size. */
export function AcrylicBookmarkGlyph({ saved = false, className, style }: Props) {
  const uid = useId().replace(/:/g, '');
  const { id, defs } = acrylicGradientDefs(uid);

  const depth = 8;
  const fx = 12;
  const fy = 8;
  const bw = 32;
  const bh = 46;

  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        {defs}
        {saved ? (
          <linearGradient id={id('saved-edge')} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={LOUNGE_TV_BRAND_RED} stopOpacity="0" />
            <stop offset="100%" stopColor={LOUNGE_TV_BRAND_RED} stopOpacity="0.35" />
          </linearGradient>
        ) : null}
      </defs>

      <g className="acrylic-glyph-structure acrylic-glyph-bookmark">
        {/* Extruded right-side depth slab */}
        <path
          d={`M ${fx + bw} ${fy} L ${fx + bw + depth} ${fy + 3} L ${fx + bw + depth} ${fy + bh + 2} L ${fx + bw} ${fy + bh} Z`}
          fill={`url(#${id('side')})`}
        />
        {/* Bottom depth wedge */}
        <path
          d={`M ${fx} ${fy + bh} L ${fx + bw} ${fy + bh} L ${fx + bw + depth} ${fy + bh + 2} L ${fx + 2} ${fy + bh - 1} Z`}
          fill={`url(#${id('side-vertical')})`}
          opacity="0.88"
        />

        {/* Front bookmark face */}
        <path d={`M ${fx} ${fy} H ${fx + bw} V ${fy + bh} L ${fx + bw / 2} ${fy + bh - 11} L ${fx} ${fy + bh} Z`} fill={`url(#${id('face')})`} />

        {/* V-notch inner fold plane */}
        <path
          d={`M ${fx + bw / 2 - 5} ${fy + bh - 11} L ${fx + bw / 2} ${fy + bh - 4} L ${fx + bw / 2 + 5} ${fy + bh - 11} Z`}
          fill="#ffffff"
          opacity="0.18"
        />

        {saved ? (
          <path
            d={`M ${fx} ${fy} H ${fx + bw} V ${fy + bh} L ${fx + bw / 2} ${fy + bh - 11} L ${fx} ${fy + bh} Z`}
            fill={`url(#${id('saved-edge')})`}
          />
        ) : null}

        {/* Top polished bevel — thick bright lip */}
        <rect x={fx} y={fy} width={bw + 1} height={3.5} fill={`url(#${id('bevel-top')})`} />

        {/* Outer outline — heavy acrylic border */}
        <path
          d={`M ${fx} ${fy} H ${fx + bw} V ${fy + bh} L ${fx + bw / 2} ${fy + bh - 11} L ${fx} ${fy + bh} Z`}
          fill="none"
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={2.6}
          opacity={0.95}
        />

        {/* Front-right depth edge */}
        <line
          x1={fx + bw}
          y1={fy}
          x2={fx + bw}
          y2={fy + bh}
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={2.8}
          opacity={0.98}
        />

        {/* Extruded top-right corner */}
        <line
          x1={fx + bw}
          y1={fy}
          x2={fx + bw + depth}
          y2={fy + 3}
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={2.2}
          opacity={0.9}
        />

        {/* Extruded side edge */}
        <line
          x1={fx + bw + depth}
          y1={fy + 3}
          x2={fx + bw + depth}
          y2={fy + bh + 2}
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={2}
          opacity={0.75}
        />

        {/* Left front edge — thinner shadow edge */}
        <line
          x1={fx}
          y1={fy}
          x2={fx}
          y2={fy + bh}
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={1.6}
          opacity={0.5}
        />

        {/* Notch crease lines */}
        <path
          d={`M ${fx} ${fy + bh} L ${fx + bw / 2} ${fy + bh - 11} L ${fx + bw} ${fy + bh}`}
          fill="none"
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={1.8}
          opacity={0.72}
        />
      </g>
    </svg>
  );
}
