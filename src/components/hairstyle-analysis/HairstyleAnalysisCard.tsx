import { useMemo, useRef } from 'react';
import type {
  AnalysisLook,
  HairstyleAnalysis,
  PercentRect,
  SlotLayoutOverrides,
  TextContentOverrides,
} from '../../types/hairstyleAnalysis';
import {
  additionalLooksLimit,
  getTemplateSlots,
  normalizeAnalysisTier,
} from '../../utils/hairstyleAnalysisRules';
import { mergeSlotRect, mergeTextSlot } from '../../utils/hairstyleAnalysisSlotCoords';
import AnalysisOverlaySlot from './AnalysisOverlaySlot';
import EditableOverlayText from './EditableOverlayText';
import styles from './HairstyleAnalysisCard.module.css';

type HairstyleAnalysisCardProps = {
  analysis: HairstyleAnalysis;
  showDebugFrames?: boolean;
  slotOverrides?: SlotLayoutOverrides;
  textOverrides?: TextContentOverrides;
  onSlotRectChange?: (slotId: string, rect: PercentRect) => void;
  onTextChange?: (slotId: string, value: string) => void;
};

function formatRating(rating: number): string {
  return Number.isInteger(rating) ? `${rating}.0` : rating.toFixed(1);
}

function topMatchLineValues(look: AnalysisLook): string[] {
  return [
    look.unit,
    `${look.color} | ${look.length} | ${look.lace}`,
    `${look.density} | ${look.hairline}`,
    `${look.part} | ${look.styling}`,
  ];
}

function additionalLookText(look: AnalysisLook): string {
  return `${look.unit}\n${look.color} · ${look.length}\nSCORE ${look.score}`;
}

