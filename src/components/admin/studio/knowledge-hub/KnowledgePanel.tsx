import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useStudioKnowledge } from '../../../../contexts/StudioKnowledgeContext';
import { adminStudioKnowledgeHubPath } from '../../../../utils/adminStudioRoutes';
import { KH_VISUAL, khActionBtn, khCaption, khPanelStyle, khSectionTitle } from './knowledgeHubTheme';

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: '14px' }}>
      {items.map((item) => (
        <li key={item} style={{ ...khCaption, color: KH_VISUAL.black, marginBottom: '4px' }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Slide-over knowledge panel — purpose, practices, workflows per page. */
export function KnowledgePanel() {
  const navigate = useNavigate();
  const {
    panelOpen,
    closePanel,
    pageGuide,
    tourStepIndex,
    startTour,
    nextTourStep,
    endTour,
    markCurrentPageRead,
  } = useStudioKnowledge();

  useEffect(() => {
    if (!panelOpen) return;
    markCurrentPageRead();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [panelOpen, closePanel, markCurrentPageRead]);

  if (!panelOpen || typeof document === 'undefined') return null;

  const guide = pageGuide;

  return createPortal(
    <div
      className="fixed inset-0 flex justify-end"
      style={{ zIndex: 10002 }}
      role="dialog"
      aria-modal="true"
      aria-label="Knowledge panel"
    >
      <button
        type="button"
        className="flex-1"
        style={{ background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer' }}
        onClick={closePanel}
        aria-label="Close knowledge panel"
      />
      <div
        className="h-full overflow-y-auto"
        style={{
          ...khPanelStyle,
          width: 'min(100%, 360px)',
          maxWidth: '100vw',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ padding: '16px' }}>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p style={{ ...khCaption, color: KH_VISUAL.red }}>KNOWLEDGE HUB</p>
              <p style={{ ...khSectionTitle, fontSize: '12px' }}>
                {guide?.title ?? 'STUDIOOS PAGE'}
              </p>
            </div>
            <button type="button" onClick={closePanel} style={khActionBtn}>
              CLOSE
            </button>
          </div>

          {tourStepIndex >= 0 && guide ? (
            <div style={{ ...khPanelStyle, padding: '10px', marginBottom: '12px', borderColor: KH_VISUAL.red }}>
              <p style={{ ...khCaption, color: KH_VISUAL.red }}>TAKE TOUR · STEP {tourStepIndex + 1}</p>
              <p style={{ ...khCaption, color: KH_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>
                {guide.tourSteps[tourStepIndex]}
              </p>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={nextTourStep} style={khActionBtn}>
                  NEXT STEP
                </button>
                <button type="button" onClick={endTour} style={khActionBtn}>
                  END TOUR
                </button>
              </div>
            </div>
          ) : null}

          {guide ? (
            <>
              <section className="mb-3">
                <p style={khSectionTitle}>PURPOSE</p>
                <p style={{ ...khCaption, color: KH_VISUAL.black }}>{guide.purpose}</p>
              </section>
              <section className="mb-3">
                <p style={khSectionTitle}>WHY IT EXISTS</p>
                <p style={{ ...khCaption, color: KH_VISUAL.black }}>{guide.whyItExists}</p>
              </section>
              <section className="mb-3">
                <p style={khSectionTitle}>WHEN TO USE IT</p>
                <BulletList items={guide.whenToUse} />
              </section>
              <section className="mb-3">
                <p style={khSectionTitle}>BEST PRACTICES</p>
                <BulletList items={guide.bestPractices} />
              </section>
              <section className="mb-3">
                <p style={khSectionTitle}>COMMON MISTAKES</p>
                <BulletList items={guide.commonMistakes} />
              </section>
              {guide.relatedPages.length > 0 ? (
                <section className="mb-3">
                  <p style={khSectionTitle}>RELATED PAGES</p>
                  {guide.relatedPages.map((link) => (
                    <button
                      key={link.route}
                      type="button"
                      onClick={() => {
                        navigate(link.route);
                        closePanel();
                      }}
                      style={{ ...khActionBtn, display: 'block', width: '100%', textAlign: 'left', marginBottom: '4px' }}
                    >
                      {link.label}
                    </button>
                  ))}
                </section>
              ) : null}
              <section className="mb-3">
                <p style={khSectionTitle}>EXAMPLE WORKFLOWS</p>
                <BulletList items={guide.exampleWorkflows} />
              </section>
              <section className="mb-3">
                <p style={khSectionTitle}>OWNER&apos;S MANUAL</p>
                <button
                  type="button"
                  onClick={() => navigate(adminStudioKnowledgeHubPath())}
                  style={{ ...khActionBtn, color: KH_VISUAL.red }}
                >
                  OPEN FULL MANUAL · {guide.ownersManualChapter}
                </button>
              </section>
              <div className="flex flex-wrap gap-2 mt-4">
                <button type="button" onClick={startTour} style={khActionBtn}>
                  TAKE TOUR
                </button>
                <button
                  type="button"
                  onClick={() => navigate(adminStudioKnowledgeHubPath())}
                  style={khActionBtn}
                >
                  OPEN WIKI
                </button>
              </div>
            </>
          ) : (
            <p style={khCaption}>No dedicated guide for this route yet. Open Knowledge Hub for the full wiki.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
