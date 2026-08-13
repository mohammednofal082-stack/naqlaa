import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const user = await requireAuth();
    const assessmentId = req.nextUrl.searchParams.get('assessmentId');
    const supabase = await createSupabaseServerClient();

    const isReviewer = ['hr', 'company', 'admin'].includes(user.role);
    let q = supabase
      .from('assessment_submissions')
      .select('*, profiles:student_id(full_name, email)')
      .order('created_at', { ascending: false });
    if (assessmentId) q = q.eq('assessment_id', assessmentId);
    if (!isReviewer) q = q.eq('student_id', user.userId);
    else await requireAnyRole('hr', 'company', 'admin');

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((row) => {
      const profile = row.profiles as { full_name?: string; email?: string } | null;
      return {
        id: String(row.id),
        assessmentId: String(row.assessment_id),
        studentId: String(row.student_id),
        studentName: profile?.full_name ?? '',
        studentEmail: profile?.email ?? '',
        content: String(row.content ?? ''),
        score: row.score != null ? Number(row.score) : null,
        feedback: row.feedback ? String(row.feedback) : null,
        status: String(row.status ?? 'submitted'),
        createdAt: String(row.created_at),
      };
    });
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAuth();
    const body = await req.json();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('assessment_submissions').insert({
      assessment_id: body.assessmentId,
      application_id: body.applicationId ?? null,
      student_id: user.userId,
      content: body.content ?? '',
      score: body.score != null ? Number(body.score) : null,
      feedback: body.feedback ?? null,
      status: 'submitted',
    }).select().single();
    if (error) throw error;
    return data;
  });
}

export async function PATCH(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAnyRole('hr', 'company', 'admin');
    const body = await req.json();
    if (!body.id) throw new Error('INVALID_INPUT');
    const supabase = await createSupabaseServerClient();
    const patch: Record<string, unknown> = {};
    if (body.score !== undefined) patch.score = Number(body.score);
    if (body.feedback !== undefined) patch.feedback = String(body.feedback);
    if (body.status !== undefined) patch.status = String(body.status);
    const { data, error } = await supabase
      .from('assessment_submissions')
      .update(patch)
      .eq('id', body.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  });
}
