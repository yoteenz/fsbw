import type { ProductionPlanResponse } from './types.js';

/** Development adapter — swap for OpenAI/FAL-backed provider in production. */
export const aiProductionDirector = {
  async interpretProject(projectId: string): Promise<{ summary: string; confidence: number }> {
    return {
      summary: `PROJECT ${projectId.toUpperCase()} INTERPRETED FROM IDNTY + BLDR INTAKE.`,
      confidence: 0.82,
    };
  },

  async generateProjectIntelligence(input: Record<string, unknown>) {
    return {
      ...input,
      provenance: {
        identity_state: 'SYSTEM_INFERRED',
        build_class: 'CLIENT_PROVIDED',
        primary_goals: 'AI_SUGGESTED',
      },
      confidence: 0.78,
      last_generated_at: new Date().toISOString(),
    };
  },

  async generateProductionPlan(project: {
    id: string;
    current_phase: string;
    deliverables: Array<{ deliverable_key: string; title: string; category: string; status: string }>;
  }): Promise<ProductionPlanResponse> {
    return {
      projectId: project.id,
      phase: project.current_phase,
      deliverables: project.deliverables,
      dependencies: [],
      blockers: project.deliverables.filter((d) => d.status === 'BLOCKED').map((d) => d.title),
      missingAssets: [],
      missingAccess: [],
      recommendations: ['GENERATE HOMEPAGE ART DIRECTION BRIEF', 'CONFIRM CREATIVE CONSTITUTION'],
      nextActions: [
        {
          actionType: 'GENERATE_BRIEF',
          title: 'CREATE HOMEPAGE ART DIRECTION BRIEF',
          priority: 'HIGH',
          destination: `/admin/site00/projects/${project.id}/studio`,
        },
      ],
    };
  },

  async generateBrief(input: {
    deliverableTitle: string;
    projectName: string;
    constitution: Record<string, unknown>;
  }) {
    return {
      title: `${input.deliverableTitle.toUpperCase()} — AI PRODUCTION BRIEF`,
      objective: `CREATE A LUXURY ECOMMERCE ${input.deliverableTitle.toUpperCase()} FOR ${input.projectName.toUpperCase()}.`,
      audience: 'PREMIUM SKINCARE BUYERS AGED 25–45.',
      goals: ['INCREASE CONVERSION', 'BUILD CREDIBILITY', 'COMMUNICATE CRAFTSMANSHIP'],
      mustCommunicate: ['LUXURY', 'TRUST', 'CRAFTSMANSHIP', 'TRANSFORMATION'],
      existingAssets: ['APPROVED LOGO', 'PALETTE', 'PRODUCT PHOTOGRAPHY'],
      requiredSections: ['HERO', 'VALUE PROPOSITION', 'COLLECTION', 'STORY', 'SOCIAL PROOF', 'FOOTER'],
      avoid: ['GENERIC ECOMMERCE', 'VISUAL CLICHÉS', 'CROWDED LAYOUTS'],
      generate: 3,
      constitutionRules: input.constitution,
    };
  },

  async recommendInsights(project: { name: string; deliverables: Array<{ title: string; status: string }> }) {
    const insights = [];
    const homepage = project.deliverables.find((d) => d.title.includes('HOMEPAGE'));
    if (homepage && homepage.status === 'READY') {
      insights.push({
        priority: 'HIGH',
        what: 'HOMEPAGE ART DIRECTION READY TO GENERATE',
        why: 'SITEMAP AND STRATEGY DEPENDENCIES ARE COMPLETE.',
        impact: 'UNBLOCKS COLLECTION AND PRODUCT PAGE DIRECTION.',
        action: 'GENERATE BRIEF',
        destination: 'STUDIO',
      });
    }
    insights.push({
      priority: 'MEDIUM',
      what: 'SITEMAP APPROVED — CONTINUE TO WIREFRAMES',
      why: 'INFORMATION ARCHITECTURE IS LOCKED.',
      impact: 'ENABLES VISUAL PRODUCTION STAGE.',
      action: 'VIEW DELIVERABLES',
      destination: 'DELIVERABLES',
    });
    return insights;
  },
};
