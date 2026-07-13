import { useEffect, useId, useRef } from 'react';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Bottom sheet on mobile; side drawer on desktop compact */
  variant?: 'sheet' | 'drawer';
};

/** Internal overlay panel — does not expand outer page height. */
export function ExperienceLabSheet({ open, title, onClose, children, variant = 'sheet' }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => prev?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className={`elab-sheet elab-sheet--${variant}`} data-elab-sheet role="presentation">
      <button type="button" className="elab-sheet__scrim" aria-label="Close panel" onClick={onClose} />
      <div
        ref={panelRef}
        className="elab-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="elab-sheet__head">
          <h2 id={titleId} className="elab-sheet__title">{title}</h2>
          <button type="button" className="elab-sheet__close" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="elab-sheet__body">{children}</div>
      </div>
    </div>
  );
}
