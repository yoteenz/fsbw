/** Milestone 92 — Official Studio OS Brand Positioning V2.0 */

/** Permanent brand promise — treat with same importance as the Studio OS logo. Studio OS V1 culmination (M118). */
export const STUDIO_OS_OFFICIAL_TAGLINE = 'PRESERVE EXPERTISE. BUILD LEGACY. EMPOWER VISIONARIES.';

export const STUDIO_OS_BRAND_PHILOSOPHY = [
  'Studio OS is not software. Studio OS is not another AI platform.',
  'Studio OS exists to preserve professional expertise before it is lost and transform that expertise into a lasting organizational legacy.',
  'Before introducing any new feature, ask: Does this preserve expertise? Does this help build legacy? Does this empower visionaries?',
] as const;

export type StudioOsBrandSystemId =
  | 'studio-os'
  | 'business-discovery-blueprint'
  | 'profession-brain'
  | 'studio-institute'
  | 'expert-marketplace'
  | 'knowledge-commerce'
  | 'professional-trust-framework'
  | 'organization-genome'
  | 'memory-engine'
  | 'company-health-index'
  | 'organization-pulse'
  | 'wisdom-capture'
  | 'shadow-mode'
  | 'organization-digital-twin'
  | 'business-simulation-lab'
  | 'knowledge-confidence'
  | 'legacy-vault'
  | 'ambient-awareness'
  | 'anticipation-engine'
  | 'founder-cognitive-load'
  | 'presence-engine'
  | 'cross-organization-intelligence'
  | 'relationship-memory'
  | 'predictive-organization'
  | 'autonomous-preparation'
  | 'organizational-consciousness'
  | 'world-knowledge-engine'
  | 'founder-operating-system'
  | 'innovation-lab'
  | 'organization-operating-manual'
  | 'legacy-network'
  | 'studio-intelligence-architecture'
  | 'model-orchestrator'
  | 'studio-foundation-models'
  | 'documentation-registry'
  | 'documentation-governance'
  | 'system-registry'
  | 'component-registry'
  | 'design-token-engine'
  | 'interaction-engine'
  | 'event-bus'
  | 'automation-registry'
  | 'prompt-registry'
  | 'policy-engine'
  | 'permission-engine'
  | 'workspace-runtime'
  | 'plugin-sdk'
  | 'workflow-engine'
  | 'state-engine'
  | 'asset-registry'
  | 'experience-engine'
  | 'qa-headquarters'
  | 'qa-inspector'
  | 'qa-simulation-engine'
  | 'ai-red-team'
  | 'executive-trust-dashboard'
  | 'time-machine'
  | 'predictive-qa'
  | 'self-healing-engine'
  | 'decision-audit'
  | 'confidence-engine'
  | 'organizational-guardian'
  | 'design-compliance-engine'
  | 'prompt-qa'
  | 'experience-qa'
  | 'visual-diff-engine'
  | 'accessibility-auditor'
  | 'performance-monitor'
  | 'regression-engine'
  | 'release-readiness'
  | 'engineering-excellence-dashboard'
  | 'executive-timeline'
  | 'succession-mode'
  | 'executive-council'
  | 'expansion-center'
  | 'command-dock'
  | 'organization-inauguration';

