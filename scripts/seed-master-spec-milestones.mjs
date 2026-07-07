#!/usr/bin/env node
/**
 * Seeds milestone YAML files from Master Specification tables.
 * Run once: node scripts/seed-master-spec-milestones.mjs
 * Output becomes source of truth in docs/studio-os/master-spec/milestones/
 */
import fs from 'fs';
import path from 'path';
import { dump } from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs/studio-os/master-spec/milestones');

const SHIPPED_MODULES = {
  M90: { moduleId: 'business-discovery-blueprint', status: 'complete' },
  'M90.5': { moduleId: 'organization-inauguration', status: 'complete' },
  M91: { moduleId: 'profession-brain', status: 'complete' },
  M92: { moduleId: 'expert-marketplace', status: 'complete' },
  'M92.5': { moduleId: 'knowledge-commerce', status: 'complete' },
  M93: { moduleId: 'studio-institute', status: 'complete' },
  M94: { moduleId: 'professional-trust-framework', status: 'complete' },
  M95: { moduleId: 'organization-genome', status: 'complete' },
  M96: { moduleId: 'memory-engine', status: 'complete' },
  M97: { moduleId: 'company-health-index', status: 'complete' },
  M98: { moduleId: 'succession-mode', status: 'complete' },
  M99: { moduleId: 'executive-council', status: 'complete' },
  M100: { moduleId: 'organization-pulse', status: 'complete' },
  M101: { moduleId: 'wisdom-capture', status: 'complete' },
  M102: { moduleId: 'shadow-mode', status: 'complete' },
  M103: { moduleId: 'organization-digital-twin', status: 'complete' },
  M104: { moduleId: 'business-simulation-lab', status: 'complete' },
  M105: { moduleId: 'knowledge-confidence', status: 'complete' },
  M106: { moduleId: 'legacy-vault', status: 'complete' },
  M107: { moduleId: 'ambient-awareness', status: 'complete' },
  M108: { moduleId: 'anticipation-engine', status: 'complete' },
  M109: { moduleId: 'founder-cognitive-load', status: 'complete' },
  M110: { moduleId: 'presence-engine', status: 'complete' },
  M111: { moduleId: 'cross-organization-intelligence', status: 'complete' },
  M112: { moduleId: 'relationship-memory', status: 'complete' },
  M113: { moduleId: 'predictive-organization', status: 'complete' },
  M114: { moduleId: 'autonomous-preparation', status: 'complete' },
  M115: { moduleId: 'organizational-consciousness', status: 'complete' },
  M116: { moduleId: 'executive-timeline', status: 'complete' },
  M117: { moduleId: 'world-knowledge-engine', status: 'complete' },
  M118: { moduleId: 'founder-operating-system', status: 'complete' },
  M119: { moduleId: 'innovation-lab', status: 'complete' },
  M120: { moduleId: 'organization-operating-manual', status: 'complete' },
  M121: { moduleId: 'legacy-network', status: 'complete' },
  M122: { moduleId: 'studio-intelligence-architecture', status: 'complete' },
  M123: { moduleId: 'model-orchestrator', status: 'complete' },
  M124: { moduleId: 'studio-foundation-models', status: 'complete' },
  M125: { moduleId: 'documentation-sync', status: 'complete' },
  M126: { moduleId: 'knowledge-registry', status: 'in-progress' },
  'M126.5': { moduleId: 'documentation-governance', status: 'complete' },
  M127: { moduleId: 'system-registry', status: 'complete' },
  M128: { moduleId: 'component-registry', status: 'complete' },
  M129: { moduleId: 'design-token-engine', status: 'complete' },
  M130: { moduleId: 'interaction-engine', status: 'complete' },
  M131: { moduleId: 'event-bus', status: 'complete' },
  M132: { moduleId: 'automation-registry', status: 'complete' },
  M133: { moduleId: 'prompt-registry', status: 'complete' },
  M134: { moduleId: 'policy-engine', status: 'complete' },
  M135: { moduleId: 'permission-engine', status: 'complete' },
  M136: { moduleId: 'workspace-runtime', status: 'complete' },
  M137: { moduleId: 'plugin-sdk', status: 'complete' },
  M138: { moduleId: 'workflow-engine', status: 'complete' },
  M139: { moduleId: 'state-engine', status: 'complete' },
  M140: { moduleId: 'asset-registry', status: 'complete' },
  M141: { moduleId: 'experience-engine', status: 'complete' },
  M142: { moduleId: 'qa-headquarters', status: 'complete' },
  M143: { moduleId: 'qa-inspector', status: 'complete' },
  M144: { moduleId: 'qa-simulation-engine', status: 'complete' },
  M146: { moduleId: 'ai-red-team', status: 'complete' },
  M147: { moduleId: 'executive-trust-dashboard', status: 'complete' },
  M148: { moduleId: 'time-machine', status: 'complete' },
  M149: { moduleId: 'predictive-qa', status: 'complete' },
  M150: { moduleId: 'self-healing-engine', status: 'complete' },
  M151: { moduleId: 'decision-audit', status: 'complete' },
  M152: { moduleId: 'confidence-engine', status: 'complete' },
  M153: { moduleId: 'organizational-guardian', status: 'complete' },
  M154: { moduleId: 'design-compliance-engine', status: 'complete' },
  M155: { moduleId: 'prompt-qa', status: 'complete' },
  M156: { moduleId: 'experience-qa', status: 'complete' },
  M157: { moduleId: 'visual-diff-engine', status: 'complete' },
  M158: { moduleId: 'accessibility-auditor', status: 'complete' },
  // Shipped QA chain occupying M159-M162 badge slots
  'M159-shipped': { moduleId: 'performance-monitor', status: 'complete', shippedId: 'M159' },
  'M160-shipped': { moduleId: 'regression-engine', status: 'complete', shippedId: 'M160' },
  'M161-shipped': { moduleId: 'release-readiness', status: 'complete', shippedId: 'M161' },
  'M162-shipped': { moduleId: 'engineering-excellence-dashboard', status: 'complete', shippedId: 'M162' },
  // Canonical Volume V — shipped M163-M168
  M159: { moduleId: 'identity-graph', status: 'complete', shippedId: 'M163' },
  M160: { moduleId: 'professional-profile', status: 'complete', shippedId: 'M164' },
  M161: { moduleId: 'skill-graph', status: 'complete', shippedId: 'M165' },
  M162: { moduleId: 'role-intelligence', status: 'complete', shippedId: 'M166' },
  M163: { moduleId: 'organizational-hierarchy', status: 'complete', shippedId: 'M167' },
  M164: { moduleId: 'identity-timeline', status: 'complete', shippedId: 'M168' },
};

