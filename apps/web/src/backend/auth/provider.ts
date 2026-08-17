import type { UserRole } from '@careerlink/shared';
import { ROLE_DASHBOARD_PATHS } from '@careerlink/shared';
import { authenticateUser, registerUser, getUserById } from '@/backend/auth/store';
import { createSession, setSessionCookie, clearSessionCookie } from '@/backend/auth/session';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { createSupabaseAdminClient, hasSupabaseAdmin } from '@/backend/supabase/admin';
import { useSupabaseAuth } from '@/backend/config/env';
import type { SessionPayload } from '@/backend/auth/session';

export const PENDING_ACCOUNT_MESSAGE =
  'حسابك لسا لم تتم الموافقة عليه من مدير النظام';

export interface LoginResult {
  user?: SessionPayload;
  redirect?: string;
  error?: string;
  token?: string;
  pending?: boolean;
  message?: string;
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
  if (process.env.NODE_ENV === 'production') {
    return { error: 'MOCK_AUTH_DISABLED' };
  }
  const attempt = authenticateUser(email, password);
  if (!attempt.ok) {
    if (attempt.reason === 'pending') {
      return { error: PENDING_ACCOUNT_MESSAGE, pending: true };
    }
    if (attempt.reason === 'suspended') {
      return { error: 'تم تعليق هذا الحساب' };
    }
    return { error: 'بيانات الدخول غير صحيحة' };
  }

  const user = attempt.user;
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

