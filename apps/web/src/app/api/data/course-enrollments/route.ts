import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const user = await requireAuth();
    const supabase = await createSupabaseServerClient();
    const courseId = req.nextUrl.searchParams.get('courseId');
    const scope = req.nextUrl.searchParams.get('scope');

    if (scope === 'trainer' || user.role === 'trainer' || user.role === 'admin') {
      await requireAnyRole('trainer', 'admin');
      let courseIds: string[] = [];
      if (courseId) {
        courseIds = [courseId];
      } else {
        const { data: courses } = await supabase
          .from('courses')
          .select('id')
          .eq('trainer_id', user.userId);
        courseIds = (courses ?? []).map((c) => String(c.id));
      }
      if (courseIds.length === 0) return [];
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*, profiles:student_id(id, full_name, email, avatar_url), courses(title)')
        .in('course_id', courseIds)
        .order('enrolled_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => {
        const profile = row.profiles as { id?: string; full_name?: string; email?: string; avatar_url?: string } | null;
        const course = row.courses as { title?: string } | null;
        return {
          id: String(row.id),
          courseId: String(row.course_id),
          courseTitle: course?.title ?? '',
          studentId: String(row.student_id),
          studentName: profile?.full_name ?? '',
          studentEmail: profile?.email ?? '',
          progress: Number(row.progress ?? 0),
          enrolledAt: String(row.enrolled_at),
        };
      });
    }

    let q = supabase.from('course_enrollments').select('*').eq('student_id', user.userId);
    if (courseId) q = q.eq('course_id', courseId);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  });
}

export async function PATCH(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAuth();
    const body = await req.json();
    if (!body.courseId) throw new Error('INVALID_INPUT');
    const supabase = await createSupabaseServerClient();
    const progress = Math.max(0, Math.min(100, Number(body.progress ?? 0)));
    const { data, error } = await supabase
      .from('course_enrollments')
      .update({ progress })
      .eq('course_id', body.courseId)
      .eq('student_id', user.userId)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const inserted = await supabase
        .from('course_enrollments')
        .insert({ course_id: body.courseId, student_id: user.userId, progress })
        .select()
        .single();
      if (inserted.error) throw inserted.error;
      return inserted.data;
    }
    return data;
  });
}
