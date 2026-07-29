import { createBrowserClient } from '@supabase/ssr';
import { envConfig, isSupabaseConfigured } from '@/backend/config/env';

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }
  return createBrowserClient(envConfig.supabase.url, envConfig.supabase.anonKey);
}
