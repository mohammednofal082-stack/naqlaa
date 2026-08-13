# تجهيز نقلة للجنة — خطوة بخطوة

الترتيب الصحيح من الصفر حتى العرض.

## أ) قاعدة البيانات (مرة واحدة)

في Supabase → **SQL Editor** نفّذ بالترتيب (Run لكل ملف):

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_talent_pools.sql`
3. `supabase/migrations/003_operations.sql` ← تقارير تدريب، شراكات، تقييمات، تسجيل فعاليات/QR
4. `supabase/migrations/004_rls_demo.sql` ← صلاحيات قراءة للعرض
5. `supabase/seed.sql` ← شركات/وظائف/كورسات/فعاليات/Talent Pools تجريبية

تحقق من **Table Editor**: لازم تشوف `jobs`, `companies`, `talent_pools`, `partnerships`, …

## ب) البيئة المحلية

في `apps/web/.env.local`:

```env
NEXT_PUBLIC_DATA_PROVIDER=supabase
NEXT_PUBLIC_AUTH_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=naqlah-mvp-change-me-please-2026
```

ثم نفّذ أيضاً (مرة واحدة):

1. `supabase/migrations/005_jobs_write_rls.sql`
2. `supabase/migrations/006_write_rls.sql`
3. `supabase/migrations/007_storage_courses.sql`
4. `supabase/migrations/008_signup_role_trigger.sql`
5. `supabase/migrations/009_full_platform.sql`
6. `supabase/migrations/010_skills_sessions.sql`
7. `supabase/migrations/011_feed_social.sql`
8. `supabase/migrations/012_comments_moderation.sql`
9. إنشاء Storage bucket باسم `cvs`
10. من جذر المشروع: `npm run seed:demo-users` ← ينشئ 8 حسابات Auth + طلبات تجريبية

**قبل المناقشة (مهم):** إذا ظهر خطأ Migrations أو أعمدة ناقصة، شغّل مرة واحدة في SQL Editor:

- `supabase/scripts/defense_repair_013_015.sql`
- اختياري للصور/مرفقات الرسائل: bucket `media` أو `supabase/scripts/create_media_bucket.sql`

ثم:

```bash
cd apps/web
npm run dev
```

تحقق: `http://localhost:3000/api/data/jobs` → `"provider":"supabase"` وبيانات من الـ seed.

دخول تجريبي: `student@naqlah.ps` / `Naqlah@2025` (بعد سكربت الحسابات).

## ج) Vercel (عرض للدكتور)

1. Root Directory = `apps/web`
2. نفس متغيرات البيئة أعلاه (أو اترك `mock` إذا ما شغّلت SQL بعد)
3. Redeploy بدون Build Cache

للعرض السريع بدون DB: اترك `mock` — المنصة كاملة واجهات.

## د) ماذا يغطي هذا التجهيز؟

| مطلب | جاهز |
|------|------|
| Talent Pools | نعم (جدول + صفحة + API) |
| Job Market Analysis | نعم (`/market` من jobs/internships) |
| 8 أدوار + workflows | نعم |
| تقارير تدريب / شراكات / تقييمات | جداول + adapters |
| عربي/إنجليزي | نعم |
| Seed للعرض | نعم |

## هـ) ما زال اختيارياً لاحقاً

- Supabase Realtime للرسائل
- Push notifications على الموبايل
- Email verification كامل + قوالب بريد مخصّصة (Resend)
- Pagination و rate limiting و اختبارات CI
- المدفوعات / الاشتراكات
- مقابلات فيديو داخل المنصة

**مضاف في هذا التجهيز:** Storage لـ CV (`cvs` + `cv_files`)، وحدات/دروس الكورس، كويزات/تقييمات، صور المنشورات ومرفقات الرسائل، تسجيل حضور فعاليات عبر QR، واستعادة كلمة المرور عبر Supabase Auth.

هذه لا تمنع عرض الـ MVP للجنة إذا الواجهات والخوارزميات شغّالة مع Supabase.
