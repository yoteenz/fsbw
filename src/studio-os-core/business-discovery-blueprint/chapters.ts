import type { DiscoveryChapterId, DiscoveryPrompt } from './types';

export type DiscoveryChapterDefinition = {
  id: DiscoveryChapterId;
  number: number;
  title: string;
  subtitle: string;
  philosophy: string;
};

export const DISCOVERY_CHAPTERS: DiscoveryChapterDefinition[] = [
  {
    id: 'organization-identity',
    number: 1,
    title: 'Organization Identity',
    subtitle: 'Who you are · who you serve · why you exist',
    philosophy: 'Tell the story of your company — not your software settings.',
  },
  {
    id: 'founder-brain',
    number: 2,
    title: 'Founder Brain',
    subtitle: 'How you actually operate · not your job title',
    philosophy: 'Capture founder behavior — the knowledge that lives only in your head.',
  },
  {
    id: 'services',
    number: 3,
    title: 'Services',
    subtitle: 'Every service · understood deeply',
    philosophy: 'Each service gets its own discovery conversation until Studio OS understands it completely.',
  },
  {
    id: 'decision-intelligence',
    number: 4,
    title: 'Decision Intelligence',
    subtitle: 'How you decide · not only what you do',
    philosophy: 'Capture reasoning — the unwritten rules behind every judgment call.',
  },
  {
    id: 'knowledge-wisdom',
    number: 5,
    title: 'Knowledge & Wisdom',
    subtitle: 'Lessons that took years to learn',
    philosophy: 'Preserve wisdom — not only process documentation.',
  },
  {
    id: 'resources',
    number: 6,
    title: 'Resources',
    subtitle: 'Documents · forms · templates · reference material',
    philosophy: 'Upload what your organization already trusts — it becomes permanent knowledge.',
  },
  {
    id: 'people',
    number: 7,
    title: 'People',
    subtitle: 'Departments · roles · relationships',
    philosophy: 'Studio OS begins understanding the human organization.',
  },
  {
    id: 'customers',
    number: 8,
    title: 'Customers',
    subtitle: 'Journey · expectations · support',
    philosophy: 'Understand how customers experience your business — not just demographics.',
  },
  {
    id: 'growth',
    number: 9,
    title: 'Growth',
    subtitle: 'Where you are going · not only where you are today',
    philosophy: 'Studio OS must understand the future — expansion · automation · hiring · vision.',
  },
];

