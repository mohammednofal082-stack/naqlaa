# Architecture — Naqla

## Pattern

Layered monorepo (MVC-style):

| Layer | Role | Location |
|-------|------|----------|
| **View (Frontend)** | UI only | `apps/web/src/app` pages, `components`, `hooks`, `contexts`, `i18n` · `apps/mobile/app`, `components` |
| **Controller (API)** | HTTP endpoints | `apps/web/src/app/api/**` |
| **Model / Domain** | Types, rules, algorithms | `packages/shared` |
| **Infrastructure (Backend services)** | Auth, repositories, providers | `apps/web/src/backend/**` |
| **Database** | PostgreSQL schema + RLS | `supabase/migrations`, `supabase/seed.sql` |

```text
Web UI / Mobile UI
        │
        ▼
   /api/data/*   (Controller)
        │
        ▼
  backend/data   (Repository)
   ├── mock
   └── supabase
        │
        ▼
   PostgreSQL (Supabase)
```

Mobile uses the same controllers when `EXPO_PUBLIC_API_URL` points at the web server. If unset, it falls back to `packages/shared` seed data so the app still runs offline.

## Repository layout

```text
naqla/
├── apps/
│   ├── web/src/
│   │   ├── app/                 # Views (pages) + Controllers (api/)
│   │   ├── components/          # View components
│   │   ├── hooks/               # UI data hooks → /api
│   │   ├── contexts/            # Client state
│   │   ├── i18n/
│   │   ├── backend/             # Infrastructure
│   │   │   ├── data/            # Repositories (mock | supabase)
│   │   │   ├── auth/
│   │   │   ├── supabase/
│   │   │   ├── config/
│   │   │   └── ai/
│   │   └── lib/                 # UI utilities only
│   └── mobile/
│       ├── app/                 # Screens (View)
│       ├── services/            # API client → web controllers
│       ├── hooks/
│       ├── contexts/
│       ├── components/
│       └── i18n/
├── packages/shared/             # Domain model
└── supabase/                    # Database
```

## Configuration

```env
NEXT_PUBLIC_DATA_PROVIDER=mock|supabase
NEXT_PUBLIC_AUTH_PROVIDER=mock|supabase
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Conventions

- Feature UI lives under domain folders (`feed`, `role`, `dashboard`, …)
- Mutations and queries go through `/api/data/*` (web) or `services/api-client` (mobile)
- No secrets in Git; use `.env.local` / Expo env
- Prefer TypeScript contracts from `@careerlink/shared`
