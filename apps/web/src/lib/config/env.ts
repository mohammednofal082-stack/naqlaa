export type DataProvider = 'mock' | 'supabase';
export type AuthProvider = 'mock' | 'supabase';

function env(key: string, fallback = ''): string {
  return process.env[key]?.trim() || fallback;
}

export const envConfig = {
  dataProvider: env('NEXT_PUBLIC_DATA_PROVIDER', 'mock') as DataProvider,
  authProvider: env('NEXT_PUBLIC_AUTH_PROVIDER', 'mock') as AuthProvider,

  supabase: {
    url: env('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: env('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: env('SUPABASE_SERVICE_ROLE_KEY'),
  },

  jwtSecret: env('JWT_SECRET', 'naqlah-dev-secret-change-in-production-2025'),

  openai: {
    apiKey: env('OPENAI_API_KEY'),
    model: env('OPENAI_MODEL', 'gpt-4o-mini'),
  },
};

export function isSupabaseConfigured(): boolean {
  return Boolean(envConfig.supabase.url && envConfig.supabase.anonKey);
}

export function useSupabaseData(): boolean {
  return envConfig.dataProvider === 'supabase' && isSupabaseConfigured();
}

export function useSupabaseAuth(): boolean {
  return envConfig.authProvider === 'supabase' && isSupabaseConfigured();
}
