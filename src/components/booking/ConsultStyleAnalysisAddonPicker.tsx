import type { CSSProperties, ReactNode } from 'react';
import {
  CONSULT_DEPOSIT_USD,
  CONSULT_STYLE_ANALYSIS_NON_REFUNDABLE_NOTE,
  CONSULT_STYLE_ANALYSIS_TIERS,
  consultStyleAnalysisUsd,
  type ConsultStyleAnalysisSelection,
  type ConsultStyleAnalysisTierDef,
} from '../../utils/consultStyleAnalysisAddon';
import { bookingFontBook, bookingFontMedium } from './BookingPageChrome';
import ConsultStyleAnalysisSelfiePicker, {
  type ConsultStyleAnalysisSelfieItem,
} from './ConsultStyleAnalysisSelfiePicker';

type ConsultStyleAnalysisAddonPickerProps = {
  value: ConsultStyleAnalysisSelection;
  onChange: (next: ConsultStyleAnalysisSelection) => void;
  selfie: ConsultStyleAnalysisSelfieItem | null;
  onSelfieChange: (next: ConsultStyleAnalysisSelfieItem | null) => void;
  disabled?: boolean;
};

const optionBtnBase: CSSProperties = {
  width: '100%',
  textAlign: 'left',
  border: 'none',
  backgroundColor: 'transparent',
  padding: 0,
  cursor: 'pointer',
  boxSizing: 'border-box',
};

const NO_ADDON_OPTION = {
  label: 'NO STYLE ANALYSIS',
  description: 'CONSULT DEPOSIT ONLY — SKIP THE ADD-ON AND SELFIE UPLOAD.',
} as const;

function tierCard(
  selected: boolean,
  onSelect: () => void,
  disabled: boolean | undefined,
  header: ReactNode,
  body: ReactNode,
  footer?: ReactNode
) {
  return (
    <div
      style={{
        width: '100%',
        border: `1.3px solid ${selected ? '#EB1C24' : '#000'}`,
        backgroundColor: '#FFFFFF',
        padding: '10px 12px',
        boxSizing: 'border-box',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <button type="button" disabled={disabled} onClick={onSelect} style={optionBtnBase}>
        {header}
        {body}
      </button>
      {selected ? footer : null}
    </div>
  );
}

function paidTierHeader(tier: ConsultStyleAnalysisTierDef, selected: boolean) {
  return (
    <>
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
    </>
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
  const hasAddon = value === 1 || value === 4;

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <p style={{ ...labelStyle, marginTop: 0, marginBottom: '8px' }}>STYLE ANALYSIS ADD-ON (OPTIONAL):</p>
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
        CHOOSE A TIER TO ADD COMPARISONS TO YOUR CONSULT TOTAL. WHEN SELECTED, UPLOAD A SELFIE INSIDE THAT
        PANEL — WE COMBINE IT WITH YOUR HAIR INSPO TO SHOW THAT EXACT STYLE ON YOU.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tierCard(
          value === null,
          () => onChange(null),
          disabled,
          (
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
                  color: value === null ? '#EB1C24' : '#000',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                {NO_ADDON_OPTION.label}
              </span>
              <span
                style={{
                  fontFamily: bookingFontMedium,
                  fontSize: '11px',
                  color: '#000',
                  flexShrink: 0,
                }}
              >
                ${CONSULT_DEPOSIT_USD} ONLY
              </span>
            </div>
          ),
          (
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
              {NO_ADDON_OPTION.description}
            </p>
          )
        )}

        {CONSULT_STYLE_ANALYSIS_TIERS.map((tier) =>
          tierCard(
            value === tier.comparisonCount,
            () => onChange(tier.comparisonCount),
            disabled,
            paidTierHeader(tier, value === tier.comparisonCount),
            null,
            (
              <ConsultStyleAnalysisSelfiePicker
                embedded
                value={selfie}
                onChange={onSelfieChange}
                disabled={disabled}
              />
            )
          )
        )}
      </div>

      {hasAddon ? (
        <>
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
            {CONSULT_DEPOSIT_USD + addonUsd} TOTAL. ONLY THE ${CONSULT_DEPOSIT_USD} DEPOSIT IS CREDITABLE
            TOWARD YOUR UNIT OR INSTALL WHEN YOU CLAIM YOUR CONSULT OFFER.
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
        </>
      ) : (
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
          CHECKOUT: ${CONSULT_DEPOSIT_USD} CONSULT DEPOSIT ONLY — NO SELFIE REQUIRED.
        </p>
      )}
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
