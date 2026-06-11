import type { CSSProperties } from 'react';
import type { AnalysisLook, HairstyleAnalysis } from '../../types/hairstyleAnalysis';
import {
  additionalLooksLimit,
  getTemplateSlots,
  normalizeAnalysisTier,
} from '../../utils/hairstyleAnalysisRules';
import RoseBullet from './RoseBullet';
import styles from './HairstyleAnalysisCard.module.css';

type HairstyleAnalysisCardProps = {
  analysis: HairstyleAnalysis;
  showDebugFrames?: boolean;
};

function pctRect(style: { left: string; top: string; width?: string; height?: string }): CSSProperties {
  return {
    left: style.left,
    top: style.top,
    width: style.width,
    height: style.height,
  };
}

function formatRating(rating: number): string {
  return Number.isInteger(rating) ? `${rating}.0` : rating.toFixed(1);
}

function topMatchBulletLines(look: AnalysisLook): string[] {
  return [
    look.unit,
    `${look.color} | ${look.length} | ${look.lace}`,
    `${look.density} | ${look.hairline}`,
    `${look.part} | ${look.styling}`,
  ];
}

function specTableLines(look: AnalysisLook): string[] {
  return [
    look.unit,
    look.color,
    look.length,
    look.lace,
    look.density,
    look.hairline,
    look.part,
    look.styling.replace(/^STYLING:\s*/i, ''),
  ];
}

function additionalLookLines(look: AnalysisLook): string[] {
  return [look.unit, `${look.color} · ${look.length}`, `SCORE ${look.score}`];
}

export default function HairstyleAnalysisCard({
  analysis,
  showDebugFrames = false,
}: HairstyleAnalysisCardProps) {
  const tierKey = normalizeAnalysisTier(analysis.tier);
  const slots = getTemplateSlots(analysis.tier);
  const additionalLimit = additionalLooksLimit(analysis.tier);
  const additionalLooks = analysis.additionalLooks.slice(0, additionalLimit);
  const debugClass = showDebugFrames ? styles.slotDebug : '';

  return (
    <div
      className={styles.card}
      data-attribute="hairstyle-analysis-card"
      data-tier={analysis.tier}
    >
      <img
        src={analysis.templateUrl}
        alt=""
        className={styles.templateBg}
        crossOrigin="anonymous"
        draggable={false}
      />

      <div
        className={`${styles.slot} ${debugClass}`}
        style={pctRect(slots.clientImage)}
      >
        <img
          src={analysis.clientPreviewUrl}
          alt=""
          className={`${styles.clientImage} w-full h-full`}
          crossOrigin="anonymous"
          draggable={false}
        />
      </div>

      <div
        className={`${styles.slot} ${debugClass}`}
        style={pctRect(slots.topScore)}
      >
        <p className={`${styles.overlayText} ${styles.scoreText}`}>{analysis.topMatch.score}</p>
      </div>

      <div
        className={`${styles.slot} ${debugClass}`}
        style={pctRect(slots.rating)}
      >
        <p className={`${styles.overlayText} ${styles.ratingText}`}>
          {formatRating(analysis.topMatch.rating)}
        </p>
      </div>

      <div
        className={`${styles.bulletRows} ${debugClass}`}
        style={{ left: slots.topMatchRows.left, top: slots.topMatchRows.top }}
      >
        {topMatchBulletLines(analysis.topMatch).map((line) => (
          <div key={line} className={styles.bulletRow}>
            <RoseBullet size={10} />
            <span className={styles.overlayText}>{line}</span>
          </div>
        ))}
      </div>

      <div
        className={`${styles.specTable} ${debugClass}`}
        style={{ left: slots.specsTable.left, top: slots.specsTable.top }}
      >
        {specTableLines(analysis.topMatch).map((line) => (
          <div key={line} className={styles.specLine}>
            {line}
          </div>
        ))}
      </div>

      {additionalLimit > 0 && slots.additionalLooks
        ? additionalLooks.map((look, index) => {
            const slot = slots.additionalLooks?.[index];
            if (!slot) return null;
            const thumbUrl = look.imageUrl ?? analysis.clientPreviewUrl;
            return (
              <div key={look.id}>
                <div
                  className={`${styles.slot} ${debugClass}`}
                  style={pctRect(slot.image)}
                >
                  {look.imageUrl ? (
                    <img
                      src={thumbUrl}
                      alt=""
                      className={`${styles.additionalThumb} w-full h-full`}
                      crossOrigin="anonymous"
                      draggable={false}
                    />
                  ) : (
                    <div className={`${styles.additionalTextOnly} w-full h-full`}>
                      <span className={styles.additionalRank}>#{look.rank}</span>
                      <span className={styles.additionalUnit}>{look.unit}</span>
                      <span className={styles.additionalUnit}>{look.color}</span>
                    </div>
                  )}
                </div>
                <div
                  className={`${styles.slot} ${debugClass}`}
                  style={pctRect(slot.text)}
                >
                  {additionalLookLines(look).map((line) => (
                    <div key={line} className={styles.specLine}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        : null}

      {analysis.whyItWorks.length > 0 ? (
        <div
          className={`${styles.whySection} ${debugClass}`}
          style={{ left: slots.whyRows.left, top: slots.whyRows.top }}
        >
          {analysis.whyItWorks.map((line) => (
            <div key={line} className={styles.bulletRow}>
              <RoseBullet size={10} />
              <span className={`${styles.overlayText} ${styles.overlayTextMuted}`}>{line}</span>
            </div>
          ))}
        </div>
      ) : null}

      <span className="sr-only">
        Hairstyle analysis for {analysis.clientName} — {tierKey} tier
      </span>
    </div>
  );
}
