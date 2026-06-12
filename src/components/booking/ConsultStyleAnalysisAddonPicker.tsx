import type { CSSProperties } from 'react';
import {
  CONSULT_STYLE_ANALYSIS_NON_REFUNDABLE_NOTE,
  CONSULT_STYLE_ANALYSIS_TIERS,
  type ConsultStyleAnalysisTierDef,
} from '../../utils/consultStyleAnalysisAddon';
import type { StyleAnalysisComparisonTier } from '../../types/styleAnalysis';
import { bookingFontBook, bookingFontMedium } from './BookingPageChrome';

type ConsultStyleAnalysisAddonPickerProps = {
  value: StyleAnalysisComparisonTier;
  onChange: (next: StyleAnalysisComparisonTier) => void;
  disabled?: boolean;
};

const optionBtnBase: CSSProperties = {
  width: '100%',
  textAlign: 'left',
  border: '1.3px solid #000',
  backgroundColor: '#FFFFFF',
  padding: '10px 12px',
  cursor: 'pointer',
  boxSizing: 'border-box',
};

function tierRow(
  tier: ConsultStyleAnalysisTierDef,
  selected: boolean,
  onSelect: () => void,
  disabled?: boolean
) {
  return (
    <button
      type="button"
      key={tier.comparisonCount}
      disabled={disabled}
      onClick={onSelect}
      style={{
        ...optionBtnBase,
        borderColor: selected ? '#EB1C24' : '#000',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px',
          alignItems: 'flex-start',
        }}
      >
        <span
          style={{
            fontFamily: bookingFontMedium,
            fontSize: '11px',
            color: selected ? '#EB1C24' : '#000',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          {tier.label}
        </span>
        <span
          style={{
            fontFamily: bookingFontMedium,
            fontSize: '11px',
            color: '#000',
            flexShrink: 0,
          }}
        >
          +${tier.priceUsd}
        </span>
      </div>
      <p
        style={{
          fontFamily: bookingFontBook,
          fontSize: '9px',
          color: '#808080',
          textTransform: 'uppercase',
          margin: '6px 0 0',
          lineHeight: 1.4,
          letterSpacing: '0.02em',
        }}
      >
        {tier.description}
      </p>
    </button>
  );
}

export default function ConsultStyleAnalysisAddonPicker({
  value,
  onChange,
  disabled,
}: ConsultStyleAnalysisAddonPickerProps) {
  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <p style={{ ...labelStyle, marginTop: 0, marginBottom: '8px' }}>
        STYLE ANALYSIS ADD-ON:
      </p>
      <p
        style={{
          fontFamily: bookingFontBook,
          fontSize: '9px',
          color: '#808080',
          textTransform: 'uppercase',
          margin: '0 0 12px',
          lineHeight: 1.45,
        }}
      >
        WE MATCH YOUR HAIR INSPO TO YOUR FACE — SELFIE COMPOSITES + COLOR & LENGTH COMPARISONS
        RETURN WITH YOUR CONSULT OUTPUT.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {CONSULT_STYLE_ANALYSIS_TIERS.map((tier) =>
          tierRow(tier, value === tier.comparisonCount, () => onChange(tier.comparisonCount), disabled)
        )}
      </div>
      <p
        style={{
          fontFamily: bookingFontBook,
          fontSize: '8px',
          color: '#EB1C24',
          textTransform: 'uppercase',
          margin: '10px 0 0',
          lineHeight: 1.45,
        }}
      >
        {CONSULT_STYLE_ANALYSIS_NON_REFUNDABLE_NOTE}
      </p>
    </div>
  );
}

const labelStyle: CSSProperties = {
  fontFamily: bookingFontMedium,
  fontSize: '11px',
  color: '#000000',
  textTransform: 'uppercase',
  display: 'block',
  letterSpacing: '0.03em',
  fontWeight: 500,
};
