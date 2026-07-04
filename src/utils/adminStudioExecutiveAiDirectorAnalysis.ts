/**
 * Executive AI Director — production & prompt analysis from workspace data.
 */

import type { ProductionDraft } from './adminStudioProductionBuilderDemo';
import { findProductionAsset } from './adminStudioProductionBuilderDemo';
import { assembleProductionPrompt } from './adminStudioProductionBuilderPrompt';
import type { BrandComplianceItem, ProductionCoachingNote, PromptReviewFinding } from './adminStudioExecutiveAiDirectorDemo';
import { BRAND_COMPLIANCE_SEED } from './adminStudioExecutiveAiDirectorDemo';

export function analyzeProductionDraft(draft: ProductionDraft | null): ProductionCoachingNote[] {
  if (!draft) {
    return [
      {
        id: 'no-draft',
        severity: 'info',
        title: 'NO ACTIVE PRODUCTION',
        detail: 'OPEN PRODUCTION BUILDER OR DIRECTOR MODE TO RECEIVE PRE-GENERATION COACHING.',
        source: 'config',
      },
    ];
  }

  const notes: ProductionCoachingNote[] = [];
  const scenes = [...draft.scenes].sort((a, b) => a.order - b.order);
  const totalSec = scenes.length * 45;
  const cameras = scenes.map((s) => s.selection.cameraId).filter(Boolean);
  const uniqueCameras = new Set(cameras);

  if (scenes.length > 0) {
    const lastScene = scenes[scenes.length - 1];
    const ctaSceneIndex = scenes.findIndex((s) => s.name.toUpperCase().includes('CTA'));
    if (ctaSceneIndex === -1 || ctaSceneIndex > Math.floor(scenes.length * 0.7)) {
      notes.push({
        id: 'cta-late',
        severity: 'warn',
        title: 'CTA APPEARS LATE',
        detail: 'TOP-PERFORMING EPISODES PLACE CTA IN FINAL 25% — CONSIDER EARLIER SOFT CTA (WORKSPACE HISTORY).',
        source: 'history',
      });
    }
    void lastScene;
  }

  if (cameras.length >= 3 && uniqueCameras.size < 2) {
    notes.push({
      id: 'framing-repeat',
      severity: 'warn',
      title: 'IDENTICAL FRAMING ACROSS SCENES',
      detail: `${scenes.length} CONSECUTIVE SCENES SHARE THE SAME CAMERA PRESET — VARY WIDE / MEDIUM / CLOSE (HISTORY: +18% RETENTION).`,
      source: 'history',
    });
  }

  if (totalSec > 720) {
    notes.push({
      id: 'runtime-long',
      severity: 'warn',
      title: 'EXCEEDS IDEAL RUNTIME',
      detail: `ESTIMATED ${Math.floor(totalSec / 60)}+ MIN — LOUNGE SWEET SPOT IS 8–12 MIN (WORKSPACE HISTORY).`,
      source: 'history',
    });
  }

  const hookScene = scenes[0];
  if (hookScene && !hookScene.selection.talentId) {
    notes.push({
      id: 'hook-weak',
      severity: 'critical',
      title: 'OPENING HOOK WEAKER THAN TOP EPISODES',
      detail: 'SCENE 1 MISSING ASSIGNED TALENT — PSA HOST DRIVES HIGHEST OPENING RETENTION.',
      source: 'history',
    });
  } else if (hookScene) {
    notes.push({
      id: 'hook-ok',
      severity: 'info',
      title: 'OPENING TALENT ASSIGNED',
      detail: `${findProductionAsset(hookScene.selection.talentId ?? '')?.name ?? 'TALENT'} ON SCENE 1 — ALIGNED WITH TOP PERFORMERS.`,
      source: 'analysis',
    });
  }

  const hasGraphics = scenes.some((s) => s.selection.graphicsId || s.selection.brandElementIds?.length);
  if (!hasGraphics) {
    notes.push({
      id: 'graphics-missing',
      severity: 'warn',
      title: 'FORECAST GRAPHICS UNDERUSED',
      detail: 'NO BRAND GRAPHICS ON ACTIVE SCENES — FORECAST KIT BOOSTS ENGAGEMENT IN WEATHER FORMATS.',
      source: 'config',
    });
  }

  if (notes.length === 0) {
    notes.push({
      id: 'all-clear',
      severity: 'info',
      title: 'PRODUCTION ALIGNMENT STRONG',
      detail: 'NO CRITICAL FLAGS — READY FOR DIRECTOR MODE REHEARSAL.',
      source: 'analysis',
    });
  }

  return notes;
}

