import { NextResponse } from 'next/server';
import { getRepositories } from '@/backend/data';
import { envConfig, useSupabaseData } from '@/backend/config/env';
import { getCurrentUser } from '@/backend/auth/provider';

const CORS_HEADERS: Record<string, string> = {
  // The web app is same-origin. Native Expo requests do not use browser CORS,
  // so a wildcard would only expose bearer-token API responses to arbitrary
  // browser origins.
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  Vary: 'Origin',
};

export function corsOptions() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function withCors(res: NextResponse) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

function activeProvider(): 'supabase' | 'mock' | 'unconfigured' {
  if (useSupabaseData()) return 'supabase';
  if (envConfig.supabase.url || envConfig.supabase.anonKey) return 'unconfigured';
  return 'mock';
}

export async function dataResponse<T>(handler: () => Promise<T>) {
  try {
    const data = await handler();
    return withCors(
      NextResponse.json({
        data,
        provider: activeProvider(),
      })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DATA_ERROR';
    const lower = message.toLowerCase();
    const supabaseDown =
      lower.includes('fetch failed') ||
      lower.includes('failed to fetch') ||
      lower.includes('network') ||
      lower.includes('econnrefused') ||
      lower.includes('enotfound') ||
      lower.includes('503') ||
      lower.includes('521') ||
      lower.includes('timeout');
    const status =
      message === 'SUPABASE_NOT_CONFIGURED' || message === 'SUPABASE_REQUIRED' || supabaseDown ? 503 :
      message === 'UNAUTHORIZED' ? 401 :
      message === 'FORBIDDEN' ? 403 :
      message === 'NOT_FOUND' ? 404 :
      message === 'ALREADY_APPLIED' ? 409 : 500;
    return withCors(
      NextResponse.json(
        {
          error:
            supabaseDown
              ? 'قاعدة البيانات غير متاحة حالياً — افتح مشروع Supabase واضغط Restore إن كان متوقفاً، ثم أعد تحميل الصفحة'
              : message === 'SUPABASE_NOT_CONFIGURED' || message === 'SUPABASE_REQUIRED'
              ? 'Supabase غير مُعدّ — أضف المفاتيح في .env.local'
              : message === 'ALREADY_APPLIED'
                ? 'لقد تقدمت مسبقاً على هذه الفرصة'
                : message === 'UNAUTHORIZED'
                  ? 'يجب تسجيل الدخول'
                  : message === 'FORBIDDEN'
                    ? 'ليس لديك صلاحية لهذا الإجراء'
                    : 'فشل العملية',
          code: supabaseDown ? 'SUPABASE_UNAVAILABLE' : message,
          provider: activeProvider(),
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
