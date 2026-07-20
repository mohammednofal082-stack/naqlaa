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
| **Root Directory** | `apps/web` (اضغط Edit واختر المجلد) — **إلزامي** بدون هذا تظهر 404 NOT_FOUND |
| **Build Command** | اترك Override مطفأ (يستخدم `apps/web/vercel.json` → `npm run build`) |
| **Install Command** | اترك Override مطفأ (يستخدم `cd ../.. && npm install` من جذر الـ monorepo) |
| **Output Directory** | **فارغ** — لا تكتب `.next` ولا `out` (Override مطفأ) |

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

## إصلاح مشروع موجود يعطي 404 NOT_FOUND

1. افتح المشروع على Vercel → **Settings → General → Root Directory** → **Edit** → اختر `apps/web` → **Save**.
2. **Settings → Build and Deployment**:
   - Framework Preset = **Next.js**
   - Install / Build / Output Directory: اجعل **Override** مطفأ للكل (لا تضع Output Directory يدوياً).
3. **Settings → Environment Variables** (Preview + Production):
   - `NEXT_PUBLIC_DATA_PROVIDER=mock`
   - `NEXT_PUBLIC_AUTH_PROVIDER=mock`
   - `JWT_SECRET=naqlah-mvp-change-me-please-2026`
4. **Deployments** → أحدث deployment → ⋮ → **Redeploy** → ألغِ تفعيل **Use existing Build Cache** → **Redeploy**.

## استكشاف أخطاء شائعة

| المشكلة | الحل |
|---------|------|
| **404 NOT_FOUND** (شاشة بيضاء مع Code) | غالباً **Root Directory** غلط أو Framework = Other. اضبط Root Directory = `apps/web` و Framework = **Next.js** واترك **Output Directory** فاضي (لا تكتب `.next` ولا `out`) ثم **Redeploy** بدون cache |
| Cannot find module `@careerlink/shared` | تأكد Root Directory = `apps/web` و Install من جذر الـ monorepo (`cd ../.. && npm install`) |
| Build failed / out of memory | من Settings → General جرّب Node 20 |
| صفحة فاضية بعد النشر | تأكد إن الـ env vars محفوظة وأعدت Deploy |

## حساب Vercel الصحيح

اربط المشروع من حساب GitHub **`mohammednofal082-stack`** (ريبو `naqlaa`).  
إذا ظهر المشروع تحت حساب آخر (مثل ammarshtayeh) فالمحصول على رابط preview مختلف — أنشئ المشروع من جديد على الحساب الصحيح أو انقل الملكية، ثم طبّق إعدادات Root Directory أعلاه.
