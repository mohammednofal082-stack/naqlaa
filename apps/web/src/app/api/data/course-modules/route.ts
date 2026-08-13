import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requirePermission } from '@/backend/auth/rbac';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const courseId = req.nextUrl.searchParams.get('courseId');
    if (!courseId) return [];
    const supabase = await createSupabaseServerClient();
    const { data: modules, error } = await supabase
      .from('course_modules')
      .select('*, course_lessons(*)')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (modules ?? []).map((m) => ({
      id: String(m.id),
      courseId: String(m.course_id),
      title: String(m.title),
      sortOrder: Number(m.sort_order),
      lessonsCount: Number(m.lessons_count ?? 0),
      lessons: ((m.course_lessons as Record<string, unknown>[]) ?? [])
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
        .map((l) => ({
          id: String(l.id),
          title: String(l.title),
          content: String(l.content ?? ''),
          videoUrl: l.video_url ? String(l.video_url) : '',
          durationMinutes: Number(l.duration_minutes ?? 10),
          sortOrder: Number(l.sort_order),
        })),
    }));
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requirePermission('course.create');
    await requireAuth();
    const body = await req.json();
    const supabase = await createSupabaseServerClient();

    if (body.type === 'lesson') {
      const { data, error } = await supabase
        .from('course_lessons')
        .insert({
          module_id: body.moduleId,
          title: body.title,
          content: body.content ?? '',
          video_url: body.videoUrl ?? null,
          duration_minutes: Number(body.durationMinutes ?? 10),
          sort_order: Number(body.sortOrder ?? 1),
        })
        .select()
        .single();
      if (error) throw error;
      const { count } = await supabase
        .from('course_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', body.moduleId);
      await supabase.from('course_modules').update({ lessons_count: count ?? 0 }).eq('id', body.moduleId);
      return data;
    }

    const { data, error } = await supabase
      .from('course_modules')
      .insert({
        course_id: body.courseId,
        title: body.title,
        sort_order: Number(body.sortOrder ?? 1),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  });
}

export async function PATCH(req: NextRequest) {
  return mutationResponse(async () => {
    await requirePermission('course.create');
    const body = await req.json();
    const supabase = await createSupabaseServerClient();
    if (body.type === 'lesson') {
      if (!body.id) throw new Error('INVALID_INPUT');
      const patch: Record<string, unknown> = {};
      if (body.title !== undefined) patch.title = String(body.title);
      if (body.content !== undefined) patch.content = String(body.content);
      if (body.videoUrl !== undefined) patch.video_url = body.videoUrl ? String(body.videoUrl) : null;
      if (body.durationMinutes !== undefined) patch.duration_minutes = Number(body.durationMinutes);
      const { data, error } = await supabase.from('course_lessons').update(patch).eq('id', body.id).select().single();
      if (error) throw error;
      return data;
    }
    if (!body.id) throw new Error('INVALID_INPUT');
    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) patch.title = String(body.title);
    const { data, error } = await supabase.from('course_modules').update(patch).eq('id', body.id).select().single();
    if (error) throw error;
    return data;
  });
}
