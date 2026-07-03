import { ADMIN_STUDIO_BRAND_BRAIN_DEFAULTS, ADMIN_STUDIO_EDITORIAL_RULES_DEFAULTS } from '../../../utils/adminStudioContentBrainDemo';
import { ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS } from '../../../utils/adminStudioContentBrainShowBibleDemo';
import { ADMIN_STUDIO_CAMPAIGN_FRAMEWORKS_DEFAULTS } from '../../../utils/adminStudioContentBrainCampaignsDemo';
import { ADMIN_STUDIO_PROMPT_FRAMEWORKS_DEFAULTS } from '../../../utils/adminStudioContentBrainPromptFrameworksDemo';
import { ADMIN_STUDIO_CTA_LIBRARY_DEFAULTS, ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS } from '../../../utils/adminStudioContentBrainCatalogDemo';
import { PROMPT_ASSEMBLER_STAGES } from '../../../utils/adminStudioCreativeDirectorDemo';
import type { CreativeDirectorSession, PromptAssemblerResult } from './types';
import { buildDecisionRecommendation } from './decisionEngine';

export function assembleMasterPrompt(session: CreativeDirectorSession): PromptAssemblerResult {
  const rec = buildDecisionRecommendation(session);
  const show = ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS.find((s) => s.id === session.selectedShowId);
  const campaign = ADMIN_STUDIO_CAMPAIGN_FRAMEWORKS_DEFAULTS[0];
  const framework = ADMIN_STUDIO_PROMPT_FRAMEWORKS_DEFAULTS.find((p) => p.id === session.promptFrameworkId);
  const cta = ADMIN_STUDIO_CTA_LIBRARY_DEFAULTS.find((c) => c.id === session.primaryCtaId);
  const products = session.featuredProductIds
    .map((id) => ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS.find((p) => p.id === id)?.name)
    .filter(Boolean)
    .join(' · ');

  const snippets: Record<string, string> = {
    'brand-brain': `VOICE: ${ADMIN_STUDIO_BRAND_BRAIN_DEFAULTS.brandVoice?.slice(0, 80)}…`,
    'show-bible': show ? `${show.name} · ${show.openingLine?.slice(0, 60)}…` : rec.show.showName,
    'editorial-rules': `TONE: ${ADMIN_STUDIO_EDITORIAL_RULES_DEFAULTS.luxuryTone?.slice(0, 70)}…`,
    'campaign-framework': `${campaign.title} · ${campaign.objective?.slice(0, 50)}…`,
    'prompt-framework': framework?.title ?? 'FRAMEWORK PENDING',
    'product-knowledge': products || 'NO PRODUCTS SELECTED',
    'cta-library': cta?.title ?? 'CTA PENDING',
    'distribution-rules': rec.distribution.join(' · ') || 'NO CHANNELS ACTIVE',
    'master-prompt': '',
  };

  const stages = PROMPT_ASSEMBLER_STAGES.map((stage) => ({
    id: stage.id,
    label: stage.label,
    snippet: snippets[stage.id] ?? '—',
    included: stage.id !== 'master-prompt',
  }));

  const masterPrompt = `CREATIVE DIRECTOR — ASSEMBLED MASTER PROMPT (DEMO)

TOPIC: ${session.topic}
SHOW: ${show?.name ?? rec.show.showName}
PURPOSE: ${session.contentPurpose.toUpperCase()}
AUDIENCE: ${session.targetAudience}
MEMBERSHIP: ${session.membershipTier}

BRAND VOICE: ${ADMIN_STUDIO_BRAND_BRAIN_DEFAULTS.brandVoice}
SHOW OPEN: ${show?.openingLine ?? '—'}
EDITORIAL: ${ADMIN_STUDIO_EDITORIAL_RULES_DEFAULTS.headlineStyle}
CAMPAIGN: ${campaign.keyMessages}
FRAMEWORK BODY:
${framework?.body ?? 'SELECT PROMPT FRAMEWORK'}

PRODUCTS: ${products}
CTA: ${cta?.body ?? '—'}
DISTRIBUTION: ${rec.distribution.join(', ')}

STATUS: DRAFT — REQUIRES CREATIVE DIRECTOR APPROVAL BEFORE AI ORCHESTRATOR.
NO PROVIDER CALLED — PHASE 2 ONLY.`;

  stages[stages.length - 1] = {
    id: 'master-prompt',
    label: 'MASTER PROMPT',
    snippet: masterPrompt.slice(0, 120) + '…',
    included: true,
  };

  return { stages, masterPrompt };
}
