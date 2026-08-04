import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const user = await requireAuth();
    const mentorId = req.nextUrl.searchParams.get('mentorId') || user.userId;
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('mentor_availability')
      .select('*')
      .eq('mentor_id', mentorId)
      .order('day_of_week');
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: String(r.id),
      mentorId: String(r.mentor_id),
      dayOfWeek: Number(r.day_of_week),
      startTime: String(r.start_time),
      endTime: String(r.end_time),
      isActive: Boolean(r.is_active),
    }));
  });
}

export async function PUT(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAnyRole('mentor', 'admin');
    const body = await req.json();
    const slots = Array.isArray(body.slots) ? body.slots : [];
    const supabase = await createSupabaseServerClient();
    await supabase.from('mentor_availability').delete().eq('mentor_id', user.userId);
    if (slots.length) {
      const rows = slots.map((s: { dayOfWeek: number; startTime: string; endTime: string; isActive?: boolean }) => ({
        mentor_id: user.userId,
        day_of_week: Number(s.dayOfWeek),
        start_time: String(s.startTime),
        end_time: String(s.endTime),
        is_active: s.isActive !== false,
      }));
      const { error } = await supabase.from('mentor_availability').insert(rows);
      if (error) throw error;
    }
    return { ok: true, count: slots.length };
  });
}
