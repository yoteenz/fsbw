import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import { branchPresetFromIntent, executeCreativeCommand } from './commandEngine';
import { analyzeInspirationReference, createEmptyMoodBoard, mergeReferenceIntoMoodBoard } from './inspirationAnalyzer';
import { routeCreativeNote } from './routing';
import type {
  CreativeDirectionBranch,
  CreativeDirectionNote,
  CreativeDirectionProject,
  CreativeCommandResult,
  DirectionTimelineEvent,
  InspirationReference,
  InspirationSourceType,
} from './types';

export const CREATIVE_DIRECTION_STORAGE_KEY = 'studioOsCreativeDirection_v1';

export { NDXBOOK_PAGE_001_PROJECT_ID } from './types';

type Store = {
  projects: Record<string, CreativeDirectionProject>;
};

const EMPTY: Store = { projects: {} };

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function readStore(): Store {
  return readStudioOsJson(CREATIVE_DIRECTION_STORAGE_KEY, () => EMPTY);
}

function writeStore(store: Store): void {
  writeStudioOsJson(CREATIVE_DIRECTION_STORAGE_KEY, store);
}

function timelineEvent(
  type: DirectionTimelineEvent['type'],
  label: string,
  detail: string,
  branchId?: string
): DirectionTimelineEvent {
  return { id: uid('tl'), createdAt: new Date().toISOString(), type, label, detail, branchId };
}

function seedBranch(name: string, presetIntent: string): CreativeDirectionBranch {
  const preset = branchPresetFromIntent(presetIntent, name);
  const id = uid('branch');
  return {
    id,
    name,
    createdAt: new Date().toISOString(),
    brief: preset.brief!,
    vision: preset.vision ?? '',
    northStar: preset.northStar ?? '',
    moodBoard: createEmptyMoodBoard(),
    references: [],
    notes: [],
    aiSuggestions: [],
    conciergeRecommendations: [],
    versionHistory: [],
  };
}

export function bootstrapPage001CreativeDirection(): CreativeDirectionProject {
  const existing = readStore().projects['ndxbook-page-001'];
  if (existing) return existing;

  const branches = [
    seedBranch('Luxury Editorial', 'luxury-editorial'),
    seedBranch('Apple Launch', 'apple-launch'),
    seedBranch('Fashion Campaign', 'fashion'),
    seedBranch('Minimal Luxury', 'minimal'),
    seedBranch('High Energy Social', 'high-energy'),
    seedBranch('Futuristic', 'futuristic'),
  ];
  branches[0]!.moodBoard.sections['visual-style'] = ['Editorial crop', 'Indigo restraint', 'Calm authority'];
  branches[0]!.moodBoard.sections.color = ['#6366F1', '#0F172A', '#F8FAFC'];

  const project: CreativeDirectionProject = {
    id: 'ndxbook-page-001',
    name: 'PAGE 001 · TRUTH TUESDAY',
    workspaceId: 'ai-media',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activeBranchId: branches[0]!.id,
    branches,
    directionTimeline: [
      timelineEvent('branch-created', 'Luxury Editorial', 'Default pilot branch for Page 001', branches[0]!.id),
    ],
  };

  const store = readStore();
  writeStore({ projects: { ...store.projects, [project.id]: project } });
  return project;
}

export function getCreativeDirectionProject(projectId: string): CreativeDirectionProject | null {
  if (projectId === 'ndxbook-page-001') {
    return readStore().projects[projectId] ?? bootstrapPage001CreativeDirection();
  }
  return readStore().projects[projectId] ?? null;
}

export function getActiveBranch(projectId: string): CreativeDirectionBranch | null {
  const project = getCreativeDirectionProject(projectId);
  if (!project) return null;
  return project.branches.find((b) => b.id === project.activeBranchId) ?? null;
}

function saveProject(project: CreativeDirectionProject): CreativeDirectionProject {
  project.updatedAt = new Date().toISOString();
  const store = readStore();
  writeStore({ projects: { ...store.projects, [project.id]: project } });
  return project;
}

export function setActiveBranch(projectId: string, branchId: string): CreativeDirectionProject | null {
  const project = getCreativeDirectionProject(projectId);
  if (!project) return null;
  if (!project.branches.some((b) => b.id === branchId)) return null;
  project.activeBranchId = branchId;
  project.directionTimeline.unshift(
    timelineEvent('branch-activated', 'Branch activated', project.branches.find((b) => b.id === branchId)!.name, branchId)
  );
  return saveProject(project);
}

export function createCreativeBranch(projectId: string, name: string, presetIntent = 'general'): CreativeDirectionProject | null {
  const project = getCreativeDirectionProject(projectId);
  if (!project) return null;
  const branch = seedBranch(name, presetIntent);
  project.branches.push(branch);
  project.directionTimeline.unshift(timelineEvent('branch-created', 'New creative branch', name, branch.id));
  return saveProject(project);
}

