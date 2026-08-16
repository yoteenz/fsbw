import type { Session, User } from '@supabase/supabase-js';
import type { AioInternalRole, AioMembershipRole, AioOrgType } from '../data/supabase/database.types';
import { getAioSupabase } from '../data/supabase/client';

export type SignUpAccountType = 'carrier' | 'fleet' | 'shipper' | 'unsure';

export interface AioAuthSession {
  user: User;
  session: Session;
  profile: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  } | null;
  organization: {
    id: string;
    name: string;
    organizationType: AioOrgType;
    primaryOperatingState: string | null;
  } | null;
  membershipRole: AioMembershipRole | null;
  internalRole: AioInternalRole | null;
  isInternal: boolean;
  emailVerified: boolean;
}

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName: string;
  accountType: SignUpAccountType;
  phone?: string;
  gettingStarted?: boolean;
  marketingOptIn?: boolean;
}

function mapOrgType(accountType: SignUpAccountType): AioOrgType {
  switch (accountType) {
    case 'fleet':
      return 'fleet';
    case 'shipper':
      return 'shipper';
    case 'carrier':
      return 'owner_operator';
    default:
      return 'owner_operator';
  }
}

async function createOrganizationForUser(userId: string, payload: SignUpPayload): Promise<string | null> {
  const supabase = getAioSupabase();
  if (!supabase) return 'Backend is not configured.';

  const orgType = mapOrgType(payload.accountType);
  const { data: org, error: orgError } = await supabase
    .from('aio_organizations')
    .insert({ name: payload.businessName, organization_type: orgType })
    .select('id')
    .single();

  if (orgError) return friendlyAuthError(orgError.message);

  const { error: memberError } = await supabase.from('aio_organization_memberships').insert({
    organization_id: org.id,
    user_id: userId,
    role: 'organization_owner',
  });

  if (memberError) return friendlyAuthError(memberError.message);

  if (payload.email) {
    await supabase.from('aio_profiles').upsert({
      id: userId,
      email: payload.email,
      first_name: payload.firstName || null,
      last_name: payload.lastName || null,
      phone: payload.phone || null,
    });
  }

  return null;
}

export async function signUp(payload: SignUpPayload): Promise<{ user: User | null; error: string | null }> {
  const supabase = getAioSupabase();
  if (!supabase) return { user: null, error: 'Backend is not configured.' };

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        first_name: payload.firstName,
        last_name: payload.lastName,
        business_name: payload.businessName,
        account_type: payload.accountType,
        getting_started: payload.gettingStarted ?? false,
        marketing_opt_in: payload.marketingOptIn ?? false,
      },
    },
  });

  if (error) return { user: null, error: friendlyAuthError(error.message) };
  const user = data.user;
  if (!user) return { user: null, error: 'Sign-up did not return a user.' };

  if (data.session) {
    const orgError = await createOrganizationForUser(user.id, payload);
    if (orgError) return { user, error: orgError };
  }

  return { user, error: null };
}

export async function ensureOrganizationForUser(
  userId: string,
  payload?: Pick<SignUpPayload, 'businessName' | 'accountType' | 'email' | 'firstName' | 'lastName'>,
): Promise<string | null> {
  const supabase = getAioSupabase();
  if (!supabase) return 'Backend is not configured.';

  const { data: existing } = await supabase
    .from('aio_organization_memberships')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (existing) return null;
  if (!payload?.businessName) return 'Business name required to complete setup.';

  return createOrganizationForUser(userId, {
    firstName: payload.firstName ?? '',
    lastName: payload.lastName ?? '',
    email: payload.email ?? '',
    password: '',
    businessName: payload.businessName,
    accountType: payload.accountType ?? 'unsure',
  });
}

export async function signIn(email: string, password: string): Promise<{ session: Session | null; error: string | null }> {
  const supabase = getAioSupabase();
  if (!supabase) return { session: null, error: 'Backend is not configured.' };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { session: null, error: friendlyAuthError(error.message) };
  return { session: data.session, error: null };
}

export async function signOut(): Promise<void> {
  const supabase = getAioSupabase();
  if (supabase) await supabase.auth.signOut();
}

export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  const supabase = getAioSupabase();
  if (!supabase) return { error: 'Backend is not configured.' };

  const redirectTo = `${window.location.origin}/all-in-one/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return { error: error ? friendlyAuthError(error.message) : null };
}

export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  const supabase = getAioSupabase();
  if (!supabase) return { error: 'Backend is not configured.' };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error ? friendlyAuthError(error.message) : null };
}

export async function resendVerification(email: string): Promise<{ error: string | null }> {
  const supabase = getAioSupabase();
  if (!supabase) return { error: 'Backend is not configured.' };

  const { error } = await supabase.auth.resend({ type: 'signup', email });
  return { error: error ? friendlyAuthError(error.message) : null };
}

export async function loadAuthSession(): Promise<AioAuthSession | null> {
  const supabase = getAioSupabase();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session?.user) return null;

  const user = session.user;
  const { data: profile } = await supabase.from('aio_profiles').select('*').eq('id', user.id).maybeSingle();

  const { data: membership } = await supabase
    .from('aio_organization_memberships')
    .select('role, organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  let org: { id: string; name: string; organization_type: AioOrgType; primary_operating_state: string | null } | null = null;
  if (membership?.organization_id) {
    const { data: orgRow } = await supabase
      .from('aio_organizations')
      .select('id, name, organization_type, primary_operating_state')
      .eq('id', membership.organization_id)
      .maybeSingle();
    org = orgRow ?? null;
  }

  const { data: internalStaff } = await supabase
    .from('aio_internal_staff')
    .select('role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  return {
    user,
    session,
    profile: profile
      ? {
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          phone: profile.phone,
        }
      : null,
    organization: org
      ? {
          id: org.id,
          name: org.name,
          organizationType: org.organization_type,
          primaryOperatingState: org.primary_operating_state,
        }
      : null,
    membershipRole: membership?.role ?? null,
    internalRole: internalStaff?.role ?? null,
    isInternal: Boolean(internalStaff),
    emailVerified: Boolean(user.email_confirmed_at),
  };
}

export function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'Email or password is incorrect.';
  if (lower.includes('email not confirmed')) return 'Please verify your email before signing in.';
  if (lower.includes('user already registered')) return 'An account with this email already exists.';
  if (lower.includes('password')) return 'Please choose a stronger password (at least 8 characters).';
  if (lower.includes('network')) return 'Network error. Please check your connection and try again.';
  return 'Something went wrong. Please try again.';
}

export function onAuthStateChange(callback: (session: Session | null) => void): (() => void) | null {
  const supabase = getAioSupabase();
  if (!supabase) return null;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}
