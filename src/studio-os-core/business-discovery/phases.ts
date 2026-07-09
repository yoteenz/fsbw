import type {
  BusinessDiscoveryPhaseDefinition,
  BusinessDiscoveryPhaseId,
  BusinessDiscoveryQuestion,
} from './types';

function q(id: string, prompt: string, intent: string): BusinessDiscoveryQuestion {
  return { id, prompt, intent };
}

export const BUSINESS_DISCOVERY_PHASES: BusinessDiscoveryPhaseDefinition[] = [
  {
    id: 'founder-discovery',
    number: 1,
    title: 'Founder Discovery™',
    purpose:
      'Understand the founder as strategist, decision-maker, operator, and visionary before mapping the company.',
    questionsAsked: [
      q('vision', 'What future are you building toward?', 'Capture founder vision and ambition.'),
      q('mission', 'What problem must this company exist to solve?', 'Clarify purpose and urgency.'),
      q('values', 'What values should never be compromised?', 'Define governance principles.'),
      q('goals', 'Which goals matter most in the next year?', 'Prioritize near-term direction.'),
      q('ambition', 'What do you want this company to become long term?', 'Capture legacy horizon.'),
      q('decision-style', 'How do you make important decisions?', 'Model founder judgment.'),
      q('leadership-style', 'How do people experience your leadership?', 'Map leadership behavior.'),
      q('success-definition', 'How will you know Studio OS made your company stronger?', 'Define success criteria.'),
    ],
    informationCollected: [
      'Vision',
      'Mission',
      'Values',
      'Goals',
      'Long-term ambitions',
      'Decision style',
      'Leadership style',
      'Success definition',
    ],
    objectsCreated: [
      'Founder Genome™ draft',
      'Founder Decision Profile™',
      'Leadership Style Profile™',
      'Success Definition Record™',
    ],
    systemsUpdated: ['Organization Genome™', 'Founder Operating System™', 'Command Dock™', 'Orb™'],
    aiReasoning: [
      'Infer decision preferences and approval thresholds.',
      'Detect founder values that must govern AI-generated work.',
      'Identify leadership bottlenecks and delegation opportunities.',
    ],
    founderExperience:
      'Feels like an executive strategy intake: reflective, personal, and clarifying without becoming therapy or a form.',
    visualExperience:
      'Founder portrait constellation: mission, values, ambition, decision style, and success definition gradually illuminate.',
    successCriteria: [
      'Founder can articulate sharper mission, vision, values, and success definition.',
      'Studio OS can explain how the founder prefers to decide and lead.',
      'Orb can speak in the founder’s preferred strategic cadence.',
    ],
    orbRole:
      'Acts as strategist and mentor, mirroring the founder’s own language back with sharper structure.',
    founderMoments: [
      'Your leadership pattern is beginning to emerge.',
      'We found the decisions that should always stay founder-led.',
    ],
  },
  {
    id: 'company-discovery',
    number: 2,
    title: 'Company Discovery™',
    purpose:
      'Map what the company does, who it serves, how it makes money, and how work currently happens.',
    questionsAsked: [
      q('business-model', 'How does the company create and capture value?', 'Identify business model.'),
      q('offers', 'What products, services, packages, or offers do you sell today?', 'Catalog revenue surfaces.'),
      q('customers', 'Who are your best customers and why do they choose you?', 'Map ideal customer profile.'),
      q('market', 'What market do you compete in and how is it changing?', 'Understand external context.'),
      q('revenue', 'Where does revenue come from today?', 'Build revenue graph inputs.'),
      q('pricing', 'How are prices set and when do they change?', 'Capture pricing logic.'),
      q('operations', 'Walk me through how work moves from request to delivery.', 'Map operations.'),
      q('team-tech-brand', 'What team, tools, and brand standards support the work?', 'Capture resources and brand.'),
    ],
    informationCollected: [
      'Business model',
      'Products',
      'Services',
      'Offers',
      'Customers',
      'Market',
      'Revenue',
      'Pricing',
      'Operations',
      'Processes',
      'Team',
      'Technology',
      'Brand',
    ],
    objectsCreated: [
      'Offer Catalog™',
      'Customer Segment Map™',
      'Revenue Model Draft™',
      'Operations Map™',
      'Brand Input Profile™',
    ],
    systemsUpdated: [
      'Business Discovery Blueprint™',
      'Organization Genome™',
      'Industry Architecture™',
      'Company Health Index™',
      'Expert Marketplace™',
    ],
    aiReasoning: [
      'Separate what the company sells from the workflows required to deliver it.',
      'Detect pricing gaps, customer concentration, and operational dependency risks.',
      'Identify which department packs and digital staff may be needed.',
    ],
    founderExperience:
      'Feels like a partner finally understanding the business model, not a SaaS configuration checklist.',
    visualExperience:
      'Company map forms around offers, customers, revenue, operations, team, tools, and brand signals.',
    successCriteria: [
      'Every current offer and customer segment is named.',
      'Revenue and operations have enough structure to map dependencies.',
      'Founder sees at least one clarifying insight about the business model.',
    ],
    orbRole:
      'Acts as business architect, asking “what happens next?” until the company model is visible.',
    founderMoments: [
      'Your business is beginning to take shape.',
      'We can now see how value moves through your company.',
    ],
  },
  {
    id: 'relationship-discovery',
    number: 3,
    title: 'Relationship Discovery™',
    purpose:
      'Reveal how work, people, systems, customers, money, and knowledge connect across the organization.',
    questionsAsked: [
      q('dependencies', 'What must happen before each major workflow can begin?', 'Identify dependencies.'),
      q('inputs', 'What information, assets, approvals, or materials are required?', 'Map inputs.'),
      q('outputs', 'What does each workflow produce?', 'Map outputs.'),
      q('ownership', 'Who owns each decision, handoff, or deliverable?', 'Capture ownership.'),
      q('feedback-loops', 'Where do you learn that something worked or failed?', 'Map feedback loops.'),
    ],
    informationCollected: ['Dependencies', 'Inputs', 'Outputs', 'Ownership', 'Workflows', 'Feedback loops'],
    objectsCreated: [
      'Dependency Map™',
      'Workflow Relationship Graph™',
      'Ownership Matrix™',
      'Feedback Loop Map™',
    ],
    systemsUpdated: [
      'World Graph™',
      'Memory Engine™',
      'Executive Council™',
      'Shadow Mode™',
      'Automation Architecture™',
    ],
    aiReasoning: [
      'Detect hidden bottlenecks and single points of failure.',
      'Compare ownership clarity against workflow complexity.',
      'Identify safe observation targets for Shadow Mode™ before automation.',
    ],
    founderExperience:
      'Feels like a consulting team mapping the business on a glass wall and circling the hidden constraints.',
    visualExperience:
      'Nodes and lines animate into an operational graph with bottlenecks, loops, and ownership lanes.',
    successCriteria: [
      'Core dependencies and handoffs are visible.',
      'Ownership gaps are named without blame.',
      'At least one workflow can be projected into automation discovery.',
    ],
    orbRole:
      'Acts as systems consultant, pointing out connections and asking where work slows down.',
    founderMoments: [
      'We discovered three hidden bottlenecks.',
      'Your workflow relationships are now visible.',
    ],
  },
  {
    id: 'knowledge-discovery',
    number: 4,
    title: 'Knowledge Discovery™',
    purpose:
      'Collect and classify the organization’s existing documentation, operating knowledge, policies, and systems.',
    questionsAsked: [
      q('documentation', 'What documents does the company already trust?', 'Inventory current documentation.'),
      q('sops', 'Which SOPs or workflows already exist?', 'Find procedural knowledge.'),
      q('policies', 'What policies guide customer, team, or compliance decisions?', 'Capture governance knowledge.'),
      q('research', 'What research or references shape how you work?', 'Capture external knowledge sources.'),
      q('brand-guidelines', 'What brand standards should Studio OS protect?', 'Capture brand knowledge.'),
      q('existing-systems', 'Which tools or systems currently hold truth?', 'Map system-of-record boundaries.'),
    ],
    informationCollected: [
      'Current documentation',
      'SOPs',
      'Policies',
      'Research',
      'Brand guidelines',
      'Processes',
      'Existing systems',
    ],
    objectsCreated: [
      'Knowledge Inventory™',
      'Document Trust Map™',
      'SOP Seed Library™',
      'System-of-Record Map™',
    ],
    systemsUpdated: [
      'Profession Brain™',
      'Organization Operating Manual™',
      'Documentation Registry™',
      'Knowledge Confidence™',
      'Legacy Vault™',
    ],
    aiReasoning: [
      'Classify knowledge by trust, currency, scope, owner, and operational impact.',
      'Detect duplicate or outdated knowledge sources.',
      'Identify knowledge gaps before digital staff can rely on the information.',
    ],
    founderExperience:
      'Feels like handing a consulting team the company’s binder, folders, and unwritten rules so they can organize the truth.',
    visualExperience:
      'Documents become knowledge cards that sort into policies, SOPs, research, brand, systems, and gaps.',
    successCriteria: [
      'Trusted sources are separated from stale or unknown sources.',
      'Profession Brain™ has enough seed material to begin preserving expertise.',
      'Founder understands what the company knows and what remains uncaptured.',
    ],
    orbRole:
      'Acts as knowledge architect, asking what should be trusted and what should be reviewed.',
    founderMoments: [
      'Your knowledge library is forming.',
      'We found the documents your future team will depend on.',
    ],
  },
  {
    id: 'business-genome',
    number: 5,
    title: 'Business Genome™',
    purpose:
      'Synthesize discovery into the Company Genome™: systems, graphs, risks, opportunities, and operating intelligence.',
    questionsAsked: [
      q('confirm-patterns', 'Do these patterns accurately describe how your company works?', 'Validate synthesis.'),
      q('risk-review', 'Which risks feel most important to address first?', 'Founder-rank risks.'),
      q('opportunity-review', 'Which automation or AI opportunities feel most valuable?', 'Founder-rank opportunities.'),
    ],
    informationCollected: [
      'Business systems',
      'Dependencies',
      'Operational graph',
      'Knowledge graph',
      'Customer journey',
      'Revenue graph',
      'Decision graph',
      'Automation opportunities',
      'AI opportunities',
      'Operational risks',
    ],
    objectsCreated: [
      'Company Genome™',
      'Operational Graph™',
      'Knowledge Graph™',
      'Customer Journey Map™',
      'Revenue Graph™',
      'Decision Graph™',
      'Automation Opportunity Register™',
      'AI Opportunity Register™',
      'Operational Risk Register™',
    ],
    systemsUpdated: [
      'Company Genome™',
      'Organization Genome™',
      'Company Health Index™',
      'Organization Digital Twin™',
      'Executive Council™',
      'Studio Intelligence™',
    ],
    aiReasoning: [
      'Synthesize patterns from all prior discovery phases.',
      'Identify leverage points, risk clusters, and decision bottlenecks.',
      'Translate founder language into machine-usable operating architecture.',
    ],
    founderExperience:
      'Feels like the reveal in an elite consulting engagement: the founder sees their company as a living system.',
    visualExperience:
      'A Genome chamber assembles identity, operations, knowledge, revenue, customers, decisions, automation, and risk into one living map.',
    successCriteria: [
      'Founder recognizes the company in the generated Genome.',
      'Systems and dependencies are actionable enough to power Headquarters.',
      'Automation and AI opportunities are prioritized without executing automatically.',
    ],
    orbRole:
      'Acts as synthesis partner, explaining what changed, what matters, and what the Genome will power.',
    founderMoments: [
      'Your customer journey has been mapped.',
      'Your Company Genome™ is ready.',
    ],
  },
  {
    id: 'headquarters-generation',
    number: 6,
    title: 'Headquarters Generation™',
    purpose:
      'Use the Company Genome™ to propose the founder’s first Studio OS Headquarters, departments, rooms, missions, knowledge architecture, and automation architecture.',
    questionsAsked: [
      q('hq-priorities', 'Which Headquarters areas should open first?', 'Founder prioritization.'),
      q('mission-confirmation', 'Which first mission would create the most momentum?', 'Mission system seed.'),
      q('staffing-comfort', 'Where should digital staff observe before helping?', 'Automation readiness boundary.'),
    ],
    informationCollected: [
      'Executive Headquarters™ needs',
      'Department Wing priorities',
      'Room/workspace requirements',
      'Orb configuration',
      'Mission priorities',
      'Atlas structure',
      'Knowledge architecture',
      'Automation architecture',
    ],
    objectsCreated: [
      'Executive Headquarters™ proposal',
      'Department Wings™ proposal',
      'Rooms™ and Workspaces™ proposal',
      'Orb Configuration™',
      'Mission System™ seed',
      'Atlas™ projection',
      'Knowledge Architecture™',
      'Automation Architecture™',
    ],
    systemsUpdated: [
      'Headquarters Experience™',
      'Mission Control™',
      'Studio World Atlas™',
      'Orb™',
      'Command Dock™',
      'Expansion Center™',
      'Organization Inauguration™',
    ],
    aiReasoning: [
      'Translate Genome into spatial operating architecture.',
      'Prioritize Headquarters rooms by founder goals, operational risk, and knowledge readiness.',
      'Create first missions and automation candidates without bypassing founder approval.',
    ],
    founderExperience:
      'Feels like entering a custom-built executive headquarters that understands the company before the founder clicks anything.',
    visualExperience:
      'Headquarters blueprint blooms from the Genome: executive floor, wings, rooms, Atlas nodes, missions, Orb personality, and knowledge stacks.',
    successCriteria: [
      'Founder receives a coherent Headquarters proposal.',
      'First missions and departments are generated from Genome evidence.',
      'Founder can enter Headquarters with confidence instead of completing setup.',
    ],
    orbRole:
      'Acts as business architect and host, presenting the company’s new home with confidence and restraint.',
    founderMoments: [
      'Your first Headquarters is ready.',
      'Welcome to your company’s new home.',
    ],
  },
];

export function getBusinessDiscoveryPhase(
  phaseId: BusinessDiscoveryPhaseId
): BusinessDiscoveryPhaseDefinition {
  const phase = BUSINESS_DISCOVERY_PHASES.find((item) => item.id === phaseId);
  if (!phase) throw new Error(`Unknown Business Discovery phase: ${phaseId}`);
  return phase;
}
