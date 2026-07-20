import { NextRequest, NextResponse } from 'next/server';
import { registerNewUser } from '@/lib/auth/provider';
import { validateEmail, validatePassword } from '@/lib/auth/password';
import { type UserRole } from '@careerlink/shared';

const ALLOWED_ROLES: UserRole[] = ['student', 'graduate', 'company', 'trainer', 'mentor'];

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, role, university, major, companyName, industry } =
      await req.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'جميع الحقول المطلوبة يجب تعبئتها' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 });
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.errors[0] }, { status: 400 });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'نوع الحساب غير مدعوم للتسجيل الذاتي' }, { status: 400 });
    }

    const result = await registerNewUser({
      email,
      password,
      fullName,
      role,
      organizationId: role === 'company' ? `comp-${Date.now()}` : university,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    if (!result.user) {
      return NextResponse.json({
        redirect: result.redirect ?? '/auth/login',
        message: 'تم إنشاء حسابك — يمكنك تسجيل الدخول',
      });
    }

    const user = result.user;
    const activeRole = user.role;

    return NextResponse.json({
      user: {
        id: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: activeRole,
        avatar: user.avatar,
      },
      redirect: result.redirect,
      message: 'تم إنشاء حسابك بنجاح',
    });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
