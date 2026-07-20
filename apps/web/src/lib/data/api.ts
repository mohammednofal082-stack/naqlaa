import { NextResponse } from 'next/server';
import { getRepositories } from '@/lib/data';
import { envConfig } from '@/lib/config/env';
import { getCurrentUser } from '@/lib/auth/provider';

export async function dataResponse<T>(handler: () => Promise<T>) {
  try {
    const data = await handler();
    return NextResponse.json({
      data,
      provider: envConfig.dataProvider,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DATA_ERROR';
    const status =
      message === 'SUPABASE_NOT_CONFIGURED' ? 503 :
      message === 'UNAUTHORIZED' ? 401 :
      message === 'NOT_FOUND' ? 404 :
      message === 'ALREADY_APPLIED' ? 409 : 500;
    return NextResponse.json(
      {
        error:
          message === 'SUPABASE_NOT_CONFIGURED'
            ? 'Supabase غير مُعدّ — أضف المفاتيح في .env.local'
            : message === 'ALREADY_APPLIED'
              ? 'لقد تقدمت مسبقاً على هذه الفرصة'
              : message === 'UNAUTHORIZED'
                ? 'يجب تسجيل الدخول'
                : 'فشل العملية',
        code: message,
      },
      { status }
    );
  }
}

export async function mutationResponse<T>(handler: () => Promise<T>) {
  return dataResponse(handler);
}

export function getRepo() {
  return getRepositories();
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}