function milestone(canonicalId, name, purpose, volumeId, dependsOn = []) {
  const shipped = SHIPPED_MODULES[canonicalId];
  const slug = name.replace(/™/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  const internalId = shipped?.moduleId ?? slug;
  let implementationStatus = 'planned';
  if (shipped?.status === 'complete') implementationStatus = 'complete';
  if (shipped?.status === 'in-progress') implementationStatus = 'in-progress';
  return {
    canonicalId,
    name,
    internalId,
    registryKind: canonicalId.startsWith('DR') ? 'design-revision' : 'milestone',
    volumeId,
    purpose,
    implementationStatus,
    shippedMilestone: shipped?.shippedId ?? (shipped ? canonicalId : null),
    moduleId: shipped?.moduleId ?? null,
    dependsOn,
    enables: [],
  };
}

const volII_IV = [
  milestone('M90', 'Business Discovery Blueprint™', 'Captures workflows, expertise, offers, customers, operations, and decision logic.', 'volume-ii'),
  milestone('M90.5', 'Organization Inauguration™', 'Activates organization after Discovery Blueprint with Charter and HQ setup.', 'volume-ii', ['M90']),
  milestone('M91', 'Profession Brain™', 'Living institutional intelligence preserving professional expertise and judgment.', 'volume-ii', ['M90']),
  milestone('M92', 'Expert Marketplace™', 'External discovery and access layer for expertise and expert experiences.', 'volume-ii', ['M91']),
  milestone('M92.5', 'Knowledge Commerce™', 'Turns expertise into products, subscriptions, courses, tools, and licensing.', 'volume-ii', ['M92']),
  milestone('M93', 'Studio Institute™', 'Teaching engine for employees, customers, future owners, and communities.', 'volume-ii', ['M91']),
  milestone('M94', 'Professional Trust Framework™', 'Scopes expert advice, regulated guidance, disclaimers, and escalation.', 'volume-iv', ['M91']),
  milestone('M95', 'Organization Genome™', 'Preserves identity — tone, values, culture, standards, and decision philosophy.', 'volume-ii', ['M91']),
  milestone('M96', 'Memory Engine™', 'Organizational memory for lessons, outcomes, failures, successes, and decisions.', 'volume-ii', ['M91']),
  milestone('M97', 'Company Health Index™', 'Executive score of organizational health across departments.', 'volume-ii', ['M96']),
  milestone('M98', 'Succession Mode™', 'Measures survival without founder and preserves knowledge gaps.', 'volume-iv', ['M96']),
  milestone('M99', 'Executive Council™ V2', 'Digital executives collaborate and summarize strategic recommendations.', 'volume-ii', ['M97']),
  milestone('M100', 'Organization Pulse™', 'Real-time organizational well-being and operating state.', 'volume-ii', ['M99']),
  milestone('M101', 'Wisdom Capture™', 'Captures small lessons and observations before they disappear.', 'volume-ii', ['M96']),
  milestone('M102', 'Shadow Mode™', 'Concierges observe before recommending, assisting, or automating.', 'volume-ii', ['M101']),
  milestone('M103', 'Organization Digital Twin™', 'Simulation clone of the organization.', 'volume-ii', ['M102']),
  milestone('M104', 'Business Simulation Lab™', 'Strategic what-if testing before real-world changes.', 'volume-ii', ['M103']),
  milestone('M105', 'Knowledge Confidence™', 'Measures completeness, reliability, and currency of knowledge.', 'volume-ii', ['M96']),
  milestone('M106', 'Legacy Vault™', 'Permanent archive of milestones, founder letters, and organizational history.', 'volume-ii', ['M96']),
  milestone('M107', 'Ambient Awareness™', 'Contextual awareness of projects, priorities, calendar, and workloads.', 'volume-ii', ['M100']),
  milestone('M108', 'Anticipation Engine™', 'Predicts needs and prepares work before users ask.', 'volume-ii', ['M107']),
  milestone('M109', 'Founder Cognitive Load™', 'Protects founder attention and reduces overload.', 'volume-ii', ['M108']),
  milestone('M110', 'Presence Engine™', 'Creates calm, responsive, executive presence.', 'volume-ii', ['M109']),
  milestone('M111', 'Cross-Organization Intelligence™', 'Permission-based opportunity discovery across organizations.', 'volume-ii', ['M110']),
  milestone('M112', 'Relationship Memory™', 'Learns how people and organizations prefer to work together.', 'volume-ii', ['M111']),
  milestone('M113', 'Predictive Organization™', 'Forecasts risks, opportunities, bottlenecks, and future needs.', 'volume-ii', ['M112']),
  milestone('M114', 'Autonomous Preparation™', 'Prepares drafts, agendas, assets, and workflows for approval.', 'volume-ii', ['M113']),
  milestone('M115', 'Organizational Consciousness™', 'Unified intelligence connecting awareness, memory, prediction, and action.', 'volume-ii', ['M114']),
  milestone('M116', 'Executive Timeline™', 'Interactive history of the organization.', 'volume-ii', ['M106']),
  milestone('M117', 'World Knowledge Engine™', 'Monitors external trends, regulations, competitors, and technologies.', 'volume-ii', ['M115']),
  milestone('M118', 'Founder Operating System™', 'Supports founder focus, coaching, leadership, and executive health.', 'volume-ii', ['M109']),
  milestone('M119', 'Innovation Lab™', 'Generates and manages ideas, prototypes, partnerships, and opportunities.', 'volume-ii', ['M118']),
  milestone('M120', 'Organization Operating Manual™', 'Living handbook generated from organizational systems and knowledge.', 'volume-ii', ['M91']),
  milestone('M121', 'Legacy Network™', 'Permission-based global ecosystem for shared frameworks and knowledge.', 'volume-ii', ['M106']),
  milestone('M122', 'Studio Intelligence™ Architecture', 'Separates knowledge from reasoning; Knowledge Fabric™ and durable intelligence.', 'volume-ii', ['M91']),
  milestone('M123', 'Model Orchestrator™ + AI Swap Engine™', 'Provider-agnostic AI routing, failover, and model independence.', 'volume-ii', ['M122']),
  milestone('M124', 'Studio Foundation Models™', 'Long-term roadmap for Studio-owned specialized Profession Models™.', 'volume-ii', ['M123']),
  milestone('M125', 'Documentation Synchronization™', 'One-time update of manual, walkthrough, search, help, academy, and docs.', 'volume-ii', ['M122']),
  milestone('M126', 'Studio OS Knowledge Registry™', 'Single source of truth for platform knowledge architecture.', 'volume-ii', ['M125']),
  milestone('M126.5', 'Documentation Governance™', 'Audits documentation coverage, terminology, dependencies, and health.', 'volume-ii', ['M126']),
  milestone('M127', 'System Registry™', 'Master registry of every platform object and system.', 'volume-ii', ['M126.5']),
  milestone('M128', 'Component Registry™', 'Registry of reusable UI components and variants.', 'volume-xi', ['M127']),
  milestone('M129', 'Design Token Engine™', 'Visual source of truth for spacing, typography, glass, motion, and themes.', 'volume-xi', ['M127']),
  milestone('M130', 'Interaction Engine™', 'Behavioral source of truth for every interaction and state.', 'volume-xi', ['M129']),
  milestone('M131', 'Event Bus™', 'Communication backbone for event-driven systems.', 'volume-xi', ['M130']),
  milestone('M132', 'Automation Registry™', 'Transparent registry for every automation.', 'volume-x', ['M131']),
  milestone('M133', 'Prompt Registry™', 'Versioned prompt and AI instruction management.', 'volume-xi', ['M131']),
  milestone('M134', 'Policy Engine™', 'Central rulebook for approvals, privacy, AI, and compliance.', 'volume-xiv', ['M127']),
  milestone('M135', 'Permission Engine™', 'Capability-based access and authorization.', 'volume-xiv', ['M134']),
  milestone('M136', 'Workspace Runtime™', 'Isolated organization runtime with sandbox and production modes.', 'volume-xi', ['M135']),
  milestone('M137', 'Plugin SDK™', 'Extensible plugin ecosystem.', 'volume-xi', ['M136']),
  milestone('M138', 'Workflow Engine™', 'Visual no-code orchestration for business workflows.', 'volume-xi', ['M131']),
  milestone('M139', 'State Engine™', 'Lifecycle management for all objects.', 'volume-xi', ['M138']),
  milestone('M140', 'Asset Registry™', 'Versioned registry for media, documents, templates, and assets.', 'volume-xi', ['M127']),
  milestone('M141', 'Experience Engine™', 'Experience modes and environmental adaptation.', 'volume-i', ['M129', 'M130']),
  milestone('M142', 'Quality Assurance & Trust Infrastructure™', 'Permanent QA layer protecting trust and integrity.', 'volume-iv', ['M127']),
  milestone('M143', 'QA Inspector™', 'Continuous system audits.', 'volume-iv', ['M142']),
  milestone('M144', 'QA Simulation Engine™', 'Simulates user journeys and roles before production.', 'volume-iv', ['M143']),
  milestone('M145', 'Digital Twin™ Sandbox', 'Tests operational changes in a clone.', 'volume-iv', ['M103']),
  milestone('M146', 'AI Red Team™', 'Stress tests prompts, workflows, security, and AI behavior.', 'volume-iv', ['M144']),
  milestone('M147', 'Executive Trust Dashboard™', 'Executive trust and risk overview.', 'volume-iv', ['M146']),
  milestone('M148', 'Time Machine™ Replay Engine', 'Replays events, workflows, decisions, and AI actions.', 'volume-iv', ['M147']),
  milestone('M149', 'Predictive QA™', 'Predicts future quality risks.', 'volume-iv', ['M148']),
  milestone('M150', 'Self-Healing™ Engine', 'Repairs low-risk issues and prepares recovery plans.', 'volume-iv', ['M149']),
  milestone('M151', 'Decision Audit™', 'Records decision rationale, evidence, alternatives, and approvals.', 'volume-iv', ['M150']),
  milestone('M152', 'Confidence Engine™', 'Explains confidence, evidence, and uncertainty.', 'volume-iv', ['M151']),
  milestone('M153', 'Organizational Guardian™', 'Highest oversight protecting quality, trust, security, and resilience.', 'volume-iv', ['M152']),
  milestone('M154', 'Design Compliance Engine™', 'Audits UI against Studio OS design language.', 'volume-iv', ['M153']),
  milestone('M155', 'Prompt QA™', 'Audits prompts for clarity, conflict, and hallucination risk.', 'volume-iv', ['M154']),
  milestone('M156', 'Experience QA™', 'Audits emotional quality, friction, clarity, and premium feel.', 'volume-iv', ['M155']),
  milestone('M157', 'Visual Diff Engine™', 'Detects visual regressions against golden screenshots.', 'volume-iv', ['M156']),
  milestone('M158', 'Accessibility Auditor™', 'Evaluates inclusive, understandable, usable experiences.', 'volume-iv', ['M157']),
  // Shipped QA extensions (badge M159-M162)
  milestone('M159-shipped', 'Performance Monitor™', 'Continuously measures speed, responsiveness, and operational performance.', 'volume-iv', ['M158']),
  milestone('M160-shipped', 'Regression Engine™', 'Verifies changes do not break existing functionality.', 'volume-iv', ['M159-shipped']),
  milestone('M161-shipped', 'Release Readiness™', 'Final approval gate before production deployment.', 'volume-iv', ['M160-shipped']),
  milestone('M162-shipped', 'Engineering Excellence Dashboard™', 'Executive command center for engineering health and readiness.', 'volume-iv', ['M161-shipped']),
];

const volV = [
  milestone('M159', 'Identity Graph™', 'Living graph of every person connected to the organization.', 'volume-v', ['M112']),
  milestone('M160', 'Professional Profile™', 'Dynamic career identity with skills, achievements, and contributions.', 'volume-v', ['M159']),
  milestone('M161', 'Skill Graph™', 'Maps capabilities, mentors, gaps, and invisible knowledge.', 'volume-v', ['M160']),
  milestone('M162', 'Role Intelligence™', 'Understands responsibilities and workflows, not just titles.', 'volume-v', ['M161']),
  milestone('M163', 'Organizational Hierarchy™', 'Maps real-world reporting, matrix teams, and shared services.', 'volume-v', ['M162']),
  milestone('M164', 'Identity Timeline™', 'Preserves the professional journey of every individual.', 'volume-v', ['M163']),
];

function range(start, end, volumeId, names) {
  const out = [];
  for (let i = start; i <= end; i++) {
    const id = `M${i}`;
    const [name, purpose] = names[i - start] ?? [`Milestone ${id}`, `Planned milestone ${id} per Master Specification.`];
    out.push(milestone(id, name, purpose, volumeId));
  }
  return out;
}

const volVI = range(165, 172, 'volume-vi', [
  ['Relationship Graph™', 'Maps relationships among people, organizations, customers, vendors, and partners.'],
  ['Partner Network™', 'Manages trusted collaborators, agencies, service providers, and referral partners.'],
  ['Vendor Network™', 'Tracks suppliers, vendors, contracts, reliability, and relationship health.'],
  ['Referral Intelligence™', 'Identifies referral paths, introducers, influence, and warm-network opportunities.'],
  ['Customer Relationship Map™', 'Maps customer journeys, touchpoints, preferences, sentiment, and opportunities.'],
  ['Family Business Mapping™', 'Supports ownership, family roles, succession, and sensitive relationship context.'],
  ['Relationship Health™', 'Measures relationship strength, risk, activity, trust, and follow-up needs.'],
  ['Relationship Search™', 'Natural-language search across people, organizations, expertise, and connections.'],
]);

const volVII = range(173, 180, 'volume-vii', [
  ['Memory Timeline™', 'Chronological memory across conversations, decisions, events, and organizational moments.'],
  ['Memory Search™', 'Semantic search across people, projects, documents, and history.'],
  ['Conversation Memory™', 'Preserves context from chats, meetings, calls, and Command Dock conversations.'],
  ['Decision Memory™', 'Stores why choices were made, outcomes, and future lessons.'],
  ['Workflow Memory™', 'Remembers how workflows performed and where they improved or failed.'],
  ['Customer Memory™', 'Remembers customer preferences, issues, purchases, and relationship context.'],
  ['Department Memory™', 'Each department retains its own operational memory.'],
  ['Memory Governance™', 'Controls retention, privacy, deletion, consent, and access to memory.'],
]);

const volVIII = range(181, 188, 'volume-viii', [
  ['Financial Command Center™', 'Executive financial overview for revenue, expenses, margin, cash flow, and runway.'],
  ['Cash Flow Intelligence™', 'Predicts short-term and long-term cash flow pressure and opportunity.'],
  ['Pricing Simulator™', 'Tests pricing changes, bundles, subscriptions, and discount strategies.'],
  ['Profitability Engine™', 'Analyzes margin, product profitability, labor, overhead, and recurring revenue.'],
  ['Hiring Simulator™', 'Predicts financial and operational impact of hiring or replacing roles.'],
  ['Growth Forecast™', 'Forecasts revenue, capacity, demand, staffing, and risks.'],
  ['Financial Twin™', 'Financial simulation model connected to the organization Digital Twin™.'],
  ['Financial Guardian™', 'Flags financial risk, waste, underpricing, and unsustainable trends.'],
]);

const volIX = range(189, 196, 'volume-ix', [
  ['Communication Hub™', 'Unified inbox for email, SMS, chat, voice, meetings, and customer messages.'],
  ['Voice Mode™', 'Orb-based voice interaction with Studio Intelligence™.'],
  ['Meeting Intelligence™', 'Summaries, decisions, tasks, memories, and follow-ups from meetings.'],
  ['Customer Inbox™', 'Central customer communication with history, sentiment, and routing.'],
  ['Internal Chat™', 'Team and Digital Staff communication across departments.'],
  ['Broadcast Center™', 'Campaigns, announcements, updates, newsletters, alerts, and segmentation.'],
  ['Notification Intelligence™', 'Priority-based notifications that protect cognitive load.'],
  ['Translation & Localization™', 'Multilingual communication and localization across organizations.'],
]);

const volX = range(197, 204, 'volume-x', [
  ['Automation Store™', 'Marketplace for installing approved automations.'],
  ['Automation Builder™', 'No-code creation of reusable automations.'],
  ['Automation Certification™', 'QA, trust, security, and safety certification for automations.'],
  ['Automation Licensing™', 'Subscription and one-time licensing for automations.'],
  ['Automation Analytics™', 'Usage, success, ROI, failures, and improvement recommendations.'],
  ['Automation Reviews™', 'Trust, reputation, ratings, and verified outcomes.'],
  ['Automation Templates™', 'Reusable templates for common business workflows.'],
  ['Automation Revenue Center™', 'Payouts and economics for automation creators.'],
]);

const volXI = range(205, 212, 'volume-xi', [
  ['Studio OS API™', 'Programmable access to core Studio OS systems.'],
  ['Developer Console™', 'Manage apps, keys, logs, test environments, and deployments.'],
  ['Extension Framework™', 'Custom pages, panels, commands, widgets, and modules.'],
  ['App Marketplace™', 'Installable Studio OS apps and extensions.'],
  ['Integration Hub™', 'Third-party services, OAuth, data sync, and connection health.'],
  ['Custom Component SDK™', 'Build reusable components following Studio OS design and QA rules.'],
  ['Developer Documentation™', 'Self-updating docs for APIs, SDK, plugins, and best practices.'],
  ['Platform Governance™', 'Review, approval, policy, security, and monetization for extensions.'],
]);

const volXII = range(213, 220, 'volume-xii', [
  ['Reputation Engine™', 'Universal reputation layer for organizations, experts, packs, and assets.'],
  ['Expert Reputation™', 'Tracks expert quality, outcomes, consistency, trust, and credentials.'],
  ['Profession Brain Reputation™', 'Measures knowledge quality, usefulness, trust, and adoption.'],
  ['Organization Reputation™', 'Shows contribution quality, marketplace reliability, and legacy impact.'],
  ['Automation Reputation™', 'Rates automations by reliability, safety, ROI, and completion success.'],
  ['Knowledge Product Reputation™', 'Tracks usefulness, adoption, reviews, completion, and revenue.'],
  ['Trust Badges™', 'Verified signals for quality, expertise, compliance, and community trust.'],
  ['Reputation Governance™', 'Prevents manipulation, spam, unfair reviews, and trust abuse.'],
]);

const volXIII = range(221, 228, 'volume-xiii', [
  ['Studio Wallet™', 'Organization wallet for purchases, payouts, subscriptions, and credits.'],
  ['Royalty Engine™', 'Calculates royalties for knowledge, packs, templates, and licensed expertise.'],
  ['Revenue Sharing™', 'Revenue split controls for creators, organizations, partners, and Studio OS.'],
  ['Subscription Billing™', 'Memberships, pack subscriptions, expert subscriptions, and recurring products.'],
  ['Creator Payouts™', 'Payout system for experts, organizations, automation creators, and course creators.'],
  ['Affiliate System™', 'Referral tracking, commissions, campaign codes, and performance.'],
  ['Partner Economy™', 'Agency and partner revenue models, certifications, and distribution.'],
  ['Economy Dashboard™', 'Executive economy view across marketplace, licensing, royalties, and subscriptions.'],
]);

const volXIV = range(229, 236, 'volume-xiv', [
  ['Board Governance™', 'Board-level approvals, meeting packs, resolutions, and governance records.'],
  ['Approval Chain Intelligence™', 'Dynamic approval flows based on policy, risk, amount, and authority.'],
  ['Delegation Engine™', 'Temporary and permanent delegation of authority.'],
  ['Compliance Center™', 'Compliance tasks, logs, regulated workflow controls, and evidence.'],
  ['Audit Trail™', 'Immutable records of decisions, changes, access, and actions.'],
  ['Risk Governance™', 'Risk categories, mitigation plans, owners, and escalation paths.'],
  ['Policy Lifecycle™', 'Draft, review, approve, publish, revise, and retire organizational policies.'],
  ['Governance Dashboard™', 'Executive view of governance health, approvals, risks, and compliance readiness.'],
]);

const volXV = range(237, 244, 'volume-xv', [
  ['Research Engine™', 'Dedicated research workspace powered by World Knowledge Engine™.'],
  ['Competitor Intelligence™', 'Tracks competitors, positioning, pricing, offers, launches, and threats.'],
  ['Market Trend Discovery™', 'Identifies trends relevant to the organization and industry.'],
  ['Regulation Watch™', 'Monitors legal, policy, compliance, and industry changes.'],
  ['Technology Watch™', 'Tracks tools, AI advances, platforms, and automation opportunities.'],
  ['Patent & IP Discovery™', 'Finds IP opportunities, prior art signals, and innovation spaces.'],
  ['Opportunity Discovery™', 'Surfaces strategic opportunities based on research and organizational fit.'],
  ['Research Briefing Room™', 'Executive briefings, source review, research memory, and recommendations.'],
]);

const volXVI = range(245, 252, 'volume-xvi', [
  ['World Builder™', 'Creates profession-specific immersive environments and headquarters.'],
  ['Industry Environment Packs™', 'Mansion, Medical Command, Operations Tower, Kitchen Command, etc.'],
  ['Environment Registry™', 'Registers rooms, zones, assets, lighting, animations, and transitions.'],
  ['World Navigation™', 'Spatial navigation across rooms, wings, floors, dashboards, and experiences.'],
  ['Environmental Story Logic™', 'Connects achievements, seasons, milestones, and Life & Culture Preferences™.'],
  ['Interactive Rooms™', 'Rooms become functional interfaces, not decorative backgrounds.'],
  ['World Asset Pipeline™', 'Generates, stores, versions, and optimizes world assets.'],
  ['World QA™', 'Audits immersive environments for consistency, performance, accessibility, and brand fit.'],
]);

const volXVII = range(253, 260, 'volume-xvii', [
  ['Organization Galaxy™', 'Visual network of related organizations, brands, subsidiaries, and divisions.'],
  ['Holding Company Mode™', 'Portfolio-level oversight without defaulting to one company.'],
  ['Shared Services™', 'Centralized teams serving multiple organizations.'],
  ['Cross-Company Knowledge™', 'Permissioned sharing of knowledge, templates, and capabilities.'],
  ['Portfolio Intelligence™', 'Insights, risks, opportunities, and performance across a portfolio.'],
  ['Inter-Organization Workflows™', 'Workflows that span multiple companies securely.'],
  ['Organization Transfers™', 'Move assets, templates, workflows, staff, and knowledge between organizations.'],
  ['Portfolio Governance™', 'Policies, permissions, approvals, and reporting across multiple organizations.'],
]);

const volXVIII = range(261, 268, 'volume-xviii', [
  ['Decision Philosophy™', 'Captures how an organization should think about decisions.'],
  ['Strategic Advisor™', 'Long-term advisor for growth, tradeoffs, timing, and restraint.'],
  ['Ethical Reasoning™', 'Evaluates impact, fairness, responsibility, and values alignment.'],
  ['Risk Wisdom™', 'Balances opportunity with downside, timing, and organizational readiness.'],
  ['Historical Wisdom™', 'Uses past outcomes and lessons to advise future action.'],
  ['Leadership Coach™', 'Helps founders and leaders develop judgment, communication, and resilience.'],
  ['Scenario Judgment™', 'Evaluates not just what could happen, but what should be done.'],
  ['Wisdom Dashboard™', 'Executive view of strategic maturity, decision quality, and values alignment.'],
]);

const volXIX = range(269, 276, 'volume-xix', [
  ['Mission & Vision Engine™', 'Captures, refines, and preserves mission and vision.'],
  ['Values System™', 'Defines values and how they affect decisions and behavior.'],
  ['Culture Engine™', 'Maps culture, rituals, language, standards, and norms.'],
  ['Brand Voice DNA™', 'Defines tone, language, vocabulary, personality, and communication rules.'],
  ['Leadership Style™', 'Preserves how leadership makes decisions, communicates, and guides people.'],
  ['Customer Philosophy™', 'Defines how the organization treats, serves, supports, and respects customers.'],
  ['Risk Tolerance™', 'Defines risk appetite across finance, legal, operations, innovation, and automation.'],
  ['Studio DNA Dashboard™', 'Unified view of identity, principles, culture, and operating philosophy.'],
]);

const allMilestones = [
  ...volII_IV,
  ...volV,
  ...volVI,
  ...volVII,
  ...volVIII,
  ...volIX,
  ...volX,
  ...volXI,
  ...volXII,
  ...volXIII,
  ...volXIV,
  ...volXV,
  ...volXVI,
  ...volXVII,
  ...volXVIII,
  ...volXIX,
];

fs.mkdirSync(OUT_DIR, { recursive: true });

const files = {
  'volume-ii-iv.yaml': volII_IV,
  'volume-v.yaml': volV,
  'volume-vi-xix.yaml': [...volVI, ...volVII, ...volVIII, ...volIX, ...volX, ...volXI, ...volXII, ...volXIII, ...volXIV, ...volXV, ...volXVI, ...volXVII, ...volXVIII, ...volXIX],
  'index.yaml': { version: '1.0.0', updatedAt: '2026-07-07', totalMilestones: allMilestones.length, files: ['volume-ii-iv.yaml', 'volume-v.yaml', 'volume-vi-xix.yaml'] },
};

for (const [file, data] of Object.entries(files)) {
  const content = file === 'index.yaml'
    ? dump(data)
    : dump({ version: '1.0.0', milestones: data });
  fs.writeFileSync(path.join(OUT_DIR, file), content);
  console.log(`Wrote ${file} (${Array.isArray(data) ? data.length : 'index'} entries)`);
}

console.log(`Total milestones: ${allMilestones.length}`);
