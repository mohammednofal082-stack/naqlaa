import { useSupabaseData } from '@/backend/config/env';
import { supabaseRepositories } from './supabase';
import type { DataRepositories } from './types';

export function getRepositories(): DataRepositories {
  if (!useSupabaseData()) {
    throw new Error(
      'SUPABASE_REQUIRED: Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local',
    );
  }
  return supabaseRepositories;
}

export type { DataRepositories, JobWithCompany, InternshipWithCompany, ApplicationWithDetails, UserProfileBundle, UserSettings, ApplyInput, CreateJobInput } from './types';
export { dataClient } from './client';
