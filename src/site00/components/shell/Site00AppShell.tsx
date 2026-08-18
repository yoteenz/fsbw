import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Site00LogoBlock } from './Site00LogoBlock';
import { GlobalNav } from './GlobalNav';
import { EntryToggle } from './EntryToggle';
import { useSite00DesktopArtboardPreview } from './Site00DesktopArtboardContext';

type Site00AppShellProps = {
  children: ReactNode;
  locationLabel?: string;
  showStatusStrip?: boolean;
  statusStrip?: ReactNode;
};

export function Site00AppShell({
  children,
  locationLabel,
  showStatusStrip = false,
  statusStrip,
}: Site00AppShellProps) {
  const desktopArtboardPreview = useSite00DesktopArtboardPreview();

  const statusFooter =
    showStatusStrip && statusStrip ? (
      <footer
        className={desktopArtboardPreview ? 'site00-status-strip-host--viewport' : undefined}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 'var(--site-z-nav)',
        }}
      >
        {statusStrip}
      </footer>
    ) : null;

  return (
    <>
      <header
        className="site00-safe-ui"
        style={{
          position: 'relative',
          zIndex: 'var(--site-z-nav)',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'start',
          gap: 16,
          paddingTop: 20,
        }}
      >
        <Site00LogoBlock locationLabel={locationLabel} />
        <div style={{ justifySelf: 'center', paddingTop: 4 }}>
          <GlobalNav />
        </div>
        <div style={{ justifySelf: 'end' }}>
          <EntryToggle />
        </div>
      </header>
      <main>{children}</main>
      {desktopArtboardPreview && statusFooter && typeof document !== 'undefined'
        ? createPortal(statusFooter, document.body)
        : statusFooter}
    </>
  );
}
