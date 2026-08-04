import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    await requireAuth();
    const requestId = req.nextUrl.searchParams.get('internshipRequestId');
    const supabase = await createSupabaseServerClient();
    let q = supabase.from('internship_evaluations').select('*').order('created_at', { ascending: false });
    if (requestId) q = q.eq('internship_request_id', requestId);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAnyRole('company', 'university', 'hr', 'admin');
    const body = await req.json();
    const role = user.role === 'university' ? 'university' : 'company';
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('internship_evaluations').insert({
      internship_request_id: body.internshipRequestId,
      evaluator_role: body.evaluatorRole ?? role,
      evaluator_id: user.userId,
      score: body.score != null ? Number(body.score) : null,
      comments: body.comments ?? null,
      approved: body.approved ?? null,
    }).select().single();
    if (error) throw error;

    if (body.approved === true && (body.evaluatorRole === 'university' || role === 'university')) {
      await supabase.from('internship_requests').update({ status: 'completed' }).eq('id', body.internshipRequestId);
    }

    return data;
  });
}
