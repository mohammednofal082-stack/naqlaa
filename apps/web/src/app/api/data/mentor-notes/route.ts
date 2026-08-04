import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET() {
  return dataResponse(async () => {
    const user = await requireAuth();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('mentor_notes')
      .select('*')
      .eq('mentor_id', user.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: String(r.id),
      title: String(r.title),
      body: String(r.body ?? ''),
      menteeId: r.mentee_id ? String(r.mentee_id) : null,
      sessionId: r.session_id ? String(r.session_id) : null,
      createdAt: String(r.created_at),
    }));
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAnyRole('mentor', 'admin');
    const body = await req.json();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('mentor_notes').insert({
      mentor_id: user.userId,
      title: String(body.title ?? 'ملاحظة'),
      body: String(body.body ?? ''),
      mentee_id: body.menteeId ?? null,
      session_id: body.sessionId ?? null,
    }).select().single();
    if (error) throw error;
    return data;
  });
}
