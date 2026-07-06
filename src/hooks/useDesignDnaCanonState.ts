import { useCallback, useState } from 'react';
import { buildDesignDnaCanonSeed } from '../studio-os-core/design-dna-canon/bootstrap';
import {
  bootstrapDesignDnaCanonStore,
  readDesignDnaCanonStore,
  selectCanonPage,
  selectDesignReview,
  setDesignDnaNav,
  updateReviewStatus,
  getSelectedCanonPage,
  getSelectedReview,
} from '../studio-os-core/design-dna-canon/store';
import type { CanonPageId, DesignDnaNavId } from '../studio-os-core/design-dna-canon/types';

function ensureBootstrap(): void {
  bootstrapDesignDnaCanonStore(buildDesignDnaCanonSeed());
}

export function useDesignDnaCanonState() {
  const [, setTick] = useState(0);
  useState(() => {
    ensureBootstrap();
    return 0;
  });

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const store = readDesignDnaCanonStore();
  const selectedPage = getSelectedCanonPage(store);
  const selectedReview = getSelectedReview(store);

  const selectPage = useCallback(
    (id: CanonPageId) => {
      selectCanonPage(id);
      refresh();
    },
    [refresh]
  );

  const selectReview = useCallback(
    (id: string) => {
      selectDesignReview(id);
      refresh();
    },
    [refresh]
  );

  const setNav = useCallback(
    (navId: DesignDnaNavId) => {
      setDesignDnaNav(navId);
      refresh();
    },
    [refresh]
  );

  const markReviewPassed = useCallback(() => {
    if (!selectedReview) return;
    updateReviewStatus(selectedReview.id, 'passed');
    refresh();
  }, [selectedReview, refresh]);

  const markReviewRefinement = useCallback(() => {
    if (!selectedReview) return;
    updateReviewStatus(selectedReview.id, 'needs-refinement');
    refresh();
  }, [selectedReview, refresh]);

  return {
    store,
    selectedPage,
    selectedReview,
    selectPage,
    selectReview,
    setNav,
    markReviewPassed,
    markReviewRefinement,
    refresh,
  };
}
