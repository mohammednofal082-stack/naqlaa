# نقلة (Naqla)

منصة مهنية فلسطينية تربط طلاب وخريجي الجامعات بالوظائف، التدريبات، التعلم، والإرشاد.

| | |
|---|---|
| **الجامعة** | جامعة النجاح الوطنية |
| **النوع** | مشروع تخرج — ويب + موبايل |
| **الطلاب** | أمير أبو شمس · محمد نوفل |
| **Students** | Ameer Abu Shams · Mohammed Nofal |
| **البيانات** | PostgreSQL عبر Supabase فقط (بدون Mock) |

---

## نظرة عامة

- طلاب وخريجون: ملف، تطابق، أدوات جاهزية، تقديمات
- شركات وموارد بشرية: إعلانات، مسار توظيف، talent pools
- جامعات: تدريبات، فعاليات، شراكات
- مدربون وموجهون: دورات وجلسات
- إدارة: تحقق، إشراف، سجلات

واجهة عربية / إنجليزية، RTL/LTR، ويب وموبايل.

---

## هيكل المشروع

```text
naqla/
├── apps/web/          # Next.js (واجهة + API)
│   └── src/backend/   # Auth + مستودعات البيانات + Supabase
├── apps/mobile/       # Expo (يتصل بنفس API)
├── packages/shared/   # أنواع ودوال مجال مشتركة
└── supabase/          # migrations + seed
```

التفاصيل: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## المتطلبات

- Node.js 20+
- حساب [Supabase](https://supabase.com) مع مشروع فارغ
- npm

---

## 1) إعداد قاعدة البيانات (مرة واحدة)

1. افتح Supabase → **SQL Editor**
2. نفّذ بالترتيب:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_talent_pools.sql`
   - `supabase/migrations/003_operations.sql`
   - `supabase/migrations/004_rls_demo.sql`
   - `supabase/seed.sql`
3. من **Project Settings → API** انسخ:
   - Project URL
   - `anon` public key
   - `service_role` secret (للخادم فقط)

---

## 2) تشغيل الويب (بيانات حقيقية)

```bash
npm install
cd apps/web
cp .env.example .env.local
```

عدّل `apps/web/.env.local`:

```env
NEXT_PUBLIC_DATA_PROVIDER=supabase
NEXT_PUBLIC_AUTH_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

ثم:

```bash
npm run dev
```

افتح http://localhost:3000

### تحقق سريع أن البيانات من قاعدة البيانات

افتح http://localhost:3000/api/data/jobs  
يجب أن ترى `"provider":"supabase"` وقائمة وظائف من الجداول (ليس mock).

تسجيل الدخول التجريبي بعد تشغيل سكربت الحسابات:

```bash
npm run seed:demo-users
```

كلمة المرور لكل الحسابات: `Naqlah@2025`  
أمثلة: `student@naqlah.ps` · `company@jawwal.ps` · `hr@jawwal.ps` · `admin@naqlah.ps`

---

## 3) تشغيل الموبايل (نفس قاعدة البيانات عبر API)

الويب يجب أن يكون شغّالاً أولاً.

```bash
cd apps/mobile
cp .env.example .env
```

في `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

على جهاز حقيقي استبدل `localhost` بـ IP جهازك على الشبكة (مثال `http://192.168.1.10:3000`).

ثم:

```bash
npx expo start
```

الموبايل يجلب البيانات من `/api/data/*` على الويب، والويب يقرأ من Supabase فقط.

---

## مسار البيانات

```text
Web UI / Mobile  →  /api/data/*  →  backend/data (Supabase)  →  PostgreSQL
```

لا يُستخدم مصدر mock طالما مفاتيح Supabase موجودة في `.env.local`.

---

## الفريق

| الاسم بالعربية | الاسم بالإنجليزية |
|---|---|
| أمير أبو شمس | Ameer Abu Shams |
| محمد نوفل | Mohammed Nofal |

جامعة النجاح الوطنية — مشروع تخرج.

---

## التوثيق

| الملف | الغرض |
|------|--------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | الطبقات والبنية |
| [`docs/GO-LIVE.md`](docs/GO-LIVE.md) | ربط Supabase |
| [`docs/VERCEL.md`](docs/VERCEL.md) | النشر على Vercel |
| [`docs/SRS-NAQLA.md`](docs/SRS-NAQLA.md) | المتطلبات |

## التقنيات

Next.js · React · TypeScript · Tailwind · Expo · Supabase (PostgreSQL + Auth + RLS)
