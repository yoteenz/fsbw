import { scoreBrandConsistency } from './brand-consistency-checker';
import { getBrandDnaById } from './brand-dna-registry';
import type { XbdIntelligenceQuery, XbdIntelligenceResult } from '../types';

/** Brand Intelligence Layer™ — reusable reasoning API for creative/strategic systems */
export function evaluateBrandIntelligence(query: XbdIntelligenceQuery): XbdIntelligenceResult {
  const brand = getBrandDnaById(query.brandId);
  if (!brand) {
    const empty = scoreBrandConsistency(
      {
        brandId: query.brandId,
        companyId: '',
        brandName: 'Unknown',
        brandPhilosophy: '',
        mission: '',
        vision: '',
        values: [],
        audienceProfile: {
          primaryAudience: '',
          secondaryAudiences: [],
          psychology: '',
          customerDesire: '',
          identitySignals: [],
        },
        emotionalTerritory: [],
        visualPersonality: [],
        writingVoice: {
          tone: '',
          cadence: '',
          vocabulary: [],
          forbiddenLanguage: [],
          sampleLine: '',
        },
        colorSystem: {
          primary: '#000',
          secondary: '#000',
          accent: '#000',
          background: '#fff',
          textPrimary: '#000',
          textSecondary: '#666',
        },
        typography: {
          displayFont: 'sans-serif',
          labelFont: 'sans-serif',
          bodyFont: 'sans-serif',
          displaySize: '16px',
          labelSize: '10px',
          bodySize: '14px',
        },
        materials: [],
        photographyStyle: '',
        packagingStyle: '',
        contentStyle: '',
        luxuryLevel: 50,
        positioning: '',
        competitors: [],
        antiPatterns: [],
        brandRules: [],
        createdAt: '',
        updatedAt: '',
        version: '1.0.0',
        status: 'draft',
      },
      query.artifactSummary,
      query.artifactType
    );
    return {
      matchesBrandDna: false,
      strengthensBrand: false,
      attractsAudience: false,
      contradictsBrand: true,
      feelsPremiumEnough: false,
      supportsPositioning: false,
      rationale: ['Brand DNA not found in registry.'],
      consistency: empty,
    };
  }

  const consistency = scoreBrandConsistency(brand, query.artifactSummary, query.artifactType);
  const pass = consistency.status === 'pass';

  return {
    matchesBrandDna: consistency.brandAlignment >= consistency.passThreshold,
    strengthensBrand: consistency.differentiation >= 70 && consistency.voiceAlignment >= 70,
    attractsAudience: consistency.audienceFit >= consistency.passThreshold,
    contradictsBrand: consistency.voiceAlignment < 50 || consistency.improvementNotes.some((n) =>
      n.includes('forbidden')
    ),
    feelsPremiumEnough: consistency.luxuryFit >= brand.luxuryLevel - 15,
    supportsPositioning: consistency.positioningFit >= consistency.passThreshold,
    rationale: [
      `${brand.brandName}: ${consistency.overallScore}/100 overall alignment`,
      `Voice ${consistency.voiceAlignment} · Visual ${consistency.visualAlignment} · Audience ${consistency.audienceFit}`,
      pass ? 'Approved for downstream application.' : 'Revise before shipping.',
    ],
    consistency,
  };
}
