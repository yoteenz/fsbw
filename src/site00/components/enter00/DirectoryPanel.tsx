import { SITE00_DIRECTORY_SECTIONS, SITE00_ENTER_COPY } from '../../config/directory';
import { ArchitecturalPanel } from '../panels/ArchitecturalPanel';
import { SectionRule } from '../panels/SectionRule';
import { DirectoryRow } from '../workflow/WorkflowCards';

export function DirectoryPanel() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(200px, 1fr) minmax(280px, 380px)',
        gap: 32,
        alignItems: 'start',
        maxWidth: 900,
        margin: '0 auto',
        padding: '40px 24px 80px',
      }}
      className="site00-enter-layout"
    >
      <div>
        <span className="site00-label-red">{SITE00_ENTER_COPY.welcomeNumber}</span>
        <h1 className="site00-heading-lg" style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          {SITE00_ENTER_COPY.welcomeTitle}
          <span className="site00-diamond" aria-hidden="true" />
        </h1>
        <div style={{ margin: '16px 0', maxWidth: 200 }}>
          <SectionRule />
        </div>
        <p className="site00-tagline" style={{ marginBottom: 8 }}>
          {SITE00_ENTER_COPY.welcomeSubtitle}
        </p>
        <p className="site00-body" style={{ color: 'var(--site-text-muted)' }}>
          {SITE00_ENTER_COPY.welcomeBody}
        </p>
      </div>

      <ArchitecturalPanel>
        <div style={{ padding: '24px 20px' }}>
          {SITE00_DIRECTORY_SECTIONS.map((section, idx) => (
            <div key={section.id} style={{ marginBottom: idx === 0 ? 24 : 0 }}>
              <p className="site00-label-red" style={{ marginBottom: 12 }}>
                {section.heading}
              </p>
              <nav aria-label={section.heading}>
                {section.rows.map((row) => (
                  <DirectoryRow
                    key={row.id}
                    number={row.number}
                    title={row.title}
                    description={row.description}
                    href={row.href}
                    enabled={row.enabled}
                  />
                ))}
              </nav>
              {idx === 0 ? (
                <div style={{ margin: '20px 0' }}>
                  <SectionRule />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </ArchitecturalPanel>
    </div>
  );
}

export function EnterStatusStrip() {
  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid var(--site-border)',
        zIndex: 'var(--site-z-nav)',
      }}
    >
      <p className="site00-mono" style={{ margin: 0, textTransform: 'uppercase' }}>
        {SITE00_ENTER_COPY.statusStrip}
      </p>
    </footer>
  );
}
