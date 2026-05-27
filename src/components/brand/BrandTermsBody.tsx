import {
  BRAND_TERMS_INTRO_PARAGRAPHS,
  BRAND_TERMS_SECTIONS,
} from '../../constants/brandTermsCopy';

const BODY_STYLE = {
  fontFamily: '"Futura PT Book"',
  fontSize: '10px',
  color: '#000000',
  fontWeight: 400,
  margin: 0,
  lineHeight: 1.45,
  textTransform: 'uppercase' as const,
  textAlign: 'left' as const,
};

const SECTION_TITLE_STYLE = {
  fontFamily: '"Bohemy", cursive',
  fontSize: '18px',
  color: '#EB1C24',
  fontWeight: 400,
  margin: '0 0 10px 0',
  textTransform: 'lowercase' as const,
  textAlign: 'left' as const,
};

const BULLET_STYLE = {
  ...BODY_STYLE,
  paddingLeft: '12px',
};

const EMAIL_STYLE = {
  ...BODY_STYLE,
  color: '#EB1C24',
  fontFamily: '"Futura PT Medium"',
  fontWeight: 500,
};

function renderParagraph(text: string, key: string) {
  if (text === 'CONTACT@FRONTALSLAYER.COM') {
    return (
      <p key={key} style={EMAIL_STYLE}>
        {text}
      </p>
    );
  }
  return (
    <p key={key} style={BODY_STYLE}>
      {text}
    </p>
  );
}

/** Terms of Service body for `/brand/terms`. */
export default function BrandTermsBody() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        textAlign: 'left',
        paddingBottom: '4px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {BRAND_TERMS_INTRO_PARAGRAPHS.map((paragraph, index) =>
          renderParagraph(paragraph, `intro-${index}`)
        )}
      </div>

      {BRAND_TERMS_SECTIONS.map((section) => {
        if (!section.title && section.paragraphs.length === 0 && !section.bullets?.length) {
          return null;
        }
        return (
          <div key={section.id}>
            {section.title ? <p style={SECTION_TITLE_STYLE}>{section.title}</p> : null}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {section.paragraphs.map((paragraph, index) =>
                renderParagraph(paragraph, `${section.id}-p-${index}`)
              )}
              {section.bullets?.map((bullet, index) => (
                <p key={`${section.id}-b-${index}`} style={BULLET_STYLE}>
                  • {bullet}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
