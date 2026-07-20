# قائمة تحقق Supabase

1. أنشئ مشروعًا على supabase.com
2. انسخ URL + anon + service_role من Settings → API
3. نفّذ SQL: الصق `001_initial_schema.sql` ثم `002_talent_pools.sql` في SQL Editor
   - المسارات: `supabase/migrations/001_initial_schema.sql` و `supabase/migrations/002_talent_pools.sql`
4. املأ `apps/web/.env.local` واضبط كلا الـ PROVIDER إلى `supabase`
5. أعد تشغيل `npm run dev`
6. تحقق أن `/api/data/jobs` يعرض provider = supabase
7. اختياري: أنشئ أول مستخدم عبر `/auth/register`