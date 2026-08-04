import { NextRequest } from 'next/server';
import { mutationResponse, dataResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    await requireAuth();
    const applicationId = req.nextUrl.searchParams.get('applicationId');
    const supabase = await createSupabaseServerClient();
    let q = supabase.from('interview_evaluations').select('*').order('created_at', { ascending: false });
    if (applicationId) q = q.eq('application_id', applicationId);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAnyRole('hr', 'company', 'admin');
    const body = await req.json();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('interview_evaluations').insert({
      application_id: body.applicationId,
      evaluator_id: user.userId,
      score: body.score != null ? Number(body.score) : null,
      strengths: body.strengths ?? null,
      weaknesses: body.weaknesses ?? null,
      recommendation: body.recommendation ?? null,
      notes: body.notes ?? null,
    }).select().single();
    if (error) throw error;
    return data;
  });
}
