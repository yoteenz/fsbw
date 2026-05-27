import {
  BRAND_ABOUT_ACCENT_PARAGRAPHS,
  BRAND_ABOUT_GRAY_MEDIUM_PARAGRAPHS,
  BRAND_ABOUT_US_PARAGRAPHS,
} from '../../constants/brandAboutCopy';

/** About Us narrative body — shared by `/brand/about` and the hidden height measurer. */
export default function BrandAboutUsBody() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'center',
      }}
    >
      {BRAND_ABOUT_US_PARAGRAPHS.map((paragraph) => {
        const isAccent = BRAND_ABOUT_ACCENT_PARAGRAPHS.has(paragraph);
        const isGrayMedium = BRAND_ABOUT_GRAY_MEDIUM_PARAGRAPHS.has(paragraph);
        return (
          <p
            key={paragraph}
            style={{
              fontFamily: isGrayMedium || isAccent ? '"Futura PT Medium"' : '"Futura PT Book"',
              fontSize: '10px',
              color: isGrayMedium ? '#808080' : isAccent ? '#EB1C24' : '#000000',
              fontWeight: isGrayMedium || isAccent ? 500 : 400,
              margin: 0,
              lineHeight: 1.45,
              textTransform: 'uppercase',
            }}
          >
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}
