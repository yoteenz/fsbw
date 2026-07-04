import {
  AdminStudioExpandableImage,
  type AdminStudioImagePreviewItem,
} from '../AdminStudioImagePreviewModal';
import type { MasterHeroGenerationRecord } from '../../../../studio-os/product-photography/ProductAssetFactory';
import { PP_VISUAL, ppActionBtn, ppCaption, ppSectionTitle } from '../product-photography-bible/photographyBibleTheme';

type MasterHeroPreviewPanelProps = {
  generatedMasterSrc?: string;
  generation?: MasterHeroGenerationRecord;
  running?: boolean;
  onExpand: (item: AdminStudioImagePreviewItem) => void;
  onRegenerate: () => void;
};

function formatTimestamp(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function MasterHeroPreviewPanel({
  generatedMasterSrc,
  generation,
  running = false,
  onExpand,
  onRegenerate,
}: MasterHeroPreviewPanelProps) {
  const falOriginal = generation?.falOriginalImageUrl;

  return (
    <section style={{ marginTop: 12 }}>
      <p style={ppSectionTitle}>GENERATED MASTER HERO</p>
      <p style={{ ...ppCaption, marginBottom: 8, fontSize: '7px' }}>
        FRESH FAL OUTPUT ONLY · NO WEBSITE PLACEHOLDER FALLBACK
      </p>

      {generatedMasterSrc ? (
        <>
          <AdminStudioExpandableImage
            src={generatedMasterSrc}
            alt="Generated master hero"
            label="GENERATED MASTER HERO"
            subtitle="CANONICAL SUPABASE ASSET · POST-FAL"
            onExpand={onExpand}
          />

          <div
            className="mt-3 p-2 grid grid-cols-1 gap-1 sm:grid-cols-2"
            style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.85)' }}
          >
            <p style={{ ...ppCaption, fontSize: '7px' }}>
              GENERATION TIMESTAMP · {formatTimestamp(generation?.generatedAt)}
            </p>
            <p style={{ ...ppCaption, fontSize: '7px' }}>
              MODEL · {generation?.falModel ?? '—'}
            </p>
            <p style={{ ...ppCaption, fontSize: '7px' }}>
              PROMPT VERSION · {generation?.promptVersion ?? '—'}
            </p>
            <p style={{ ...ppCaption, fontSize: '7px', wordBreak: 'break-all' }}>
              GENERATION ID · {generation?.generationId ?? '—'}
            </p>
            {generation?.falRequestId ? (
              <p style={{ ...ppCaption, fontSize: '7px', wordBreak: 'break-all' }}>
                FAL REQUEST ID · {generation.falRequestId}
              </p>
            ) : null}
            {generation?.debugLog?.imagePassedToBackgroundRemoval ? (
              <p style={{ ...ppCaption, fontSize: '6px', wordBreak: 'break-all' }}>
                BG REMOVAL INPUT · {generation.debugLog.imagePassedToBackgroundRemoval}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              style={{ ...ppActionBtn, color: PP_VISUAL.red, opacity: running ? 0.6 : 1 }}
              disabled={running}
              onClick={onRegenerate}
            >
              {running ? 'REGENERATING…' : 'REGENERATE'}
            </button>
            {falOriginal ? (
              <button
                type="button"
                style={ppActionBtn}
                onClick={() => window.open(falOriginal, '_blank', 'noopener,noreferrer')}
              >
                VIEW ORIGINAL FAL OUTPUT
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <div className="p-3" style={{ border: `1px dashed ${PP_VISUAL.panelBorder}` }}>
          <p style={{ ...ppCaption, fontSize: '7px' }}>NOT YET GENERATED</p>
          <p style={{ ...ppCaption, color: PP_VISUAL.muted, fontSize: '6px', marginTop: 4 }}>
            CLICK GENERATE MASTER HERO PORTRAIT — PREVIEW WILL SHOW HTTPS FAL OUTPUT ONLY
          </p>
        </div>
      )}
    </section>
  );
}
