import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requirePermission, requireAnyRole } from '@/backend/auth/rbac';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const courseId = req.nextUrl.searchParams.get('courseId');
    const supabase = await createSupabaseServerClient();
    let q = supabase.from('course_quizzes').select('*').order('created_at', { ascending: false });
    if (courseId) q = q.eq('course_id', courseId);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const body = await req.json();
    const supabase = await createSupabaseServerClient();

    if (body.action === 'submit') {
      const user = await requireAuth();
      const quizId = String(body.quizId);
      const answers = body.answers ?? [];
      const { data: quiz } = await supabase.from('course_quizzes').select('*').eq('id', quizId).single();
      if (!quiz) throw new Error('NOT_FOUND');
      const questions = (quiz.questions as Array<{ answer?: string }>) ?? [];
      let correct = 0;
      questions.forEach((q, i) => {
        if (String(answers[i] ?? '').trim().toLowerCase() === String(q.answer ?? '').trim().toLowerCase()) {
          correct += 1;
        }
      });
      const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
      const passed = score >= Number(quiz.pass_score ?? 60);
      const { data, error } = await supabase.from('quiz_attempts').insert({
        quiz_id: quizId,
        student_id: user.userId,
        score,
        answers,
        passed,
      }).select().single();
      if (error) throw error;
      if (passed) {
        const { data: badge } = await supabase.from('badges').select('id').eq('code', 'course_done').maybeSingle();
        if (badge?.id) await supabase.from('user_badges').upsert({ user_id: user.userId, badge_id: badge.id });
      }
      return data;
    }

    await requirePermission('course.create');
    const { data, error } = await supabase.from('course_quizzes').insert({
      course_id: body.courseId,
      module_id: body.moduleId ?? null,
      title: String(body.title),
      questions: body.questions ?? [],
      pass_score: Number(body.passScore ?? 60),
    }).select().single();
    if (error) throw error;
    return data;
  });
}
