import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { createServerClient } from '@supabase/ssr';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'naqlah-dev-secret-change-in-production-2025'
);
const COOKIE_NAME = 'naqlah_session';

function useSupabaseAuth() {
  return (
    process.env.NEXT_PUBLIC_AUTH_PROVIDER === 'supabase' &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

async function refreshSupabaseSession(req: NextRequest, res: NextResponse) {
  const supabase = createServerClient(
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
  await supabase.auth.getUser();
  return res;
}

const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register', '/api/auth/login', '/api/auth/register'];
const AUTH_PATHS = ['/auth/login', '/auth/register'];

async function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { role?: string };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(req);
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL(`/dashboard/${session.role}`, req.url));
  }

  if (!session && (pathname.startsWith('/dashboard') || pathname.startsWith('/feed') || pathname.startsWith('/messages') || pathname.startsWith('/journey') || pathname.startsWith('/ai'))) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && pathname.startsWith('/dashboard/')) {
    const roleSegment = pathname.split('/')[2];
    if (roleSegment && roleSegment !== session.role && session.role !== 'admin') {
      const sharedRoutes = ['jobs', 'internships', 'courses', 'events', 'messages', 'notifications', 'profile', 'settings', 'search', 'ai', 'applications', 'saved', 'projects', 'feed', 'community'];
      if (!sharedRoutes.includes(roleSegment)) {
        return NextResponse.redirect(new URL(`/dashboard/${session.role}`, req.url));
      }
    }
  }

  return useSupabaseAuth() ? refreshSupabaseSession(req, NextResponse.next()) : NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
