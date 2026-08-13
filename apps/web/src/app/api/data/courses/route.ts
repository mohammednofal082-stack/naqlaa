import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requirePermission } from '@/backend/auth/rbac';
import { mapCourse } from '@/backend/data/mappers';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const mine = req.nextUrl.searchParams.get('mine') === '1';
    if (!mine) return getRepo().getCourses();

    const user = await requireAuth();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('trainer_id', user.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapCourse(row as Record<string, unknown>));
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requirePermission('course.create');
    const body = await req.json();
    if (!body.title) throw new Error('INVALID_INPUT');
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('courses')
      .insert({
        trainer_id: user.userId,
        title: String(body.title),
        description: body.description ? String(body.description) : '',
        category: body.category ? String(body.category) : 'عام',
        level: body.level ? String(body.level) : 'beginner',
        duration: body.duration ? String(body.duration) : '',
        status: body.status === 'published' ? 'published' : 'draft',
        certificate_enabled: body.certificateEnabled !== false,
      })
      .select()
      .single();
    if (error) throw error;
    return mapCourse(data as Record<string, unknown>);
  });
}

export async function PATCH(req: NextRequest) {
  return mutationResponse(async () => {
    await requirePermission('course.create');
    const body = await req.json();
    if (!body.id) throw new Error('INVALID_INPUT');
    const supabase = await createSupabaseServerClient();
    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) patch.title = String(body.title);
    if (body.description !== undefined) patch.description = String(body.description);
    if (body.category !== undefined) patch.category = String(body.category);
    if (body.level !== undefined) patch.level = String(body.level);
    if (body.duration !== undefined) patch.duration = String(body.duration);
    if (body.status !== undefined) patch.status = String(body.status);
    if (body.certificateEnabled !== undefined) patch.certificate_enabled = Boolean(body.certificateEnabled);
    if (body.modulesCount !== undefined) patch.modules_count = Number(body.modulesCount);
    const { data, error } = await supabase.from('courses').update(patch).eq('id', body.id).select().single();
    if (error) throw error;
    return mapCourse(data as Record<string, unknown>);
  });
}