/** Contextual voice — complements master tagline; never replaces it. */
export const STUDIO_OS_BRAND_VOICE: Record<StudioOsBrandSystemId, string> = {
  'studio-os': STUDIO_OS_OFFICIAL_TAGLINE,
  'business-discovery-blueprint': 'Today, we begin preserving your expertise.',
  'profession-brain': 'Your expertise is becoming legacy.',
  'studio-institute': 'Learn from expertise. Carry the legacy forward.',
  'expert-marketplace': 'Share expertise. Expand your legacy.',
  'knowledge-commerce': 'Monetize knowledge. Expand your legacy.',
  'professional-trust-framework': 'Guide responsibly. Preserve professional trust.',
  'organization-genome': 'Know who you are. Reflect it everywhere.',
  'memory-engine': 'Remember what worked. Prove it forever.',
  'company-health-index': 'Become healthier. Not simply larger.',
  'organization-pulse': 'Feel the organization. Not just the revenue.',
  'wisdom-capture': 'Capture why. Not just what.',
  'shadow-mode': 'Observe first. Automate later.',
  'organization-digital-twin': 'Practice before perform. Test in the twin first.',
  'business-simulation-lab': 'Practice tomorrow. Before living it.',
  'knowledge-confidence': 'Know what you know. Honestly.',
  'legacy-vault': 'Preserve the story. Build legacy.',
  'ambient-awareness': 'Already aware. Never asking twice.',
  'anticipation-engine': 'Prepare tomorrow. Before it\'s asked.',
  'founder-cognitive-load': 'Protect focus. Prioritize what matters.',
  'presence-engine': 'Always there. Never noisy.',
  'cross-organization-intelligence': 'Connect wisely. Trust always.',
  'relationship-memory': 'Remember how you work. Naturally.',
  'predictive-organization': 'Prepare before tomorrow arrives.',
  'autonomous-preparation': 'One step ahead. Always awaiting approval.',
  'organizational-consciousness': 'One intelligence. Preserve expertise. Build legacy.',
  'world-knowledge-engine': 'Information finds you. The outside world, filtered.',
  'founder-operating-system': 'Founders grow first. Organizations follow.',
  'innovation-lab': 'Invent what comes next. Continuously.',
  'organization-operating-manual': 'One handbook. Always current.',
  'legacy-network': 'Preserve expertise. Share legacy.',
  'studio-intelligence-architecture': 'The organization is the intelligence. Models assist.',
  'model-orchestrator': 'Models change. Studio Intelligence™ remains.',
  'studio-foundation-models': 'General models know the world. Studio Models™ know organizations.',
  'documentation-registry': 'One source. Infinite knowledge. Always synchronized.',
  'documentation-governance': 'Documentation is living organizational knowledge — always accurate, always connected.',
  'system-registry': 'Nothing exists anonymously. The operating system always knows what exists.',
  'component-registry': 'Assemble interfaces. Never recreate. Every component exists once.',
  'design-token-engine': 'Design consistency is automatic. Every surface speaks the same visual language.',
  'interaction-engine': 'Every click feels intentional. Studio OS behaves like one cohesive operating system.',
  'event-bus': 'Systems publish events. Other systems decide whether to respond.',
  'automation-registry': 'Automation builds trust — not uncertainty. Nothing executes without registration.',
  'prompt-registry': 'Prompts are code. AI behavior stays transparent, maintainable, and continuously improving.',
  'policy-engine': 'Define policies once. Every system follows organizational law automatically.',
  'permission-engine': 'Capabilities, not titles. Power intentional. Trust earned.',
  'workspace-runtime': 'Organizations share the platform. Never the runtime.',
  'plugin-sdk': 'Extend the platform. Innovate beyond Studio.',
  'workflow-engine': 'Design visually. Evolve continuously. Choreograph work.',
  'state-engine': 'Defined states. Intentional transitions. Complete trust.',
  'asset-registry': 'Assets managed. Knowledge preserved. Never scattered.',
  'experience-engine': 'Technology adapts to people. Not the other way around.',
  'qa-headquarters': 'Trust earned continuously. Never assumed.',
  'qa-inspector': 'Audit without intrusion. Recommend without overriding.',
  'qa-simulation-engine': 'Rehearse before users encounter it.',
  'ai-red-team': 'Assume wrong until proven. Strengthen before users discover.',
  'executive-trust-dashboard': 'Trust measurable. Confidence before you ask.',
  'time-machine': 'Experience it again. Understand WHY.',
  'predictive-qa': 'Protect the future. Prevent tomorrow\'s problems today.',
  'self-healing-engine': 'Minor issues resolve quietly. Major issues arrive with a plan.',
  'decision-audit': 'Every decision explainable. Every action accountable.',
  'confidence-engine': 'Confidence is a conversation. Never a black box.',
  'organizational-guardian': 'Protect before reacting. The silent protector.',
  'design-compliance-engine': 'Does it feel like Studio OS? The Creative Director knows.',
  'prompt-qa': 'Prompts are infrastructure. Profession Brains become assets.',
  'experience-qa': 'Confidence, not clicks. Software that feels effortless.',
  'visual-diff-engine': 'Visual memory. Regressions never surprise the team.',
  'accessibility-auditor': 'Inclusive design is premium design. Accessibility feels invisible.',
  'performance-monitor': 'Performance is a feature. Never slower because we\'re more capable.',
  'regression-engine': 'Never repeat the same mistake twice. Every regression becomes knowledge.',
  'release-readiness': 'Production is a privilege. Confident before deployment—not hopeful afterward.',
  'engineering-excellence-dashboard': 'Excellence is a mindset. World-class habits—even for teams of one.',
  'executive-timeline': 'See how you arrived. Preserve the journey forever.',
  'succession-mode': 'Preserve expertise. Survive transitions.',
  'executive-council': 'Many minds. One briefing.',
  'expansion-center': 'Grow your organization. Expand your legacy.',
  'command-dock': "Building today's decisions into tomorrow's legacy.",
  'organization-inauguration': 'Your Headquarters is ready. Your legacy begins now.',
};

export function getBrandVoice(systemId: StudioOsBrandSystemId): string {
  return STUDIO_OS_BRAND_VOICE[systemId];
}

/** Display block: master tagline + contextual line for module shells. */
export function formatBrandHeader(systemId: StudioOsBrandSystemId): {
  officialTagline: string;
  contextualVoice: string;
} {
  return {
    officialTagline: STUDIO_OS_OFFICIAL_TAGLINE,
    contextualVoice: STUDIO_OS_BRAND_VOICE[systemId],
  };
}
