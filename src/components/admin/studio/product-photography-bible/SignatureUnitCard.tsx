import type { SignatureUnitPhotographyRecord } from '../../../../utils/adminStudioProductPhotographyBibleDemo';
import {
  MEDIA_KIT_STATUS_LABELS,
  PHOTOGRAPHY_STATUS_LABELS,
} from '../../../../utils/adminStudioProductPhotographyBibleDemo';
import { PP_VISUAL, ppActionBtn, ppCaption, ppPanelStyle, statusColor } from './photographyBibleTheme';

type SignatureUnitCardProps = {
  unit: SignatureUnitPhotographyRecord;
  onApprove: () => void;
  onReplace: () => void;
  onView: () => void;
  onGenerateVariants: () => void;
};

export function SignatureUnitCard({ unit, onApprove, onReplace, onView, onGenerateVariants }: SignatureUnitCardProps) {
  return (
    <article style={{ ...ppPanelStyle, padding: '10px', borderTop: `2px solid ${PP_VISUAL.red}` }}>
      <div className="flex gap-2">
        <div
          className="shrink-0 w-[72px] h-[88px] flex items-end justify-center overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.9)', border: `1px solid ${PP_VISUAL.panelBorder}` }}
        >
          <img
            src={unit.heroPortraitSrc}
            alt={unit.label}
            className="max-w-full max-h-[80px] object-contain object-top"
            style={{ marginBottom: '-8px' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ ...ppCaption, color: PP_VISUAL.red, fontSize: '7px' }}>COLLECTION NO. {unit.collectionNo}</p>
          <p style={{ ...ppCaption, color: PP_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '10px' }}>
            {unit.label}
          </p>
          <p style={{ ...ppCaption, fontSize: '7px', marginTop: 4 }}>
            PHOTO ·{' '}
            <span style={{ color: statusColor(unit.photographyStatus) }}>
              {PHOTOGRAPHY_STATUS_LABELS[unit.photographyStatus]}
            </span>
          </p>
          <p style={{ ...ppCaption, fontSize: '7px' }}>
            MEDIA KIT ·{' '}
            <span style={{ color: statusColor(unit.mediaKitStatus) }}>
              {MEDIA_KIT_STATUS_LABELS[unit.mediaKitStatus]}
            </span>
          </p>
          <p style={{ ...ppCaption, fontSize: '6px' }}>
            V{unit.version} · UPDATED {unit.lastUpdated}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 mt-3">
        <button type="button" style={ppActionBtn} onClick={onApprove}>
          APPROVE
        </button>
        <button type="button" style={ppActionBtn} onClick={onReplace}>
          REPLACE
        </button>
        <button type="button" style={ppActionBtn} onClick={onView}>
          VIEW
        </button>
        <button type="button" style={{ ...ppActionBtn, color: PP_VISUAL.red }} onClick={onGenerateVariants}>
          GENERATE VARIANTS
        </button>
      </div>
    </article>
  );
}
