import type { CSSProperties } from 'react';

/** Shared hero image layout — order form, brand member, etc. */
export const PAGE_HERO_IMAGE_STYLE: CSSProperties = {
  width: '75%',
  height: 'auto',
  display: 'block',
  objectFit: 'contain',
  marginTop: '22px',
  marginBottom: '12px',
  marginLeft: 'auto',
  marginRight: 'auto',
};

type PageHeroImageProps = {
  src: string;
};

export default function PageHeroImage({ src }: PageHeroImageProps) {
  return <img src={src} alt="" style={PAGE_HERO_IMAGE_STYLE} />;
}
