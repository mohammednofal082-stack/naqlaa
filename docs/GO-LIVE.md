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

ثم:

```bash
cd apps/web
npm run dev
```

تحقق: `http://localhost:3000/api/data/jobs` → `"provider":"supabase"` وبيانات من الـ seed.

أنشئ حساباً من `/auth/register` (طالب) ثم جرّب الوظائف و`/market` وTalent Pools بعد دخول شركة.

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
- Storage لرفع CV
- Push notifications على الموبايل
- توسيع جداول الدروس/الكويز المنفصلة

هذه لا تمنع عرض الـ MVP للجنة إذا الواجهات والخوارزميات شغّالة.
