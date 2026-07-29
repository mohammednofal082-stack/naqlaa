# Branch workflow → merge to main

Team: **Mohammed Nofal** · **Ameer Abu Shams**

## Branch model

```text
main
 ├── mohammed    # Mohammed Nofal only
└── ameer       # Ameer Abu Shams only
```

- Each student works on **his branch**.
- After each stage: **Pull Request → merge into `main`**.
- Never commit directly to `main`.

---

## Order

| # | Owner | Branch | Stage folder | Commit |
|---|-------|--------|--------------|--------|
| 1 | Mohammed | `mohammed` | `01-monorepo-scaffold` | `chore: scaffold Naqla monorepo and landing` |
| 2 | Mohammed | `mohammed` | `02-web-student-core` | `feat(web): student core flows — auth, feed, jobs` |
| 3 | Ameer | `ameer` | `03-role-dashboards` | `feat(web): multi-role dashboards and modules` |
| 4 | Mohammed | `mohammed` | `04-career-tools` | `feat: career tools and matching algorithms` |
| 5 | Ameer | `ameer` | `05-talent-market` | `feat: talent pools and job market analysis` |
| 6 | Mohammed | `mohammed` | `06-mobile-workflows` | `feat(mobile): Expo app and platform workflows` |
| 7 | Ameer | `ameer` | `07-data-docs` | `chore: supabase schema, seed, and documentation` |

---

## Scenario for one stage

```powershell
git checkout main
git pull origin main

# first time for this student:
git checkout -b mohammed
# later stages:
# git checkout mohammed
# git merge main

# copy stage folder into repo root, then:
git add .
git commit -m "<commit message>"
git push -u origin mohammed
```

On GitHub: **Pull Request** `mohammed` → `main` → **Merge**.  
Then the other student does `git pull` on `main` before his stage.

## Run before every push

```bash
npm install
cd apps/web
cp .env.example .env.local
npm run dev
```

Demo: `student@naqlah.ps` / `Naqlah@2025`
