import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { createServerClient } from '@supabase/ssr';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'naqlah-dev-secret-change-in-production-2025'
);
const COOKIE_NAME = 'naqlah_session';

function isSupabaseAuthEnabled() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) return false;
  // Prefer Supabase whenever keys exist (same rule as backend env)
  return true;
}

function createSupabaseProxyClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}

async function getLocalJwtSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { role?: string; userId?: string };
  } catch {
    return null;
  }
}

async function getSupabaseSession(req: NextRequest, res: NextResponse) {
  if (!isSupabaseAuthEnabled()) return null;
  const supabase = createSupabaseProxyClient(req, res);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_role, roles')
    .eq('id', user.id)
    .maybeSingle();

  const roles = (profile?.roles as string[] | null) ?? [];
  const role = String(profile?.active_role || roles[0] || user.user_metadata?.role || 'student');
  return { role, userId: user.id };
}

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  if (req.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.includes('.')
  ) {
    return res;
  }

  const localSession = await getLocalJwtSession(req);
  const supabaseSession = localSession ? null : await getSupabaseSession(req, res);
  const session = localSession ?? supabaseSession;
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (session && isAuthPage && !pathname.startsWith('/auth/reset-password')) {
    return NextResponse.redirect(new URL(`/dashboard/${session.role || 'student'}`, req.url));
  }

  if (
    !session &&
    (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/feed') ||
      pathname.startsWith('/messages') ||
      pathname.startsWith('/journey') ||
      pathname.startsWith('/ai'))
  ) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && pathname.startsWith('/dashboard/')) {
    const roleSegment = pathname.split('/')[2];
    if (roleSegment && roleSegment !== session.role && session.role !== 'admin') {
      const sharedRoutes = [
        'jobs', 'internships', 'courses', 'events', 'messages', 'notifications',
        'profile', 'settings', 'search', 'ai', 'applications', 'saved', 'projects',
        'feed', 'community', 'market', 'mentorship', 'workflows',
      ];
      if (!sharedRoutes.includes(roleSegment)) {
        return NextResponse.redirect(new URL(`/dashboard/${session.role}`, req.url));
      }
    }
  }

  // Keep Supabase cookies fresh on every request when configured
  if (isSupabaseAuthEnabled()) {
    const supabase = createSupabaseProxyClient(req, res);
    await supabase.auth.getUser();
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
