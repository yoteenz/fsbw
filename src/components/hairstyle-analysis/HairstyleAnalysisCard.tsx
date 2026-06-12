import { useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import type {
  HairstyleAnalysis,
  PercentRect,
  SlotLayoutOverrides,
  TextContentOverrides,
  TextFontStyleOverrides,
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
  fontOverrides?: TextFontStyleOverrides;
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

function matchRowValueClassName(fieldId: string): string | undefined {
  if (!/^match\d+-(texture|color|length|score)$/.test(fieldId)) return undefined;
  return fieldId.endsWith('-score') ? styles.matchRowScoreText : styles.matchRowValueText;
}

export default function HairstyleAnalysisCard({
  analysis,
  showDebugFrames = false,
  slotOverrides = {},
  textOverrides = {},
  fontOverrides = {},
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

  const fontStyleFor = (slotId: string): CSSProperties | undefined => {
    const override = fontOverrides[slotId];
    if (!override) return undefined;
    const style: CSSProperties = { ...override };
    if (override.textAlign) style.textAlign = override.textAlign;
    return style;
  };

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
        const matchRowClass = matchRowValueClassName(field.id);
        const textClassName =
          field.id === 'topScore'
            ? styles.scoreText
            : field.id === 'rating'
              ? styles.ratingText
              : field.id === 'clientName'
                ? styles.clientNameText
                : matchRowClass
                  ? matchRowClass
                  : field.id.endsWith('-score') || /^alt-\d+-score$/.test(field.id)
                    ? styles.matchScoreText
                    : undefined;

        const topScoreEditable = field.id === 'topScore' && showDebugFrames && onTextChange;

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
            {field.id === 'topScore' && !topScoreEditable ? (
              <p
                className={`${styles.overlayText} ${styles.scoreText}`.trim()}
                style={fontStyleFor(field.id)}
              >
                {value.replace(/%$/, '')}
                <span className={styles.scorePercentSuffix}>%</span>
              </p>
            ) : (
              <EditableOverlayText
                slotId={field.id}
                value={value}
                debug={showDebugFrames}
                onChange={onTextChange}
                multiline={field.multiline}
                className={textClassName}
                style={fontStyleFor(field.id)}
              />
            )}
          </AnalysisOverlaySlot>
        );
      })}

      <span className="sr-only">
        Hairstyle analysis for {analysis.clientName} — {tierKey} tier
      </span>
    </div>
  );
}
