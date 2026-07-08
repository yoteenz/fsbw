/**
 * Studio World™ Experience Intelligence — Creative Director canon.
 */

export const CREATIVE_DIRECTOR_QUESTIONS = [
  'Would someone smile when entering?',
  'Would they stop and explore?',
  'Would they remember this room tomorrow?',
  'Does it feel premium?',
  'Does it reward curiosity?',
  'Is there enough environmental storytelling?',
  'Does this feel handcrafted?',
  'Does it surprise the founder?',
  'Does it feel alive?',
  'Would this impress someone who has never seen Studio World?',
  'Would Apple ship this?',
  'Would Disney Imagineering obsess over this?',
  'Would Epic Games be proud of this environment?',
] as const;

export const FORBIDDEN_FLAT_EXPERIENCE_PATTERNS = [
  'flat',
  'empty',
  'repetitive',
  'generic',
  'template-like',
  'static',
  'too much ui',
  'too much text',
  'too many panels',
  'too many forms',
  'no discovery',
  'no movement',
  'no atmosphere',
  'no focal landmark',
  'no emotional payoff',
  'scrollable admin stage',
  'dashboard hybrid',
  'kpi metric grid',
] as const;

export const DISCOVERY_OPPORTUNITY_TEMPLATES = [
  { type: 'hidden-room' as const, suggestion: 'Conceal a secondary chamber behind an environmental hotspot — reward curiosity without signage.' },
  { type: 'collectible' as const, suggestion: 'Place a founder collectible on a shelf only visible from the arrival angle.' },
  { type: 'founder-memory' as const, suggestion: 'Embed a living memory inscription that appears after the founder lingers 3 seconds.' },
  { type: 'artifact' as const, suggestion: 'Add a behind-the-scenes production artifact in a vitrine with diegetic lighting.' },
  { type: 'interactive-object' as const, suggestion: 'Install one tactile prop that responds to hover — micro delight without UI chrome.' },
  { type: 'milestone' as const, suggestion: 'Mark an organizational milestone as environmental graffiti, not a card.' },
  { type: 'seasonal' as const, suggestion: 'Layer seasonal atmosphere that shifts with Living Headquarters™ preferences.' },
  { type: 'concierge-npc' as const, suggestion: 'Position a living concierge at the threshold — voice, not modal.' },
  { type: 'dynamic-weather' as const, suggestion: 'Introduce subtle weather/atmosphere variation on repeat visits.' },
  { type: 'time-of-day' as const, suggestion: 'Shift lighting language by time-of-day for replayability.' },
  { type: 'music-shift' as const, suggestion: 'Cross-fade ambient score when crossing wing boundaries.' },
  { type: 'environmental-surprise' as const, suggestion: 'Hide a small motion beat — light flicker, distant door, orb pulse.' },
] as const;
