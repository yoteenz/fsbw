import { bootstrapRemembranceGardenStore } from './store';
import type { RemembranceGardenStore } from './types';

export function buildRemembranceGardenSeed(): Partial<RemembranceGardenStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary:
        'REMEMBRANCE GARDEN V1.0 — the most personal space on campus · preserve gratitude · honor those who shaped the organization.',
      dedicationCount: 12,
      reflectionSpaces: 6,
      preservedMemories: 10,
      legacyLetters: 4,
      gardenMaturityPct: 38,
      gratitudeDepthPct: 62,
      activeSeason: 'spring',
    },
    dedicationSpaces: [
      { id: 'ds-1', category: 'PARENT', honoree: 'Father · taught persistence through craft', memorialType: 'oak-tree', architecturalElement: 'Mature oak at garden entrance · roots deep', privacy: 'family' },
      { id: 'ds-2', category: 'MENTOR', honoree: 'Editorial mentor · stat-forward voice', memorialType: 'stone-engraving', architecturalElement: 'Marble inscription · "Trust the reader\'s intelligence"', privacy: 'organization' },
      { id: 'ds-3', category: 'FIRST EMPLOYEE', honoree: 'First editorial hire · believed before traction', memorialType: 'rose-garden', architecturalElement: 'Rose garden bed · first team marker', privacy: 'organization' },
      { id: 'ds-4', category: 'EARLY BELIEVER', honoree: 'Three people who said yes before proof', memorialType: 'lantern-pathway', architecturalElement: 'Lantern pathway · light in early darkness', privacy: 'private' },
      { id: 'ds-5', category: 'FIRST CUSTOMER', honoree: 'First paying reader · validation of mission', memorialType: 'reflection-pool', architecturalElement: 'Still reflection pool · first trust', privacy: 'organization' },
      { id: 'ds-6', category: 'COMMUNITY', honoree: '100th engaged reader · community formed', memorialType: 'cherry-blossom', architecturalElement: 'Cherry blossom grove · seasonal renewal', privacy: 'public' },
      { id: 'ds-7', category: 'PARTNER', honoree: 'Creator marketplace pilot partner', memorialType: 'walking-bridge', architecturalElement: 'Garden bridge · connection across uncertainty', privacy: 'organization' },
      { id: 'ds-8', category: 'TEACHER', honoree: 'Writing craft teacher · institutional memory seed', memorialType: 'garden-pavilion', architecturalElement: 'Quiet pavilion · lessons preserved', privacy: 'family' },
      { id: 'ds-9', category: 'SUPPORTER', honoree: 'Friend who funded first year runway', memorialType: 'crystal-installation', architecturalElement: 'Crystal installation · clarity in doubt', privacy: 'private' },
      { id: 'ds-10', category: 'REMEMBERED', honoree: 'Colleague who shaped editorial standards', memorialType: 'marble-monument', architecturalElement: 'Marble monument · standards live on', privacy: 'organization' },
      { id: 'ds-11', category: 'INVESTOR', honoree: 'Angel who bet on editorial intelligence', memorialType: 'olive-tree', architecturalElement: 'Olive tree · patience and growth', privacy: 'executive' },
      { id: 'ds-12', category: 'CHILD', honoree: 'Inspiration · building for future readers', memorialType: 'flower-garden', architecturalElement: 'Wildflower meadow · hope and possibility', privacy: 'family' },
    ],
    memoryPreservations: [
      { id: 'mp-1', dedicationId: 'ds-1', reflection: 'Every late night editing session traced back to watching him finish work with pride', lifeLesson: 'Craft compounds · shortcuts never satisfy', quote: 'Do it right or don\'t do it' },
      { id: 'mp-2', dedicationId: 'ds-2', reflection: 'Mentor said readers deserve intelligence, not hype — became NDXBOOK\'s north star', lifeLesson: 'Stat-forward voice attracts the right audience', hasMedia: true },
      { id: 'mp-3', dedicationId: 'ds-3', reflection: 'First hire took half salary because they believed in the editorial mission', lifeLesson: 'Early team members are co-founders in spirit' },
      { id: 'mp-4', dedicationId: 'ds-5', reflection: 'First payment proved someone would pay for editorial intelligence', lifeLesson: 'Trust before scale · honor first customers forever' },
      { id: 'mp-5', dedicationId: 'ds-6', reflection: '100th reader email changed how we thought about community', lifeLesson: 'Relationships measure success · not vanity metrics' },
    ],
    reflectionSpaces: [
      { id: 'rs-1', label: 'REFLECTION BENCH', purpose: 'Quiet pause · remember why you started', locationInGarden: 'Entrance · beneath the oak' },
      { id: 'rs-2', label: 'QUIET PAVILION', purpose: 'Write legacy letters · unhurried gratitude', locationInGarden: 'Center · mentor inscription' },
      { id: 'rs-3', label: 'SUNRISE OVERLOOK', purpose: 'Morning gratitude · new day perspective', locationInGarden: 'East edge · cherry blossom grove' },
      { id: 'rs-4', label: 'READING TERRACE', purpose: 'Re-read preserved memories · institutional wisdom', locationInGarden: 'Knowledge connection · west terrace' },
      { id: 'rs-5', label: 'MEMORY BRIDGE', purpose: 'Cross from founder walk · transition to reflection', locationInGarden: 'Founder walk junction' },
      { id: 'rs-6', label: 'GARDEN SANCTUARY', purpose: 'Most private space · family heritage only', locationInGarden: 'Secluded north grove · family only' },
    ],
    livingSeasons: [
      { id: 'ls-1', element: 'Cherry blossoms', evolution: 'Bud → full bloom → petals fall · renewal cycle', season: 'Spring', timeOfDay: 'Morning light' },
      { id: 'ls-2', element: 'Rose garden', evolution: 'First buds → peak fragrance → gentle fade', season: 'Summer', timeOfDay: 'Golden hour' },
      { id: 'ls-3', element: 'Oak canopy', evolution: 'Young sapling → spreading shade → mature wisdom', season: 'Autumn', timeOfDay: 'Afternoon dapple' },
      { id: 'ls-4', element: 'Reflection pool', evolution: 'Still surface · ripples with wind · ice clarity in winter', season: 'Winter', timeOfDay: 'Twilight' },
      { id: 'ls-5', element: 'Lantern pathway', evolution: 'Soft glow at dusk · guides evening walks', season: 'Year-round', timeOfDay: 'Evening' },
      { id: 'ls-6', element: 'Wildflower meadow', evolution: 'Seeds planted → meadow spreads · hope visible', season: 'Spring through summer', timeOfDay: 'Midday warmth' },
    ],
    gratitudeMoments: [
      { id: 'gm-1', signal: 'Creator partnership transformed mission from publication to platform', recommendation: 'Dedicate garden space to first creator partner before details fade', priority: 'high' },
      { id: 'gm-2', signal: 'Onboarding friction lesson came from reader who almost left', recommendation: 'Preserve customer story that reshaped experience strategy', priority: 'high' },
      { id: 'gm-3', signal: 'Writing Bible institutionalization traced to mentor\'s early guidance', recommendation: 'Connect mentor inscription to Knowledge Asset Engine lineage', priority: 'medium' },
      { id: 'gm-4', signal: 'First employee anniversary approaching · extraordinary early contribution', recommendation: 'Write legacy letter · schedule for future leadership unlock', priority: 'medium' },
    ],
    legacyLetters: [
      { id: 'll-1', recipient: 'To my mentor', subject: 'What you taught me about editorial integrity', excerpt: 'You never let me publish something I wouldn\'t be proud of in ten years...', unlockPolicy: 'legacy', privacy: 'organization' },
      { id: 'll-2', recipient: 'To future leadership', subject: 'The people who built this before you arrived', excerpt: 'Before metrics dashboards, there were believers. Honor them...', unlockPolicy: 'scheduled', privacy: 'organization' },
      { id: 'll-3', recipient: 'To my family', subject: 'Why I built this and what it cost', excerpt: 'The late nights were for you as much as for readers...', unlockPolicy: 'private', privacy: 'family' },
      { id: 'll-4', recipient: 'To myself · day one', subject: 'Remember this feeling when it gets hard', excerpt: 'You have no proof yet. That is okay. Build anyway...', unlockPolicy: 'private', privacy: 'private' },
    ],
    familyHeritage: [
      { id: 'fh-1', category: 'TRADITION', title: 'Sunday editorial reading', note: 'Family ritual of reading long-form journalism together', institutionalShare: 'family' },
      { id: 'fh-2', category: 'ENTREPRENEURIAL', title: 'Grandfather\'s small business', note: 'First exposure to building something from nothing', institutionalShare: 'private' },
      { id: 'fh-3', category: 'VALUES', title: 'Intellectual honesty', note: 'Never oversell · never underestimate the reader', institutionalShare: 'organization' },
      { id: 'fh-4', category: 'CULTURAL', title: 'Immigrant work ethic', note: 'Persistence through uncertainty · gratitude for opportunity', institutionalShare: 'family' },
      { id: 'fh-5', category: 'LIFE LESSON', title: 'Failure is data', note: 'First venture failed · second succeeded because of what was learned', institutionalShare: 'organization' },
    ],
    futureGenerations: [
      { id: 'fg-1', category: 'VALUES ORIGIN', insight: 'Stat-forward voice came from mentor who refused to dumb down content' },
      { id: 'fg-2', category: 'SACRIFICE', insight: 'First employee took half salary · angel funded runway · family patience' },
      { id: 'fg-3', category: 'INSPIRATION', insight: 'Built for readers who think · children who will inherit a smarter media landscape' },
      { id: 'fg-4', category: 'PRINCIPLE', insight: 'Honor first customers · relationships before revenue · never forget early believers' },
      { id: 'fg-5', category: 'CULTURE', insight: 'Gratitude is institutional memory · walk the garden before major decisions' },
    ],
    portfolioRemembrance: [
      { id: 'pr-1', fromCompany: 'NDXBOOK', toCompany: 'STUDIO OS', sharedInfluence: 'Motherboard memory model · editorial OS patterns' },
      { id: 'pr-2', fromCompany: 'STUDIO OS', toCompany: 'NDXBOOK', sharedInfluence: 'Architect pipeline · campus gratitude methodology' },
      { id: 'pr-3', fromCompany: 'NDXBOOK', toCompany: 'FRONTAL SLAYER', sharedInfluence: 'Relationship engine · reader advocacy concepts' },
      { id: 'pr-4', fromCompany: 'SHARED MENTOR', toCompany: 'PORTFOLIO', sharedInfluence: 'One editorial mentor influenced all three company gardens' },
    ],
    campusIntegration: [
      { id: 'ci-1', campusLocation: 'Founder Walk', connection: 'Memory bridge connects walk to garden · milestones meet gratitude' },
      { id: 'ci-2', campusLocation: 'Living Headquarters', connection: 'Morning arrival may include garden pause · CoS gratitude briefing' },
      { id: 'ci-3', campusLocation: 'Company Genome', connection: 'Values origin stories feed genetic layers' },
      { id: 'ci-4', campusLocation: 'Knowledge Library', connection: 'Preserved reflections become knowledge assets' },
      { id: 'ci-5', campusLocation: 'Legacy Hall', connection: 'Future generations enter through garden first' },
      { id: 'ci-6', campusLocation: 'Relationship Engine', connection: 'Dedications link to relationship milestones' },
    ],
    recommendedNextSteps: [
      'Walk to reflection bench · pause beneath the oak',
      'Preserve creator partnership dedication before details fade',
      'Write legacy letter to future leadership · schedule unlock',
      'Connect mentor inscription to Knowledge Asset Engine',
    ],
    futureOpportunities: [
      'Voice recordings and photos attached to dedications',
      'Seasonal garden animation synced to organizational rhythm',
      'Portfolio garden bridges between company campuses',
      'Future generation guided tour · gratitude narration mode',
    ],
  };
}

export function bootstrapRemembranceGardenPlatform(): void {
  bootstrapRemembranceGardenStore(buildRemembranceGardenSeed());
}
