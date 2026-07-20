import { useSupabaseData } from '@/lib/config/env';
import { mockRepositories } from './mock';
import { supabaseRepositories } from './supabase';
import type { DataRepositories } from './types';

export function getRepositories(): DataRepositories {
  if (useSupabaseData()) return supabaseRepositories;
  return mockRepositories;
}

export type { DataRepositories, JobWithCompany, InternshipWithCompany, ApplicationWithDetails, UserProfileBundle, UserSettings, ApplyInput, CreateJobInput } from './types';
export { dataClient } from './client';
