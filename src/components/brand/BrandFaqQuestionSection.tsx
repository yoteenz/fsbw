import { useState, type CSSProperties, type FormEvent } from 'react';
import { BRAND_FAQ_SUBMIT_SECTION_TITLE } from '../../constants/brandFaqCopy';
import { postBrandFaqQuestionSubmit } from '../../utils/api';
import { appendBrandFaqQuestionLocal } from '../../utils/brandFaqQuestions';

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

const sectionTitleStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '11px',
  color: '#EB1C24',
  fontWeight: 500,
  margin: '0 0 12px 0',
  textTransform: 'uppercase',
  textAlign: 'left',
};

const errorTextStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: '#EB1C24',
  margin: 0,
  lineHeight: 1.45,
  textTransform: 'uppercase',
  textAlign: 'center',
};

const requiredMarkStyle: CSSProperties = { color: '#EB1C24' };

type BrandFaqQuestionSectionProps = {
  formId?: string;
  onSubmitted?: () => void;
  onSubmittingChange?: (submitting: boolean) => void;
};

/** FAQ question submission form — fields inside main card; submit button lives in `PageActionsBelowCard`. */
export default function BrandFaqQuestionSection({
  formId = 'brand-faq-question-form',
  onSubmitted,
  onSubmittingChange,
}: BrandFaqQuestionSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    onSubmittingChange?.(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        question: question.trim(),
      };
      const result = await postBrandFaqQuestionSubmit(payload);
      const questionId = result.questionId || `faq-${Date.now()}`;
      appendBrandFaqQuestionLocal({
        id: questionId,
        name: payload.name.toUpperCase(),
        email: payload.email.toLowerCase(),
        question: payload.question.toUpperCase(),
        timestamp: new Date().toISOString(),
        status: 'new',
      });
      setName('');
      setEmail('');
      setQuestion('');
      onSubmitted?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message.toUpperCase() : 'COULD NOT SEND QUESTION');
    } finally {
      onSubmittingChange?.(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
        <p style={sectionTitleStyle}>{BRAND_FAQ_SUBMIT_SECTION_TITLE}</p>
      </div>

      {submitError ? <p style={errorTextStyle}>{submitError}</p> : null}

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

        <div style={{ flexShrink: 0 }}>
          <label style={fieldLabelStyle}>
            QUESTION<span style={requiredMarkStyle}>*</span>
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value.toUpperCase())}
            style={fieldTextareaStyle}
            required
          />
        </div>
      </form>
    </div>
  );
}
