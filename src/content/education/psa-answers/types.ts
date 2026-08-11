/** Reuse editorial image primitives from Slay Tips where shapes align. */
export type {
  SlayTipEditorialImage as PsaAnswerEditorialImage,
  SlayTipImageAnnotation as PsaAnswerImageAnnotation,
  SlayTipDeeperContent as PsaAnswerDeeperContent,
} from '../types';

export type PsaAnswerCause = {
  number: string;
  label: string;
  body: string;
};

export type PsaAnswerLookHereItem = {
  label: string;
  caption: string;
  imageId?: string;
  image?: import('../types').SlayTipEditorialImage;
};

export type PsaAnswerFirstStep = {
  number: string;
  label: string;
  body: string;
};

export type PsaAnswerArticleModule =
  | { type: 'psaSays'; body: string }
  | { type: 'likelyCauses'; causes: PsaAnswerCause[] }
  | { type: 'lookHere'; items: PsaAnswerLookHereItem[] }
  | { type: 'psaNote'; number?: string; body: string }
  | { type: 'tryThisFirst'; steps: PsaAnswerFirstStep[] }
  | { type: 'escalation'; body: string }
  | { type: 'text'; heading?: string; body: string };

export type PsaAnswerEditorialContent = {
  /** Matches {@link PsaAnswerPresentationEntry.id}. */
  id: string;
  deck?: string;
  readTime?: string;
  directAnswer?: string;
  heroMedia?: import('../types').SlayTipEditorialImage[];
  modules?: PsaAnswerArticleModule[];
  relatedAnswerId?: string;
  deeperContent?: import('../types').SlayTipDeeperContent;
};
