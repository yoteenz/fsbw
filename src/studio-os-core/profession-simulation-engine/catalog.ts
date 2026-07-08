import type {
  AICharacterDefinition,
  CareerStageDefinition,
  ProfessionDefinition,
  SimulationSceneDefinition,
  WorkplaceLoopStep,
} from './types';

export const DEFAULT_WORKPLACE_LOOP: WorkplaceLoopStep[] = [
  'clock-in',
  'review-mentor-notes',
  'receive-appointment',
  'consult-client',
  'perform-service',
  'handle-challenge',
  'document-result',
  'receive-feedback',
  'earn-skill-evidence',
  'build-reputation',
  'unlock-promotion',
];

const hairCharacters: AICharacterDefinition[] = [
  {
    id: 'mentor-master-stylist',
    displayName: 'Mentor Stylist™',
    role: 'mentor',
    summary: 'A senior stylist who guides technique, judgment, professional etiquette, and confidence.',
    personality: 'precise, warm, direct, standards-driven',
    memoryLayers: ['session', 'relationship', 'competency', 'career'],
    adaptsBy: ['skill gaps', 'mistake recovery', 'client communication', 'promotion readiness'],
  },
  {
    id: 'salon-manager',
    displayName: 'Salon Manager™',
    role: 'manager',
    summary: 'Runs the floor, assigns shifts, monitors reputation, and approves new responsibilities.',
    personality: 'efficient, protective of clients, business-minded',
    memoryLayers: ['relationship', 'reputation', 'workplace', 'career'],
    adaptsBy: ['punctuality', 'client satisfaction', 'team reliability', 'safety compliance'],
  },
  {
    id: 'returning-client-maya',
    displayName: 'Returning Client™',
    role: 'client',
    summary: 'A recurring client whose trust changes based on prior consultations and outcomes.',
    personality: 'expressive, detail-oriented, honest about trust',
    memoryLayers: ['session', 'relationship', 'reputation'],
    adaptsBy: ['consultation quality', 'comfort', 'result accuracy', 'follow-up care'],
  },
  {
    id: 'supplier-beauty-rep',
    displayName: 'Supplier Rep™',
    role: 'supplier',
    summary: 'Provides inventory, product substitution constraints, and supply-chain surprises.',
    personality: 'practical, inventory-aware, opportunity-driven',
    memoryLayers: ['session', 'workplace'],
    adaptsBy: ['supply choices', 'budget awareness', 'reorder timing'],
  },
  {
    id: 'state-board-inspector',
    displayName: 'Inspector™',
    role: 'inspector',
    summary: 'Evaluates sanitation, safety, documentation, and professional compliance.',
    personality: 'neutral, exacting, evidence-based',
    memoryLayers: ['session', 'reputation', 'competency'],
    adaptsBy: ['sanitation consistency', 'documentation accuracy', 'risk handling'],
  },
];

function gates(stage: string): CareerStageDefinition['promotionGates'] {
  return [
    {
      type: 'skill-evidence',
      label: `${stage} competency evidence`,
      evidenceRequired: 'Complete required workplace scenes with mentor-observed technique.',
      passCondition: 'No critical safety miss and minimum competency score achieved.',
    },
    {
      type: 'client-satisfaction',
      label: `${stage} client trust`,
      evidenceRequired: 'Serve simulated clients with appropriate communication and aftercare.',
      passCondition: 'Client satisfaction and trust remain above stage threshold.',
    },
    {
      type: 'mentor-approval',
      label: `${stage} mentor review`,
      evidenceRequired: 'Mentor reviews shift history, mistakes, recovery, and professionalism.',
      passCondition: 'Mentor approves promotion readiness.',
    },
  ];
}

function stage(
  id: string,
  displayName: string,
  order: number,
  summary: string,
  responsibilities: string[],
  tools: string[],
  clientTypes: string[],
  environments: string[],
  incomeModel: string,
  aiScenarioUnlocks: string[],
  certificationUnlocks: string[],
  sceneIds: string[]
): CareerStageDefinition {
  return {
    id,
    displayName,
    order,
    summary,
    responsibilities,
    unlockedTools: tools,
    unlockedClientTypes: clientTypes,
    unlockedEnvironments: environments,
    incomeModel,
    aiScenarioUnlocks,
    certificationUnlocks,
    promotionGates: gates(displayName),
    sceneIds,
    unlocks: [
      { type: 'responsibility', label: responsibilities[0] ?? displayName, summary },
      { type: 'tool', label: tools[0] ?? 'Professional tool access', summary: 'New tool access expands workplace responsibility.' },
      { type: 'client-type', label: clientTypes[0] ?? 'New client profile', summary: 'New client expectations enter the simulation.' },
      { type: 'environment', label: environments[0] ?? 'New workplace zone', summary: 'The playable workplace expands.' },
      { type: 'income', label: incomeModel, summary: 'Income model increases with professional responsibility.' },
    ],
  };
}

