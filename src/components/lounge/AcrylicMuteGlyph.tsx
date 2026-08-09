import { useId, type CSSProperties } from 'react';
import { acrylicGradientDefs, ACRYLIC_EDGE_STROKE } from './acrylicGlyphDefs';

type Props = {
  muted?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Thick extruded acrylic speaker — unmute shows sound waves; muted shows crystal slash. */
export function AcrylicMuteGlyph({ muted = true, className, style }: Props) {
  const uid = useId().replace(/:/g, '');
  const { id, defs } = acrylicGradientDefs(uid);
  const depth = 7;

  /** Speaker back housing — small extruded slab. */
  const renderSpeakerHousing = () => {
    const fx = 10;
    const fy = 26;
    const fw = 12;
    const fh = 12;

    return (
      <g className="acrylic-glyph-structure acrylic-glyph-speaker-housing">
        <path
          d={`M ${fx + fw} ${fy} L ${fx + fw + depth} ${fy + 2} L ${fx + fw + depth} ${fy + fh + 2} L ${fx + fw} ${fy + fh} Z`}
          fill={`url(#${id('side')})`}
        />
        <path
          d={`M ${fx} ${fy + fh} L ${fx + fw} ${fy + fh} L ${fx + fw + depth} ${fy + fh + 2} L ${fx + 2} ${fy + fh - 1} Z`}
          fill={`url(#${id('side-vertical')})`}
          opacity="0.88"
        />
        <rect
          x={fx}
          y={fy}
          width={fw}
          height={fh}
          fill={`url(#${id('face')})`}
          stroke="#ffffff"
          strokeWidth={1.1}
          strokeOpacity={0.82}
        />
        <rect x={fx} y={fy} width={fw + 1} height={3} fill={`url(#${id('bevel-top')})`} />
        <line
          x1={fx + fw}
          y1={fy}
          x2={fx + fw}
          y2={fy + fh}
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={2.4}
          opacity={0.96}
        />
        <line x1={fx} y1={fy} x2={fx} y2={fy + fh} {...ACRYLIC_EDGE_STROKE.bright} strokeWidth={1.5} opacity={0.48} />
      </g>
    );
  };

  /** Horn cone — extruded wedge pointing right. */
  const renderSpeakerCone = () => {
    const fx = 22;
    const fy = 24;
    const tipX = 38;
    const tipY = 32;
    const bottomY = 40;

    return (
      <g className="acrylic-glyph-structure acrylic-glyph-speaker-cone">
        <path
          d={`M ${tipX} ${tipY - 8} L ${tipX + depth} ${tipY - 6} L ${tipX + depth} ${tipY + 6} L ${tipX} ${tipY + 8} Z`}
          fill={`url(#${id('side')})`}
        />
        <path d={`M ${fx} ${fy} L ${tipX} ${tipY - 8} L ${tipX} ${tipY + 8} L ${fx} ${bottomY} Z`} fill={`url(#${id('face')})`} />
        <path d={`M ${fx} ${fy} L ${tipX} ${tipY - 8} L ${tipX - 2} ${tipY - 7} L ${fx + 2} ${fy + 2} Z`} fill={`url(#${id('bevel-top')})`} opacity="0.92" />
        <path
          d={`M ${fx} ${fy} L ${tipX} ${tipY - 8} L ${tipX} ${tipY + 8} L ${fx} ${bottomY} Z`}
          fill="none"
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={2.5}
          opacity={0.94}
        />
        <line
          x1={tipX}
          y1={tipY - 8}
          x2={tipX}
          y2={tipY + 8}
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={2.6}
          opacity={0.98}
        />
        <line
          x1={tipX}
          y1={tipY - 8}
          x2={tipX + depth}
          y2={tipY - 6}
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={2}
          opacity={0.88}
        />
      </g>
    );
  };

  const renderSoundWaves = () => (
    <g className="acrylic-glyph-structure acrylic-glyph-sound-waves">
      <path
        d="M 42 28 A 6 6 0 0 1 42 36"
        fill="none"
        {...ACRYLIC_EDGE_STROKE.bright}
        strokeWidth={2.6}
        opacity={0.92}
      />
      <path
        d="M 46 24 A 10 10 0 0 1 46 40"
        fill="none"
        {...ACRYLIC_EDGE_STROKE.bright}
        strokeWidth={2.8}
        opacity={0.96}
      />
      <path
        d="M 50 20 A 14 14 0 0 1 50 44"
        fill="none"
        {...ACRYLIC_EDGE_STROKE.bright}
        strokeWidth={2.4}
        opacity={0.78}
      />
    </g>
  );

  /** Muted — extruded diagonal slash through speaker + waves. */
  const renderMuteSlash = () => {
    const x1 = 34;
    const y1 = 18;
    const x2 = 54;
    const y2 = 46;
    const slashW = 3.2;

    return (
      <g className="acrylic-glyph-structure acrylic-glyph-mute-slash">
        <path
          d={`M ${x1 - 1} ${y1 + 2} L ${x2 - 1} ${y2 + 2} L ${x2 + slashW} ${y2 + 2 + depth * 0.35} L ${x1 + slashW} ${y1 + 2 + depth * 0.35} Z`}
          fill={`url(#${id('side')})`}
          opacity="0.9"
        />
        <line x1={x1} y1={y1} x2={x2} y2={y2} {...ACRYLIC_EDGE_STROKE.bright} strokeWidth={3.4} opacity={0.98} />
        <line
          x1={x1 + 1.2}
          y1={y1 + 1.2}
          x2={x2 + 1.2}
          y2={y2 + 1.2}
          {...ACRYLIC_EDGE_STROKE.bright}
          strokeWidth={1.4}
          opacity={0.55}
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
      {renderSpeakerHousing()}
      {renderSpeakerCone()}
      {muted ? renderMuteSlash() : renderSoundWaves()}
    </svg>
  );
}
