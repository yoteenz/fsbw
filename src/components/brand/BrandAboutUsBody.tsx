import {
  BRAND_ABOUT_ACCENT_PARAGRAPHS,
  BRAND_ABOUT_BOHEMY_PARAGRAPHS,
  BRAND_ABOUT_DEMI_PARAGRAPHS,
  BRAND_ABOUT_US_PARAGRAPHS,
} from '../../constants/brandAboutCopy';
import { BRAND_ABOUT_HERO_IMAGE_SRC } from '../../constants/brandAboutAssets';
import PageHeroImage from '../PageHeroImage';

/** About Us narrative body, shared by `/brand/about` and the hidden height measurer. */
export default function BrandAboutUsBody() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'left',
      }}
    >
      <PageHeroImage src={BRAND_ABOUT_HERO_IMAGE_SRC} />
      {BRAND_ABOUT_US_PARAGRAPHS.map((paragraph) => {
        const isAccent = BRAND_ABOUT_ACCENT_PARAGRAPHS.has(paragraph);
        const isDemi = BRAND_ABOUT_DEMI_PARAGRAPHS.has(paragraph);
        const isBohemy = BRAND_ABOUT_BOHEMY_PARAGRAPHS.has(paragraph);
        return (
          <p
            key={paragraph}
            style={{
              fontFamily: isBohemy
                ? '"Bohemy", cursive'
                : isDemi
                  ? '"Futura PT Demi"'
                  : isAccent
                    ? '"Futura PT Medium"'
                    : '"Futura PT Book"',
              fontSize: isBohemy ? '17px' : '10px',
              color: isAccent ? '#EB1C24' : isDemi || isBohemy ? '#808080' : '#000000',
              fontWeight: isDemi || isAccent ? 500 : 400,
              margin: 0,
              lineHeight: 1.45,
              textTransform: isBohemy ? 'none' : 'uppercase',
            }}
          >
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}
