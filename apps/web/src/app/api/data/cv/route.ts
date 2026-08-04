import { NextRequest } from 'next/server';
import { dataResponse, requireAuth } from '@/backend/data/api';
import { requireAnyRole } from '@/backend/auth/rbac';
import { createSupabaseServerClient } from '@/backend/supabase/server';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const user = await requireAuth();
    const requestedId = req.nextUrl.searchParams.get('userId');
    let targetId = user.userId;

    if (requestedId && requestedId !== user.userId) {
      await requireAnyRole('company', 'hr', 'admin');
      targetId = requestedId;
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('cv_files')
      .select('file_name, public_url, storage_path, created_at')
      .eq('user_id', targetId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      fileName: String(data.file_name),
      publicUrl: data.public_url ? String(data.public_url) : null,
      storagePath: String(data.storage_path),
      uploadedAt: String(data.created_at),
    };
  });
}
