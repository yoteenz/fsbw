import SlayQuestRewardAsset from './SlayQuestRewardAsset';
import {
  slayQuestRewardAssets,
  type SlayQuestAssetPhase,
  type SlayQuestRewardType,
} from '../../config/slayQuestRewardAssets';

const PREVIEW_PHASES: SlayQuestAssetPhase[] = ['phase1', 'phase2', 'phase3'];

const phaseHeadingByPhase: Record<SlayQuestAssetPhase, string> = {
  phase1: 'PHASE 1 — LOCKED',
  phase2: 'PHASE 2 — 75%',
  phase3: 'PHASE 3 — UNLOCKED',
};

/** Admin Slay Challenge test view — every collectible reward in all three phases. */
export function SlayChallengeCollectiblesPreview() {
  const entries = Object.values(slayQuestRewardAssets);

  return (
    <div style={{ marginTop: '4px' }}>
      <p
        style={{
          fontFamily: '"Futura PT Book"',
          color: '#666666',
          fontSize: '10px',
          margin: '0 0 12px 0',
          lineHeight: 1.45,
          textTransform: 'uppercase',
          textAlign: 'left',
        }}
      >
        PREVIEW ALL REWARD COLLECTIBLES ACROSS PHASE 1, PHASE 2, AND PHASE 3.
      </p>
      {entries.map((asset) => (
        <section key={asset.id} style={{ marginBottom: '16px' }}>
          <p
            style={{
              fontFamily: '"Futura PT Medium"',
              color: '#EB1C24',
              fontSize: '10px',
              margin: '0 0 8px 0',
              lineHeight: 1.25,
              textTransform: 'uppercase',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textAlign: 'left',
            }}
          >
            {asset.label}
          </p>
          {PREVIEW_PHASES.map((phase) => (
            <div key={`${asset.id}-${phase}`} style={{ marginBottom: '6px' }}>
              <p
                style={{
                  fontFamily: '"Futura PT Book"',
                  color: '#808080',
                  fontSize: '8px',
                  margin: '0 0 4px 0',
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                  textAlign: 'left',
                }}
              >
                {phaseHeadingByPhase[phase]}
              </p>
              <SlayQuestRewardAsset
                rewardType={asset.rewardType as SlayQuestRewardType}
                completedRequirements={0}
                totalRequirements={3}
                selectedRewardLabel={asset.label.toUpperCase()}
                phase={phase}
                className=""
              />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
