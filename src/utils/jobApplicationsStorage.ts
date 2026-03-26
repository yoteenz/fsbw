/**
 * Client-side job applications (public apply → admin Workers page).
 * Stored in localStorage; replace with API/Supabase when ready.
 */

const STORAGE_KEY = 'brandJobApplications_v1';

export type JobApplication = {
  id: string;
  /** Matches `AdminDashboardWorker.id` from adminWorkersDashboard.ts */
  jobId: string;
  role: string;
  fullName: string;
  email: string;
  phone: string;
  /** Added 2026; omitted on older stored applications */
  currentLocation?: string;
  skillsAndExperience?: string;
  linkedInUrl: string;
  portfolioUrl: string;
  otherLinks: string;
  /** Apply form: highest completed / held education (dropdown); added 2026 */
  educationLevel?: string;
  yearsExperience: string;
  coverLetter: string;
  resumeFileName: string;
  /** Data URL; may be omitted if file too large for quota */
  resumeDataUrl?: string;
  submittedAt: string;
};

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `app_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}

export function loadAllJobApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as JobApplication[]) : [];
  } catch {
    return [];
  }
}

export function getJobApplicationsForJob(jobId: string): JobApplication[] {
  return loadAllJobApplications()
    .filter((a) => a.jobId === jobId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export function countApplicationsForJob(jobId: string): number {
  return loadAllJobApplications().filter((a) => a.jobId === jobId).length;
}

export function appendJobApplication(entry: Omit<JobApplication, 'id' | 'submittedAt'>): JobApplication {
  const row: JobApplication = {
    ...entry,
    id: newId(),
    submittedAt: new Date().toISOString(),
  };
  const persist = (list: JobApplication[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };
  try {
    persist([...loadAllJobApplications(), row]);
    return row;
  } catch {
    const slim: JobApplication = { ...row, resumeDataUrl: undefined };
    try {
      persist([...loadAllJobApplications(), slim]);
      return slim;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Could not save application. Try a smaller resume file.');
    }
  }
}

export function removeJobApplication(applicationId: string): void {
  const all = loadAllJobApplications().filter((a) => a.id !== applicationId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
