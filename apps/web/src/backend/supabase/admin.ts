import { createClient } from '@supabase/supabase-js';
import { envConfig, isSupabaseConfigured } from '@/backend/config/env';

/** Service-role client for Storage and privileged server writes. Never expose to the browser. */
export function createSupabaseAdminClient() {
  if (!isSupabaseConfigured() || !envConfig.supabase.serviceRoleKey) {
    throw new Error('SUPABASE_ADMIN_NOT_CONFIGURED');
  }
  return createClient(envConfig.supabase.url, envConfig.supabase.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function hasSupabaseAdmin(): boolean {
  return Boolean(isSupabaseConfigured() && envConfig.supabase.serviceRoleKey);
}
