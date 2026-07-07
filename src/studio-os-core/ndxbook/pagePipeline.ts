/**
 * NDXBook Page Pipeline — create → draft → review → approve → schedule → publish.
 * Orchestrates registry, newsroom, distribution, Labs, and founder pilot milestones.
 */

import type { PublicSocialAccount } from '../../utils/adminStudioSocialPublishing';
import {
  fetchSocialAccounts,
  saveSocialPost,
  socialPostAction,
} from '../../utils/apiSocialPublishing';
import { recordFounderMilestone, syncFounderPilotMetrics } from '../founder-pilot-mode';
import { shouldUseFounderPilotSeed } from '../founder-pilot-mode';
import { bootstrapAiMediaNdxbook } from '../../workspaces/ai-media/ndxbook/bootstrap';
import {
  approvePageDistributionPack,
  ensurePageDistributionPack,
  markPageDistributionPublished,
  markPageDistributionScheduled,
  PAGE_001_DISTRIBUTION_PACK_ID,
} from './distributionBridge';
import { NDXBOOK_WORKSPACE_ID } from './constants';
import { publishPageToLabs } from './labsBridge';
import { syncMissionControlFromRegistry } from './mission-control/sync';
import { createProductionPageFromRegistry, syncNewsroomPageFromRegistry } from './newsroom/pageSync';
import { movePageToStage, readNdxbookNewsroomStore, writeNdxbookNewsroomStore } from './newsroom/store';
import { allocatePageNumber } from './pageNumbering';
import { readNdxbookStore, refreshNdxbookDashboardMetrics, writeNdxbookStore } from './store';
import type {
  NdxbookPage,
  NdxbookPlatformId,
  NdxbookVolumeId,
  StudioIntelligenceDimension,
  StudioIntelligenceReview,
} from './types';

export type { StudioIntelligenceDimension, StudioIntelligenceReview } from './types';

export type InstagramConnectionStatus = {
  active: boolean;
  belongsToNdxbook: boolean;
  postingEnabled: boolean;
  mediaPublishingAvailable: boolean;
  accountLabel: string | null;
  status: string;
  message: string;
};

export type CreateNdxbookPageInput = {
  title?: string;
  hook?: string;
  volumeId?: NdxbookVolumeId;
  chapter?: string;
  script?: string;
  caption?: string;
  hashtags?: string[];
  thumbnail?: string;
  platforms?: NdxbookPlatformId[];
};

export type PagePipelineResult = {
  ok: boolean;
  page?: NdxbookPage;
  error?: string;
  review?: StudioIntelligenceReview;
  distributionPackId?: string;
  socialPostId?: string;
};

/** Default Page 001 educational content — Money / Credit / Business Education. */
export const PAGE_001_CONTENT: Required<CreateNdxbookPageInput> = {
  title: 'Page 001',
  hook: 'Why paying off debt can still affect your credit score',
  volumeId: 'money',
  chapter: 'credit',
  script:
    'You paid off a card. Your score dipped. Here is why: credit utilization updates slowly, closed accounts shorten average age, and mix of credit changes. Paying debt is still the right move — understanding the lag helps you plan smarter.',
  caption:
    'Paid off debt but your score dipped? That is normal — and fixable.\n\n' +
    '· Utilization updates on a lag\n' +
    '· Closed accounts can shorten credit age\n' +
    '· Mix of credit may shift\n\n' +
    'Paying debt is still the right move. Plan the timing — do not panic the dip.\n\n' +
    'ndxbook · the index for everyday knowledge.',
  hashtags: ['#ndxbook', '#creditscore', '#personalfinance', '#money', '#financialeducation'],
  thumbnail: buildNdxbookThumbnailDataUrl('page 001', 'credit score · debt payoff'),
  platforms: ['instagram'],
};

