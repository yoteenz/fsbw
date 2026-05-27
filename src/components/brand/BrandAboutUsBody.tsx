import {
  BRAND_ABOUT_ACCENT_PARAGRAPHS,
  BRAND_ABOUT_BOHEMY_PARAGRAPHS,
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
        const isBohemy = BRAND_ABOUT_BOHEMY_PARAGRAPHS.has(paragraph);
        return (
          <p
            key={paragraph}
            style={{
              fontFamily: isBohemy
                ? '"Bohemy", cursive'
                : isAccent
                  ? '"Futura PT Medium"'
                  : '"Futura PT Book"',
              fontSize: isBohemy ? '16px' : '10px',
              color: isBohemy ? '#808080' : isAccent ? '#EB1C24' : '#000000',
              fontWeight: isBohemy ? 400 : isAccent ? 500 : 400,
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