export default function HairstyleAnalysisCard({
  analysis,
  showDebugFrames = false,
  slotOverrides = {},
  textOverrides = {},
  onSlotRectChange,
  onTextChange,
}: HairstyleAnalysisCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tierKey = normalizeAnalysisTier(analysis.tier);
  const slots = getTemplateSlots(analysis.tier);
  const additionalLimit = additionalLooksLimit(analysis.tier);
  const additionalLooks = analysis.additionalLooks.slice(0, additionalLimit);

  const topLines = useMemo(() => topMatchLineValues(analysis.topMatch), [analysis.topMatch]);

  const text = (slotId: string, fallback: string) => textOverrides[slotId] ?? fallback;

  const clientRect = mergeSlotRect(slots.clientImage, slotOverrides.clientImage);
  const topScoreRect = mergeSlotRect(slots.topScore, slotOverrides.topScore);
  const ratingRect = mergeSlotRect(slots.rating, slotOverrides.rating);

  return (
    <div
      ref={cardRef}
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

      <AnalysisOverlaySlot
        slotId="clientImage"
        label="Client preview"
        rect={clientRect}
        debug={showDebugFrames}
        cardRef={cardRef}
        onRectChange={onSlotRectChange}
      >
        <img
          src={analysis.clientPreviewUrl}
          alt=""
          className={`${styles.clientImage} w-full h-full`}
          crossOrigin="anonymous"
          draggable={false}
        />
      </AnalysisOverlaySlot>

      <AnalysisOverlaySlot
        slotId="topScore"
        label="Score"
        rect={topScoreRect}
        debug={showDebugFrames}
        cardRef={cardRef}
        onRectChange={onSlotRectChange}
      >
        <EditableOverlayText
          slotId="topScore"
          value={text('topScore', String(analysis.topMatch.score))}
          debug={showDebugFrames}
          onChange={onTextChange}
          className={styles.scoreText}
        />
      </AnalysisOverlaySlot>

      <AnalysisOverlaySlot
        slotId="rating"
        label="Rating"
        rect={ratingRect}
        debug={showDebugFrames}
        cardRef={cardRef}
        onRectChange={onSlotRectChange}
      >
        <EditableOverlayText
          slotId="rating"
          value={text('rating', formatRating(analysis.topMatch.rating))}
          debug={showDebugFrames}
          onChange={onTextChange}
          className={styles.ratingText}
        />
      </AnalysisOverlaySlot>

      {slots.topMatchLines.map((lineSlot, index) => {
        const slotId = `topLine-${index}`;
        const rect = mergeTextSlot(lineSlot, slotOverrides[slotId]);
        return (
          <AnalysisOverlaySlot
            key={slotId}
            slotId={slotId}
            label={`Top line ${index + 1}`}
            rect={{
              left: rect.left,
              top: rect.top,
              width: rect.width ?? '28%',
              height: rect.height ?? '3.2%',
            }}
            debug={showDebugFrames}
            cardRef={cardRef}
            onRectChange={onSlotRectChange}
            className={styles.valueOnlySlot}
          >
            <EditableOverlayText
              slotId={slotId}
              value={text(slotId, topLines[index] ?? '')}
              debug={showDebugFrames}
              onChange={onTextChange}
            />
          </AnalysisOverlaySlot>
        );
      })}

      {additionalLimit > 0 && slots.additionalLooks
        ? additionalLooks.map((look, index) => {
            const imageSlotId = `addImage-${index}`;
            const textSlotId = `addText-${index}`;
            const slot = slots.additionalLooks?.[index];
            if (!slot) return null;

            const imageRect = mergeSlotRect(slot.image, slotOverrides[imageSlotId]);
            const textRect = mergeTextSlot(slot.text, slotOverrides[textSlotId]);

            return (
              <div key={look.id}>
                {look.imageUrl ? (
                  <AnalysisOverlaySlot
                    slotId={imageSlotId}
                    label={`Thumb ${index + 1}`}
                    rect={imageRect}
                    debug={showDebugFrames}
                    cardRef={cardRef}
                    onRectChange={onSlotRectChange}
                  >
                    <img
                      src={look.imageUrl}
                      alt=""
                      className={`${styles.additionalThumb} w-full h-full`}
                      crossOrigin="anonymous"
                      draggable={false}
                    />
                  </AnalysisOverlaySlot>
                ) : null}
                <AnalysisOverlaySlot
                  slotId={textSlotId}
                  label={`Match ${index + 2} text`}
                  rect={{
                    left: textRect.left,
                    top: textRect.top,
                    width: textRect.width ?? '26%',
                    height: textRect.height ?? '7%',
                  }}
                  debug={showDebugFrames}
                  cardRef={cardRef}
                  onRectChange={onSlotRectChange}
                  className={styles.valueOnlySlot}
                >
                  <EditableOverlayText
                    slotId={textSlotId}
                    value={text(textSlotId, additionalLookText(look))}
                    debug={showDebugFrames}
                    onChange={onTextChange}
                    multiline
                  />
                </AnalysisOverlaySlot>
              </div>
            );
          })
        : null}

      {analysis.whyItWorks.map((line, index) => {
        const slot = slots.whyLines[index];
        if (!slot) return null;
        const slotId = `whyLine-${index}`;
        const rect = mergeTextSlot(slot, slotOverrides[slotId]);
        return (
          <AnalysisOverlaySlot
            key={slotId}
            slotId={slotId}
            label={`Why ${index + 1}`}
            rect={{
              left: rect.left,
              top: rect.top,
              width: rect.width ?? '28%',
              height: rect.height ?? '2.8%',
            }}
            debug={showDebugFrames}
            cardRef={cardRef}
            onRectChange={onSlotRectChange}
            className={styles.valueOnlySlot}
          >
            <EditableOverlayText
              slotId={slotId}
              value={text(slotId, line)}
              debug={showDebugFrames}
              onChange={onTextChange}
            />
          </AnalysisOverlaySlot>
        );
      })}

      <span className="sr-only">
        Hairstyle analysis for {analysis.clientName} — {tierKey} tier
      </span>
    </div>
  );
}
