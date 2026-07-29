import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient, hasSupabaseAdmin } from '@/backend/supabase/admin';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { isSupabaseConfigured } from '@/backend/config/env';
import { validateEmail } from '@/backend/auth/password';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'بريد غير صالح' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase غير مُعدّ — فعّل المفاتيح لإرسال رابط الاستعادة' },
        { status: 503 },
      );
    }

    const origin = req.nextUrl.origin;
    const redirectTo = `${origin}/auth/login`;

    if (hasSupabaseAdmin()) {
      const admin = createSupabaseAdminClient();
      const { error } = await admin.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Always return success to avoid email enumeration
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'فشل الطلب' }, { status: 500 });
  }
}
