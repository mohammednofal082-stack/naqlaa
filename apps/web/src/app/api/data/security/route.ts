import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';

const KEY = 'security_policies';

export async function GET() {
  return dataResponse(async () => {
    await requireAnyRole('admin');
    const supabase = await createSupabaseServerClient();
    const { data: setting } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', KEY)
      .maybeSingle();

    const { data: audits } = await supabase
      .from('audit_logs')
      .select('*, actor:actor_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(20);

    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    return {
      policies: (setting?.value as Record<string, boolean>) ?? {
        twoFactor: true,
        logIp: true,
        rateLimit: true,
        encryption: true,
      },
      events: (audits ?? []).map((row) => ({
        id: String(row.id),
        message: String(row.action),
        actor: (row.actor as { full_name?: string } | null)?.full_name ?? '—',
        entity: `${row.entity_type ?? ''} ${row.entity_id ?? ''}`.trim(),
        time: String(row.created_at),
        severity: String(row.action).includes('ban') || String(row.action).includes('reject')
          ? 'high'
          : String(row.action).includes('update') || String(row.action).includes('moderation')
            ? 'medium'
            : 'low',
      })),
      stats: {
        users: usersCount ?? 0,
        alerts: (audits ?? []).filter((a) => String(a.action).includes('ban') || String(a.action).includes('reject')).length,
      },
    };
  });
}

export async function PUT(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAnyRole('admin');
    await requireAuth();
    const body = await req.json();
    const policies = body.policies ?? body;
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('platform_settings')
      .upsert({
        key: KEY,
        value: policies,
        updated_at: new Date().toISOString(),
        updated_by: user.userId,
      })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
      actor_id: user.userId,
      action: 'security.policies_updated',
      entity_type: 'platform_settings',
      entity_id: KEY,
      metadata: policies,
    });

    return data?.value ?? policies;
  });
}
