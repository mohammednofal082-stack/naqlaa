import { createBrowserClient } from '@supabase/ssr';
import { envConfig, isSupabaseConfigured } from '@/lib/config/env';

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }
  return createBrowserClient(envConfig.supabase.url, envConfig.supabase.anonKey);
}
