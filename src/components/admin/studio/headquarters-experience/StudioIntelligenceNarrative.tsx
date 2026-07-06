import { HQ, hqBody, hqLabel } from './hqExperienceTheme';
import { HqGlassSurface } from './HqWingZone';

type Props = {
  publishedCount: number;
  primaryInsight?: string;
  secondaryInsights?: string[];
  accentHex?: string;
  livingMemory?: string | null;
};

/** Conversational Studio Intelligence — educates naturally, not via docs. */
export function StudioIntelligenceNarrative({
  publishedCount,
  primaryInsight,
  secondaryInsights = [],
  accentHex = HQ.red,
  livingMemory,
}: Props) {
  const narrative = buildIntelligenceNarrative(publishedCount, primaryInsight);

  return (
    <HqGlassSurface>
      <p style={{ ...hqLabel, color: accentHex, margin: 0 }}>STUDIO INTELLIGENCE</p>
      {livingMemory ? (
        <p style={{ ...hqBody, fontSize: '8px', color: HQ.gold, marginTop: 10, lineHeight: 1.5, fontStyle: 'italic' }}>
          {livingMemory}
        </p>
      ) : null}
      <p style={{ ...hqBody, fontSize: '9px', color: HQ.black, marginTop: 12, lineHeight: 1.55, fontStyle: 'normal' }}>
        {narrative}
      </p>
      {secondaryInsights.slice(0, 2).map((line) => (
        <p key={line} style={{ ...hqBody, fontSize: '7px', color: HQ.gray, marginTop: 10, lineHeight: 1.5 }}>
          · {line}
        </p>
      ))}
    </HqGlassSurface>
  );
}

function buildIntelligenceNarrative(publishedCount: number, primaryInsight?: string): string {
  if (primaryInsight) return primaryInsight;
  if (publishedCount === 0) {
    return "I'm ready when you are. Once we publish our first knowledge asset, I'll begin learning your organization's voice and patterns.";
  }
  if (publishedCount === 1) {
    return "I've only seen one published knowledge asset so far. Once we reach five, I'll begin identifying patterns. At twenty-five, I'll start predicting audience behavior. As we publish more, my recommendations become increasingly personalized.";
  }
  if (publishedCount < 5) {
    return `I've observed ${publishedCount} published assets. A few more and I'll unlock pattern recognition — then recommendations become proactive, not reactive.`;
  }
  if (publishedCount < 25) {
    return `With ${publishedCount} assets in the library, I'm identifying early patterns. At twenty-five publications, predictive audience modeling activates.`;
  }
  return `Your library has ${publishedCount} assets. I'm predicting audience behavior and personalizing recommendations based on what resonates for this organization.`;
}
