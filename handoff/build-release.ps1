# Builds a runnable student release under handoff/release/
# Every stage folder is a COMPLETE working monorepo (npm install + npm run dev).
# Run: powershell -ExecutionPolicy Bypass -File .\handoff\build-release.ps1

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Release = Join-Path $PSScriptRoot "release"
$StagesOut = Join-Path $Release "stages"
$CompleteOut = Join-Path $Release "naqla"

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
  if ($norm -match '(^|\\)SkillBridge') { return $true }
  $name = Split-Path $fullPath -Leaf
  if ($name -eq ".env" -or $name -eq ".env.local") { return $true }
  if ($name -like ".env.*.local") { return $true }
  if ($name -like "*.pdf" -and $norm -match '^docs\\') {
    # keep docs pdfs except huge optional ones — allow handoff guide copy separately
  }
  return $false
}

function Copy-ProjectTree([string]$destRoot) {
  $includeRoots = @(
    ".gitignore",
    "package.json",
    "package-lock.json",
    "README.md",
    "apps",
    "packages",
    "supabase",
    "docs"
  )
  foreach ($item in $includeRoots) {
    $src = Join-Path $Root $item
    if (-not (Test-Path $src)) { continue }
    if (Test-Path $src -PathType Leaf) {
      Copy-Item -Force $src (Join-Path $destRoot $item)
      continue
    }
    Get-ChildItem -Path $src -Recurse -File | ForEach-Object {
      if (ShouldSkip $_.FullName) { return }
      $rel = $_.FullName.Substring($Root.Path.Length).TrimStart("\", "/")
      $destFile = Join-Path $destRoot $rel
      New-Item -ItemType Directory -Force -Path (Split-Path $destFile -Parent) | Out-Null
      Copy-Item -Force $_.FullName $destFile
    }
  }
}

function Write-Utf8([string]$path, [string]$content) {
  $utf8 = New-Object System.Text.UTF8Encoding $true
  [System.IO.File]::WriteAllText($path, $content, $utf8)
}

$Stages = @(
  @{ Num="01"; Folder="01-monorepo-scaffold"; Who="Mohammed Nofal"; Branch="mohammed"; Commit="chore: scaffold Naqla monorepo and landing"; Title="Monorepo & Landing"; Focus="Project foundation, design system, landing page, and runnable web app shell." },
  @{ Num="02"; Folder="02-web-student-core"; Who="Mohammed Nofal"; Branch="mohammed"; Commit="feat(web): student core flows — auth, feed, jobs"; Title="Student Web Core"; Focus="Student flows: auth, feed, jobs, applications, profile, and data access layer." },
  @{ Num="03"; Folder="03-role-dashboards"; Who="Ameer Abu Shams"; Branch="ameer"; Commit="feat(web): multi-role dashboards and modules"; Title="Multi-Role Dashboards"; Focus="Role dashboards for company, HR, university, trainer, mentor, and admin." },
  @{ Num="04"; Folder="04-career-tools"; Who="Mohammed Nofal"; Branch="mohammed"; Commit="feat: career tools and matching algorithms"; Title="Career Tools"; Focus="Career tools and shared matching algorithms." },
  @{ Num="05"; Folder="05-talent-market"; Who="Ameer Abu Shams"; Branch="ameer"; Commit="feat: talent pools and job market analysis"; Title="Talent Pools & Market"; Focus="Talent pools and job market analysis." },
  @{ Num="06"; Folder="06-mobile-workflows"; Who="Mohammed Nofal"; Branch="mohammed"; Commit="feat(mobile): Expo app and platform workflows"; Title="Mobile & Workflows"; Focus="Expo mobile app and platform workflows." },
  @{ Num="07"; Folder="07-data-docs"; Who="Ameer Abu Shams"; Branch="ameer"; Commit="chore: supabase schema, seed, and documentation"; Title="Database & Docs"; Focus="Supabase migrations, seed data, and academic documentation." }
)

if (Test-Path $Release) { Remove-Item -Recurse -Force $Release }
New-Item -ItemType Directory -Force -Path $StagesOut | Out-Null
New-Item -ItemType Directory -Force -Path $CompleteOut | Out-Null

Write-Host "Copying complete runnable project -> release/naqla ..."
Copy-ProjectTree $CompleteOut

# RUN guide for complete project
$runMd = @"
# How to run Naqla

## Web

``````bash
npm install
cd apps/web
cp .env.example .env.local
npm run dev
``````

Open: http://localhost:3000

Demo login (mock mode):
- Email: ``student@naqlah.ps``
- Password: ``Naqlah@2025``

## Mobile (optional)

``````bash
cd apps/mobile
npx expo start
``````

## Notes

- Default mode is ``mock`` (works without Supabase).
- Do not commit ``.env.local``.
- Team: Mohammed Nofal · Ameer Abu Shams
"@
Write-Utf8 (Join-Path $CompleteOut "RUN.md") $runMd

foreach ($s in $Stages) {
  $folder = Join-Path $StagesOut $s.Folder
  Write-Host ("Building runnable stage {0} ..." -f $s.Folder)
  New-Item -ItemType Directory -Force -Path $folder | Out-Null
  # Full project copy so every stage runs
  Copy-ProjectTree $folder
  Copy-Item -Force (Join-Path $CompleteOut "RUN.md") (Join-Path $folder "RUN.md")

  $milestone = @"
# Milestone — Stage $($s.Num): $($s.Title)

**Owner:** $($s.Who)  
**Commit message:** ``$($s.Commit)``

## Focus of this upload

$($s.Focus)

## Project structure

``````text
naqla/
├── apps/
│   ├── web/                 # Next.js (runnable)
│   └── mobile/              # Expo
├── packages/shared/         # Shared domain package
├── supabase/                # Migrations + seed
├── docs/                    # Architecture / SRS / Go-Live
├── package.json
├── README.md
├── RUN.md
└── DELIVERY.md
``````

This folder is a **complete runnable project**.
"@
  Write-Utf8 (Join-Path $folder "MILESTONE.md") $milestone

  $delivery = @"
# Delivery — Stage $($s.Num): $($s.Title)

| Field | Value |
|-------|-------|
| Owner | $($s.Who) |
| Branch | ``$($s.Branch)`` |
| Commit | ``$($s.Commit)`` |

## Before upload — verify it runs

``````bash
npm install
cd apps/web
cp .env.example .env.local
npm run dev
``````

Open http://localhost:3000 and confirm the app loads.

## Upload steps (branch → PR → main)

1. Set Git identity:
   ``````powershell
   git config --global user.name "$($s.Who)"
   git config --global user.email "YOUR_GITHUB_EMAIL"
   ``````
2. Update from main, then use your branch:
   ``````powershell
   git checkout main
   git pull origin main
   git checkout -b $($s.Branch)
   ``````
   If the branch already exists:
   ``````powershell
   git checkout $($s.Branch)
   git merge main
   ``````
3. Copy **all contents of this folder** into the repository root (overwrite).
4. Commit and push the branch:
   ``````powershell
   git add .
   git status
   git commit -m "$($s.Commit)"
   git push -u origin $($s.Branch)
   ``````
5. On GitHub: open **Pull Request** ``$($s.Branch)`` → ``main`` → **Merge**.
6. Tell the other student that ``main`` is updated before the next stage.

## Do not upload

- ``.env.local``
- ``node_modules/``
- ``.next/``
"@
  Write-Utf8 (Join-Path $folder "DELIVERY.md") $delivery
}

# Root release README
$rootReadme = @"
# Naqla — Student Release Package (Runnable)

Team: **Mohammed Nofal** · **Ameer Abu Shams**  
University: An-Najah National University

``````text
release/
├── README.md
├── ORDER.txt
├── Naqlah-Handoff-Guide.pdf
├── naqla/                      # complete runnable project
└── stages/
    ├── 01-monorepo-scaffold/   # full runnable snapshot + delivery notes
    ├── 02-web-student-core/
    ├── 03-role-dashboards/
    ├── 04-career-tools/
    ├── 05-talent-market/
    ├── 06-mobile-workflows/
    └── 07-data-docs/
``````

## Important

Every ``stages/0X-...`` folder is a **full working project** (not partial files).

Students can run any stage with:

``````bash
cd stages/01-monorepo-scaffold
npm install
cd apps/web
cp .env.example .env.local
npm run dev
``````

Or use ``release/naqla`` as the main working copy.

## Workflow

Each student works on a **personal branch**, then merges to ``main`` with a Pull Request:

``````text
main
├── mohammed
└── ameer
``````

## Upload order

1. Mohammed → branch ``mohammed`` → ``01-monorepo-scaffold`` → PR → main
2. Mohammed → branch ``mohammed`` → ``02-web-student-core`` → PR → main
3. Ameer → branch ``ameer`` → ``03-role-dashboards`` → PR → main
4. Mohammed → branch ``mohammed`` → ``04-career-tools`` → PR → main
5. Ameer → branch ``ameer`` → ``05-talent-market`` → PR → main
6. Mohammed → branch ``mohammed`` → ``06-mobile-workflows`` → PR → main
7. Ameer → branch ``ameer`` → ``07-data-docs`` → PR → main

Read ``DELIVERY.md`` inside each stage before pushing.
"@
Write-Utf8 (Join-Path $Release "README.md") $rootReadme

$order = @"
NAQLA UPLOAD ORDER — BRANCH THEN MERGE TO MAIN
==============================================

Branch model:
  main
  ├── mohammed   (Mohammed Nofal)
  └── ameer      (Ameer Abu Shams)

01  Mohammed   branch=mohammed   stages/01-monorepo-scaffold   → PR → main
02  Mohammed   branch=mohammed   stages/02-web-student-core    → PR → main
03  Ameer      branch=ameer      stages/03-role-dashboards     → PR → main
04  Mohammed   branch=mohammed   stages/04-career-tools        → PR → main
05  Ameer      branch=ameer      stages/05-talent-market       → PR → main
06  Mohammed   branch=mohammed   stages/06-mobile-workflows    → PR → main
07  Ameer      branch=ameer      stages/07-data-docs           → PR → main

Before every push:
  npm install
  cd apps/web
  cp .env.example .env.local
  npm run dev

Flow each stage:
  git checkout main && git pull
  git checkout -b <branch>   (or: git checkout <branch> && git merge main)
  copy stage files
  git add . && git commit && git push -u origin <branch>
  GitHub PR: <branch> → main → Merge

Never upload .env.local or node_modules.
Never commit directly to main.
"@
Write-Utf8 (Join-Path $Release "ORDER.txt") $order

# PDF
Push-Location $Root
try { node docs/generate-handoff-pdf.mjs | Out-Host } finally { Pop-Location }
$pdfSrc = Join-Path $Root "docs\Naqlah-Handoff-Guide.pdf"
if (Test-Path $pdfSrc) {
  Copy-Item -Force $pdfSrc (Join-Path $Release "Naqlah-Handoff-Guide.pdf")
  Copy-Item -Force $pdfSrc (Join-Path $PSScriptRoot "Naqlah-Handoff-Guide.pdf")
}

Write-Host ""
Write-Host "Verifying web build in release/naqla (this may take a few minutes)..."
Push-Location $CompleteOut
try {
  npm install --no-fund --no-audit | Out-Host
  if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
  npm run build --workspace=@careerlink/web | Out-Host
  if ($LASTEXITCODE -ne 0) { throw "web build failed" }
  Write-Host "BUILD OK"
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "Release ready at: $Release"
