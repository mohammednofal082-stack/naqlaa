import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET() {
  return dataResponse(async () => {
    const supabase = await createSupabaseServerClient();
    const { data: universities, error } = await supabase.from('universities').select('*, colleges(*, departments(*))').order('name');
    if (error) throw error;
    return universities ?? [];
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAnyRole('university', 'admin');
    await requireAuth();
    const body = await req.json();
    const supabase = await createSupabaseServerClient();

    if (body.type === 'college') {
      const { data, error } = await supabase.from('colleges').insert({
        university_id: body.universityId,
        name: body.name,
        code: body.code ?? null,
      }).select().single();
      if (error) throw error;
      return data;
    }

    if (body.type === 'department') {
      const { data, error } = await supabase.from('departments').insert({
        college_id: body.collegeId,
        name: body.name,
        code: body.code ?? null,
      }).select().single();
      if (error) throw error;
      return data;
    }

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
