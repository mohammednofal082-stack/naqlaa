# Builds polished cumulative stage folders under handoff/dist/
# Run: powershell -ExecutionPolicy Bypass -File .\handoff\build-stages.ps1

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Dist = Join-Path $PSScriptRoot "dist"

function ShouldSkip([string]$fullPath) {
  $rel = $fullPath.Substring($Root.Path.Length).TrimStart("\", "/")
  $norm = $rel -replace "/", "\"
  if ($norm -match '(^|\\)node_modules(\\|$)') { return $true }
  if ($norm -match '(^|\\)\.next(\\|$)') { return $true }
  if ($norm -match '(^|\\)\.expo(\\|$)') { return $true }
  if ($norm -match '(^|\\)\.git(\\|$)') { return $true }
  if ($norm -match '(^|\\)\.turbo(\\|$)') { return $true }
  if ($norm -match '(^|\\)\.vercel(\\|$)') { return $true }
  if ($norm -match '(^|\\)coverage(\\|$)') { return $true }
  if ($norm -match '(^|\\)handoff(\\|$)') { return $true }
  $name = Split-Path $fullPath -Leaf
  if ($name -eq ".env" -or $name -eq ".env.local") { return $true }
  if ($name -like ".env.*.local") { return $true }
  return $false
}

function Copy-TreeFiltered([string]$srcRel, [string]$destRoot) {
  $src = Join-Path $Root $srcRel
  if (-not (Test-Path $src)) { return }
  if (Test-Path $src -PathType Leaf) {
    $destFile = Join-Path $destRoot $srcRel
    $dir = Split-Path $destFile -Parent
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Copy-Item -Force $src $destFile
    return
  }
  Get-ChildItem -Path $src -Recurse -File | ForEach-Object {
    if (ShouldSkip $_.FullName) { return }
    $rel = $_.FullName.Substring($Root.Path.Length).TrimStart("\", "/")
    $destFile = Join-Path $destRoot $rel
    $dir = Split-Path $destFile -Parent
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Copy-Item -Force $_.FullName $destFile
  }
}

function Write-Utf8([string]$path, [string]$content) {
  $utf8 = New-Object System.Text.UTF8Encoding $true
  [System.IO.File]::WriteAllText($path, $content, $utf8)
}

function New-StageReadme {
  param(
    [string]$Dest,
    [string]$Num,
    [string]$TitleEn,
    [string]$TitleAr,
    [string]$Who,
    [string]$Commit,
    [string]$FocusAr,
    [string]$Tree,
    [string]$RunHint
  )

  $md = @"
# Stage $Num — $TitleEn

**$TitleAr**

| | |
|---|---|
| **Contributor** | $Who |
| **Commit message** | ``$Commit`` |
| **University** | An-Najah National University |
| **Project** | Naqla (نقلة) — Graduation platform |

---

## Goal of this milestone

$FocusAr

---

## Expected repository structure (after this stage)

``````text
$Tree
``````

---

## Student checklist

1. Configure Git identity (once):
   ``````powershell
   git config --global user.name "$Who"
   git config --global user.email "YOUR_GITHUB_EMAIL"
   ``````
2. Open the supervisor repository locally (`git clone` / `git pull`).
3. Copy **all contents** of this folder into the repository root (overwrite).
4. Never commit secrets:
   - ``.env.local``
   - ``node_modules/``
   - ``.next/``
5. Commit and push:
   ``````powershell
   git add .
   git status
   git commit -m "$Commit"
   git push
   ``````
6. Wait for confirmation before the next stage.

---

## How to run (when applicable)

$RunHint

---

## Notes for the supervisor

- This delivery is **incremental** and follows a clean monorepo layout (`apps` / `packages` / `supabase` / `docs`).
- Each stage adds a coherent product slice suitable for academic review.
- Data layer supports ``mock`` (demo) and ``supabase`` (production-ready wiring).
"@

  Write-Utf8 (Join-Path $Dest "README.md") $md
}

# Cumulative path sets
$S1 = @(
  ".gitignore", "package.json", "package-lock.json", "packages/shared",
  "apps/web/package.json", "apps/web/tsconfig.json", "apps/web/next.config.ts",
  "apps/web/postcss.config.mjs", "apps/web/next-env.d.ts", "apps/web/eslint.config.mjs",
  "apps/web/.env.example", "apps/web/vercel.json",
  "apps/web/src/app/globals.css", "apps/web/src/app/layout.tsx", "apps/web/src/app/page.tsx",
  "apps/web/src/app/favicon.ico", "apps/web/src/components/landing", "apps/web/src/components/ui",
  "apps/web/src/i18n", "apps/web/src/lib/utils.ts", "apps/web/src/lib/config", "apps/web/public"
)

$S2 = $S1 + @(
  "apps/web/src/app/auth", "apps/web/src/app/feed", "apps/web/src/app/jobs",
  "apps/web/src/app/applications", "apps/web/src/app/internships", "apps/web/src/app/profile",
  "apps/web/src/app/companies", "apps/web/src/app/search", "apps/web/src/app/saved",
  "apps/web/src/app/notifications", "apps/web/src/app/messages", "apps/web/src/app/settings",
  "apps/web/src/app/community", "apps/web/src/app/projects", "apps/web/src/app/journey",
  "apps/web/src/app/dashboard/student", "apps/web/src/app/dashboard/graduate",
  "apps/web/src/app/dashboard/page.tsx", "apps/web/src/components/feed",
  "apps/web/src/components/layout", "apps/web/src/components/dashboard",
  "apps/web/src/contexts", "apps/web/src/hooks", "apps/web/src/lib/auth",
  "apps/web/src/lib/data", "apps/web/src/lib/supabase", "apps/web/src/proxy.ts", "apps/web/src/app/api"
)

$S3 = $S2 + @(
  "apps/web/src/app/dashboard/company", "apps/web/src/app/dashboard/hr",
  "apps/web/src/app/dashboard/university", "apps/web/src/app/dashboard/trainer",
  "apps/web/src/app/dashboard/mentor", "apps/web/src/app/dashboard/admin",
  "apps/web/src/components/role", "apps/web/src/app/courses",
  "apps/web/src/app/mentorship", "apps/web/src/app/events"
)

$S4 = $S3 + @("apps/web/src/app/ai", "packages/shared/src/matching")

$S5 = $S4 + @(
  "apps/web/src/app/market", "apps/web/src/app/dashboard/company/talent-pools",
  "apps/web/src/app/api/data/talent-pools", "apps/web/src/app/api/data/market-analysis",
  "supabase/migrations/002_talent_pools.sql"
)

$S6 = $S5 + @("apps/mobile", "apps/web/src/app/workflows", "packages/shared/src/workflows.ts")

$S7 = $S6 + @("supabase", "docs", "README.md")

$Tree1 = @"
naqla/
├── apps/web/                 # Next.js landing + design system
├── packages/shared/          # Shared contracts
├── package.json              # npm workspaces
└── README.md
"@

$Tree2 = @"
naqla/
├── apps/web/src/app/         # auth, feed, jobs, applications, ...
├── apps/web/src/lib/data/    # repository layer (mock/supabase)
├── packages/shared/
└── ...
"@

$Tree3 = @"
naqla/
├── apps/web/src/app/dashboard/
│   ├── company/ hr/ university/ trainer/ mentor/ admin/
├── apps/web/src/components/role/
└── ...
"@

$Tree4 = @"
naqla/
├── apps/web/src/app/ai/              # career tools
├── packages/shared/src/matching/     # algorithms
└── ...
"@

$Tree5 = @"
naqla/
├── apps/web/src/app/market/
├── apps/web/.../talent-pools/
├── supabase/migrations/002_talent_pools.sql
└── ...
"@

$Tree6 = @"
naqla/
├── apps/mobile/              # Expo application
├── apps/web/src/app/workflows/
├── packages/shared/workflows.ts
└── ...
"@

$Tree7 = @"
naqla/
├── apps/web/
├── apps/mobile/
├── packages/shared/
├── supabase/migrations/      # 001→004 + seed
├── docs/                     # Architecture, SRS, Go-Live
└── README.md
"@

$Stages = @(
  @{ Num="01"; Folder="01-monorepo-scaffold"; TitleEn="Monorepo & Landing"; TitleAr="أساس المشروع والصفحة الرئيسية"; Who="Mohammed Nofal"; Commit="chore: scaffold Naqla monorepo and landing"; Focus="تأسيس Monorepo احترافي، نظام التصميم، الصفحة الرئيسية، وإعدادات Next.js."; Tree=$Tree1; Paths=$S1; Run="``````bash`nnpm install`ncd apps/web`nnpm run dev`n``````" },
  @{ Num="02"; Folder="02-web-student-core"; TitleEn="Student Web Core"; TitleAr="مسارات الطالب الأساسية على الويب"; Who="Mohammed Nofal"; Commit="feat(web): student core flows — auth, feed, jobs"; Focus="تسجيل الدخول، الخلاصة، الوظائف، التقديمات، الملف، وطبقة البيانات."; Tree=$Tree2; Paths=$S2; Run="افتح ``/auth/login`` ثم مسارات الطالب (فيد / وظائف / تقديمات)." },
  @{ Num="03"; Folder="03-role-dashboards"; TitleEn="Multi-Role Dashboards"; TitleAr="لوحات الأدوار والموديولات"; Who="Ameer Abu Shams"; Commit="feat(web): multi-role dashboards and modules"; Focus="لوحات الشركة، HR، الجامعة، المدرب، المرشد، والأدمن + كورسات/إرشاد/فعاليات."; Tree=$Tree3; Paths=$S3; Run="بدّل الدور من شاشة الدخول التجريبية واستعرض لوحة كل دور." },
  @{ Num="04"; Folder="04-career-tools"; TitleEn="Career Tools & Matching"; TitleAr="الأدوات المهنية وخوارزميات المطابقة"; Who="Mohammed Nofal"; Commit="feat: career tools and matching algorithms"; Focus="فجوة المهارات، تحليل السيرة، التوصيات، المسار المهني، والمحاكاة — مع حزمة المطابقة المشتركة."; Tree=$Tree4; Paths=$S4; Run="افتح ``/ai`` والأدوات الفرعية." },
  @{ Num="05"; Folder="05-talent-market"; TitleEn="Talent Pools & Market Analysis"; TitleAr="قوائم المواهب وتحليل سوق العمل"; Who="Ameer Abu Shams"; Commit="feat: talent pools and job market analysis"; Focus="Talent Pools للشركات وصفحة تحليل السوق ``/market`` مع migration مخصص."; Tree=$Tree5; Paths=$S5; Run="``/market`` ولوحة الشركة → Talent Pools." },
  @{ Num="06"; Folder="06-mobile-workflows"; TitleEn="Mobile App & Workflows"; TitleAr="تطبيق الموبايل وسيناريوهات المنصة"; Who="Mohammed Nofal"; Commit="feat(mobile): Expo app and platform workflows"; Focus="تطبيق Expo، دعم عربي/إنجليزي، وصفحة السيناريوهات السبعة المشتركة."; Tree=$Tree6; Paths=$S6; Run="ويب: ``/workflows`` — موبايل: ``cd apps/mobile && npx expo start``." },
  @{ Num="07"; Folder="07-data-docs"; TitleEn="Database Schema & Documentation"; TitleAr="قاعدة البيانات والتوثيق الأكاديمي"; Who="Ameer Abu Shams"; Commit="chore: supabase schema, seed, and documentation"; Focus="Migrations كاملة، seed للعرض، Architecture، SRS، Go-Live، وREADME النهائي."; Tree=$Tree7; Paths=$S7; Run="راجع ``docs/GO-LIVE.md`` ثم نفّذ SQL على Supabase." }
)

if (Test-Path $Dist) { Remove-Item -Recurse -Force $Dist }
New-Item -ItemType Directory -Force -Path $Dist | Out-Null

# Index for the flash drive
$index = @"
# Naqla — Staged delivery package

Give folders to students **in order** (01 → 07).

| Folder | Contributor | Commit |
|--------|-------------|--------|
| ``01-monorepo-scaffold`` | Mohammed Nofal | scaffold monorepo + landing |
| ``02-web-student-core`` | Mohammed Nofal | student web core |
| ``03-role-dashboards`` | Ameer Abu Shams | role dashboards |
| ``04-career-tools`` | Mohammed Nofal | career tools |
| ``05-talent-market`` | Ameer Abu Shams | talent pools + market |
| ``06-mobile-workflows`` | Mohammed Nofal | mobile + workflows |
| ``07-data-docs`` | Ameer Abu Shams | supabase + docs |

Each folder includes a full ``README.md``. Follow it exactly.
"@
Write-Utf8 (Join-Path $Dist "README.md") $index

foreach ($s in $Stages) {
  $folder = Join-Path $Dist $s.Folder
  New-Item -ItemType Directory -Force -Path $folder | Out-Null
  Write-Host ("Building {0} ..." -f $s.Folder)
  foreach ($p in ($s.Paths | Select-Object -Unique)) {
    Copy-TreeFiltered $p $folder
  }
}

# Write polished README.md + DELIVERY.md per stage
foreach ($s in $Stages) {
  $folder = Join-Path $Dist $s.Folder

  if ($s.Num -eq "07") {
    Copy-TreeFiltered "README.md" $folder
    Copy-TreeFiltered "docs/ARCHITECTURE.md" $folder
  } elseif ($s.Num -eq "01") {
    $shortReadme = @"
# نقلة (Naqla)

منصة مهنية فلسطينية — مشروع تخرج، جامعة النجاح الوطنية.

## Project structure

``````text
naqla/
├── apps/web/              # Next.js application
├── packages/shared/       # Shared types & domain logic
├── package.json           # npm workspaces monorepo
└── README.md
``````

## Run

``````bash
npm install
cd apps/web
cp .env.example .env.local
npm run dev
``````

**Team:** Mohammed Nofal · Ameer Abu Shams
"@
    Write-Utf8 (Join-Path $folder "README.md") $shortReadme
  } else {
    $mid = @"
# نقلة (Naqla)

Palestinian career platform — An-Najah National University graduation project.

## Monorepo structure

``````text
$($s.Tree)
``````

## Milestone

**Stage $($s.Num): $($s.TitleEn)**  
$($s.Focus)

See ``DELIVERY.md`` for commit instructions.

## Run (web)

``````bash
npm install
cd apps/web
cp .env.example .env.local
npm run dev
``````

**Team:** Mohammed Nofal · Ameer Abu Shams
"@
    Write-Utf8 (Join-Path $folder "README.md") $mid
  }

  $delivery = @"
# Delivery Guide — Stage $($s.Num)

**$($s.TitleEn)** · $($s.TitleAr)

| Field | Value |
|-------|-------|
| Contributor | $($s.Who) |
| Git commit | ``$($s.Commit)`` |

## What this stage adds

$($s.Focus)

## Structure after merge

``````text
$($s.Tree)
``````

## Steps

1. ``git config`` name/email = your GitHub identity  
2. Copy this folder into the supervisor repo root  
3. ``git add .`` → ``git commit -m "$($s.Commit)"`` → ``git push``  
4. Do not upload ``.env.local`` or ``node_modules``

## Run hint

$($s.Run)
"@
  Write-Utf8 (Join-Path $folder "DELIVERY.md") $delivery
}

Write-Host ""
Write-Host "Done -> $Dist"
Get-ChildItem $Dist -Directory | ForEach-Object { Write-Host (" - " + $_.Name) }
