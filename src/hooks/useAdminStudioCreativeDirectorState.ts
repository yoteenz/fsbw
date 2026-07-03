import { useCallback, useMemo, useState } from 'react';
import {
  ADMIN_STUDIO_CREATIVE_DIRECTOR_DEFAULTS,
  CREATIVE_DISTRIBUTION_CHANNELS,
  CREATIVE_OUTPUT_DEFINITIONS,
  type CreativeDirectorTabId,
  type CreativeOutputId,
  type DistributionChannelId,
  type OutputTier,
} from '../utils/adminStudioCreativeDirectorDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import {
  applyEditorReviewAction,
  buildCreativeDirectorPackage,
  recommendShowForTopic,
  syncSessionFromRecommendation,
  type CreativeDirectorSession,
  type EditorReviewAction,
} from '../services/studio/creativeDirector/index';

function defaultOutputs(): Record<CreativeOutputId, OutputTier> {
  return CREATIVE_OUTPUT_DEFINITIONS.reduce(
    (acc, def) => {
      acc[def.id] = def.defaultTier;
      return acc;
    },
    {} as Record<CreativeOutputId, OutputTier>
  );
}

function defaultDistribution(): Record<DistributionChannelId, boolean> {
  return CREATIVE_DISTRIBUTION_CHANNELS.reduce(
    (acc, ch) => {
      acc[ch.id] = ch.defaultEnabled;
      return acc;
    },
    {} as Record<DistributionChannelId, boolean>
  );
}

function loadSession(): CreativeDirectorSession {
  const saved = readStudioJson<Partial<CreativeDirectorSession>>(ADMIN_STUDIO_STORAGE_KEYS.creativeDirector);
  const defaults = ADMIN_STUDIO_CREATIVE_DIRECTOR_DEFAULTS;
  return {
    topic: saved?.topic ?? defaults.topic,
    selectedShowId: saved?.selectedShowId ?? defaults.selectedShowId,
    campaignGoal: saved?.campaignGoal ?? defaults.campaignGoal,
    targetAudience: saved?.targetAudience ?? defaults.targetAudience,
    membershipTier: saved?.membershipTier ?? defaults.membershipTier,
    primaryCtaId: saved?.primaryCtaId ?? defaults.primaryCtaId,
    contentPurpose: saved?.contentPurpose ?? defaults.contentPurpose,
    featuredProductIds: saved?.featuredProductIds ?? [...defaults.featuredProductIds],
    rewardId: saved?.rewardId ?? defaults.rewardId,
    environment: saved?.environment ?? defaults.environment,
    promptFrameworkId: saved?.promptFrameworkId ?? defaults.promptFrameworkId,
    visualLanguage: saved?.visualLanguage ?? defaults.visualLanguage,
    publishingStatus: saved?.publishingStatus ?? defaults.publishingStatus,
    approvalStatus: saved?.approvalStatus ?? defaults.approvalStatus,
    timelineStep: saved?.timelineStep ?? defaults.timelineStep,
    showRecommendationOverride: saved?.showRecommendationOverride ?? defaults.showRecommendationOverride,
    manualShowId: saved?.manualShowId ?? defaults.manualShowId,
    outputs: { ...defaultOutputs(), ...(saved?.outputs ?? {}) },
    distribution: { ...defaultDistribution(), ...(saved?.distribution ?? {}) },
  };
}

function persistSession(session: CreativeDirectorSession): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.creativeDirector, session);
}

export function useAdminStudioCreativeDirector() {
  const [session, setSession] = useState<CreativeDirectorSession>(loadSession);
  const [activeTab, setActiveTab] = useState<CreativeDirectorTabId>('overview');
  const [masterPromptExpanded, setMasterPromptExpanded] = useState(false);

  const pkg = useMemo(() => buildCreativeDirectorPackage(session), [session]);

  const updateSession = useCallback((patch: Partial<CreativeDirectorSession>) => {
    setSession((prev) => {
      const next = { ...prev, ...patch };
      persistSession(next);
      return next;
    });
  }, []);

  const setTopic = useCallback(
    (topic: string) => {
      setSession((prev) => {
        const rec = recommendShowForTopic(topic);
        const next = syncSessionFromRecommendation(
          {
            ...prev,
            topic,
            selectedShowId: prev.showRecommendationOverride ? prev.selectedShowId : rec.showId,
          },
          !prev.showRecommendationOverride
        );
        persistSession(next);
        return next;
      });
    },
    []
  );

  const applyShowRecommendation = useCallback(() => {
    const rec = pkg.recommendation.show;
    updateSession({ selectedShowId: rec.showId, showRecommendationOverride: false, manualShowId: '' });
  }, [pkg.recommendation.show, updateSession]);

  const overrideShow = useCallback(
    (showId: string) => {
      updateSession({
        selectedShowId: showId,
        manualShowId: showId,
        showRecommendationOverride: true,
      });
    },
    [updateSession]
  );

  const toggleDistribution = useCallback(
    (channelId: DistributionChannelId) => {
      setSession((prev) => {
        const next = {
          ...prev,
          distribution: { ...prev.distribution, [channelId]: !prev.distribution[channelId] },
        };
        persistSession(next);
        return next;
      });
    },
    []
  );

  const setOutputTier = useCallback((outputId: CreativeOutputId, tier: OutputTier) => {
    setSession((prev) => {
      const next = { ...prev, outputs: { ...prev.outputs, [outputId]: tier } };
      persistSession(next);
      return next;
    });
  }, []);

  const runEditorAction = useCallback((action: EditorReviewAction) => {
    setSession((prev) => {
      const next = applyEditorReviewAction(prev, action);
      persistSession(next);
      return next;
    });
  }, []);

  const applyBriefingSuggestions = useCallback(() => {
    updateSession({
      topic: ADMIN_STUDIO_CREATIVE_DIRECTOR_DEFAULTS.topic,
      selectedShowId: ADMIN_STUDIO_CREATIVE_DIRECTOR_DEFAULTS.selectedShowId,
      primaryCtaId: ADMIN_STUDIO_CREATIVE_DIRECTOR_DEFAULTS.primaryCtaId,
      featuredProductIds: [...ADMIN_STUDIO_CREATIVE_DIRECTOR_DEFAULTS.featuredProductIds],
    });
  }, [updateSession]);

  return {
    session,
    pkg,
    activeTab,
    setActiveTab,
    updateSession,
    setTopic,
    applyShowRecommendation,
    overrideShow,
    toggleDistribution,
    setOutputTier,
    runEditorAction,
    applyBriefingSuggestions,
    masterPromptExpanded,
    setMasterPromptExpanded,
  };
}
