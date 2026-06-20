import {
  parseSlayChallengeTierRequirement,
  SLAY_CHALLENGE_TIERS,
} from '../../config/slayChallengeTiers';
import type { SlayQuestAssetPhase, SlayQuestRewardType } from '../../config/slayQuestRewardAssets';
import {
  getSlayChallengeRewardAssetSelection,
  slayChallengeTierRewardsForCollectible,
} from '../../utils/slayChallengeRewardAssetMap';
import { SlayChallengeBohemySubhead, SlayChallengeRoseBullet } from './SlayChallengeRoseBullet';

const phaseStatusByPhase: Record<SlayQuestAssetPhase, string> = {
  phase1: 'LOCKED / IN PROGRESS',
  phase2: '75% COMPLETE',
  phase3: 'UNLOCKED',
};

function completedCountForPhase(phase: SlayQuestAssetPhase, required: number): number {
  if (phase === 'phase3') return required;
  if (phase === 'phase2') return Math.max(1, Math.floor(required * 0.75));
  return 0;
}

type SlayChallengeTierPhaseDetailProps = {
  tierIndex: number;
  phase: SlayQuestAssetPhase;
  rewardType: SlayQuestRewardType;
};

export function SlayChallengeTierPhaseDetail({
  tierIndex,
  phase,
  rewardType,
}: SlayChallengeTierPhaseDetailProps) {
  const safeTierIndex = Math.min(Math.max(tierIndex, 0), SLAY_CHALLENGE_TIERS.length - 1);
  const tier = SLAY_CHALLENGE_TIERS[safeTierIndex];
  const { required, total } = parseSlayChallengeTierRequirement(tier.requirement, tier.tasks.length);
  const completedCount = completedCountForPhase(phase, required);
  const matchingRewards = slayChallengeTierRewardsForCollectible(safeTierIndex, rewardType);

  return (
    <div
      style={{
        border: '1.3px solid #000000',
        borderTop: 'none',
        padding: '12px',
        margin: '0 0 8px 0',
        background: 'rgba(255,255,255,0.92)',
        textAlign: 'left',
      }}
    >
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          color: '#EB1C24',
          fontSize: '9px',
          margin: '0 0 8px 0',
          lineHeight: 1.25,
          textTransform: 'uppercase',
          fontWeight: 500,
          letterSpacing: '0.06em',
        }}
      >
        {phaseStatusByPhase[phase]} — {tier.title}
      </p>

      {tier.description ? (
        <p
          style={{
            fontFamily: '"Futura PT Book"',
            color: '#000000',
            fontSize: '10px',
            margin: '0 0 6px 0',
            lineHeight: 1.45,
            textTransform: 'uppercase',
          }}
        >
          {tier.description}
        </p>
      ) : null}

      <SlayChallengeBohemySubhead>requirements</SlayChallengeBohemySubhead>
      <p
        style={{
          fontFamily: '"Futura PT Book"',
          color: '#808080',
          fontSize: '9px',
          margin: '0 0 6px 0',
          lineHeight: 1.4,
          textTransform: 'uppercase',
        }}
      >
        {tier.requirement}
      </p>
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          color: '#000000',
          fontSize: '9px',
          margin: '0 0 8px 0',
          lineHeight: 1.3,
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        {completedCount} / {required} REQUIREMENTS MET ({total} ACTIVITIES AVAILABLE)
      </p>
      <div style={{ marginBottom: '12px' }}>
        {tier.tasks.map((task, index) => (
          <SlayChallengeRoseBullet key={`${tier.title}-task-${task}`} completed={index < completedCount}>
            {task}
          </SlayChallengeRoseBullet>
        ))}
      </div>

      <SlayChallengeBohemySubhead>rewards</SlayChallengeBohemySubhead>
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          color: '#000000',
          fontSize: '10px',
          margin: '0 0 6px 0',
          lineHeight: 1.35,
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        {tier.rewardHeading}
      </p>
      <div style={{ marginBottom: matchingRewards.length > 0 ? '8px' : 0 }}>
        {tier.rewards.map((reward) => {
          const isMatch =
            getSlayChallengeRewardAssetSelection(reward)?.rewardType === rewardType;
          return (
            <div
              key={`${tier.title}-reward-${reward}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '4px',
                padding: isMatch ? '6px 8px' : '0',
                border: isMatch ? '1.3px solid #EB1C24' : 'none',
                background: isMatch ? 'rgba(235, 28, 36, 0.06)' : 'transparent',
              }}
            >
              <img
                src="/assets/rose-alert.svg"
                alt=""
                style={{ width: '12px', height: '12px', marginTop: '2px', flexShrink: 0 }}
              />
              <p
                style={{
                  fontFamily: '"Futura PT Book"',
                  color: isMatch ? '#EB1C24' : '#000000',
                  fontSize: '10px',
                  margin: 0,
                  lineHeight: 1.45,
                  textTransform: 'uppercase',
                  fontWeight: isMatch ? 500 : 400,
                }}
              >
                {reward}
                {isMatch ? ' — THIS COLLECTIBLE' : ''}
              </p>
            </div>
          );
        })}
      </div>
      {matchingRewards.length > 0 ? (
        <p
          style={{
            fontFamily: '"Futura PT Book"',
            color: '#808080',
            fontSize: '8px',
            margin: 0,
            lineHeight: 1.35,
            textTransform: 'uppercase',
          }}
        >
          COLLECTIBLE PREVIEW MATCHES: {matchingRewards.join(' · ')}
        </p>
      ) : null}
    </div>
  );
}
