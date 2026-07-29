import { NextResponse } from 'next/server';
import { getRepositories } from '@/backend/data';
import { envConfig } from '@/backend/config/env';
import { getCurrentUser } from '@/backend/auth/provider';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function corsOptions() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function withCors(res: NextResponse) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export async function dataResponse<T>(handler: () => Promise<T>) {
  try {
    const data = await handler();
    return withCors(
      NextResponse.json({
        data,
        provider: envConfig.dataProvider,
      })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DATA_ERROR';
    const status =
      message === 'SUPABASE_NOT_CONFIGURED' ? 503 :
      message === 'UNAUTHORIZED' ? 401 :
      message === 'NOT_FOUND' ? 404 :
      message === 'ALREADY_APPLIED' ? 409 : 500;
    return withCors(
      NextResponse.json(
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
      )
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
