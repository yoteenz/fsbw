import { getPromptsForChapter, DISCOVERY_CHAPTERS } from './chapters';
import type {
  ChapterProgress,
  DiscoveryChapterId,
  OrganizationDiscoveryBlueprint,
  ServiceDiscoverySession,
} from './types';

function countAnsweredForChapter(
  blueprint: OrganizationDiscoveryBlueprint,
  chapterId: DiscoveryChapterId
): { answered: number; total: number } {
  if (chapterId === 'services') {
    const sessions = blueprint.serviceSessions.filter((s) => s.status === 'complete');
    const coreServicesAnswer = blueprint.responses.find((r) => r.promptId === 'identity-core-services');
    const serviceNames = parseServiceList(coreServicesAnswer?.answer ?? '');
    const totalServices = Math.max(serviceNames.length, 1);
    const completeSessions = sessions.length;
    const promptsPerService = getPromptsForChapter('services').length;
    return {
      answered: completeSessions * promptsPerService,
      total: totalServices * promptsPerService,
    };
  }

  if (chapterId === 'resources') {
    const narrativeAnswered = blueprint.responses.filter(
      (r) => r.chapterId === 'resources' && r.answer.trim().length > 0
    ).length;
    const uploadBonus = blueprint.resourceUploads.length > 0 ? 1 : 0;
    const prompts = getPromptsForChapter('resources');
    return {
      answered: Math.min(prompts.length, narrativeAnswered + uploadBonus),
      total: prompts.length + 1,
    };
  }

  const prompts = getPromptsForChapter(chapterId).filter((p) =>
    shouldIncludePrompt(p.id, blueprint.industryId, getPromptsForChapter(chapterId))
  );
  const answered = prompts.filter((p) =>
    blueprint.responses.some((r) => r.promptId === p.id && r.answer.trim().length > 0)
  ).length;
  return { answered, total: prompts.length };
}

function shouldIncludePrompt(
  promptId: string,
  industryId: string,
  prompts: ReturnType<typeof getPromptsForChapter>
): boolean {
  const prompt = prompts.find((p) => p.id === promptId);
  if (!prompt) return true;
  if (prompt.onlyForIndustries?.length && !prompt.onlyForIndustries.includes(industryId)) return false;
  if (prompt.skipForIndustries?.includes(industryId)) return false;
  return true;
}

export function parseServiceList(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function computeChapterProgress(
  blueprint: OrganizationDiscoveryBlueprint,
  chapterId: DiscoveryChapterId
): ChapterProgress {
  const { answered, total } = countAnsweredForChapter(blueprint, chapterId);
  const percentComplete = total === 0 ? 0 : Math.round((answered / total) * 100);
  const lastResponse = blueprint.responses
    .filter((r) => r.chapterId === chapterId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

  let status: ChapterProgress['status'] = 'not-started';
  if (percentComplete >= 100) status = 'complete';
  else if (answered > 0) status = 'in-progress';

  return {
    chapterId,
    answeredCount: answered,
    totalCount: total,
    percentComplete,
    status,
    lastActivityAt: lastResponse?.updatedAt,
  };
}

export function computeAllChapterProgress(blueprint: OrganizationDiscoveryBlueprint): ChapterProgress[] {
  return DISCOVERY_CHAPTERS.map((c) => computeChapterProgress(blueprint, c.id));
}

export function computeOverallProgress(blueprint: OrganizationDiscoveryBlueprint): number {
  const chapters = computeAllChapterProgress(blueprint);
  if (chapters.length === 0) return 0;
  const sum = chapters.reduce((acc, c) => acc + c.percentComplete, 0);
  return Math.round(sum / chapters.length);
}

export function recommendNextChapter(blueprint: OrganizationDiscoveryBlueprint): DiscoveryChapterId {
  const progress = computeAllChapterProgress(blueprint);
  const inProgress = progress.find((p) => p.status === 'in-progress');
  if (inProgress) return inProgress.chapterId;

  const notStarted = progress.find((p) => p.status === 'not-started');
  if (notStarted) return notStarted.chapterId;

  return 'growth';
}

export function getActiveServiceSession(
  blueprint: OrganizationDiscoveryBlueprint
): ServiceDiscoverySession | null {
  return blueprint.serviceSessions.find((s) => s.status === 'in-progress') ?? null;
}

export function listPendingServiceNames(blueprint: OrganizationDiscoveryBlueprint): string[] {
  const coreServicesAnswer = blueprint.responses.find((r) => r.promptId === 'identity-core-services');
  const names = parseServiceList(coreServicesAnswer?.answer ?? '');
  const completed = new Set(
    blueprint.serviceSessions.filter((s) => s.status === 'complete').map((s) => s.serviceName.toLowerCase())
  );
  return names.filter((n) => !completed.has(n.toLowerCase()));
}

export function detectMilestoneToCelebrate(
  blueprint: OrganizationDiscoveryBlueprint,
  previousPct: number
): string | null {
  const current = computeOverallProgress(blueprint);
  const thresholds = [25, 50, 75, 100];
  for (const t of thresholds) {
    const key = `milestone-${t}`;
    if (previousPct < t && current >= t && !blueprint.milestonesCelebrated.includes(key)) {
      return key;
    }
  }
  const completedChapters = computeAllChapterProgress(blueprint).filter((c) => c.status === 'complete');
  for (const ch of completedChapters) {
    const key = `chapter-${ch.chapterId}`;
    if (!blueprint.milestonesCelebrated.includes(key)) return key;
  }
  return null;
}

export function resolveBlueprintStatus(
  blueprint: OrganizationDiscoveryBlueprint
): OrganizationDiscoveryBlueprint['status'] {
  const pct = computeOverallProgress(blueprint);
  if (pct >= 75) return 'living';
  if (pct >= 40) return 'foundational';
  return 'discovering';
}
