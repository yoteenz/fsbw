import { useState } from 'react';
import { BRAND_FAQ_SECTIONS } from '../../constants/brandFaqCopy';

const QUESTION_STYLE = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: '#000000',
  fontWeight: 500,
  margin: 0,
  lineHeight: 1.45,
  textTransform: 'uppercase' as const,
  textAlign: 'left' as const,
  flex: 1,
};

const ANSWER_STYLE = {
  fontFamily: '"Futura PT Book"',
  fontSize: '10px',
  color: '#EB1C24',
  fontWeight: 400,
  margin: 0,
  lineHeight: 1.45,
  textTransform: 'uppercase' as const,
  textAlign: 'left' as const,
};

const SECTION_TITLE_STYLE = {
  fontFamily: '"Bohemy", cursive',
  fontSize: '16px',
  color: '#808080',
  fontWeight: 400,
  margin: '0 0 8px 0',
  textTransform: 'lowercase' as const,
  textAlign: 'left' as const,
};

/** Expandable FAQ for `/brand/faq`. */
export default function BrandFaqSection() {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        textAlign: 'left',
        paddingBottom: '4px',
      }}
    >
      {BRAND_FAQ_SECTIONS.map((section, sectionIndex) => (
        <div key={section.id}>
          <p style={SECTION_TITLE_STYLE}>{section.title}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {section.items.map((item) => {
              const isOpen = openIds.has(item.id);
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-expanded={isOpen}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      width: '100%',
                      padding: 0,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '10px',
                        color: '#EB1C24',
                        fontWeight: 500,
                        flexShrink: 0,
                        lineHeight: 1.45,
                        width: '10px',
                      }}
                    >
                      {isOpen ? '−' : '+'}
                    </span>
                    <span style={QUESTION_STYLE}>{item.question}</span>
                  </button>
                  {isOpen ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginTop: '6px',
                        paddingLeft: '18px',
                      }}
                    >
                      {item.answerParagraphs.map((paragraph, paragraphIndex) => (
                        <p key={`${item.id}-${paragraphIndex}`} style={ANSWER_STYLE}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          {sectionIndex < BRAND_FAQ_SECTIONS.length - 1 ? (
            <div style={{ borderBottom: '1px solid #e5e7eb', marginTop: '14px' }} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
