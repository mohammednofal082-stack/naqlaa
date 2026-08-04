import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET() {
  return dataResponse(async () => {
    await requireAnyRole('admin');
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('content_reports')
      .select('*, reporter:reporter_id(full_name, email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => {
      const reporter = row.reporter as { full_name?: string; email?: string } | null;
      return {
        id: String(row.id),
        type: String(row.target_type),
        target: String(row.target_label || row.target_id || ''),
        targetId: row.target_id ? String(row.target_id) : null,
        reporter: reporter?.full_name || reporter?.email || '—',
        reason: String(row.reason),
        status: String(row.status) as 'pending' | 'reviewed' | 'banned',
        date: String(row.created_at).slice(0, 10),
        link: row.link ? String(row.link) : undefined,
      };
    });
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAuth();
    const body = await req.json();
    if (!body.reason || !body.targetType) throw new Error('INVALID_INPUT');
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('content_reports')
      .insert({
        reporter_id: user.userId,
        target_type: String(body.targetType),
        target_id: body.targetId ? String(body.targetId) : null,
        target_label: String(body.targetLabel ?? body.targetId ?? ''),
        reason: String(body.reason),
        link: body.link ? String(body.link) : null,
        status: 'pending',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  });
}

export async function PATCH(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAnyRole('admin');
    const body = await req.json();
    if (!body.id || !body.status) throw new Error('INVALID_INPUT');
    const status = String(body.status);
    if (!['pending', 'reviewed', 'banned'].includes(status)) throw new Error('INVALID_INPUT');

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('content_reports')
      .update({
        status,
        resolved_at: status === 'pending' ? null : new Date().toISOString(),
        resolved_by: user.userId,
      })
      .eq('id', body.id)
      .select()
      .single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
      actor_id: user.userId,
      action: `moderation.${status}`,
      entity_type: 'content_report',
      entity_id: String(body.id),
      metadata: { target_type: data.target_type, target_id: data.target_id },
    });

    if (status === 'banned' && data.target_type === 'profile' && data.target_id) {
      await supabase.from('profiles').update({ status: 'suspended' }).eq('id', data.target_id);
    }

    return data;
  });
}
