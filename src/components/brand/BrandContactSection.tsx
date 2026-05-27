import { useState, type CSSProperties } from 'react';
import { BRAND_CONTACT_INTRO_PARAGRAPHS } from '../../constants/brandContactCopy';

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
  color: '#000000',
  boxSizing: 'border-box',
  borderRadius: '0',
  outline: 'none',
  textTransform: 'uppercase',
};

const fieldTextareaStyle: CSSProperties = {
  ...fieldInputStyle,
  height: 'auto',
  minHeight: '120px',
  resize: 'vertical',
  padding: '12px',
  lineHeight: 1.45,
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
          key={option.toUpperCase()}
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

export default function BrandContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isOrderRelated, setIsOrderRelated] = useState<'yes' | 'no'>('no');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'center',
        }}
      >
        {BRAND_CONTACT_INTRO_PARAGRAPHS.map((paragraph) => (
          <p
            key={paragraph}
            style={{
              fontFamily: '"Futura PT Book"',
              fontSize: '10px',
              color: '#000000',
              margin: 0,
              lineHeight: 1.45,
              textTransform: 'uppercase',
            }}
          >
            {paragraph}
          </p>
        ))}
      </div>

      <form
        className="flex flex-col"
        style={{ gap: '12px' }}
        onSubmit={(e) => e.preventDefault()}
      >
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

        <div>
          <label style={fieldLabelStyle}>
            MESSAGE<span style={requiredMarkStyle}>*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.toUpperCase())}
            rows={6}
            style={fieldTextareaStyle}
            required
          />
        </div>
      </form>
    </div>
  );
}
