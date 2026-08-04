import { NextRequest } from 'next/server';
import { mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';

export async function PUT(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAuth();
    const body = await req.json();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('student_profiles').update({
      employment_status: body.employmentStatus ?? 'seeking',
      employment_company: body.employmentCompany ?? null,
      employment_title: body.employmentTitle ?? null,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.userId).select().single();
    if (error) throw error;
    return data;
  });
}
