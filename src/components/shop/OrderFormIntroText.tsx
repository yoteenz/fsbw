import type { CSSProperties } from 'react';
import {
  ORDER_FORM_INTRO_AUTHORIZATION,
  ORDER_FORM_INTRO_CLOSING,
  ORDER_FORM_INTRO_CONTACT_EMAIL,
  ORDER_FORM_INTRO_CONTACT_PREFIX,
  ORDER_FORM_INTRO_PURPOSE_BULLETS,
  ORDER_FORM_INTRO_MATCH_INFO,
  ORDER_FORM_INTRO_OPENING,
  ORDER_FORM_INTRO_PLEASE_NOTE_BULLETS,
  ORDER_FORM_INTRO_PLEASE_NOTE_TITLE,
  ORDER_FORM_INTRO_PURPOSE_TITLE,
  ORDER_FORM_INTRO_RECORDKEEPING,
} from '../../constants/orderFormIntroCopy';

const PARA_STYLE: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '12px',
  color: '#000000',
  lineHeight: 1.8,
  margin: '0 0 20px 0',
  textAlign: 'left',
  textTransform: 'uppercase',
};

const SUBHEAD_STYLE: CSSProperties = {
  ...PARA_STYLE,
  fontFamily: '"Futura PT Medium"',
  fontWeight: 500,
  color: '#808080',
  margin: '0 0 10px 0',
};

const BULLET_STYLE: CSSProperties = {
  ...PARA_STYLE,
  margin: '0 0 8px 0',
  paddingLeft: '12px',
};

const BULLET_MARK_STYLE: CSSProperties = { color: '#EB1C24' };

function BulletLine({ line }: { line: string }) {
  return (
    <p style={BULLET_STYLE}>
      <span style={BULLET_MARK_STYLE}>•</span> {line}
    </p>
  );
}

/** Intro copy block for the Order Authorization Form main card. */
export default function OrderFormIntroText() {
  return (
    <div style={{ marginBottom: '10px' }}>
      <p style={{ ...PARA_STYLE, margin: '18px 0 20px 0' }}>{ORDER_FORM_INTRO_OPENING}</p>

      <p style={SUBHEAD_STYLE}>{ORDER_FORM_INTRO_PURPOSE_TITLE}</p>
      {ORDER_FORM_INTRO_PURPOSE_BULLETS.map((line) => (
        <BulletLine key={line} line={line} />
      ))}

      <p style={{ ...PARA_STYLE, margin: '12px 0 20px 0' }}>{ORDER_FORM_INTRO_MATCH_INFO}</p>

      <p style={SUBHEAD_STYLE}>{ORDER_FORM_INTRO_PLEASE_NOTE_TITLE}</p>
      {ORDER_FORM_INTRO_PLEASE_NOTE_BULLETS.map((line) => (
        <BulletLine key={line} line={line} />
      ))}

      <p style={{ ...PARA_STYLE, margin: '12px 0 20px 0' }}>{ORDER_FORM_INTRO_AUTHORIZATION}</p>
      <p style={PARA_STYLE}>{ORDER_FORM_INTRO_RECORDKEEPING}</p>

      <p style={PARA_STYLE}>
        {ORDER_FORM_INTRO_CONTACT_PREFIX}
        <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: 600 }}>
          {ORDER_FORM_INTRO_CONTACT_EMAIL}
        </span>
      </p>

      <p style={{ ...PARA_STYLE, margin: '0 0 30px 0' }}>{ORDER_FORM_INTRO_CLOSING}</p>
    </div>
  );
}
