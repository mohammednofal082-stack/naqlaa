# نشر نقلة على Vercel (MVP)

الويب فقط (`apps/web`). الموبايل لا يُنشر على Vercel.

## 1) صلاحية GitHub (اللي أنت فيه الآن)

1. في صفحة Vercel App على GitHub تأكد إن الريبو **`naqlaa`** محدد تحت **Only select repositories**.
2. اضغط **Save**.

## 2) إنشاء المشروع على Vercel

1. ادخل [vercel.com](https://vercel.com) بنفس حساب GitHub `mohammednofal082-stack`.
2. **Add New… → Project**.
3. اختر الريبو **`naqlaa`** → **Import**.

### إعدادات الـ Import (مهمة)

| الحقل | القيمة |
|--------|--------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` (اضغط Edit واختر المجلد) |
| **Build Command** | اترك الافتراضي (من `vercel.json`) أو: `cd ../.. && npm run build --workspace=@careerlink/web` |
| **Install Command** | اترك الافتراضي أو: `cd ../.. && npm install` |
| **Output Directory** | لا تغيّره (Next.js يتولّاه) |

## 3) Environment Variables (للـ MVP)

من **Environment Variables** أضف للـ Production + Preview:

```
NEXT_PUBLIC_DATA_PROVIDER=mock
NEXT_PUBLIC_AUTH_PROVIDER=mock
JWT_SECRET=naqlah-mvp-change-me-please-2026
```

اختياري لاحقاً (بعد ربط Supabase):

```
NEXT_PUBLIC_DATA_PROVIDER=supabase
NEXT_PUBLIC_AUTH_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=...
```

لا ترفع المفاتيح في Git — فقط من لوحة Vercel.

## 4) Deploy

اضغط **Deploy**. بعد النجاح Vercel يعطيك رابط مثل:

`https://naqlaa.vercel.app`

ابعته للدكتور.

## 5) تحديثات لاحقة

كل `git push` على `main` يعمل نشر تلقائي.

## استكشاف أخطاء شائعة

| المشكلة | الحل |
|---------|------|
| Cannot find module `@careerlink/shared` | تأكد Root Directory = `apps/web` و Install من جذر الـ monorepo |
| Build failed / out of memory | من Settings → General جرّب Node 20 |
| صفحة فاضية بعد النشر | تأكد إن الـ env vars محفوظة وأعدت Deploy |
