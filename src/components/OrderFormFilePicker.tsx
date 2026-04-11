import type { ChangeEvent, MutableRefObject } from 'react';

/**
 * File upload control matching **Order authorization** (`/tools/order-form`): invisible `input`,
 * bordered tap target, **CHOOSE FILE** + **NO FILE SELECTED**, optional in-box image preview.
 */
export default function OrderFormFilePicker({
  id,
  name,
  inputRef,
  onChange,
  accept = 'image/*',
  previewSrc,
  showSelectedTint,
  disabled = false,
}: {
  id: string;
  name?: string;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  previewSrc?: string | null;
  /** Gray “selected” styling (order form: when a `File` is set; elsewhere: when preview is set). */
  showSelectedTint: boolean;
  disabled?: boolean;
}) {
  const gray = showSelectedTint;
  return (
    <div style={{ position: 'relative' }}>
      <input
        type="file"
        id={id}
        name={name ?? id}
        ref={inputRef}
        onChange={onChange}
        accept={accept}
        disabled={disabled}
        style={{
          position: 'absolute',
          width: '100%',
          height: '36px',
          opacity: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          zIndex: 2,
        }}
      />
      <div
        onClick={() => {
          if (!disabled) inputRef.current?.click();
        }}
        style={{
          width: '100%',
          minHeight: '36px',
          height: previewSrc ? 'auto' : '36px',
          padding: '8px',
          border: '1.3px solid #000000',
          fontFamily: '"Futura PT Book"',
          fontSize: '11px',
          backgroundColor: '#FFFFFF',
          color: gray ? '#808080' : '#EB1C24',
          boxSizing: 'border-box',
          borderRadius: '0',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textTransform: 'uppercase',
          position: 'relative',
          overflow: previewSrc ? 'visible' : 'hidden',
          display: previewSrc ? 'block' : 'flex',
          alignItems: previewSrc ? 'normal' : 'center',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {previewSrc ? (
          <img
            src={previewSrc}
            alt=""
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              objectPosition: 'left center',
              display: 'block',
            }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                padding: '4px 8px',
                border: '1px solid #808080',
                borderRadius: '4px',
                backgroundColor: '#F5F5F5',
                color: '#000000',
                textTransform: 'uppercase',
                fontSize: '11px',
                fontFamily: '"Futura PT Book"',
              }}
            >
              CHOOSE FILE
            </span>
            <span style={{ marginLeft: '8px', color: '#808080', fontFamily: '"Futura PT Book"', fontSize: '10px' }}>
              NO FILE SELECTED
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
