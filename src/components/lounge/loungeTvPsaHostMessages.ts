import type { LoungeContentPack } from './loungeTvContentPack';
import type { LoungeTvPsaHostContext } from './loungeTvStreamingTypes';
import { computeSeriesProgress } from '../../utils/loungeTvSeriesProgress';
import { getWatchProgressMap } from '../../utils/loungeTvLibrary';
import { streamSeriesForPack } from './loungeTvStreamSeries';

const MESSAGE_POOL: Record<LoungeTvPsaHostContext, string[]> = {
  'featured-open': [
    'WELCOME BACK. I AM PSA — YOUR HOST ON FRONTAL SLAYER TV.',
    'GLAD YOU ARE HERE. LET US SLAY TODAY.',
  ],
  'returning-viewer': [
    'WELCOME BACK. I PICKED A FEW NEW LESSONS FOR YOU.',
    'GOOD TO SEE YOU AGAIN — YOUR ROWS ARE UPDATED.',
  ],
  'course-almost-done': [
    'YOU ARE ALMOST FINISHED WITH THIS COURSE — ONE MORE EPISODE TO GO.',
    'YOU ARE SO CLOSE — LET US COMPLETE THIS SERIES TOGETHER.',
  ],
  'next-class': ['READY FOR YOUR NEXT CLASS?', 'YOUR NEXT EPISODE IS QUEUED WHEN YOU ARE.'],
  'member-exclusive-waiting': [
    'THERE IS A NEW MEMBER-EXCLUSIVE LESSON WAITING FOR YOU.',
    'MEMBERS ONLY — I SAVED SOMETHING SPECIAL FOR YOU.',
  ],
};

function pickContextualMessage(context: LoungeTvPsaHostContext, seed: string): string {
  const pool = MESSAGE_POOL[context];
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h + seed.charCodeAt(i)) % pool.length;
  return pool[h] ?? pool[0];
}

export function resolvePsaHostContext(hero?: LoungeContentPack | null): LoungeTvPsaHostContext {
  const progressKeys = Object.keys(getWatchProgressMap());
  if (progressKeys.length === 0) return 'featured-open';
  const series = hero ? streamSeriesForPack(hero) : undefined;
  if (series) {
    const prog = computeSeriesProgress(series.id);
    if (prog.percent >= 70 && prog.percent < 100) return 'course-almost-done';
    if (prog.percent > 0 && prog.percent < 100) return 'next-class';
  }
  if (hero?.isPremium || hero?.membershipRequired) return 'member-exclusive-waiting';
  return 'returning-viewer';
}

export function resolvePsaHostMessage(
  context: LoungeTvPsaHostContext,
  hero: LoungeContentPack,
  featuredLine?: string
): string {
  if (context === 'featured-open' && featuredLine) {
    return featuredLine;
  }
  const base = pickContextualMessage(context, `${context}-${hero.id}-${new Date().getDate()}`);
  if (context === 'featured-open') {
    const topic = hero.subtitle ?? hero.title;
    return `${base} TODAY'S FEATURED PREMIERE: ${topic}`;
  }
  return base;
}
