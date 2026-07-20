import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { envConfig, isSupabaseConfigured } from '@/lib/config/env';

export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
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
        }
      },
    },
  });
}
