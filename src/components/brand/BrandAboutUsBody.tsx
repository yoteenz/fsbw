import {
  BRAND_ABOUT_ACCENT_PARAGRAPHS,
  BRAND_ABOUT_DEMI_PARAGRAPHS,
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
        textAlign: 'left',
      }}
    >
      {BRAND_ABOUT_US_PARAGRAPHS.map((paragraph) => {
        const isAccent = BRAND_ABOUT_ACCENT_PARAGRAPHS.has(paragraph);
        const isDemi = BRAND_ABOUT_DEMI_PARAGRAPHS.has(paragraph);
        return (
          <p
            key={paragraph}
            style={{
              fontFamily: isDemi
                ? '"Futura PT Demi"'
                : isAccent
                  ? '"Futura PT Medium"'
                  : '"Futura PT Book"',
              fontSize: '10px',
              color: isAccent ? '#EB1C24' : isDemi ? '#808080' : '#000000',
              fontWeight: isDemi || isAccent ? 500 : 400,
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
