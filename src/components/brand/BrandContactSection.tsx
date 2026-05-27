import { useState, type CSSProperties, type FormEvent } from 'react';
import {
  BRAND_CONTACT_EMAIL,
  BRAND_CONTACT_INTRO_HOURS,
  BRAND_CONTACT_INTRO_LINE_1_PREFIX,
  BRAND_CONTACT_INTRO_LINE_2_PREFIX,
  BRAND_CONTACT_INTRO_LINE_2_SUFFIX,
} from '../../constants/brandContactCopy';
import { postBrandContactSubmit } from '../../utils/api';
import { appendBrandContactInquiryLocal } from '../../utils/brandContactInquiries';

const fieldLabelStyle: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '10px',
  color: '#000000',
  display: 'block',
  marginBottom: '8px',
  textTransform: 'uppercase',
};

const fieldInputStyle: CSSProperties = {
  width: '100%',
  height: '36px',
  padding: '8px',
  paddingLeft: '12px',
  border: '1.3px solid #000000',
  fontFamily: '"Futura PT Book"',
  fontSize: '11px',
  backgroundColor: '#FFFFFF',
  color: '#808080',
  boxSizing: 'border-box',
  borderRadius: '0',
  outline: 'none',
  textTransform: 'uppercase',
};

const fieldTextareaStyle: CSSProperties = {
  width: '100%',
  height: '120px',
  minHeight: '120px',
  padding: '12px',
  border: '1.3px solid #000000',
  fontFamily: '"Futura PT Book"',
  fontSize: '11px',
  backgroundColor: '#FFFFFF',
  color: '#808080',
  boxSizing: 'border-box',
  borderRadius: '0',
  outline: 'none',
  textTransform: 'uppercase',
  lineHeight: 1.45,
  resize: 'vertical',
  display: 'block',
  flexShrink: 0,
};

const introTextStyle: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '10px',
  color: '#000000',
  margin: 0,
  lineHeight: 1.45,
  textTransform: 'uppercase',
};

const requiredMarkStyle: CSSProperties = { color: '#EB1C24' };

function YesNoToggle({
  value,
  onChange,
}: {
  value: 'yes' | 'no';
  onChange: (next: 'yes' | 'no') => void;
}) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {(['yes', 'no'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          style={{
            flex: 1,
            height: '32px',
            border: value === option ? '1.3px solid #EB1C24' : '1.3px solid #000000',
            backgroundColor: '#FFFFFF',
            fontFamily: '"Futura PT Book"',
            fontSize: '10px',
            color: value === option ? '#EB1C24' : '#000000',
            textTransform: 'uppercase',
            cursor: 'pointer',
            borderRadius: '0',
          }}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

type BrandContactSectionProps = {
  formId?: string;
  onSubmitted?: () => void;
  onSubmittingChange?: (submitting: boolean) => void;
};

export default function BrandContactSection({
  formId = 'brand-contact-form',
  onSubmitted,
  onSubmittingChange,
}: BrandContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isOrderRelated, setIsOrderRelated] = useState<'yes' | 'no'>('no');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    onSubmittingChange?.(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        isOrderRelated,
        orderNumber: orderNumber.trim(),
        message: message.trim(),
      };
      const result = await postBrandContactSubmit(payload);
      const inquiryId = result.inquiryId || `contact-${Date.now()}`;
      appendBrandContactInquiryLocal({
        id: inquiryId,
        name: payload.name.toUpperCase(),
        email: payload.email.toLowerCase(),
        isOrderRelated: payload.isOrderRelated,
        orderNumber: payload.orderNumber.toUpperCase(),
        message: payload.message.toUpperCase(),
        timestamp: new Date().toISOString(),
        status: 'new',
      });
      setName('');
      setEmail('');
      setIsOrderRelated('no');
      setOrderNumber('');
      setMessage('');
      onSubmitted?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message.toUpperCase() : 'COULD NOT SEND MESSAGE');
    } finally {
      onSubmittingChange?.(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left',
        }}
      >
        <p style={introTextStyle}>
          {BRAND_CONTACT_INTRO_LINE_1_PREFIX}
          <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: 500 }}>{BRAND_CONTACT_EMAIL}</span>
        </p>
        <p style={{ ...introTextStyle, marginBottom: '10px' }}>
          {BRAND_CONTACT_INTRO_LINE_2_PREFIX}
          {BRAND_CONTACT_INTRO_HOURS}
          {BRAND_CONTACT_INTRO_LINE_2_SUFFIX}
        </p>
      </div>

      {submitError ? (
        <p
          style={{
            ...introTextStyle,
            color: '#EB1C24',
            textAlign: 'left',
            fontFamily: '"Futura PT Medium"',
          }}
        >
          {submitError}
        </p>
      ) : null}

      <form id={formId} className="flex flex-col" style={{ gap: '12px', flex: '0 0 auto' }} onSubmit={handleSubmit}>
        <div>
          <label style={fieldLabelStyle}>
            NAME<span style={requiredMarkStyle}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            style={fieldInputStyle}
            required
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>
            EMAIL ADDRESS<span style={requiredMarkStyle}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toUpperCase())}
            style={fieldInputStyle}
            required
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>
            IS THIS RELATED TO A CURRENT ORDER?<span style={requiredMarkStyle}>*</span>
          </label>
          <YesNoToggle value={isOrderRelated} onChange={setIsOrderRelated} />
        </div>

        <div>
          <label style={fieldLabelStyle}>ORDER NUMBER:</label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            style={fieldInputStyle}
          />
        </div>

        <div style={{ flexShrink: 0 }}>
          <label style={fieldLabelStyle}>
            MESSAGE<span style={requiredMarkStyle}>*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.toUpperCase())}
            style={fieldTextareaStyle}
            required
          />
        </div>
      </form>
    </div>
  );
}
