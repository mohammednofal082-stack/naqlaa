import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const user = await requireAuth();
    const companyId = req.nextUrl.searchParams.get('companyId');
    const supabase = await createSupabaseServerClient();

    if (companyId) {
      const [{ count }, { data: mine }] = await Promise.all([
        supabase
          .from('company_follows')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId),
        supabase
          .from('company_follows')
          .select('company_id')
          .eq('company_id', companyId)
          .eq('user_id', user.userId)
          .maybeSingle(),
      ]);
      return { companyId, followers: count ?? 0, following: Boolean(mine) };
    }

    const { data, error } = await supabase
      .from('company_follows')
      .select('company_id')
      .eq('user_id', user.userId);
    if (error) throw error;
    return (data ?? []).map((r) => String(r.company_id));
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAuth();
    const body = await req.json();
    if (!body.companyId) throw new Error('INVALID_INPUT');
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('company_follows').upsert({
      user_id: user.userId,
      company_id: String(body.companyId),
    });
    if (error) throw error;
    return { following: true };
  });
}

export async function DELETE(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAuth();
    const body = await req.json();
    if (!body.companyId) throw new Error('INVALID_INPUT');
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('company_follows')
      .delete()
      .eq('user_id', user.userId)
      .eq('company_id', String(body.companyId));
    if (error) throw error;
    return { following: false };
  });
}
