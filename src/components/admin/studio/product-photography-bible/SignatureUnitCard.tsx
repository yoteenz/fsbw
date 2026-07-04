import { useNavigate } from 'react-router-dom';
import type { SignatureUnitPhotographyRecord } from '../../../../utils/adminStudioProductPhotographyBibleDemo';
import { adminStudioBrandAssetsAssetFactoryPath } from '../../../../utils/adminStudioRoutes';
import {
  deriveSignatureUnitPipelineStatus,
  type SignatureUnitPipelineStatus,
} from './signatureUnitPipelineStatus';
import type { ProductAssetFactoryJobRecord } from '../../../../studio-os/product-photography/ProductAssetFactory';
import { PP_VISUAL, ppActionBtn, ppCaption, ppPanelStyle, statusColor } from './photographyBibleTheme';

type SignatureUnitCardProps = {
  unit: SignatureUnitPhotographyRecord;
  factoryJob?: ProductAssetFactoryJobRecord;
  derivativeCount: number;
  generating?: boolean;
  generateEnabled?: boolean;
  onReplace: () => void;
  onView: () => void;
  onGenerateVariants: () => void;
};

function StatusRow({ label, value }: { label: string; value: string }) {
  const normalized = value.toLowerCase();
  const color =
    normalized.includes('approved') || normalized.includes('generated') || normalized.includes('ready') || normalized.includes('complete') || normalized.includes('inherited')
      ? '#16a34a'
      : normalized.includes('pending') || normalized.includes('prepared') || normalized.includes('processing')
        ? '#ca8a04'
        : normalized.includes('missing') || normalized.includes('needs') || normalized.includes('empty')
          ? PP_VISUAL.muted
          : statusColor(normalized);

  return (
    <p style={{ ...ppCaption, fontSize: '7px', marginTop: 2 }}>
      {label} · <span style={{ color }}>{value.toUpperCase()}</span>
    </p>
  );
}

function PipelineStatusBlock({ status }: { status: SignatureUnitPipelineStatus }) {
  return (
    <div className="mt-2 space-y-0">
      <StatusRow label="CREATIVE DNA" value={status.creativeDna} />
      <StatusRow label="MASTER HERO" value={status.masterHero} />
      <StatusRow label="TRANSPARENT MASTER" value={status.transparentMaster} />
      <StatusRow label="MEDIA KIT" value={status.mediaKit} />
      <StatusRow label="SMART ASSETS" value={status.smartAssets} />
      <StatusRow label="ASSET FACTORY" value={status.assetFactory} />
    </div>
  );
}

export function SignatureUnitCard({
  unit,
  factoryJob,
  derivativeCount,
  generating = false,
  generateEnabled = false,
  onReplace,
  onView,
  onGenerateVariants,
}: SignatureUnitCardProps) {
  const navigate = useNavigate();
  const pipeline = deriveSignatureUnitPipelineStatus(unit, factoryJob, derivativeCount);

  return (
    <article style={{ ...ppPanelStyle, padding: '10px', borderTop: `2px solid ${PP_VISUAL.panelBorder}` }}>
      <div className="flex gap-2">
        <div
          className="shrink-0 w-[72px] h-[88px] flex items-end justify-center overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.9)', border: `1px solid ${PP_VISUAL.panelBorder}` }}
        >
          <img
            src={unit.referenceImageSrc}
            alt={unit.label}
            className="max-w-full max-h-[80px] object-contain object-top"
            style={{ marginBottom: '-8px' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ ...ppCaption, color: PP_VISUAL.red, fontSize: '7px' }}>UNIT {unit.collectionNo}</p>
          <p style={{ ...ppCaption, color: PP_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '10px' }}>
            {unit.label}
          </p>
          <span
            style={{
              ...ppCaption,
              display: 'inline-block',
              marginTop: 4,
              fontSize: '6px',
              padding: '2px 6px',
              border: `1px solid ${PP_VISUAL.red}`,
              color: PP_VISUAL.red,
              background: 'rgba(235,28,36,0.05)',
            }}
          >
            CREATIVE DNA · INHERITED v1.0
          </span>
          <PipelineStatusBlock status={pipeline} />
          <p style={{ ...ppCaption, fontSize: '6px', marginTop: 6 }}>UPDATED {unit.lastUpdated}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 mt-3">
        <button type="button" style={ppActionBtn} onClick={onView} disabled={generating}>
          VIEW
        </button>
        <button
          type="button"
          style={{ ...ppActionBtn, color: PP_VISUAL.red, fontFamily: '"Futura PT Medium"' }}
          onClick={() => navigate(adminStudioBrandAssetsAssetFactoryPath())}
          disabled={generating}
        >
          OPEN IN ASSET FACTORY
        </button>
        <button
          type="button"
          style={ppActionBtn}
          onClick={onReplace}
          disabled={generating || !generateEnabled}
          title={generateEnabled ? undefined : 'Fal generation POC — SOFT WAVE only'}
        >
          {generating ? 'GENERATING…' : 'REPLACE REFERENCE'}
        </button>
        <button
          type="button"
          style={{ ...ppActionBtn, color: generateEnabled ? PP_VISUAL.red : PP_VISUAL.muted }}
          onClick={onGenerateVariants}
          disabled={generating || !generateEnabled}
          title={generateEnabled ? 'Generate via Creative DNA v1.0 + Fal' : 'Fal generation POC — SOFT WAVE only'}
        >
          {generating ? 'GENERATING…' : 'GENERATE MASTER HERO'}
        </button>
      </div>
    </article>
  );
}