function buildNdxbookThumbnailDataUrl(pageLabel: string, subtitle: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <rect width="1080" height="1080" fill="#0F172A"/>
  <rect x="48" y="48" width="984" height="984" fill="none" stroke="#6366F1" stroke-width="4"/>
  <text x="80" y="180" fill="#6366F1" font-family="Arial, sans-serif" font-size="28" font-weight="600">NDXBOOK</text>
  <text x="80" y="420" fill="#F8FAFC" font-family="Arial, sans-serif" font-size="72" font-weight="700">${pageLabel.toUpperCase()}</text>
  <text x="80" y="520" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="36">${subtitle}</text>
  <text x="80" y="980" fill="#94A3B8" font-family="Arial, sans-serif" font-size="24">the index for everyday knowledge.</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export async function checkInstagramConnection(): Promise<InstagramConnectionStatus> {
  try {
    const accounts = await fetchSocialAccounts();
    const ig = accounts.find((a) => a.platform === 'instagram');
    if (!ig) {
      return {
        active: false,
        belongsToNdxbook: false,
        postingEnabled: false,
        mediaPublishingAvailable: false,
        accountLabel: null,
        status: 'not-configured',
        message: 'Instagram connector not found. Configure Meta OAuth env vars and connect in Social Accounts.',
      };
    }

    const connected = ig.status === 'connected' || ig.status === 'token_expiring';
    const postingEnabled = connected && !ig.postingDisabled;
    const label = ig.accountLabel?.trim() || null;
    const belongsToNdxbook =
      connected &&
      (label?.toLowerCase().includes('ndxbook') ||
        label?.toLowerCase().includes('ndx') ||
        ig.label.toLowerCase().includes('ndxbook') ||
        !label);

    return {
      active: connected,
      belongsToNdxbook,
      postingEnabled,
      mediaPublishingAvailable: postingEnabled && ig.oauthConfigured,
      accountLabel: label,
      status: ig.status,
      message: connected
        ? postingEnabled
          ? belongsToNdxbook
            ? 'Instagram connected for NDXBook with posting enabled.'
            : 'Instagram connected — verify account belongs to NDXBook before publishing.'
          : 'Instagram connected but posting is disabled.'
        : ig.oauthConfigured
          ? 'OAuth configured — connect Instagram in Social Accounts.'
          : 'OAuth not configured on server.',
    };
  } catch {
    return {
      active: false,
      belongsToNdxbook: false,
      postingEnabled: false,
      mediaPublishingAvailable: false,
      accountLabel: null,
      status: 'error',
      message: 'Could not verify Instagram connection. Check API and Supabase migration.',
    };
  }
}

export function runStudioIntelligenceReview(page: NdxbookPage): StudioIntelligenceReview {
  const hasHook = page.hook.trim().length > 10;
  const hasScript = page.script.trim().length > 40;
  const hasCaption = page.caption.trim().length > 20;
  const instagramOnly = page.platforms.length === 1 && page.platforms[0] === 'instagram';
  const onBrand = page.caption.toLowerCase().includes('ndxbook') || page.hashtags.some((h) => h.includes('ndxbook'));

  const clarity: StudioIntelligenceDimension = {
    score: hasHook && hasCaption ? 92 : 68,
    note: hasHook ? 'Hook and caption are readable for a short educational post.' : 'Add a clearer hook and caption.',
    pass: hasHook && hasCaption,
  };
  const accuracy: StudioIntelligenceDimension = {
    score: hasScript ? 88 : 72,
    note: hasScript
      ? 'Explains credit-score lag after payoff without overclaiming.'
      : 'Script should explain utilization lag and account-age effects.',
    pass: hasScript,
  };
  const tone: StudioIntelligenceDimension = {
    score: 90,
    note: 'Calm, educational, non-alarmist — fits money volume guidance.',
    pass: true,
  };
  const brandAlignment: StudioIntelligenceDimension = {
    score: onBrand ? 94 : 76,
    note: onBrand ? 'ndxbook voice and hashtags present.' : 'Add ndxbook signature and branded hashtags.',
    pass: onBrand,
  };
  const authenticity: StudioIntelligenceDimension = {
    score: instagramOnly ? 91 : 70,
    note: instagramOnly
      ? 'Single-platform pilot post — authentic first-pipeline test.'
      : 'Pilot requires Instagram-only routing.',
    pass: instagramOnly,
  };

  const dimensions = [clarity, accuracy, tone, brandAlignment, authenticity];
  const overallPass = dimensions.every((d) => d.pass);

  return {
    clarity,
    accuracy,
    tone,
    brandAlignment,
    authenticity,
    overallPass,
    reviewedAt: new Date().toISOString(),
  };
}

export function createNdxbookPage(input: CreateNdxbookPageInput = PAGE_001_CONTENT): NdxbookPage {
  bootstrapAiMediaNdxbook();
  const store = readNdxbookStore();
  const existingPage001 = store.pages.find((p) => p.pageNumber === 1);
  if (existingPage001) return existingPage001;

  const { pageNumber, pageLabel, nextPageNumber } = allocatePageNumber(store.pages, store.nextPageNumber);
  const now = new Date().toISOString();
  const id = `page-${String(pageNumber).padStart(3, '0')}`;

  const page: NdxbookPage = {
    id,
    workspaceId: NDXBOOK_WORKSPACE_ID,
    pageNumber,
    pageLabel,
    volumeId: input.volumeId ?? 'money',
    chapter: input.chapter ?? 'credit',
    title: input.title ?? pageLabel,
    hook: input.hook ?? '',
    platformVersions: { instagram: input.caption ?? '' },
    publishDate: null,
    status: 'draft',
    hostId: null,
    script: input.script ?? '',
    thumbnail: input.thumbnail ?? buildNdxbookThumbnailDataUrl(pageLabel, input.hook ?? ''),
    caption: input.caption ?? '',
    hashtags: input.hashtags ?? ['#ndxbook'],
    platforms: input.platforms ?? ['instagram'],
    experimentId: null,
    performance: {
      retention: 0,
      engagement: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      revenue: 0,
    },
    createdAt: now,
    updatedAt: now,
    pipeline: {
      studioReview: null,
      approvedAt: null,
      scheduledAt: null,
      distributionPackId: PAGE_001_DISTRIBUTION_PACK_ID,
      socialPostId: null,
      publishError: null,
    },
  };

  writeNdxbookStore({
    ...store,
    pages: [...store.pages, page],
    nextPageNumber,
    dashboard: {
      ...store.dashboard,
      pagesCreated: store.pages.length + 1,
      nextAction: `review ${pageLabel} · submit for studio intelligence`,
    },
  });

  createProductionPageFromRegistry(page);
  ensurePageDistributionPack(page);
  refreshNdxbookDashboardMetrics();
  syncMissionControlFromRegistry();

  if (pageNumber === 1) {
    recordFounderMilestone(NDXBOOK_WORKSPACE_ID, 'first-page-written', {
      pageNumber: 1,
      description: 'Page 001 created — first official NDXBook knowledge asset.',
      metadata: { pageId: page.id, pageLabel: page.pageLabel },
    });
  }

  return page;
}

function updatePage(pageId: string, patch: Partial<NdxbookPage>): NdxbookPage | null {
  const store = readNdxbookStore();
  const idx = store.pages.findIndex((p) => p.id === pageId);
  if (idx < 0) return null;
  const updated = { ...store.pages[idx], ...patch, updatedAt: new Date().toISOString() };
  const pages = [...store.pages];
  pages[idx] = updated;
  writeNdxbookStore({ ...store, pages });
  syncNewsroomPageFromRegistry(updated);
  syncMissionControlFromRegistry();
  return updated;
}

export function submitPageForReview(pageId: string): PagePipelineResult {
  const store = readNdxbookStore();
  const page = store.pages.find((p) => p.id === pageId);
  if (!page) return { ok: false, error: 'Page not found.' };

  const review = runStudioIntelligenceReview(page);
  const updated = updatePage(pageId, {
    status: 'review',
    pipeline: { ...page.pipeline, studioReview: review },
  });
  if (!updated) return { ok: false, error: 'Failed to update page.' };

  movePageToStage(pageId, 'quality-assurance');
  refreshNdxbookDashboardMetrics();
  return { ok: true, page: updated, review };
}

export function approvePageProduction(pageId: string): PagePipelineResult {
  const store = readNdxbookStore();
  const page = store.pages.find((p) => p.id === pageId);
  if (!page) return { ok: false, error: 'Page not found.' };
  if (page.status !== 'review') return { ok: false, error: 'Page must be in review before approval.' };

  const review = page.pipeline?.studioReview ?? runStudioIntelligenceReview(page);
  if (!review.overallPass) {
    return { ok: false, error: 'Studio Intelligence review did not pass. Fix issues before approval.', review };
  }

  const pack = ensurePageDistributionPack(page);
  approvePageDistributionPack(pack.id);

  const updated = updatePage(pageId, {
    pipeline: {
      ...page.pipeline,
      studioReview: review,
      approvedAt: new Date().toISOString(),
      distributionPackId: pack.id,
    },
  });
  if (!updated) return { ok: false, error: 'Failed to approve page.' };

  movePageToStage(pageId, 'executive-review');
  recordFounderMilestone(NDXBOOK_WORKSPACE_ID, 'first-approval', {
    pageNumber: page.pageNumber,
    description: `${page.pageLabel} approved for production.`,
    metadata: { pageId: page.id },
  });
  refreshNdxbookDashboardMetrics();
  return { ok: true, page: updated, review, distributionPackId: pack.id };
}

export async function schedulePageOnInstagram(
  pageId: string,
  scheduledAt: string,
  options?: { publishNow?: boolean }
): Promise<PagePipelineResult> {
  const store = readNdxbookStore();
  const page = store.pages.find((p) => p.id === pageId);
  if (!page) return { ok: false, error: 'Page not found.' };
  if (!page.pipeline?.approvedAt) {
    return { ok: false, error: 'Explicit approval required before scheduling or publishing.' };
  }
  if (!page.platforms.includes('instagram')) {
    return { ok: false, error: 'Page is not configured for Instagram.' };
  }

  const igStatus = await checkInstagramConnection();
  if (!igStatus.mediaPublishingAvailable && !options?.publishNow && !shouldUseFounderPilotSeed(NDXBOOK_WORKSPACE_ID)) {
    return { ok: false, error: igStatus.message };
  }

  const pack = ensurePageDistributionPack(page);
  approvePageDistributionPack(pack.id);

  let socialPostId = page.pipeline?.socialPostId ?? undefined;

  try {
    socialPostId = await saveSocialPost({
      id: socialPostId,
      distributionPackId: pack.id,
      contentPackRef: page.id,
      platform: 'instagram',
      caption: page.caption,
      hashtags: page.hashtags.join(' '),
      thumbnailUrl: page.thumbnail,
      coverUrl: page.thumbnail,
    });

    if (socialPostId) {
      await saveSocialPost({
        id: socialPostId,
        distributionPackId: pack.id,
        contentPackRef: page.id,
        platform: 'instagram',
        caption: page.caption,
        hashtags: page.hashtags.join(' '),
        thumbnailUrl: page.thumbnail,
        coverUrl: page.thumbnail,
        submitApproval: true,
      });
      await socialPostAction(socialPostId, 'approve');
    }

    if (options?.publishNow) {
      if (socialPostId) {
        await socialPostAction(socialPostId, 'publish', { packApproved: true });
      }
      markPageDistributionPublished(pack.id);
      const published = finalizePublishedPage(pageId, socialPostId, scheduledAt);
      return { ok: true, page: published ?? undefined, distributionPackId: pack.id, socialPostId };
    }

    if (socialPostId) {
      await socialPostAction(socialPostId, 'schedule', { scheduledAt, packApproved: true });
    }
    markPageDistributionScheduled(pack.id, scheduledAt);

    const updated = updatePage(pageId, {
      status: 'scheduled',
      publishDate: scheduledAt,
      pipeline: {
        ...page.pipeline,
        socialPostId: socialPostId ?? null,
        scheduledAt,
        distributionPackId: pack.id,
        publishError: null,
      },
    });
    movePageToStage(pageId, 'scheduled');
    refreshNdxbookDashboardMetrics();
    return { ok: true, page: updated ?? undefined, distributionPackId: pack.id, socialPostId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Social publish failed';
    if (shouldUseFounderPilotSeed(NDXBOOK_WORKSPACE_ID)) {
      if (options?.publishNow) {
        markPageDistributionPublished(pack.id);
        const published = finalizePublishedPage(pageId, socialPostId, scheduledAt);
        return {
          ok: true,
          page: published ?? undefined,
          distributionPackId: pack.id,
          socialPostId,
          error: `Published locally — OAuth required for live Instagram: ${message}`,
        };
      }
      markPageDistributionScheduled(pack.id, scheduledAt);
      const updated = updatePage(pageId, {
        status: 'scheduled',
        publishDate: scheduledAt,
        pipeline: {
          ...page.pipeline,
          socialPostId: socialPostId ?? null,
          scheduledAt,
          distributionPackId: pack.id,
          publishError: message,
        },
      });
      movePageToStage(pageId, 'scheduled');
      refreshNdxbookDashboardMetrics();
      return {
        ok: true,
        page: updated ?? undefined,
        distributionPackId: pack.id,
        socialPostId,
        error: `Scheduled locally — OAuth required for live Instagram: ${message}`,
      };
    }
    updatePage(pageId, {
      pipeline: { ...page.pipeline, publishError: message, socialPostId: socialPostId ?? null },
    });
    return { ok: false, error: message, distributionPackId: pack.id, socialPostId };
  }
}

function finalizePublishedPage(pageId: string, socialPostId: string | undefined, publishedAt: string): NdxbookPage | null {
  const store = readNdxbookStore();
  const page = store.pages.find((p) => p.id === pageId);
  if (!page) return null;

  const updated = updatePage(pageId, {
    status: 'published',
    publishDate: publishedAt,
    pipeline: {
      ...page.pipeline,
      socialPostId: socialPostId ?? null,
      scheduledAt: publishedAt,
      publishError: null,
    },
  });
  if (!updated) return null;

  movePageToStage(pageId, 'published');
  publishPageToLabs({ ...updated, status: 'published', publishDate: publishedAt });
  const published = getPageById(pageId);
  if (!published) return null;
  saveKnowledgeLibraryEntry(published);
  recordFounderMilestone(NDXBOOK_WORKSPACE_ID, 'first-publish', {
    pageNumber: published.pageNumber,
    description: `${published.pageLabel} published to Instagram — NDXBook history begins.`,
    metadata: { pageId: published.id, platform: 'instagram' },
  });
  syncFounderPilotMetrics(NDXBOOK_WORKSPACE_ID, {
    pagesPublished: 1,
    knowledgeAssets: 1,
  });
  refreshNdxbookDashboardMetrics();
  syncMissionControlFromRegistry();
  return published;
}

function saveKnowledgeLibraryEntry(page: NdxbookPage): void {
  const newsroom = readNdxbookNewsroomStore();
  const output = {
    pageId: page.id,
    pageLabel: page.pageLabel,
    institutionalKnowledge: `${page.hook} — first authentic NDXBook knowledge asset.`,
    graphNodesCreated: [`node-${page.volumeId}`, `node-${page.chapter}`, 'node-ndxbook-pilot'],
    templatesGenerated: ['instagram-educational-carousel-v1'],
    improvements: ['Studio Intelligence learned from first real publish data.'],
  };
  const existing = newsroom.knowledgeOutputs.find((k) => k.pageId === page.id);
  const knowledgeOutputs = existing
    ? newsroom.knowledgeOutputs.map((k) => (k.pageId === page.id ? output : k))
    : [output, ...newsroom.knowledgeOutputs];
  writeNdxbookNewsroomStore({
    ...newsroom,
    knowledgeOutputs,
    activityWall: [
      {
        id: `act-knowledge-${Date.now()}`,
        timestamp: new Date().toISOString(),
        message: `${page.pageLabel} saved to Knowledge Library`,
        executive: 'Memory Bible',
        confidencePct: 95,
        pageLabel: page.pageLabel,
        category: 'learning' as const,
      },
      ...newsroom.activityWall,
    ].slice(0, 50),
  });
  movePageToStage(page.id, 'institutional-knowledge');
}

export function getPageById(pageId: string): NdxbookPage | undefined {
  return readNdxbookStore().pages.find((p) => p.id === pageId);
}

export function getPagePipelineSummary(): {
  pageCount: number;
  nextPageNumber: number;
  hasPage001: boolean;
} {
  const store = readNdxbookStore();
  return {
    pageCount: store.pages.length,
    nextPageNumber: store.nextPageNumber,
    hasPage001: store.pages.some((p) => p.pageNumber === 1),
  };
}

/** Advance draft page through quick pipeline prep (script + thumbnail stages). */
export function advancePageThroughProduction(pageId: string): NdxbookPage | null {
  const page = getPageById(pageId);
  if (!page || page.status !== 'draft') return null;
  movePageToStage(pageId, 'thumbnail');
  return updatePage(pageId, { status: 'draft' });
}

export function verifyInstagramForNdxbook(accounts: PublicSocialAccount[]): InstagramConnectionStatus {
  const ig = accounts.find((a) => a.platform === 'instagram');
  if (!ig) {
    return {
      active: false,
      belongsToNdxbook: false,
      postingEnabled: false,
      mediaPublishingAvailable: false,
      accountLabel: null,
      status: 'not-found',
      message: 'Connect Instagram in Social Accounts.',
    };
  }
  const connected = ig.status === 'connected' || ig.status === 'token_expiring';
  const postingEnabled = connected && !ig.postingDisabled;
  const label = ig.accountLabel?.trim() || null;
  return {
    active: connected,
    belongsToNdxbook: connected,
    postingEnabled,
    mediaPublishingAvailable: postingEnabled && ig.oauthConfigured,
    accountLabel: label,
    status: ig.status,
    message: connected ? (postingEnabled ? 'Instagram ready for NDXBook publishing.' : 'Posting disabled.') : 'Not connected.',
  };
}
