import { useEffect, useRef, type CSSProperties } from 'react';
import styles from './HairstyleAnalysisCard.module.css';

type EditableOverlayTextProps = {
  slotId: string;
  value: string;
  debug?: boolean;
  onChange?: (slotId: string, value: string) => void;
  className?: string;
  multiline?: boolean;
  style?: CSSProperties;
};

export default function EditableOverlayText({
  slotId,
  value,
  debug = false,
  onChange,
  className = '',
  multiline = false,
  style,
}: EditableOverlayTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debug || !ref.current) return;
    if (ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [debug, value]);

  if (debug && onChange) {
    return (
      <div
        ref={ref}
        className={`${styles.overlayText} ${styles.overlayEditable} ${className}`.trim()}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label={slotId}
        onInput={(e) => onChange(slotId, e.currentTarget.textContent ?? '')}
        style={{ ...(multiline ? { whiteSpace: 'pre-wrap' as const } : undefined), ...style }}
      />
    );
  }

  return (
    <p
      className={`${styles.overlayText} ${className}`.trim()}
      style={{ ...(multiline ? { whiteSpace: 'pre-wrap' as const } : undefined), ...style }}
    >
      {value}
    </p>
  );
}
