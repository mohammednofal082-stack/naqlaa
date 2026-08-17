export type DataProvider = 'mock' | 'supabase';
export type AuthProvider = 'mock' | 'supabase';

function env(key: string, fallback = ''): string {
  return process.env[key]?.trim() || fallback;
}

const supabaseUrl = env('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = env('NEXT_PUBLIC_SUPABASE_ANON_KEY');

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/** Always use Supabase when keys are present. Mock is only for incomplete local setup. */
function resolveDataProvider(): DataProvider {
  if (process.env.NODE_ENV === 'production' && !isSupabaseConfigured()) {
    throw new Error('SUPABASE_REQUIRED_IN_PRODUCTION');
  }
  if (isSupabaseConfigured()) return 'supabase';
  return 'mock';
}

function resolveAuthProvider(): AuthProvider {
  if (process.env.NODE_ENV === 'production' && !isSupabaseConfigured()) {
    throw new Error('SUPABASE_REQUIRED_IN_PRODUCTION');
  }
  if (isSupabaseConfigured()) return 'supabase';
  return 'mock';
}

export const envConfig = {
  get dataProvider(): DataProvider {
    return resolveDataProvider();
  },
  get authProvider(): AuthProvider {
    return resolveAuthProvider();
  },

  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceRoleKey: env('SUPABASE_SERVICE_ROLE_KEY'),
  },

  jwtSecret: env('JWT_SECRET', 'naqlah-dev-secret-change-in-production-2025'),

  openai: {
    apiKey: env('OPENAI_API_KEY'),
    model: env('OPENAI_MODEL', 'gpt-4o-mini'),
  },
};

export function useSupabaseData(): boolean {
  return resolveDataProvider() === 'supabase' && isSupabaseConfigured();
}

export function useSupabaseAuth(): boolean {
  return resolveAuthProvider() === 'supabase' && isSupabaseConfigured();
}

export function requireSupabaseData(): void {
  if (!useSupabaseData()) {
    throw new Error(
      'SUPABASE_REQUIRED: Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and NEXT_PUBLIC_DATA_PROVIDER=supabase',
    );
  }
}
