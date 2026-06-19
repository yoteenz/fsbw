import { useEffect, useState } from 'react';
import {
  getSlayQuestAssetPhase,
  slayQuestRewardAssets,
  type SlayQuestAssetPhase,
  type SlayQuestFallbackIcon,
  type SlayQuestRewardType,
} from '../../config/slayQuestRewardAssets';

type SlayQuestRewardAssetProps = {
  rewardType: SlayQuestRewardType;
  completedRequirements: number;
  totalRequirements?: number;
  selectedRewardLabel: string;
  className?: string;
};

const phaseLabelByPhase: Record<SlayQuestAssetPhase, string> = {
  phase1: 'LOCKED / IN PROGRESS',
  phase2: '75% COMPLETE',
  phase3: 'UNLOCKED',
};

const fallbackLabelByIcon: Record<SlayQuestFallbackIcon, string> = {
  diamond: 'POINTS',
  voucher: 'VOUCHER',
  gift: 'GIFT',
  double_points: '2X',
};

const isPlaceholderAssetUrl = (url: string) => !url || url.startsWith('REPLACE_WITH_SUPABASE_URL_');

function SlayQuestRewardFallback({ icon }: { icon: SlayQuestFallbackIcon }) {
  return (
    <div
      style={{
        width: '82px',
        height: '82px',
        margin: '0 auto',
        border: '1.3px solid #EB1C24',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.26)), radial-gradient(circle at 30% 20%, rgba(235,28,36,0.16), transparent 42%)',
        boxShadow: '0 10px 24px rgba(0,0,0,0.12), inset 0 0 18px rgba(255,255,255,0.5)',
        backdropFilter: 'blur(10px)',
      }}
      aria-hidden="true"
    >
      <span
        style={{
          fontFamily: '"Futura PT Medium"',
          color: '#EB1C24',
          fontSize: icon === 'double_points' ? '20px' : '9px',
          fontWeight: 500,
          letterSpacing: icon === 'double_points' ? '0.04em' : '0.09em',
          lineHeight: 1,
          textTransform: 'uppercase',
        }}
      >
        {fallbackLabelByIcon[icon]}
      </span>
    </div>
  );
}

export default function SlayQuestRewardAsset({
  rewardType,
  completedRequirements,
  totalRequirements = 3,
  selectedRewardLabel,
  className = '',
}: SlayQuestRewardAssetProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const asset = slayQuestRewardAssets[rewardType];
  const phase = getSlayQuestAssetPhase(completedRequirements, totalRequirements);
  const phaseUrlByPhase: Record<SlayQuestAssetPhase, string> = {
    phase1: asset.phase1Url,
    phase2: asset.phase2Url,
    phase3: asset.phase3Url,
  };
  const phaseUrl = phaseUrlByPhase[phase];
  const hasUsableImage = !isPlaceholderAssetUrl(phaseUrl);
  const displayCopy = phase === 'phase3' ? asset.psaSuccessMessage : asset.unlockCopy;

  useEffect(() => {
    setImageState(hasUsableImage ? 'loading' : 'error');
  }, [hasUsableImage, phaseUrl]);

  return (
    <div
      className={className}
      style={{
        border: '1.3px solid #000000',
        padding: '12px',
        margin: '12px 0',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.78), rgba(255,255,255,0.48)), radial-gradient(circle at top right, rgba(235,28,36,0.1), transparent 36%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '3px 3px 0 rgba(0,0,0,0.08)',
        textAlign: 'left',
      }}
    >
      <style>
        {`
          @keyframes slayQuestAssetSkeleton {
            0% { opacity: 0.38; transform: scale(0.98); }
            50% { opacity: 0.82; transform: scale(1); }
            100% { opacity: 0.38; transform: scale(0.98); }
          }
        `}
      </style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '92px',
            minWidth: '92px',
            minHeight: '92px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {hasUsableImage && imageState === 'loading' && (
            <div
              aria-label="Loading reward collectible"
              style={{
                width: '82px',
                height: '82px',
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, rgba(235,28,36,0.18), rgba(128,128,128,0.1), rgba(255,255,255,0.7))',
                animation: 'slayQuestAssetSkeleton 1.15s ease-in-out infinite',
              }}
            />
          )}
          {hasUsableImage && imageState !== 'error' && (
            <img
              src={phaseUrl}
              alt={asset.alt}
              onLoad={() => setImageState('loaded')}
              onError={() => setImageState('error')}
              style={{
                display: imageState === 'loaded' ? 'block' : 'none',
                width: '92px',
                height: '92px',
                objectFit: 'contain',
              }}
            />
          )}
          {(!hasUsableImage || imageState === 'error') && <SlayQuestRewardFallback icon={asset.fallbackIcon} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: '"Futura PT Medium"',
              color: '#EB1C24',
              fontSize: '9px',
              margin: '0 0 4px 0',
              lineHeight: 1.2,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {phaseLabelByPhase[phase]}
          </p>
          <p
            style={{
              fontFamily: '"Futura PT Medium"',
              color: '#000000',
              fontSize: '11px',
              margin: '0 0 4px 0',
              lineHeight: 1.25,
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {selectedRewardLabel || asset.label}
          </p>
          <p
            style={{
              fontFamily: '"Futura PT Book"',
              color: '#808080',
              fontSize: '9px',
              margin: '0 0 7px 0',
              lineHeight: 1.35,
              textTransform: 'uppercase',
            }}
          >
            {displayCopy}
          </p>
          <div
            style={{
              width: '100%',
              height: '6px',
              border: '1px solid #000000',
              background: '#ffffff',
              overflow: 'hidden',
            }}
            aria-hidden="true"
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, (completedRequirements / Math.max(1, totalRequirements)) * 100))}%`,
                height: '100%',
                background: phase === 'phase3' ? '#EB1C24' : '#808080',
              }}
            />
          </div>
          <p
            style={{
              fontFamily: '"Futura PT Medium"',
              color: '#000000',
              fontSize: '8px',
              margin: '5px 0 0 0',
              lineHeight: 1.2,
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {Math.min(completedRequirements, totalRequirements)} / {totalRequirements} REQUIREMENTS
          </p>
        </div>
      </div>
    </div>
  );
}
