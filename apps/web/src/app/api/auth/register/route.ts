import { NextRequest, NextResponse } from 'next/server';
import { registerNewUser } from '@/backend/auth/provider';
import { validateEmail, validatePassword } from '@/backend/auth/password';
import {
  type UserRole,
  OTHER_UNIVERSITY_ID,
  resolveUniversityEmailDomain,
  isValidStuEmailForDomain,
  getUniversityById,
} from '@careerlink/shared';

const ALLOWED_ROLES: UserRole[] = ['student', 'graduate', 'company', 'university', 'trainer', 'mentor'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      fullName,
      role,
      university,
      universityName,
      major,
      companyName,
      industry,
      emailLocal,
    } = body;

    if (!password || !fullName || !role) {
      return NextResponse.json({ error: 'جميع الحقول المطلوبة يجب تعبئتها' }, { status: 400 });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'نوع الحساب غير مدعوم للتسجيل الذاتي' }, { status: 400 });
    }

    let finalEmail = String(email || '').trim().toLowerCase();

    if (role === 'student' || role === 'graduate') {
      if (!university) {
        return NextResponse.json({ error: 'يجب اختيار الجامعة' }, { status: 400 });
      }
      if (university === OTHER_UNIVERSITY_ID && !String(universityName || '').trim()) {
        return NextResponse.json({ error: 'أدخل اسم الجامعة بالإنجليزية' }, { status: 400 });
      }
      if (university !== OTHER_UNIVERSITY_ID && !getUniversityById(university)) {
        return NextResponse.json({ error: 'الجامعة غير معروفة' }, { status: 400 });
      }
      const domain = resolveUniversityEmailDomain(university, universityName);
      if (emailLocal) {
        finalEmail = `${String(emailLocal).trim().toLowerCase().replace(/@.*$/, '')}@${domain}.stu`;
      }
      if (!isValidStuEmailForDomain(finalEmail, domain)) {
        return NextResponse.json(
          { error: `يجب أن يكون البريد الجامعي بالصيغة name@${domain}.stu` },
          { status: 400 },
        );
      }
    } else if (!finalEmail || !validateEmail(finalEmail)) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 });
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.errors[0] }, { status: 400 });
    }

    if (role === 'company' && !String(companyName || '').trim()) {
      return NextResponse.json({ error: 'اسم الشركة مطلوب' }, { status: 400 });
    }

    if (role === 'university' && !String(universityName || companyName || '').trim()) {
      return NextResponse.json({ error: 'اسم الجامعة مطلوب (بالإنجليزية)' }, { status: 400 });
    }

    const orgId =
      role === 'company'
        ? undefined
        : role === 'university'
          ? undefined
          : university;

    const result = await registerNewUser({
      email: finalEmail,
      password,
      fullName,
      role,
      organizationId: orgId,
      companyName: role === 'company' ? companyName : undefined,
      industry: role === 'company' ? industry : undefined,
      major: major || undefined,
      universityName:
        role === 'university'
          ? String(universityName || companyName || '').trim()
          : university === OTHER_UNIVERSITY_ID
            ? String(universityName || '').trim()
            : getUniversityById(university)?.name,
    });

    if (result.error && !result.user && !result.pending) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    if (result.pending || !result.user) {
      return NextResponse.json({
        pending: Boolean(result.pending),
        redirect: result.redirect ?? '/auth/login',
        message:
          result.message ??
          (result.pending
            ? 'تم إنشاء الحساب — بانتظار موافقة مدير النظام'
            : 'تم إنشاء حسابك — سجّل الدخول بنفس البريد وكلمة المرور'),
      });
    }

    const user = result.user;

    return NextResponse.json({
      user: {
        id: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
      },
      redirect: result.redirect ?? `/dashboard/${user.role}`,
      message: 'تم إنشاء حسابك بنجاح — يمكنك استخدام المنصة الآن',
      token: result.token,
    });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
