import { useMemo, useRef } from 'react';
import type {
  HairstyleAnalysis,
  PercentRect,
  SlotLayoutOverrides,
  TextContentOverrides,
  TextSlot,
} from '../../types/hairstyleAnalysis';
import {
  buildTemplateOverlayValues,
  resolveOverlayImageUrl,
} from '../../utils/hairstyleAnalysisOverlayContent';
import { getTemplateFields } from '../../utils/hairstyleAnalysisTemplateLayouts';
import { normalizeAnalysisTier } from '../../utils/hairstyleAnalysisRules';
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

function asPercentRect(field: TextSlot | PercentRect): PercentRect {
  return {
    left: field.left,
    top: field.top,
    width: field.width ?? '20%',
    height: field.height ?? '3%',
  };
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
  const fields = getTemplateFields(analysis.tier);

  const overlayValues = useMemo(
    () => buildTemplateOverlayValues(analysis),
    [analysis]
  );

  const text = (slotId: string, fallback: string) => textOverrides[slotId] ?? fallback;

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

      {fields.map((field) => {
        const baseRect = asPercentRect(field.slot);
        const rect =
          field.kind === 'image'
            ? mergeSlotRect(baseRect, slotOverrides[field.id])
            : mergeSlotRect(
                {
                  ...baseRect,
                  ...mergeTextSlot(field.slot as TextSlot, slotOverrides[field.id]),
                },
                slotOverrides[field.id]
              );

        if (field.kind === 'image') {
          const src = resolveOverlayImageUrl(field.id, analysis);
          if (!src) return null;
          return (
            <AnalysisOverlaySlot
              key={field.id}
              slotId={field.id}
              label={field.label}
              rect={rect}
              debug={showDebugFrames}
              cardRef={cardRef}
              onRectChange={onSlotRectChange}
            >
              <img
                src={src}
                alt=""
                className={`${styles.clientImage} w-full h-full`}
                crossOrigin="anonymous"
                draggable={false}
              />
            </AnalysisOverlaySlot>
          );
        }

        const value = text(field.id, overlayValues[field.id] ?? '');

        return (
          <AnalysisOverlaySlot
            key={field.id}
            slotId={field.id}
            label={field.label}
            rect={rect}
            debug={showDebugFrames}
            cardRef={cardRef}
            onRectChange={onSlotRectChange}
            className={styles.valueOnlySlot}
          >
            <EditableOverlayText
              slotId={field.id}
              value={value}
              debug={showDebugFrames}
              onChange={onTextChange}
              multiline={field.multiline}
              className={
                field.id === 'topScore'
                  ? styles.scoreText
                  : field.id === 'rating'
                    ? styles.ratingText
                    : field.id === 'clientName'
                      ? styles.clientNameText
                      : undefined
              }
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
