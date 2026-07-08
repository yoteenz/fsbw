import { useCallback, useEffect, useState } from 'react';
import {
  buildConstitutionKeeperReviewLines,
  buildConstitutionKeeperWelcomeLines,
  constitutionKeeperExplainsEvolution,
  listConstitutionLaws,
  listConstitutionReviews,
  recordConstitutionReview,
  runConstitutionReview,
  STUDIO_WORLD_CONSTITUTION_EVENT,
  type ConstitutionFeatureProposal,
  type ConstitutionKeeperLine,
  type ConstitutionLaw,
  type ConstitutionReviewRecord,
  type ConstitutionReviewResult,
} from '../studio-os-core/studio-world-constitution';

export function useStudioWorldConstitution() {
  const [reviews, setReviews] = useState<ConstitutionReviewRecord[]>(() => listConstitutionReviews());
  const [lastResult, setLastResult] = useState<ConstitutionReviewResult | null>(reviews[0] ?? null);
  const [reviewing, setReviewing] = useState(false);
  const [keeperLines, setKeeperLines] = useState<ConstitutionKeeperLine[]>(() => [
    ...buildConstitutionKeeperWelcomeLines(),
    constitutionKeeperExplainsEvolution(reviews.length),
  ]);

  const laws: ConstitutionLaw[] = listConstitutionLaws();

  const refresh = useCallback(() => {
    const list = listConstitutionReviews();
    setReviews(list);
    setKeeperLines(() => {
      if (lastResult) return buildConstitutionKeeperReviewLines(lastResult);
      return [...buildConstitutionKeeperWelcomeLines(), constitutionKeeperExplainsEvolution(list.length)];
    });
    return list;
  }, [lastResult]);

  const reviewProposal = useCallback(async (proposal: ConstitutionFeatureProposal) => {
    setReviewing(true);
    try {
      const result = runConstitutionReview(proposal);
      recordConstitutionReview(result);
      setLastResult(result);
      setKeeperLines(buildConstitutionKeeperReviewLines(result));
      setReviews(listConstitutionReviews());
      return result;
    } finally {
      setReviewing(false);
    }
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_WORLD_CONSTITUTION_EVENT, onUpdate);
    return () => window.removeEventListener(STUDIO_WORLD_CONSTITUTION_EVENT, onUpdate);
  }, [refresh]);

  return {
    laws,
    reviews,
    lastResult,
    reviewing,
    keeperLines,
    reviewProposal,
    refresh,
  };
}
