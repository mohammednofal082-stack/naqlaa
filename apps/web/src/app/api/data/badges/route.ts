import { NextRequest } from 'next/server';
import { dataResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const user = await requireAuth();
    const targetId = req.nextUrl.searchParams.get('userId') || user.userId;
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('user_badges')
      .select('awarded_at, badges(*)')
      .eq('user_id', targetId);
    if (error) throw error;
    return (data ?? []).map((row) => {
      const b = row.badges as unknown as Record<string, unknown> | null;
      return {
        awardedAt: String(row.awarded_at),
        code: b ? String(b.code) : '',
        nameAr: b ? String(b.name_ar) : '',
        nameEn: b ? String(b.name_en) : '',
        description: b ? String(b.description ?? '') : '',
      };
    });
  });
}
