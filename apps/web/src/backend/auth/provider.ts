import type { UserRole } from '@careerlink/shared';
import { ROLE_DASHBOARD_PATHS } from '@careerlink/shared';
import { authenticateUser, registerUser, getUserById } from '@/backend/auth/store';
import { createSession, setSessionCookie, clearSessionCookie } from '@/backend/auth/session';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { createSupabaseAdminClient, hasSupabaseAdmin } from '@/backend/supabase/admin';
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

  // Prefer requested role when allowed; otherwise use the account's primary role
  const activeRole = (role && user.roles.includes(role) ? role : user.roles[0]) as UserRole;
  const session = toSession(user, activeRole);

  try {
    const { memoryStore } = await import('@/backend/data/memory-store');
    memoryStore.currentUserId = session.userId;
  } catch {
    // ignore
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
  if (error || !data.user) {
    const msg = error?.message?.toLowerCase() ?? '';
    if (msg.includes('confirm') || msg.includes('email not confirmed')) {
      return { error: 'يجب تأكيد البريد أولاً — أو تأكد أن SUPABASE_SERVICE_ROLE_KEY مفعّل عند التسجيل' };
    }
    return { error: 'بيانات الدخول غير صحيحة' };
  }

  let profile = (
    await supabase.from('profiles').select('*').eq('id', data.user.id).single()
  ).data;

  // Ensure role from metadata is applied if profile is still default student
  const metaRole = (data.user.user_metadata?.role as UserRole | undefined) ?? undefined;
  if (hasSupabaseAdmin() && metaRole) {
    const roles = (profile?.roles as UserRole[] | undefined) ?? [];
    if (!roles.includes(metaRole)) {
      const admin = createSupabaseAdminClient();
      await admin.from('profiles').update({
        roles: [metaRole],
        active_role: metaRole,
        full_name: profile?.full_name ?? data.user.user_metadata?.full_name ?? data.user.email,
      }).eq('id', data.user.id);
      profile = (await supabase.from('profiles').select('*').eq('id', data.user.id).single()).data;
    }
  }

  const roles = (profile?.roles as UserRole[]) ?? (metaRole ? [metaRole] : ['student']);
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

async function ensureRoleProfile(
  userId: string,
  role: UserRole,
  fullName: string,
  extras?: { companyName?: string; industry?: string; major?: string; organizationId?: string },
) {
  if (!hasSupabaseAdmin()) return;
  const admin = createSupabaseAdminClient();

  await admin.from('profiles').update({
    full_name: fullName,
    roles: [role],
    active_role: role,
    ...(extras?.organizationId ? { organization_id: extras.organizationId } : {}),
  }).eq('id', userId);

  if (role === 'student' || role === 'graduate') {
    await admin.from('student_profiles').upsert({
      user_id: userId,
      headline: role === 'graduate' ? 'خريج' : 'طالب',
      about: '',
      location: 'Palestine',
      skills: [],
      major: extras?.major ?? '',
    }, { onConflict: 'user_id' });
  }

  if (role === 'mentor') {
    await admin.from('mentor_profiles').upsert({
      user_id: userId,
      expertise_area: 'إرشاد مهني',
      current_title: 'مرشد',
      experience_years: 1,
      bio: '',
      verified: false,
      rating: 5,
      sessions_count: 0,
    }, { onConflict: 'user_id' });
  }

  if (role === 'company' && extras?.companyName) {
    const { data: company } = await admin.from('companies').insert({
      owner_id: userId,
      name: extras.companyName,
      industry: extras.industry || 'Technology',
      location: 'Palestine',
      description: '',
      website: '',
      verified: false,
    }).select('id').single();
    if (company?.id) {
      await admin.from('profiles').update({ organization_id: company.id }).eq('id', userId);
    }
  }
}

export async function registerNewUser(data: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  organizationId?: string;
  companyName?: string;
  industry?: string;
  major?: string;
}): Promise<{ user?: SessionPayload; error?: string; redirect?: string; token?: string }> {
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
    if (!authData.user) return { error: 'فشل إنشاء الحساب' };

    // Confirm email + set role with service role so login works immediately
    if (hasSupabaseAdmin()) {
      try {
        const admin = createSupabaseAdminClient();
        await admin.auth.admin.updateUserById(authData.user.id, {
          email_confirm: true,
          user_metadata: { full_name: data.fullName, role: data.role },
        });
        await ensureRoleProfile(authData.user.id, data.role, data.fullName, {
          companyName: data.companyName,
          industry: data.industry,
          major: data.major,
          organizationId: data.organizationId,
        });
      } catch (e) {
        console.warn('register admin provisioning failed', e);
      }
    } else {
      // Best-effort without service role (may fail under RLS / email confirm)
      await supabase.from('profiles').update({
        roles: [data.role],
        active_role: data.role,
        full_name: data.fullName,
      }).eq('id', authData.user.id);
    }

    // Auto-login with the same credentials
    const login = await supabaseLogin(data.email, data.password, data.role);
    if (login.user) {
      return {
        user: login.user,
        redirect: login.redirect,
        token: login.token,
      };
    }

    // Account exists — send user to login with prefilled email/role
    return {
      redirect: `/auth/login?email=${encodeURIComponent(data.email)}&role=${encodeURIComponent(data.role)}`,
    };
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
    token,
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