  const status = String(profile?.status ?? 'active');
  if (status === 'pending') {
    await supabase.auth.signOut();
    return { error: PENDING_ACCOUNT_MESSAGE, pending: true };
  }
  if (status !== 'active') {
    await supabase.auth.signOut();
    return { error: 'تم تعليق هذا الحساب' };
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

  const appToken = await createSession(session);
  await setSessionCookie(appToken);
  // Prefer the Supabase access token for native clients so repository methods
  // that call auth.getUser() work without browser cookies.
  const token = data.session?.access_token || appToken;

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
  extras?: {
    companyName?: string;
    industry?: string;
    major?: string;
    organizationId?: string;
    universityName?: string;
    status?: 'pending' | 'active';
    permissions?: string[];
  },
) {
  if (!hasSupabaseAdmin()) return;
  const admin = createSupabaseAdminClient();
  const status = extras?.status ?? (role === 'company' || role === 'university' ? 'pending' : 'active');

  await admin.from('profiles').update({
    full_name: fullName,
    roles: [role],
    active_role: role,
    status,
    // Student/graduate university ids are selector ids (e.g. `uni-birzeit`),
    // while profiles.organization_id is a UUID reserved for an actual company
    // or university portal record.
    ...(role === 'university' && extras?.organizationId ? { organization_id: extras.organizationId } : {}),
  }).eq('id', userId);

  if (role === 'student' || role === 'graduate') {
    await admin.from('student_profiles').upsert({
      user_id: userId,
      headline: role === 'graduate' ? 'خريج' : 'طالب',
      about: '',
      location: 'Palestine',
      skills: [],
      major: extras?.major ?? '',
      university_id: extras?.organizationId ?? null,
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

  if (role === 'hr' && extras?.permissions) {
    // permissions live in user_metadata for HR created by company
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { permissions: extras.permissions, role: 'hr' },
    });
  }

  void extras?.universityName;
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
  universityName?: string;
  status?: 'pending' | 'active';
  permissions?: string[];
  skipAutoLogin?: boolean;
}): Promise<{ user?: SessionPayload; error?: string; redirect?: string; token?: string; pending?: boolean; message?: string }> {
  const needsApproval = data.role === 'company' || data.role === 'university';
  const status = data.status ?? (needsApproval ? 'pending' : 'active');

  if (useSupabaseAuth()) {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role,
          university_name: data.universityName,
          company_name: data.companyName,
          permissions: data.permissions,
        },
      },
    });
    if (error) return { error: error.message };
    if (!authData.user) return { error: 'فشل إنشاء الحساب' };

    if (hasSupabaseAdmin()) {
      try {
        const admin = createSupabaseAdminClient();
        await admin.auth.admin.updateUserById(authData.user.id, {
          email_confirm: true,
          user_metadata: {
            full_name: data.fullName,
            role: data.role,
            university_name: data.universityName,
            company_name: data.companyName,
            permissions: data.permissions,
          },
        });
        await ensureRoleProfile(authData.user.id, data.role, data.fullName, {
          companyName: data.companyName,
          industry: data.industry,
          major: data.major,
          organizationId: data.organizationId,
          universityName: data.universityName,
          status,
          permissions: data.permissions,
        });
      } catch (e) {
        console.warn('register admin provisioning failed', e);
      }
    } else {
      await supabase.from('profiles').update({
        roles: [data.role],
        active_role: data.role,
        full_name: data.fullName,
        status,
      }).eq('id', authData.user.id);
    }

    if (needsApproval || data.skipAutoLogin || status === 'pending') {
      return {
        pending: true,
        message: 'تم إنشاء الحساب — بانتظار موافقة مدير النظام قبل تسجيل الدخول',
        redirect: `/auth/login?email=${encodeURIComponent(data.email)}&role=${encodeURIComponent(data.role)}&pending=1`,
      };
    }

    const login = await supabaseLogin(data.email, data.password, data.role);
    if (login.user) {
      return {
        user: login.user,
        redirect: login.redirect,
        token: login.token,
      };
    }

    return {
      redirect: `/auth/login?email=${encodeURIComponent(data.email)}&role=${encodeURIComponent(data.role)}`,
    };
  }

  const result = registerUser({
    email: data.email,
    password: data.password,
    fullName: data.fullName,
    role: data.role,
    organizationId: data.organizationId,
    universityName: data.universityName,
    companyName: data.companyName,
    status,
    permissions: data.permissions,
  });
  if (result.error || !result.user) return { error: result.error ?? 'فشل التسجيل' };

  if (data.role === 'company' && result.user.organizationId) {
    try {
      const { initMemoryStore, memoryStore } = await import('@/backend/data/memory-store');
      initMemoryStore();
      if (!memoryStore.companies.some((c) => c.id === result.user!.organizationId || c.email === result.user!.email)) {
        memoryStore.companies.unshift({
          id: result.user.organizationId,
          name: data.companyName || data.fullName,
          email: result.user.email,
          logo: result.user.avatar,
          coverImage: '',
          industry: data.industry || 'Technology',
          location: 'Palestine',
          website: '',
          about: '',
          employees: 0,
          followers: 0,
          activeJobs: 0,
          verified: false,
          verificationStatus: 'pending',
          founded: new Date().getFullYear(),
        });
      }
    } catch {
      // ignore
    }
  }

  if (result.user.status === 'pending' || data.skipAutoLogin) {
    return {
      pending: true,
      message: needsApproval
        ? 'تم إنشاء الحساب — بانتظار موافقة مدير النظام قبل تسجيل الدخول'
        : 'تم إنشاء الحساب بنجاح',
      redirect: `/auth/login?email=${encodeURIComponent(data.email)}&role=${encodeURIComponent(data.role)}${needsApproval ? '&pending=1' : ''}`,
    };
  }

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
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.auth.signOut();
    // Revoke server-side sessions for the user when possible (covers mobile bearer tokens).
    if (user && hasSupabaseAdmin()) {
      try {
        const admin = createSupabaseAdminClient();
        // Scope 'global' invalidates refresh tokens / sessions for mobile + web.
        await admin.auth.admin.signOut(user.id, 'global');
      } catch {
        // Best-effort revocation; cookie/local clear still proceeds.
      }
    }
  }
  await clearSessionCookie();
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  if (useSupabaseAuth()) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!profile || String(profile.status) !== 'active') return null;
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

    // Fallback: cookie-bound custom app JWT (browser) — re-check live profile status.
    try {
      const { headers } = await import('next/headers');
      const h = await headers();
      const auth = h.get('authorization');
      if (auth?.startsWith('Bearer ')) {
        const { verifySession } = await import('@/backend/auth/session');
        const payload = await verifySession(auth.slice(7));
        if (payload) {
          const { createSupabaseAdminClient, hasSupabaseAdmin } = await import('@/backend/supabase/admin');
          if (hasSupabaseAdmin()) {
            const admin = createSupabaseAdminClient();
            const { data: profile } = await admin.from('profiles').select('*').eq('id', payload.userId).single();
            if (!profile || String(profile.status) !== 'active') return null;
            return {
              ...payload,
              role: (profile.active_role as UserRole) ?? payload.role,
              roles: (profile.roles as UserRole[]) ?? payload.roles,
              organizationId: profile.organization_id ? String(profile.organization_id) : undefined,
            };
          }
          return payload;
        }
      }
    } catch {
      // ignore
    }

    const { getSession } = await import('@/backend/auth/session');
    const cookieSession = await getSession();
    if (!cookieSession) return null;
    const { createSupabaseAdminClient, hasSupabaseAdmin } = await import('@/backend/supabase/admin');
    if (hasSupabaseAdmin()) {
      const admin = createSupabaseAdminClient();
      const { data: profile } = await admin.from('profiles').select('status, active_role, roles, organization_id, avatar_url, full_name').eq('id', cookieSession.userId).single();
      if (!profile || String(profile.status) !== 'active') return null;
      return {
        ...cookieSession,
        fullName: String(profile.full_name ?? cookieSession.fullName),
        role: (profile.active_role as UserRole) ?? cookieSession.role,
        roles: (profile.roles as UserRole[]) ?? cookieSession.roles,
        avatar: String(profile.avatar_url ?? cookieSession.avatar),
        organizationId: profile.organization_id ? String(profile.organization_id) : undefined,
      };
    }
    return cookieSession;
  }

  const { getSession } = await import('@/backend/auth/session');
  const session = await getSession();
  if (!session) return null;

  const user = getUserById(session.userId);
  if (!user || user.status !== 'active') return null;
  return session;
}
