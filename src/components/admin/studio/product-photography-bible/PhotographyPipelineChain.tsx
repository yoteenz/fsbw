import {
  PHOTOGRAPHY_BIBLE_PIPELINE_CAPTION,
  PHOTOGRAPHY_BIBLE_PIPELINE_CHAIN,
} from './photographyBibleOverviewConfig';
import { PP_VISUAL, ppCaption, ppPanelStyle, ppSectionTitle } from './photographyBibleTheme';

export function PhotographyPipelineChain() {
  return (
    <section style={{ ...ppPanelStyle, padding: '12px', marginBottom: '12px' }}>
      <p style={ppSectionTitle}>MANUFACTURING PIPELINE</p>
      <p style={{ ...ppCaption, marginBottom: 10 }}>{PHOTOGRAPHY_BIBLE_PIPELINE_CAPTION}</p>
      <div className="flex flex-col items-center gap-0">
        {PHOTOGRAPHY_BIBLE_PIPELINE_CHAIN.map((step, i) => {
          const isDna = step.includes('CREATIVE DNA');
          const isFactory = step.includes('ASSET FACTORY');
          const isDelivery = step.includes('WEBSITE');
          return (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? (
                <div className="flex flex-col items-center py-0.5">
                  <div className="w-px h-2" style={{ background: PP_VISUAL.panelBorder }} />
                  <span style={{ ...ppCaption, fontSize: '6px', color: PP_VISUAL.muted }}>↓</span>
                </div>
              ) : null}
              <div
                className="w-full px-3 py-1.5 text-center"
                style={{
                  ...ppCaption,
                  fontSize: '7px',
                  color: isDna || isFactory ? PP_VISUAL.red : isDelivery ? PP_VISUAL.black : PP_VISUAL.muted,
                  background: isDna ? 'rgba(235,28,36,0.06)' : 'rgba(255,255,255,0.85)',
                  border: `1px solid ${isDna ? PP_VISUAL.red : PP_VISUAL.panelBorder}`,
                  fontFamily: isDna || isFactory ? '"Futura PT Medium"' : '"Futura PT Book"',
                }}
              >
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
