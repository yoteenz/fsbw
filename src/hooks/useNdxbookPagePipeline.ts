import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminStudioSocialAccounts } from './useAdminStudioSocialAccounts';
import { bootstrapAiMediaNdxbook } from '../workspaces/ai-media/ndxbook/bootstrap';
import {
  approvePageProduction,
  checkInstagramConnection,
  createNdxbookPage,
  getPageById,
  getPagePipelineSummary,
  PAGE_001_CONTENT,
  schedulePageOnInstagram,
  submitPageForReview,
  verifyInstagramForNdxbook,
  type InstagramConnectionStatus,
  type PagePipelineResult,
} from '../studio-os-core/ndxbook/pagePipeline';
import { readNdxbookStore, refreshNdxbookDashboardMetrics } from '../studio-os-core/ndxbook/store';
import type { NdxbookPage } from '../studio-os-core/ndxbook/types';

export function useNdxbookPagePipeline() {
  const [version, setVersion] = useState(0);
  const { accounts, loading: accountsLoading, refresh: refreshAccounts } = useAdminStudioSocialAccounts();

  const bump = useCallback(() => {
    refreshNdxbookDashboardMetrics();
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    bootstrapAiMediaNdxbook();
  }, []);

  const summary = useMemo(() => {
    void version;
    return getPagePipelineSummary();
  }, [version]);

  const pages = useMemo(() => {
    void version;
    return readNdxbookStore().pages;
  }, [version]);

  const page001 = useMemo(() => pages.find((p) => p.pageNumber === 1) ?? null, [pages]);

  const instagramStatus: InstagramConnectionStatus = useMemo(() => {
    if (accountsLoading) {
      return {
        active: false,
        belongsToNdxbook: false,
        postingEnabled: false,
        mediaPublishingAvailable: false,
        accountLabel: null,
        status: 'loading',
        message: 'Checking Instagram connection…',
      };
    }
    if (accounts.length > 0) return verifyInstagramForNdxbook(accounts);
    return {
      active: false,
      belongsToNdxbook: false,
      postingEnabled: false,
      mediaPublishingAvailable: false,
      accountLabel: null,
      status: 'unknown',
      message: 'Open Social Accounts to verify Instagram for NDXBook.',
    };
  }, [accounts, accountsLoading]);

  const createPage001 = useCallback((): NdxbookPage => {
    const page = createNdxbookPage(PAGE_001_CONTENT);
    bump();
    return page;
  }, [bump]);

  const submitReview = useCallback(
    (pageId: string): PagePipelineResult => {
      const result = submitPageForReview(pageId);
      bump();
      return result;
    },
    [bump]
  );

  const approveProduction = useCallback(
    (pageId: string): PagePipelineResult => {
      const result = approvePageProduction(pageId);
      bump();
      return result;
    },
    [bump]
  );

  const scheduleInstagram = useCallback(
    async (pageId: string, scheduledAt: string, publishNow = false): Promise<PagePipelineResult> => {
      const result = await schedulePageOnInstagram(pageId, scheduledAt, { publishNow });
      bump();
      return result;
    },
    [bump]
  );

  const refreshInstagramStatus = useCallback(async (): Promise<InstagramConnectionStatus> => {
    await refreshAccounts();
    return checkInstagramConnection();
  }, [refreshAccounts]);

  const getPage = useCallback(
    (pageId: string) => {
      void version;
      return getPageById(pageId);
    },
    [version]
  );

  return {
    summary,
    pages,
    page001,
    instagramStatus,
    accountsLoading,
    createPage001,
    submitReview,
    approveProduction,
    scheduleInstagram,
    refreshInstagramStatus,
    getPage,
    refresh: bump,
  };
}
