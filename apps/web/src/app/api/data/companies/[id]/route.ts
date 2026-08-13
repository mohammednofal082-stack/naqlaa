import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';
import { mapCompany } from '@/backend/data/mappers';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return dataResponse(() => getRepo().getCompanyById(id));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return mutationResponse(async () => {
    const user = await requireAuth();
    await requireAnyRole('company', 'hr', 'admin');
    const body = await req.json();
    const supabase = await createSupabaseServerClient();
    const { data: company } = await supabase.from('companies').select('owner_id').eq('id', id).maybeSingle();
    if (!company) throw new Error('NOT_FOUND');
    if (user.role !== 'admin' && String(company.owner_id) !== user.userId && user.organizationId !== id) {
      throw new Error('FORBIDDEN');
    }
    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) patch.name = String(body.name);
    if (body.industry !== undefined) patch.industry = String(body.industry);
    if (body.about !== undefined) patch.description = String(body.about);
    if (body.description !== undefined) patch.description = String(body.description);
    if (body.website !== undefined) patch.website = String(body.website);
    if (body.location !== undefined) patch.location = String(body.location);
    if (body.logo !== undefined) patch.logo_url = String(body.logo);
    if (body.coverImage !== undefined) patch.cover_url = String(body.coverImage);
    if (body.email !== undefined) patch.email = String(body.email);
    if (body.employees !== undefined) patch.employees_count = Number(body.employees);
    if (body.founded !== undefined) patch.founded_year = Number(body.founded);
    const { data, error } = await supabase.from('companies').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return mapCompany(data as Record<string, unknown>);
  });
}
