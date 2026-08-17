import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';
import { getCurrentUser } from '@/backend/auth/provider';
import type { SessionPayload } from '@/backend/auth/session';

async function assertCollegeBelongsToOrg(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  user: SessionPayload,
  collegeId: string,
) {
  if (user.role === 'admin') return;
  const { data: college, error } = await supabase
    .from('colleges')
    .select('university_id')
    .eq('id', collegeId)
    .maybeSingle();
  if (error) throw error;
  if (!college || String(college.university_id) !== user.organizationId) {
    throw new Error('FORBIDDEN');
  }
}

export async function GET() {
  return dataResponse(async () => {
    const supabase = await createSupabaseServerClient();
    const user = await getCurrentUser();

    let query = supabase.from('universities').select('*, colleges(*, departments(*))').order('name');
    if (user?.role === 'university' && user.organizationId) {
      query = query.eq('id', user.organizationId);
    }

    const { data: universities, error } = await query;
    if (error) throw error;
    return universities ?? [];
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAnyRole('university', 'admin');
    const body = await req.json();
    const supabase = await createSupabaseServerClient();

    if (body.type === 'college') {
      const universityId = String(body.universityId ?? '');
      if (!universityId) throw new Error('INVALID_INPUT');
      if (user.role === 'university' && user.organizationId !== universityId) {
        throw new Error('FORBIDDEN');
      }
      const { data, error } = await supabase.from('colleges').insert({
        university_id: universityId,
        name: body.name,
        code: body.code ?? null,
      }).select().single();
      if (error) throw error;
      return data;
    }

    if (body.type === 'department') {
      const collegeId = String(body.collegeId ?? '');
      if (!collegeId) throw new Error('INVALID_INPUT');
      await assertCollegeBelongsToOrg(supabase, user, collegeId);
      const { data, error } = await supabase.from('departments').insert({
        college_id: collegeId,
        name: body.name,
        code: body.code ?? null,
      }).select().single();
      if (error) throw error;
      return data;
    }

    if (user.role !== 'admin') throw new Error('FORBIDDEN');
    const { data, error } = await supabase.from('universities').insert({
      name: body.name,
      name_en: body.nameEn ?? null,
      code: body.code ?? null,
      city: body.city ?? null,
    }).select().single();
    if (error) throw error;
    return data;
  });
}
