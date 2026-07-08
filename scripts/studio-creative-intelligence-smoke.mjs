#!/usr/bin/env node
/**
 * Creative Intelligence Engine™ smoke test — validates Supabase persistence layer.
 * Full decision evaluation runs via POST /api/admin/studio-creative-intelligence
 * Usage: node scripts/studio-creative-intelligence-smoke.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const ORG_ID = process.env.STUDIO_CIE_ORG_ID || 'frontal-slayer';

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

async function main() {
  const url = requireEnv('SUPABASE_URL');
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(url, key);

  const decisionId = randomUUID();
  const decisionPayload = {
    id: decisionId,
    org_id: ORG_ID,
    intent: {
      org_id: ORG_ID,
      raw_intent: 'Warm editorial marble headquarters environment',
      category: 'environment',
      layered: true,
    },
    recommended_strategy: 'layered_generation',
    confidence_score: 78,
    cost_intelligence: {
      estimated_provider_cost: 0.24,
      estimated_total_project_cost: 0.18,
      reuse_savings: 0.12,
      marketplace_savings: 0,
      previous_asset_savings: 0.12,
      projected_tokens: 4800,
      estimated_duration_seconds: 96,
    },
    reusable_assets: [],
    assets_missing: [
      { category: 'environment', reason: 'No match', estimated_cost: 0.08 },
    ],
    recommended_provider: 'fal',
    recommended_model: 'flux-pro',
    generation_order: [],
    approval_gates: [{ gate_id: 'pre-generation', label: 'Pre-Generation Review', reason: 'Production quality', required: true }],
    risk_level: 'medium',
    quality_tier: 'production',
    genome_alignment: { score: 82, aligned_traits: ['material_language'], misaligned_traits: [], summary: 'Highly aligned.' },
    founder_messages: ['This scene is better generated as layered assets.'],
    reasoning_summary: 'Layered generation recommended.',
    should_generate: true,
    concept_count: 1,
    created_at: new Date().toISOString(),
  };

  console.log('1. Persist decision object…');
  const { error: decErr } = await supabase.from('studio_creative_intelligence_decisions').insert({
    id: decisionId,
    org_id: ORG_ID,
    recommended_strategy: decisionPayload.recommended_strategy,
    confidence_score: decisionPayload.confidence_score,
    risk_level: decisionPayload.risk_level,
    should_generate: decisionPayload.should_generate,
    intent: decisionPayload.intent,
    decision_payload: decisionPayload,
  });
  if (decErr) throw decErr;
  console.log('   ✓', decisionId);

  console.log('2. Retrieve decision…');
  const { data: retrieved, error: getErr } = await supabase
    .from('studio_creative_intelligence_decisions')
    .select('decision_payload, recommended_strategy, confidence_score')
    .eq('id', decisionId)
    .single();
  if (getErr) throw getErr;
  console.log('   ✓ strategy:', retrieved.recommended_strategy, 'confidence:', retrieved.confidence_score);

  console.log('3. Record learning signal…');
  const { data: signal, error: sigErr } = await supabase
    .from('studio_creative_intelligence_learning_signals')
    .insert({
      org_id: ORG_ID,
      decision_id: decisionId,
      action: 'approve',
      context: { smoke: true, source: 'studio-creative-intelligence-smoke' },
    })
    .select('id, action')
    .single();
  if (sigErr) throw sigErr;
  console.log('   ✓', signal.action, signal.id);

  console.log('\n✅ Creative Intelligence Engine persistence smoke test passed');
  console.log('   Decision ID:', decisionId);
}

main().catch((err) => {
  console.error('❌ Smoke test failed:', err.message || err);
  process.exit(1);
});
