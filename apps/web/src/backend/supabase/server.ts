import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { envConfig, isSupabaseConfigured } from '@/backend/config/env';

async function readBearerToken(): Promise<string | null> {
  try {
    const h = await headers();
    const auth = h.get('authorization');
    if (auth?.startsWith('Bearer ')) return auth.slice(7).trim();
  } catch {
    // outside request context
  }
  return null;
}

/**
 * Prefer a Supabase access token from Authorization when present (Expo / native),
 * otherwise use the cookie-bound SSR client (web browser).
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured()) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const bearer = await readBearerToken();
  if (bearer) {
    const bearerClient = createClient(envConfig.supabase.url, envConfig.supabase.anonKey, {
      global: {
        headers: { Authorization: `Bearer ${bearer}` },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const { data: { user } } = await bearerClient.auth.getUser(bearer);
    if (user) return bearerClient;
  }

  const cookieStore = await cookies();
  return createServerClient(envConfig.supabase.url, envConfig.supabase.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — cookie writes may be ignored.
        }
      },
    },
  });
}
