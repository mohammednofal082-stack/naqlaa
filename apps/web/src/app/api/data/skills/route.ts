import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET() {
  return dataResponse(async () => {
    await requireAuth();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('skills_catalog')
      .select('*')
      .order('demand', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      category: String(r.category),
      demand: Number(r.demand),
    }));
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAnyRole('admin');
    const body = await req.json();
    if (!body.name) throw new Error('INVALID_INPUT');
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('skills_catalog')
      .upsert(
        {
          name: String(body.name).trim(),
          category: String(body.category ?? 'technical'),
          demand: Number(body.demand ?? 50),
        },
        { onConflict: 'name' }
      )
      .select()
      .single();
    if (error) throw error;
    return {
      id: String(data.id),
      name: String(data.name),
      category: String(data.category),
      demand: Number(data.demand),
    };
  });
}

export async function DELETE(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAnyRole('admin');
    const id = req.nextUrl.searchParams.get('id');
    const name = req.nextUrl.searchParams.get('name');
    if (!id && !name) throw new Error('INVALID_INPUT');
    const supabase = await createSupabaseServerClient();
    let q = supabase.from('skills_catalog').delete();
    if (id) q = q.eq('id', id);
    else q = q.eq('name', name!);
    const { error } = await q;
    if (error) throw error;
    return { ok: true };
  });
}
