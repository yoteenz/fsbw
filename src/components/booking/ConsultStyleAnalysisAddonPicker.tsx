import type { CSSProperties } from 'react';
import {
  CONSULT_DEPOSIT_USD,
  CONSULT_STYLE_ANALYSIS_NON_REFUNDABLE_NOTE,
  CONSULT_STYLE_ANALYSIS_TIERS,
  consultStyleAnalysisUsd,
  type ConsultStyleAnalysisTierDef,
} from '../../utils/consultStyleAnalysisAddon';
import type { StyleAnalysisComparisonTier } from '../../types/styleAnalysis';
import { bookingFontBook, bookingFontMedium } from './BookingPageChrome';
import ConsultStyleAnalysisSelfiePicker, {
  type ConsultStyleAnalysisSelfieItem,
} from './ConsultStyleAnalysisSelfiePicker';

type ConsultStyleAnalysisAddonPickerProps = {
  value: StyleAnalysisComparisonTier;
  onChange: (next: StyleAnalysisComparisonTier) => void;
  selfie: ConsultStyleAnalysisSelfieItem | null;
  onSelfieChange: (next: ConsultStyleAnalysisSelfieItem | null) => void;
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
  selfie,
  onSelfieChange,
  disabled,
}: ConsultStyleAnalysisAddonPickerProps) {
  const addonUsd = consultStyleAnalysisUsd(value);

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <p style={{ ...labelStyle, marginTop: 0, marginBottom: '8px' }}>
        STYLE ANALYSIS ADD-ON:
        <span style={{ color: '#EB1C24' }}>*</span>
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
        SELECT A TIER — ADDED TO YOUR CONSULT TOTAL AT CHECKOUT. YOUR SELFIE IS COMBINED WITH YOUR
        HAIR INSPO TO SHOW THAT EXACT STYLE ON YOU (NOT PSA RANKED PICKS OR TEMPLATE CARDS).
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {CONSULT_STYLE_ANALYSIS_TIERS.map((tier) =>
          tierRow(tier, value === tier.comparisonCount, () => onChange(tier.comparisonCount), disabled)
        )}
      </div>

      <ConsultStyleAnalysisSelfiePicker
        value={selfie}
        onChange={onSelfieChange}
        disabled={disabled}
      />

      <p
        style={{
          fontFamily: bookingFontBook,
          fontSize: '8px',
          color: '#808080',
          textTransform: 'uppercase',
          margin: '12px 0 0',
          lineHeight: 1.45,
        }}
      >
        CHECKOUT: ${CONSULT_DEPOSIT_USD} CONSULT DEPOSIT + ${addonUsd} STYLE ANALYSIS = $
        {CONSULT_DEPOSIT_USD + addonUsd} TOTAL. ONLY THE ${CONSULT_DEPOSIT_USD} DEPOSIT IS
        CREDITABLE TOWARD YOUR UNIT OR INSTALL WHEN YOU CLAIM YOUR CONSULT OFFER.
      </p>
      <p
        style={{
          fontFamily: bookingFontBook,
          fontSize: '8px',
          color: '#EB1C24',
          textTransform: 'uppercase',
          margin: '8px 0 0',
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
