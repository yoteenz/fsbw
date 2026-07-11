import { describe, expect, it } from 'vitest';
import { TAX_PREPARATION_PROFILE } from '../profiles';
import { createEmptySession } from '../session-storage';
import {
  buildKnowledgeVaultSnapshot,
  buildWorkerIsolationManifest,
  isTrustFrameworkComplete,
  PROTECTION_CARDS,
  TRUST_AGREEMENTS,
} from './index';

describe('Expert Trust Framework + Knowledge Vault', () => {
  it('defines protection cards and agreement placeholders', () => {
    expect(PROTECTION_CARDS.length).toBe(10);
    expect(TRUST_AGREEMENTS.length).toBe(5);
    expect(TRUST_AGREEMENTS.every((a) => a.placeholderText.includes('Legal text placeholder'))).toBe(true);
  });

  it('enforces organization worker isolation', () => {
    const manifest = buildWorkerIsolationManifest(TAX_PREPARATION_PROFILE, 'Acme Tax LLC');
    expect(manifest.proprietaryIsolation).toBe(true);
    expect(manifest.workerName).toContain('Acme Tax LLC');
    expect(manifest.neverMixesWith.toLowerCase()).toContain('ever');
  });

  it('requires trust framework before interview readiness', () => {
    const session = createEmptySession({ expertName: 'Jane', expertRole: 'CPA' }, TAX_PREPARATION_PROFILE);
    expect(isTrustFrameworkComplete(session)).toBe(false);
    session.meta.trustFramework = {
      welcomeCompletedAt: new Date().toISOString(),
      agreementsSignedAt: new Date().toISOString(),
      signatureName: 'Jane',
      agreementsAccepted: { expert_consent: true },
      vaultIntroCompletedAt: new Date().toISOString(),
      agreementVersion: 'studio-institute-trust-v1.1',
    };
    expect(isTrustFrameworkComplete(session)).toBe(true);
  });

  it('builds vault snapshot with dashboard and living worker', () => {
    const session = createEmptySession({ expertName: 'Jane', expertRole: 'CPA' }, TAX_PREPARATION_PROFILE);
    session.meta.trustFramework = {
      welcomeCompletedAt: new Date().toISOString(),
      agreementsSignedAt: new Date().toISOString(),
      signatureName: 'Jane',
      agreementsAccepted: {},
      vaultIntroCompletedAt: new Date().toISOString(),
      agreementVersion: 'studio-institute-trust-v1.1',
    };
    const snapshot = buildKnowledgeVaultSnapshot({ profile: TAX_PREPARATION_PROFILE, session, program: null });
    expect(snapshot.sections.length).toBeGreaterThan(15);
    expect(snapshot.livingWorker.workerName).toContain('Tax Preparation Practice');
    expect(snapshot.dashboard.knowledgeHealthScore).toBeGreaterThan(0);
  });
});
