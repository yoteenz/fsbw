import type { CSSProperties } from 'react';

const btnStyle: CSSProperties = {
  padding: '10px 14px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  border: '1px solid #333',
  borderRadius: 8,
  cursor: 'pointer',
  background: '#fff',
};

type Props = {
  onPreviewWorld?: () => void;
  onInspectObjects?: () => void;
  onApproveAndBuild?: () => void;
  onBack?: () => void;
  approveDisabled?: boolean;
  isManufacturing?: boolean;
  showManufacturingActions?: boolean;
};

/** Founder approval gate — no hidden generation. */
export function ApprovalFooter({
  onPreviewWorld,
  onInspectObjects,
  onApproveAndBuild,
  onBack,
  approveDisabled = false,
  isManufacturing = false,
  showManufacturingActions = true,
}: Props) {
  return (
    <footer
      data-blueprint-approval-footer
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        padding: '16px 0 0',
        borderTop: '1px solid #e5e7eb',
        marginTop: 16,
      }}
    >
      {onBack ? (
        <button type="button" style={btnStyle} onClick={onBack}>
          Back
        </button>
      ) : null}
      {showManufacturingActions && onPreviewWorld ? (
        <button type="button" style={btnStyle} onClick={onPreviewWorld}>
          Preview World
        </button>
      ) : null}
      {showManufacturingActions && onInspectObjects ? (
        <button type="button" style={btnStyle} onClick={onInspectObjects}>
          Inspect Objects
        </button>
      ) : null}
      {showManufacturingActions && onApproveAndBuild ? (
        <button
          type="button"
          disabled={approveDisabled || isManufacturing}
          onClick={onApproveAndBuild}
          style={{
            ...btnStyle,
            marginLeft: 'auto',
            background: approveDisabled ? '#f3f4f6' : '#eb1c24',
            color: approveDisabled ? '#9ca3af' : '#fff',
            borderColor: approveDisabled ? '#d1d5db' : '#eb1c24',
            cursor: approveDisabled || isManufacturing ? 'not-allowed' : 'pointer',
          }}
        >
          {isManufacturing ? 'Manufacturing…' : 'Approve & Build'}
        </button>
      ) : null}
    </footer>
  );
}