export function addInspirationReference(
  projectId: string,
  input: {
    title: string;
    sourceType: InspirationSourceType;
    url: string;
    caption?: string;
    thumbnail?: string;
  }
): InspirationReference | null {
  const project = getCreativeDirectionProject(projectId);
  if (!project) return null;
  const branch = project.branches.find((b) => b.id === project.activeBranchId);
  if (!branch) return null;

  const analyzed = analyzeInspirationReference(input);
  const ref: InspirationReference = {
    id: uid('ref'),
    branchId: branch.id,
    title: input.title,
    sourceType: input.sourceType,
    url: input.url,
    caption: input.caption,
    thumbnail: input.thumbnail,
    addedAt: new Date().toISOString(),
    addedBy: 'Founder',
    analysis: analyzed.analysis,
    moodBoardSections: analyzed.moodBoardSections,
  };

  branch.references.unshift(ref);
  branch.moodBoard.sections = mergeReferenceIntoMoodBoard(branch.moodBoard.sections, ref);
  branch.moodBoard.updatedAt = new Date().toISOString();
  branch.versionHistory.unshift({
    id: uid('ver'),
    branchId: branch.id,
    createdAt: new Date().toISOString(),
    label: 'Reference added',
    summary: `${input.title} · ${input.sourceType}`,
    changedFields: ['inspiration-library', 'mood-board'],
  });

  project.directionTimeline.unshift(
    timelineEvent('reference-added', input.title, `Studio Intelligence analyzed ${input.sourceType}`, branch.id)
  );
  saveProject(project);
  return ref;
}

export function addCreativeDirectionNote(
  projectId: string,
  input: {
    body: string;
    kind?: CreativeDirectionNote['kind'];
    departmentOrigin?: string;
    linkedReferenceId?: string;
  }
): CreativeDirectionNote | null {
  const project = getCreativeDirectionProject(projectId);
  if (!project) return null;
  const branch = project.branches.find((b) => b.id === project.activeBranchId);
  if (!branch) return null;

  const concierge = routeCreativeNote(input.body);
  const note: CreativeDirectionNote = {
    id: uid('cdn'),
    branchId: branch.id,
    kind: input.kind ?? 'text',
    body: input.body.trim(),
    author: 'Founder',
    createdAt: new Date().toISOString(),
    status: 'routed',
    assignedConcierge: concierge,
    departmentOrigin: input.departmentOrigin,
    linkedReferenceId: input.linkedReferenceId,
  };

  branch.notes.unshift(note);
  branch.conciergeRecommendations.unshift({
    id: uid('cr'),
    branchId: branch.id,
    conciergeId: concierge,
    createdAt: new Date().toISOString(),
    recommendation: `Review: ${input.body.slice(0, 120)}`,
    rationale: `Auto-routed to ${concierge} based on creative note content.`,
  });

  project.directionTimeline.unshift(timelineEvent('note', 'Creative direction note', input.body.slice(0, 80), branch.id));
  saveProject(project);
  return note;
}

export function runCreativeCommand(
  projectId: string,
  command: string,
  currentDepartment?: string
): CreativeCommandResult | null {
  const project = getCreativeDirectionProject(projectId);
  if (!project) return null;

  const result = executeCreativeCommand(project, command, currentDepartment);
  const branch = project.branches.find((b) => b.id === project.activeBranchId)!;

  if (result.suggestions) {
    branch.aiSuggestions.unshift(result.suggestions);
  }

  if (/start over|apple|luxury|futuristic|fashion|minimal|high energy/i.test(command)) {
    const nameMatch = result.actions.find((a) => a.includes('parallel branch'));
    if (nameMatch) {
      const name = result.actions[0]?.split('·')[1]?.trim() ?? 'New Direction';
      const newBranch = seedBranch(name, command);
      project.branches.push(newBranch);
      result.newBranch = newBranch;
    }
  }

  if (result.impact && !/find better inspiration/i.test(command)) {
    project.directionTimeline.unshift(
      timelineEvent('impact-warning', 'Direction change impact', result.impact.summary, branch.id)
    );
  }

  project.directionTimeline.unshift(timelineEvent('command', 'Creative command', command.slice(0, 100), branch.id));
  saveProject(project);
  return result;
}

export function updateBranchBrief(
  projectId: string,
  patch: Partial<CreativeDirectionBranch['brief']> & { vision?: string; northStar?: string }
): CreativeDirectionProject | null {
  const project = getCreativeDirectionProject(projectId);
  if (!project) return null;
  const branch = project.branches.find((b) => b.id === project.activeBranchId);
  if (!branch) return null;

  branch.brief = { ...branch.brief, ...patch, updatedAt: new Date().toISOString() };
  if (patch.vision) branch.vision = patch.vision;
  if (patch.northStar) branch.northStar = patch.northStar;
  branch.versionHistory.unshift({
    id: uid('ver'),
    branchId: branch.id,
    createdAt: new Date().toISOString(),
    label: 'Brief updated',
    summary: 'Creative brief / vision revision',
    changedFields: ['brief', 'vision', 'north-star'],
  });
  return saveProject(project);
}

/** Snapshot for departments — read-only creative intent. */
export function getDepartmentCreativeDirectionSnapshot(projectId: string) {
  const branch = getActiveBranch(projectId);
  if (!branch) return null;
  return {
    branchName: branch.name,
    vision: branch.vision,
    northStar: branch.northStar,
    tone: branch.brief.tone,
    referenceCount: branch.references.length,
    openNotes: branch.notes.filter((n) => n.status !== 'resolved' && n.status !== 'archived').length,
    moodHighlights: branch.moodBoard.sections['visual-style']?.slice(0, 3) ?? [],
  };
}
