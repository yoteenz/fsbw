import { loungeTvGlassCqw } from './loungeTvResponsive';

/** Gray rule between Lounge TV sections — matches Learn tab PSA Today rhythm. */
export const LOUNGE_TV_SECTION_BORDER = '1px solid rgba(255,255,255,0.08)';

type LoungeTvSectionDividerProps = {
  marginTop?: string;
  marginBottom?: string;
};

export function LoungeTvSectionDivider({
  marginTop = loungeTvGlassCqw(1.8, 4.5, 9),
  marginBottom = loungeTvGlassCqw(1.8, 4.5, 9),
}: LoungeTvSectionDividerProps) {
  return (
    <div
      role="presentation"
      aria-hidden
      style={{
        width: '100%',
        borderBottom: LOUNGE_TV_SECTION_BORDER,
        marginTop,
        marginBottom,
      }}
    />
  );
}
