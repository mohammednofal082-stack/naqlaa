import type { UserRole } from '@careerlink/shared';
import { ROLE_DASHBOARD_PATHS } from '@careerlink/shared';
import { authenticateUser, registerUser, getUserById } from '@/backend/auth/store';
import { createSession, setSessionCookie, clearSessionCookie } from '@/backend/auth/session';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { useSupabaseAuth } from '@/backend/config/env';
import type { SessionPayload } from '@/backend/auth/session';

export interface LoginResult {
  user?: SessionPayload;
  redirect?: string;
  error?: string;
  token?: string;
}

function toSession(user: {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  avatar: string;
  organizationId?: string;
}, activeRole: UserRole): SessionPayload {
  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: activeRole,
    roles: user.roles,
    avatar: user.avatar,
    organizationId: user.organizationId,
  };
}

async function mockLogin(email: string, password: string, role?: UserRole): Promise<LoginResult> {
  const user = authenticateUser(email, password);
  if (!user) return { error: 'بيانات الدخول غير صحيحة' };
  if (role && !user.roles.includes(role)) return { error: 'ليس لديك صلاحية الدخول بهذا الدور' };

  const activeRole = (role && user.roles.includes(role) ? role : user.roles[0]) as UserRole;
  const session = toSession(user, activeRole);

  // Keep in-memory data layer scoped to the same user id as auth
  try {
    const { memoryStore } = await import('@/backend/data/memory-store');
    memoryStore.currentUserId = session.userId;
  } catch {
    // ignore if memory store unavailable
  }

  const token = await createSession(session);
  await setSessionCookie(token);

  return {
    user: session,
    redirect: ROLE_DASHBOARD_PATHS[activeRole],
    token,
  };
}

async function supabaseLogin(email: string, password: string, role?: UserRole): Promise<LoginResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: 'بيانات الدخول غير صحيحة' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const roles = (profile?.roles as UserRole[]) ?? ['student'];
  const activeRole = (role && roles.includes(role) ? role : roles[0]) as UserRole;

  const session: SessionPayload = {
    userId: data.user.id,
    email: data.user.email ?? email,
    fullName: String(profile?.full_name ?? data.user.email),
    role: activeRole,
    roles,
    avatar: String(profile?.avatar_url ?? ''),
    organizationId: profile?.organization_id ? String(profile.organization_id) : undefined,
  };

    const token = await createSession(session);
  await setSessionCookie(token);

  return {
    user: session,
    redirect: ROLE_DASHBOARD_PATHS[activeRole],
    token,
  };
}

export async function loginUser(email: string, password: string, role?: UserRole): Promise<LoginResult> {
  if (useSupabaseAuth()) return supabaseLogin(email, password, role);
  return mockLogin(email, password, role);
}

export async function registerNewUser(data: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  organizationId?: string;
}): Promise<{ user?: SessionPayload; error?: string; redirect?: string }> {
  if (useSupabaseAuth()) {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName, role: data.role },
      },
    });
    if (error) return { error: error.message };

    if (authData.user) {
      await supabase.from('profiles').update({
        roles: [data.role],
        active_role: data.role,
        full_name: data.fullName,
      }).eq('id', authData.user.id);
    }

    return { redirect: '/auth/login' };
  }

  const result = registerUser(data);
  if (result.error || !result.user) return { error: result.error ?? 'فشل التسجيل' };

  const activeRole = result.user.roles[0];
  const session = toSession(result.user, activeRole);
  const token = await createSession(session);
  await setSessionCookie(token);

  return {
    user: session,
    redirect: ROLE_DASHBOARD_PATHS[activeRole],
  };
}

export async function logoutUser(): Promise<void> {
  if (useSupabaseAuth()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  await clearSessionCookie();
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  // Bearer token (mobile / API clients)
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    const auth = h.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
      const { verifySession } = await import('@/backend/auth/session');
      const payload = await verifySession(token);
      if (payload) return payload;
    }
  } catch {
    // ignore outside request context
  }

  if (useSupabaseAuth()) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Fall back to bridge JWT cookie if present
      const { getSession } = await import('@/backend/auth/session');
      return getSession();
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;
    const roles = (profile.roles as UserRole[]) ?? ['student'];

    return {
      userId: user.id,
      email: user.email ?? '',
      fullName: String(profile.full_name),
      role: (profile.active_role as UserRole) ?? roles[0],
      roles,
      avatar: String(profile.avatar_url ?? ''),
      organizationId: profile.organization_id ? String(profile.organization_id) : undefined,
    };
  }

  const { getSession } = await import('@/backend/auth/session');
  const session = await getSession();
  if (!session) return null;

  const user = getUserById(session.userId);
  if (!user || user.status !== 'active') return null;
  return session;
}
