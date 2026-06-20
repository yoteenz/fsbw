import { useState } from 'react';
import SlayQuestRewardAsset from './SlayQuestRewardAsset';
import { SlayChallengeTierPhaseDetail } from './SlayChallengeTierPhaseDetail';
import {
  slayQuestRewardAssets,
  type SlayQuestAssetPhase,
  type SlayQuestRewardType,
} from '../../config/slayQuestRewardAssets';
import { resolveSlayChallengeTierIndexForRewardType } from '../../utils/slayChallengeRewardAssetMap';

const PREVIEW_PHASES: SlayQuestAssetPhase[] = ['phase1', 'phase2', 'phase3'];

const phaseHeadingByPhase: Record<SlayQuestAssetPhase, string> = {
  phase1: 'PHASE 1 — LOCKED',
  phase2: 'PHASE 2 — 75%',
  phase3: 'PHASE 3 — UNLOCKED',
};

function collectiblePhaseKey(rewardType: SlayQuestRewardType, phase: SlayQuestAssetPhase): string {
  return `${rewardType}-${phase}`;
}

/** Admin Slay Challenge test view — every collectible reward in all three phases. */
export function SlayChallengeCollectiblesPreview() {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const entries = Object.values(slayQuestRewardAssets);

  const toggleExpanded = (key: string) => {
    setExpandedKey((current) => (current === key ? null : key));
  };

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
        TAP ANY COLLECTIBLE PHASE TO VIEW THAT TIER&apos;S REQUIREMENTS AND REWARDS.
      </p>
      {entries.map((asset) => {
        const tierIndex = resolveSlayChallengeTierIndexForRewardType(asset.rewardType);
        return (
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
            {PREVIEW_PHASES.map((phase) => {
              const key = collectiblePhaseKey(asset.rewardType, phase);
              const isExpanded = expandedKey === key;
              return (
                <div key={key} style={{ marginBottom: '6px' }}>
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
                  <button
                    type="button"
                    onClick={() => toggleExpanded(key)}
                    aria-expanded={isExpanded}
                    style={{
                      display: 'block',
                      width: '100%',
                      margin: 0,
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <SlayQuestRewardAsset
                      rewardType={asset.rewardType}
                      completedRequirements={0}
                      totalRequirements={3}
                      selectedRewardLabel={asset.label.toUpperCase()}
                      phase={phase}
                      className=""
                    />
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        color: isExpanded ? '#EB1C24' : '#808080',
                        fontSize: '8px',
                        margin: '-4px 0 0 0',
                        lineHeight: 1.2,
                        textTransform: 'uppercase',
                        textAlign: 'center',
                      }}
                    >
                      {isExpanded ? 'HIDE TIER DETAILS' : 'TAP FOR TIER REQUIREMENTS + REWARDS'}
                    </p>
                  </button>
                  {isExpanded ? (
                    <SlayChallengeTierPhaseDetail
                      tierIndex={tierIndex}
                      phase={phase}
                      rewardType={asset.rewardType}
                    />
                  ) : null}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
