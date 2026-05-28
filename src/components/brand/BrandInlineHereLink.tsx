import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { BRAND_HERE_LINK_LABEL, type BrandInlineLinkConfig } from '../../constants/brandPageLinks';

export const BRAND_HERE_LINK_STYLE: CSSProperties = {
  color: '#808080',
  fontFamily: '"Futura PT Medium"',
  fontWeight: 500,
  textDecoration: 'underline',
  textTransform: 'uppercase',
};

type BrandInlineHereLinkProps = {
  config: BrandInlineLinkConfig;
  /** Wrapper element style (e.g. FAQ answer red text). */
  style?: CSSProperties;
};

/** Prefix + linked HERE + suffix for cross-brand navigation in copy blocks. */
export default function BrandInlineHereLink({ config, style }: BrandInlineHereLinkProps) {
  return (
    <p style={style}>
      {config.prefix}
      <Link to={config.to} style={BRAND_HERE_LINK_STYLE}>
        {BRAND_HERE_LINK_LABEL}
      </Link>
      {config.suffix}
    </p>
  );
}