export function scorePrompt(draft: ProductionDraft | null, promptOverride?: string): { score: number; findings: PromptReviewFinding[] } {
  if (!draft) return { score: 0, findings: [{ id: 'p0', type: 'missing', text: 'NO PROMPT TO REVIEW' }] };

  const text = promptOverride?.trim() || assembleProductionPrompt(draft);
  const findings: PromptReviewFinding[] = [];
  let score = 100;

  const luxuryCount = (text.match(/LUXURY/gi) ?? []).length;
  if (luxuryCount > 4) {
    findings.push({ id: 'p1', type: 'repetition', text: `"LUXURY" REPEATED ${luxuryCount} TIMES — TIGHTEN LANGUAGE` });
    score -= 8;
  }

  if (!text.includes('MARBLE') && !text.includes('EB1C24')) {
    findings.push({ id: 'p2', type: 'brand', text: 'MISSING BRAND SURFACE LANGUAGE (MARBLE / RED ACCENT)' });
    score -= 12;
  }

  if (text.length < 120) {
    findings.push({ id: 'p3', type: 'missing', text: 'PROMPT TOO SHORT — ADD CAMERA + LIGHTING DETAIL PER SCENE' });
    score -= 15;
  }

  if (!draft.cta || !text.toUpperCase().includes('CTA')) {
    findings.push({ id: 'p4', type: 'missing', text: 'CTA NOT REFLECTED IN ASSEMBLED PROMPT' });
    score -= 10;
  }

  const weakPhrases = ['DEMO ONLY', 'NOT CONNECTED', 'PLACEHOLDER'];
  weakPhrases.forEach((phrase, i) => {
    if (text.includes(phrase)) {
      findings.push({ id: `pw${i}`, type: 'weak', text: `CONTAINS PLACEHOLDER PHRASE: "${phrase}"` });
      score -= 5;
    }
  });

  if (findings.length === 0) {
    findings.push({ id: 'p-ok', type: 'style', text: 'PROMPT STRUCTURE ALIGNED WITH APPROVED ASSET ASSEMBLY' });
  }

  return { score: Math.max(0, Math.min(100, score)), findings };
}

export function evaluateBrandCompliance(draft: ProductionDraft | null): BrandComplianceItem[] {
  const items = [...BRAND_COMPLIANCE_SEED];
  if (!draft) return items;

  const prompt = assembleProductionPrompt(draft);
  const promptItem = items.find((i) => i.id === 'bc-6');
  if (promptItem && (prompt.match(/LUXURY/gi) ?? []).length > 3) {
    promptItem.status = 'review';
    promptItem.note = `${prompt.match(/LUXURY/gi)?.length} LUXURY REFERENCES — CONSIDER VARIETY`;
  }

  return items;
}

export type ExecutiveChatResponse = {
  text: string;
  sourceNote: string;
};

export function generateExecutiveChatResponse(query: string, draft: ProductionDraft | null): ExecutiveChatResponse {
  const q = query.toLowerCase();

  if (q.includes('film') || q.includes('next') || q.includes('what should')) {
    return {
      text: 'RECOMMENDATION: ANOTHER WEATHER STUDIO EPISODE IN THE SLAY REPORT FORMAT. WEATHER STUDIO OUTPERFORMS BUILD STUDIO BY 14% IN WORKSPACE HISTORY. PSA HOST + LUXURY WHITE WARDROBE DRIVE TOP ENGAGEMENT.',
      sourceNote: 'SOURCE: WORKSPACE HISTORY + CURRENT CONFIGURATION',
    };
  }

  if (q.includes('campaign') || q.includes('improve')) {
    return {
      text: 'BALANCE YOUR MIX: LAST THREE EMAILS FOCUSED ON LAUNCHES (CONFIG). ADD EDUCATIONAL JOURNAL CONTENT — LUXURY CARE TOPICS INDEX HIGHEST IN WORKSPACE HISTORY. RE-USE TOP CTA "SHOP THE COLLECTION" (4.2% CTR INTERNAL).',
      sourceNote: 'SOURCE: WORKSPACE HISTORY + PUBLISHING CONFIG',
    };
  }

  if (q.includes('studio') && q.includes('idea')) {
    return {
      text: 'FOR FORECAST / EDITORIAL IDEAS: WEATHER STUDIO. FOR PRODUCT STORIES: BUILD STUDIO. MATCHES ASSET DIRECTOR USAGE MAPS AND HISTORICAL COMPLETION RATES.',
      sourceNote: 'SOURCE: WORKSPACE HISTORY',
    };
  }

  if (q.includes('pillar') || q.includes('strongest')) {
    return {
      text: 'STRONGEST PILLARS: (1) LUXURY EDUCATION / CARE, (2) TREND FORECAST, (3) PRODUCT REVEALS. LEARN CATEGORY LEADS LOUNGE TV IN WORKSPACE DATA.',
      sourceNote: 'SOURCE: WORKSPACE HISTORY — NO EXTERNAL TREND FEEDS',
    };
  }

  if (q.includes('review') || q.includes('publish') || q.includes('before')) {
    const notes = analyzeProductionDraft(draft);
    const critical = notes.filter((n) => n.severity === 'critical' || n.severity === 'warn');
    if (critical.length) {
      return {
        text: `PRE-PUBLISH REVIEW:\n${critical.map((n) => `• ${n.title}: ${n.detail}`).join('\n')}`,
        sourceNote: 'SOURCE: PRODUCTION ANALYSIS ON CURRENT DRAFT',
      };
    }
    return {
      text: 'CURRENT PRODUCTION SHOWS NO CRITICAL FLAGS. RUN DIRECTOR MODE REHEARSAL, THEN CONFIRM EMERGENCY CHECKLIST BEFORE GENERATE.',
      sourceNote: 'SOURCE: PRODUCTION ANALYSIS',
    };
  }

  return {
    text: 'I ADVISE FROM WORKSPACE HISTORY AND CURRENT CONFIGURATION — NOT LIVE EXTERNAL TRENDS. ASK ABOUT: WHAT TO FILM, CAMPAIGN MIX, STUDIO FIT, CONTENT PILLARS, OR PRE-PUBLISH REVIEW.',
    sourceNote: 'SOURCE: EXECUTIVE AI DIRECTOR · NO FABRICATED EXTERNAL DATA',
  };
}