const hairScenes: SimulationSceneDefinition[] = [
  {
    id: 'salon-day-one-clock-in',
    displayName: 'Day One Clock-In™',
    sceneType: 'orientation',
    environment: 'Salon back room, front desk, shampoo area, and stylist floor.',
    learnerAction: 'Clock in, meet the team, learn sanitation standards, observe the first client flow.',
    aiCharacters: ['mentor-master-stylist', 'salon-manager'],
    generatedFromProfessionBrain: ['sanitation basics', 'salon etiquette', 'client privacy', 'tool orientation'],
    successSignals: ['arrives prepared', 'identifies unsafe setup', 'asks appropriate questions'],
    unexpectedEvents: ['missing cape', 'late walk-in client', 'mentor asks for station reset'],
  },
  {
    id: 'shampoo-station-rush',
    displayName: 'Shampoo Station Rush™',
    sceneType: 'shift',
    environment: 'Busy shampoo station during back-to-back appointments.',
    learnerAction: 'Prepare bowls, protect client comfort, manage timing, and reset sanitation quickly.',
    aiCharacters: ['mentor-master-stylist', 'returning-client-maya'],
    generatedFromProfessionBrain: ['scalp care', 'water temperature', 'product selection', 'client comfort'],
    successSignals: ['client comfort maintained', 'products selected correctly', 'station reset on time'],
    unexpectedEvents: ['sensitive scalp', 'low product inventory', 'water temperature complaint'],
  },
  {
    id: 'first-blowout-client',
    displayName: 'First Blowout Client™',
    sceneType: 'client-appointment',
    environment: 'Styling chair with mentor shadowing nearby.',
    learnerAction: 'Consult on finish, section hair, control tension, and deliver a polished blowout.',
    aiCharacters: ['mentor-master-stylist', 'returning-client-maya'],
    generatedFromProfessionBrain: ['heat safety', 'sectioning', 'brush control', 'finish selection'],
    successSignals: ['heat protection used', 'style matches consult', 'mentor notes controlled technique'],
    unexpectedEvents: ['humidity concern', 'client changes finish request', 'dryer heat issue'],
  },
  {
    id: 'color-correction-consult',
    displayName: 'Color Correction Consult™',
    sceneType: 'challenge',
    environment: 'Consultation station with swatches, strand-test tools, and client history.',
    learnerAction: 'Assess hair history, identify risk, explain realistic outcomes, and propose a safe plan.',
    aiCharacters: ['mentor-master-stylist', 'returning-client-maya'],
    generatedFromProfessionBrain: ['color theory', 'strand testing', 'damage risk', 'expectation management'],
    successSignals: ['risk explained', 'strand test ordered', 'client expectations reset'],
    unexpectedEvents: ['undisclosed box dye', 'urgent event deadline', 'client requests unsafe lift'],
  },
  {
    id: 'lace-install-review',
    displayName: 'Lace Install Review™',
    sceneType: 'promotion-review',
    environment: 'Private styling bay with mentor and manager review.',
    learnerAction: 'Perform install prep, protect hairline, customize lace, and explain maintenance.',
    aiCharacters: ['mentor-master-stylist', 'salon-manager', 'returning-client-maya'],
    generatedFromProfessionBrain: ['lace customization', 'adhesive safety', 'hairline protection', 'aftercare'],
    successSignals: ['safe adhesive selection', 'natural finish', 'aftercare taught clearly'],
    unexpectedEvents: ['sensitive skin', 'client wants excessive hold', 'humidity forecast'],
  },
  {
    id: 'salon-owner-supply-crisis',
    displayName: 'Owner Supply Crisis™',
    sceneType: 'project',
    environment: 'Salon office, supplier call, and fully booked salon floor.',
    learnerAction: 'Reorder critical supplies, adjust schedule, protect revenue, and communicate with staff.',
    aiCharacters: ['salon-manager', 'supplier-beauty-rep', 'state-board-inspector'],
    generatedFromProfessionBrain: ['inventory planning', 'client communication', 'budgeting', 'compliance'],
    successSignals: ['clients protected', 'cash preserved', 'inspection compliance maintained'],
    unexpectedEvents: ['supplier delay', 'inspector arrives', 'VIP client request'],
  },
];

