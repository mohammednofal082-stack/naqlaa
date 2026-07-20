import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth/provider';
import { validateEmail } from '@/lib/auth/password';
import type { UserRole } from '@careerlink/shared';

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 });
    }

    const result = await loginUser(email, password, role as UserRole | undefined);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: result.user!.userId,
        email: result.user!.email,
        fullName: result.user!.fullName,
        role: result.user!.role,
        roles: result.user!.roles,
        avatar: result.user!.avatar,
      },
      redirect: result.redirect,
    });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
