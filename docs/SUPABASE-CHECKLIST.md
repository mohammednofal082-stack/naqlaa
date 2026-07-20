# قائمة تحقق Supabase

1. أنشئ مشروعًا على supabase.com
2. انسخ URL + anon + service_role من Settings → API (أو Legacy JWT)
3. نفّذ SQL بالترتيب في SQL Editor:
   - `001_initial_schema.sql`
   - `002_talent_pools.sql`
   - `003_operations.sql`
   - `004_rls_demo.sql`
   - `seed.sql`
4. املأ `apps/web/.env.local` واضبط كلا الـ PROVIDER إلى `supabase`
5. أعد تشغيل `npm run dev`
6. تحقق أن `/api/data/jobs` يعرض provider = supabase وفيه وظائف من الـ seed
7. أنشئ مستخدمًا عبر `/auth/register`
8. الدليل الكامل: `docs/GO-LIVE.md`