const hairStages: CareerStageDefinition[] = [
  stage('intern', 'Intern™', 1, 'Learns salon flow, sanitation, station setup, and observation discipline.', ['Clock in and support the floor'], ['sanitation kit'], ['observed clients'], ['back room', 'front desk'], 'Observation stipend', ['Day One orientation'], ['Salon Safety Orientation'], ['salon-day-one-clock-in']),
  stage('salon-assistant', 'Salon Assistant™', 2, 'Supports stylists, resets stations, tracks timing, and prepares appointments.', ['Prepare stations independently'], ['station cart'], ['assistant-supported clients'], ['stylist floor'], 'Hourly assistant pay', ['Station reset rush'], ['Assistant Floor Readiness'], ['salon-day-one-clock-in', 'shampoo-station-rush']),
  stage('shampoo-technician', 'Shampoo Technician™', 3, 'Owns shampoo service quality, scalp comfort, and product preparation.', ['Lead shampoo service'], ['shampoo bowls', 'scalp care products'], ['shampoo clients'], ['shampoo station'], 'Service hourly + tips', ['Sensitive scalp scenario'], ['Shampoo Service Certificate'], ['shampoo-station-rush']),
  stage('blowout-specialist', 'Blowout Specialist™', 4, 'Delivers polished finishes while managing heat safety and consultation accuracy.', ['Perform blowouts'], ['dryer', 'round brush', 'heat protectant'], ['finish-focused clients'], ['styling chair'], 'Service commission entry', ['First solo styling client'], ['Blowout Specialist Certificate'], ['first-blowout-client']),
  stage('junior-stylist', 'Junior Stylist™', 5, 'Handles lower-risk services and builds consultation confidence.', ['Own junior appointments'], ['cutting and styling kit'], ['maintenance clients'], ['junior stylist chair'], 'Junior commission', ['Consultation variance'], ['Junior Stylist Review'], ['first-blowout-client']),
  stage('color-specialist', 'Color Specialist™', 6, 'Applies color theory, strand testing, and expectation management.', ['Lead color consults'], ['color bowls', 'swatches', 'strand-test kit'], ['color clients'], ['color bar'], 'Color service commission', ['Color correction risk'], ['Color Theory Certificate'], ['color-correction-consult']),
  stage('extension-specialist', 'Extension Specialist™', 7, 'Installs, blends, and maintains extensions with hair-health judgment.', ['Recommend extension methods'], ['extension tools', 'texture match kit'], ['extension clients'], ['extension bay'], 'Premium service commission', ['Texture match challenge'], ['Extension Method Certificate'], ['color-correction-consult']),
  stage('lace-expert', 'Lace Expert™', 8, 'Customizes lace, protects hairlines, and manages adhesive safety.', ['Lead lace installs'], ['lace kit', 'adhesive safety kit'], ['lace install clients'], ['private install bay'], 'Premium lace service commission', ['Sensitive skin lace install'], ['Lace Expert Certificate'], ['lace-install-review']),
  stage('master-stylist', 'Master Stylist™', 9, 'Combines advanced services, handles VIP clients, and recovers mistakes.', ['Own complex transformations'], ['master service kit'], ['VIP transformation clients'], ['master suite'], 'Master commission + VIP premium', ['Complex recovery scenario'], ['Master Stylist Board'], ['lace-install-review']),
  stage('salon-educator', 'Salon Educator™', 10, 'Teaches junior staff and converts expertise into repeatable standards.', ['Train apprentices'], ['education station'], ['students and junior staff'], ['education room'], 'Educator rate + service premium', ['Teach-back assessment'], ['Salon Educator Certificate'], ['lace-install-review']),
  stage('salon-manager', 'Salon Manager™', 11, 'Runs floor operations, scheduling, reputation, supplies, and staff escalation.', ['Manage daily salon floor'], ['schedule board', 'inventory dashboard'], ['escalation clients'], ['manager office'], 'Manager salary + performance bonus', ['Staff conflict scenario'], ['Salon Management Certificate'], ['salon-owner-supply-crisis']),
  stage('salon-owner', 'Salon Owner™', 12, 'Owns revenue, hiring, vendor relationships, brand, and inspection readiness.', ['Protect business health'], ['financial dashboard', 'supplier network'], ['VIP and community clients'], ['owner office', 'full salon'], 'Owner profit share', ['Supply crisis', 'inspection surprise'], ['Salon Owner Certificate'], ['salon-owner-supply-crisis']),
  stage('industry-icon', 'Industry Icon™', 13, 'Shapes the industry through education, standards, product influence, and legacy.', ['Set professional standards'], ['platform stage', 'education library'], ['industry audience'], ['academy', 'conference stage'], 'Legacy income + education revenue', ['Public masterclass', 'industry critique'], ['Industry Icon Recognition'], ['salon-owner-supply-crisis']),
];

export const PROFESSION_SIMULATION_PROFESSIONS: ProfessionDefinition[] = [
  {
    id: 'hair',
    displayName: 'Hair Profession™',
    worldGraphSlug: 'hair-profession',
    professionBrainId: 'profession-brain-hair',
    summary:
      'A playable salon career where learners progress from Intern™ to Industry Icon™ by serving clients, mastering technique, and building reputation.',
    workplaceName: 'Living Salon Workplace™',
    workplaceLoop: DEFAULT_WORKPLACE_LOOP,
    supportedSurfaces: [
      'studio-institute',
      'profession-brain',
      'skill-graph',
      'professional-profile',
      'world-graph',
    ],
    aiCharacters: hairCharacters,
    careerStages: hairStages,
    simulationScenes: hairScenes,
    tags: ['hair', 'salon', 'career-simulation', 'profession-brain', 'studio-institute'],
  },
];

export function getProfessionDefinition(id: string): ProfessionDefinition | undefined {
  return PROFESSION_SIMULATION_PROFESSIONS.find((profession) => profession.id === id);
}

export function listProfessionIds(): string[] {
  return PROFESSION_SIMULATION_PROFESSIONS.map((profession) => profession.id);
}

