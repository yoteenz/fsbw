import { BRAND_UNLOCK_PREMIUM_REWARD_ITEMS } from '../../constants/brandMemberPremiumRewards';

const BRAND_GRAY = '#808080';

type PremiumRewardsMarketingListProps = {
  /** Section heading; omit for inline list only. */
  heading?: string;
  /** Extra margin above the block. */
  marginTop?: string;
  /** Brand `/brand/member`: perk titles in lowercase Bohemy instead of Covered By Your Grace. */
  bohemyPerkTitles?: boolean;
};

/** Shared premium perk titles + subtitles (Account → Rewards, Brand → Become a Member). */
export default function PremiumRewardsMarketingList({
  heading,
  marginTop = '0',
  bohemyPerkTitles = false,
}: PremiumRewardsMarketingListProps) {
  return (
    <div style={{ marginTop }}>
      {heading ? (
        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            color: '#EB1C24',
            fontSize: '11px',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            fontWeight: '500',
            textAlign: 'left',
          }}
        >
          {heading}
        </p>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {BRAND_UNLOCK_PREMIUM_REWARD_ITEMS.map((item) => (
          <div key={item.id}>
            <p
              style={
                bohemyPerkTitles
                  ? {
                      fontFamily: '"Bohemy", cursive',
                      fontSize: '22px',
                      color: '#000000',
                      margin: '0 0 4px 0',
                      textTransform: 'lowercase',
                      fontWeight: 400,
                    }
                  : {
                      fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                      fontSize: '14px',
                      color: '#000000',
                      margin: '0 0 4px 0',
                      textTransform: 'uppercase',
                    }
              }
            >
              {item.title}
            </p>
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontWeight: '500',
                fontSize: '10px',
                color: BRAND_GRAY,
                margin: '0',
                textTransform: 'uppercase',
              }}
            >
              {item.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
