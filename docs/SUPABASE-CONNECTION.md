# ربط نقلة بـ Supabase

المنصة جاهزة للعمل بدون قاعدة بيانات (وضع `mock`). لتشغيلها على Supabase، نفّذ الخطوات التالية فقط.

## 1. إنشاء مشروع Supabase

1. أنشئ مشروعاً جديداً على [supabase.com](https://supabase.com).
2. من **Project Settings → API** انسخ:
   - `Project URL`
   - `anon public` key
   - `service_role` key (سري — لا تضعه في الواجهة)

## 2. تشغيل الـ Schema

1. افتح **SQL Editor** في لوحة Supabase.
2. الصق محتوى الملفات بالترتيب:
   ```
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_talent_pools.sql
   ```
3. نفّذ السكربتات (Run).

> الجداول الأساسية: `profiles`, `student_profiles`, `companies`, `jobs`, `internships`, `applications`, `courses`, `events`, `notifications`, `feed_posts`, `conversations`, `messages`, وغيرها مع RLS.

## 3. إعداد البيئة

انسخ `apps/web/.env.example` إلى `apps/web/.env.local` واملأ:

```env
NEXT_PUBLIC_DATA_PROVIDER=supabase
NEXT_PUBLIC_AUTH_PROVIDER=supabase

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

JWT_SECRET=غيّر-هذا-في-الإنتاج
```

## 4. تشغيل التطبيق

```bash
cd apps/web
npm run dev
```

## 5. التحقق

| ما تختبره | النتيجة المتوقعة |
|-----------|------------------|
| `/jobs` | وظائف من Supabase (فارغة إن لم تُ seed) |
| `/auth/login` | تسجيل دخول عبر Supabase Auth |
| `/api/data/jobs` | `"provider": "supabase"` في JSON |
| بدون مفاتيح | رسالة `Supabase غير مُعدّ` |

## البنية الداخلية

```
الصفحات (React hooks)
    ↓  fetch /api/data/*
API Routes (apps/web/src/app/api/data/)
    ↓  getRepositories()
Mock  ← mock.ts + memory-store.ts   (الوضع الحالي)
Supabase ← supabase.ts              (بعد الربط)
```

**نقطة التبديل الوحيدة:** `NEXT_PUBLIC_DATA_PROVIDER` و `NEXT_PUBLIC_AUTH_PROVIDER`.

## Seed البيانات (اختياري)

بعد إنشاء الجداول، أضف بيانات تجريبية عبر SQL أو Supabase Dashboard، أو أنشئ مستخدمين عبر `/auth/register` ثم أضف وظائف/شركات من لوحات الشركة.

حساب تجريبي في وضع mock (للتطوير المحلي):

- البريد: `student@naqlah.ps`
- كلمة المرور: `Naqlah@2025`

## ملاحظات

- **لا تغيّر الكود** للربط — فقط `.env.local` + migration.
- بعض الكيانات المرجعية (جامعات، أقسام) ما زالت ثابتة في `@careerlink/shared` حتى إضافة جداول لها لاحقاً.
- `talent_pools` + `talent_pool_members` موجودة في migration رقم 002.
- جداول `partnerships`, `assessments`, `weekly_reports` غير موجودة بعد — الـ adapter يرجع `[]` أو يحتاج migration إضافي.
- **تحليل سوق العمل** (`/market`) يُحسب لحظياً من جدولي `jobs` و`internships` — لا يحتاج جداول إضافية.
