import type { PsaAnswerEditorialContent } from './types';
import {
  PSA_ANSWER_EDITORIAL_LACE_LIFT,
  PSA_ANSWER_LACE_LIFT_MEDIA,
} from './psa-answer-lace-lift-editorial';
import type { PsaAnswerPresentationEntry } from '../../../components/lounge/education/psaAnswersPresentation';
import { getContentPackById } from '../../../components/lounge/loungeTvContentPack';

const EDITORIAL_BY_ID: Record<string, PsaAnswerEditorialContent> = import.meta.env.DEV
  ? { [PSA_ANSWER_EDITORIAL_LACE_LIFT.id]: PSA_ANSWER_EDITORIAL_LACE_LIFT }
  : { [PSA_ANSWER_EDITORIAL_LACE_LIFT.id]: PSA_ANSWER_EDITORIAL_LACE_LIFT };

export function getPsaAnswerEditorialById(id: string): PsaAnswerEditorialContent | undefined {
  return EDITORIAL_BY_ID[id];
}

export function resolvePsaAnswerEditorial(
  entry: PsaAnswerPresentationEntry,
): PsaAnswerEditorialContent {
  const authored = getPsaAnswerEditorialById(entry.id);
  const pack = getContentPackById(entry.packId);

  if (authored) {
    const heroMedia = [
      ...(authored.heroMedia ?? []),
      ...(entry.id === 'psa-answer-lace-lift' ? PSA_ANSWER_LACE_LIFT_MEDIA : []),
    ];
    return { ...authored, heroMedia };
  }

  const modules: PsaAnswerEditorialContent['modules'] = [];
  const intro = pack?.article?.intro;
  if (intro) modules.push({ type: 'psaSays', body: intro });

  return {
    id: entry.id,
    deck: entry.focusTeaser,
    readTime: pack?.readTime?.replace(/\s*READ/i, '') ?? pack?.runtime,
    directAnswer: intro,
    heroMedia: pack?.heroImage
      ? [{ id: `${entry.id}-hero`, src: pack.heroImage, alt: entry.displayQuestion, role: 'hero' }]
      : undefined,
    modules,
  };
}
