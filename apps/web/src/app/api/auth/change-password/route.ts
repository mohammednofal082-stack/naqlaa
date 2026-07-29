import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { isSupabaseConfigured } from '@/backend/config/env';
import { getCurrentUser } from '@/backend/auth/provider';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const { password } = await req.json();
    if (!password || String(password).length < 8) {
      return NextResponse.json({ error: 'كلمة المرور قصيرة جداً' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase غير مُعدّ' }, { status: 503 });
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password: String(password) });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'فشل التحديث' }, { status: 500 });
  }
}