export const DISCOVERY_PROMPTS: DiscoveryPrompt[] = [
  // Chapter 1 — Organization Identity
  {
    id: 'identity-company-name',
    chapterId: 'organization-identity',
    question: 'What is the name of your organization?',
    placeholder: 'Tell me the name your customers know you by…',
    kind: 'narrative',
  },
  {
    id: 'identity-industry',
    chapterId: 'organization-identity',
    question: 'What industry do you operate in — and how would you describe it in your own words?',
    placeholder: 'We are a… / We serve…',
    kind: 'narrative',
    followUpWhenShort: 'What makes your corner of this industry different from everyone else?',
  },
  {
    id: 'identity-mission',
    chapterId: 'organization-identity',
    question: 'What is your mission — the problem you exist to solve?',
    kind: 'narrative',
    followUpWhenShort: 'Who suffers most when that problem goes unsolved?',
  },
  {
    id: 'identity-vision',
    chapterId: 'organization-identity',
    question: 'What is your vision — where is this organization headed in five to ten years?',
    kind: 'narrative',
  },
  {
    id: 'identity-core-services',
    chapterId: 'organization-identity',
    question: 'What are your core services or products — list everything you offer today.',
    kind: 'list',
    followUpWhenShort: 'Which of these generates the most revenue or impact?',
  },
  {
    id: 'identity-target-customers',
    chapterId: 'organization-identity',
    question: 'Who are your target customers — describe them like you would to a new hire.',
    kind: 'narrative',
  },
  {
    id: 'identity-uvp',
    chapterId: 'organization-identity',
    question: 'What is your unique value proposition — why choose you over alternatives?',
    kind: 'narrative',
  },
  {
    id: 'identity-goals',
    chapterId: 'organization-identity',
    question: 'What are your most important business goals this year?',
    kind: 'list',
  },

  // Chapter 2 — Founder Brain
  {
    id: 'founder-day-walkthrough',
    chapterId: 'founder-brain',
    question: 'Walk me through a normal day. What does it actually look like from morning to night?',
    kind: 'narrative',
    followUpWhenShort: 'What is the first thing you do — and the last thing before you stop?',
  },
  {
    id: 'founder-first-thing',
    chapterId: 'founder-brain',
    question: 'What is the first thing you do when you start work?',
    kind: 'narrative',
  },
  {
    id: 'founder-last-thing',
    chapterId: 'founder-brain',
    question: 'What is the last thing you do before you step away?',
    kind: 'narrative',
  },
  {
    id: 'founder-keeps-busy',
    chapterId: 'founder-brain',
    question: 'What keeps you busiest — the work that never seems to finish?',
    kind: 'narrative',
  },
  {
    id: 'founder-stress',
    chapterId: 'founder-brain',
    question: 'What stresses you the most right now?',
    kind: 'narrative',
  },
  {
    id: 'founder-only-you',
    chapterId: 'founder-brain',
    question: 'What only you know how to do — the things that would break if you were unavailable?',
    kind: 'narrative',
    followUpWhenShort: 'If you disappeared for one week, what would stop?',
  },
  {
    id: 'founder-disappear-week',
    chapterId: 'founder-brain',
    question: 'If you disappeared for one week, what would stop?',
    kind: 'narrative',
  },

  // Chapter 3 — Services (per-service prompts — serviceName attached at runtime)
  {
    id: 'service-purpose',
    chapterId: 'services',
    question: 'What is the purpose of this service — why do customers buy it?',
    kind: 'service-dive',
  },
  {
    id: 'service-inputs',
    chapterId: 'services',
    question: 'What inputs do you need before this service can begin?',
    kind: 'service-dive',
  },
  {
    id: 'service-outputs',
    chapterId: 'services',
    question: 'What does the customer receive when this service is complete?',
    kind: 'service-dive',
  },
  {
    id: 'service-workflow',
    chapterId: 'services',
    question: 'Walk me through the workflow — step by step, how does this service get done?',
    kind: 'service-dive',
    followUpWhenShort: 'Where do things usually slow down or get stuck?',
  },
  {
    id: 'service-decisions',
    chapterId: 'services',
    question: 'What decision points require judgment during this service?',
    kind: 'service-dive',
  },
  {
    id: 'service-exceptions',
    chapterId: 'services',
    question: 'What exceptions or edge cases come up most often?',
    kind: 'service-dive',
  },
  {
    id: 'service-deadlines',
    chapterId: 'services',
    question: 'What deadlines or timing rules apply?',
    kind: 'service-dive',
  },
  {
    id: 'service-compliance',
    chapterId: 'services',
    question: 'What compliance, licensing, or regulatory requirements apply?',
    kind: 'service-dive',
    skipForIndustries: ['creator'],
  },
  {
    id: 'service-forms',
    chapterId: 'services',
    question: 'What forms or documents are involved?',
    kind: 'service-dive',
  },
  {
    id: 'service-mistakes',
    chapterId: 'services',
    question: 'What are the most common mistakes — and how do you prevent them?',
    kind: 'service-dive',
  },
  {
    id: 'service-approvals',
    chapterId: 'services',
    question: 'What requires approval before moving forward?',
    kind: 'service-dive',
  },
  {
    id: 'service-completion',
    chapterId: 'services',
    question: 'How do you know this service is truly complete?',
    kind: 'service-dive',
  },

  // Chapter 4 — Decision Intelligence
  {
    id: 'decision-how',
    chapterId: 'decision-intelligence',
    question: 'How do you make decisions — what is your process when something important comes up?',
    kind: 'narrative',
  },
  {
    id: 'decision-correct',
    chapterId: 'decision-intelligence',
    question: 'How do you know something is correct — what evidence or feeling tells you?',
    kind: 'narrative',
  },
  {
    id: 'decision-mistakes',
    chapterId: 'decision-intelligence',
    question: 'How do you recognize mistakes early — before they become expensive?',
    kind: 'narrative',
  },
  {
    id: 'decision-human-judgment',
    chapterId: 'decision-intelligence',
    question: 'What always requires human judgment — never automation alone?',
    kind: 'narrative',
  },
  {
    id: 'decision-shortcuts',
    chapterId: 'decision-intelligence',
    question: 'What shortcuts have you learned that new people would not know?',
    kind: 'narrative',
  },
  {
    id: 'decision-patterns',
    chapterId: 'decision-intelligence',
    question: 'What patterns have you discovered in how your business actually runs?',
    kind: 'narrative',
  },
  {
    id: 'decision-unwritten',
    chapterId: 'decision-intelligence',
    question: 'What rules are unwritten — the ones everyone follows but nobody documents?',
    kind: 'narrative',
  },

  // Chapter 5 — Knowledge & Wisdom
  {
    id: 'wisdom-years',
    chapterId: 'knowledge-wisdom',
    question: 'What lessons took years to learn — things you wish you knew on day one?',
    kind: 'narrative',
  },
  {
    id: 'wisdom-wrong',
    chapterId: 'knowledge-wisdom',
    question: 'What does everyone get wrong about your industry or business?',
    kind: 'narrative',
  },
  {
    id: 'wisdom-new-employee',
    chapterId: 'knowledge-wisdom',
    question: 'What advice would you give a new employee in their first week?',
    kind: 'narrative',
  },
  {
    id: 'wisdom-never-outsource',
    chapterId: 'knowledge-wisdom',
    question: 'What would you never outsource — and why?',
    kind: 'narrative',
  },
  {
    id: 'wisdom-stories',
    chapterId: 'knowledge-wisdom',
    question: 'What stories explain why your business works the way it does?',
    kind: 'narrative',
  },

  // Chapter 6 — Resources
  {
    id: 'resources-documents',
    chapterId: 'resources',
    question: 'List key documents, forms, templates, or policies your team relies on.',
    placeholder: 'Contracts · checklists · SOPs · training manuals…',
    kind: 'upload',
  },
  {
    id: 'resources-reference',
    chapterId: 'resources',
    question: 'What reference material should every new team member have access to?',
    kind: 'narrative',
  },

  // Chapter 7 — People
  {
    id: 'people-departments',
    chapterId: 'people',
    question: 'What departments or functional areas exist in your organization today?',
    kind: 'list',
  },
  {
    id: 'people-roles',
    chapterId: 'people',
    question: 'Describe key roles — who does what, and who owns what outcomes?',
    kind: 'narrative',
  },
  {
    id: 'people-employees',
    chapterId: 'people',
    question: 'Who are your current employees or core team members?',
    kind: 'narrative',
  },
  {
    id: 'people-future',
    chapterId: 'people',
    question: 'What positions will you need to hire for next?',
    kind: 'list',
  },
  {
    id: 'people-vendors',
    chapterId: 'people',
    question: 'Who are your outside vendors and critical business relationships?',
    kind: 'narrative',
  },

  // Chapter 8 — Customers
  {
    id: 'customers-journey',
    chapterId: 'customers',
    question: 'Describe the customer journey — from first contact to long-term relationship.',
    kind: 'narrative',
    onlyForIndustries: undefined,
  },
  {
    id: 'customers-faq',
    chapterId: 'customers',
    question: 'What questions do customers ask most frequently?',
    kind: 'list',
  },
  {
    id: 'customers-pain',
    chapterId: 'customers',
    question: 'What pain points bring customers to you?',
    kind: 'narrative',
  },
  {
    id: 'customers-requests',
    chapterId: 'customers',
    question: 'What are typical customer requests — the ones you handle every week?',
    kind: 'list',
  },
  {
    id: 'customers-expectations',
    chapterId: 'customers',
    question: 'What service expectations do customers have — spoken and unspoken?',
    kind: 'narrative',
  },
  {
    id: 'customers-support',
    chapterId: 'customers',
    question: 'How does your support workflow operate when something goes wrong?',
    kind: 'narrative',
  },
  {
    id: 'customers-lifecycle',
    chapterId: 'customers',
    question: 'Describe the relationship lifecycle — how do customers stay, leave, or refer?',
    kind: 'narrative',
  },

  // Chapter 9 — Growth
  {
    id: 'growth-future-goals',
    chapterId: 'growth',
    question: 'What are your future goals — the ambitions that drive you forward?',
    kind: 'narrative',
  },
  {
    id: 'growth-expansion',
    chapterId: 'growth',
    question: 'What expansion plans are on the horizon — new markets, locations, or segments?',
    kind: 'narrative',
  },
  {
    id: 'growth-new-services',
    chapterId: 'growth',
    question: 'What new services or products are you considering?',
    kind: 'list',
  },
  {
    id: 'growth-automation',
    chapterId: 'growth',
    question: 'What would you automate if you could — and what must stay human?',
    kind: 'narrative',
  },
  {
    id: 'growth-marketing',
    chapterId: 'growth',
    question: 'What are your marketing goals this year?',
    kind: 'narrative',
  },
  {
    id: 'growth-hiring',
    chapterId: 'growth',
    question: 'What is your hiring plan — who do you need on the team?',
    kind: 'list',
  },
  {
    id: 'growth-vision',
    chapterId: 'growth',
    question: 'Describe your vision for the company — the legacy you are building.',
    kind: 'narrative',
  },
];

export function getChapterDefinition(chapterId: DiscoveryChapterId): DiscoveryChapterDefinition {
  const chapter = DISCOVERY_CHAPTERS.find((c) => c.id === chapterId);
  if (!chapter) throw new Error(`Unknown chapter: ${chapterId}`);
  return chapter;
}

export function getPromptsForChapter(chapterId: DiscoveryChapterId): DiscoveryPrompt[] {
  return DISCOVERY_PROMPTS.filter((p) => p.chapterId === chapterId);
}
