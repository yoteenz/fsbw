import type { SignUpAccountType } from './authService';

export type DemoSignupIntent =
  | 'start_business'
  | 'road_ready'
  | 'existing_business'
  | 'request_service'
  | 'shipper';

export interface DemoSignupDraft {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  businessName?: string;
  accountType: SignUpAccountType;
  gettingStarted: boolean;
  businessStructure?: string;
  termsAccepted: boolean;
  marketingOptIn: boolean;
  intent?: DemoSignupIntent;
  returnUrl?: string;
  completedAt?: string;
  verifySimulated?: boolean;
}

const STORAGE_KEY = 'aio_demo_signup_draft';

export function loadDemoSignupDraft(): DemoSignupDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoSignupDraft;
  } catch {
    return null;
  }
}

export function saveDemoSignupDraft(draft: DemoSignupDraft): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearDemoSignupDraft(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function completeDemoSignup(draft: DemoSignupDraft): DemoSignupDraft {
  const completed = { ...draft, completedAt: new Date().toISOString(), verifySimulated: true };
  saveDemoSignupDraft(completed);
  return completed;
}
