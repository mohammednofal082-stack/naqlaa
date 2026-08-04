import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET() {
  return dataResponse(async () => {
    const user = await requireAuth();
    const supabase = await createSupabaseServerClient();
    let q = supabase.from('trainer_sessions').select('*').order('scheduled_at', { ascending: false });
    if (user.role === 'trainer') q = q.eq('trainer_id', user.userId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: String(r.id),
      trainerId: String(r.trainer_id),
      title: String(r.title),
      date: String(r.scheduled_at),
      attendees: Number(r.attendees ?? 0),
      status: String(r.status),
      meetingUrl: r.meeting_url ? String(r.meeting_url) : undefined,
    }));
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAnyRole('trainer', 'admin');
    const body = await req.json();
    if (!body.title || !body.date) throw new Error('INVALID_INPUT');
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('trainer_sessions')
      .insert({
        trainer_id: user.userId,
        title: String(body.title),
        scheduled_at: new Date(String(body.date)).toISOString(),
        attendees: Number(body.attendees ?? 0),
        status: body.status ?? 'scheduled',
        meeting_url: body.meetingUrl ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: String(data.id),
      trainerId: String(data.trainer_id),
      title: String(data.title),
      date: String(data.scheduled_at),
      attendees: Number(data.attendees ?? 0),
      status: String(data.status),
      meetingUrl: data.meeting_url ? String(data.meeting_url) : undefined,
    };
  });
}
