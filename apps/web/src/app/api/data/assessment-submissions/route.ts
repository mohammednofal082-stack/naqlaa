import { NextRequest } from 'next/server';
import { mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';

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
