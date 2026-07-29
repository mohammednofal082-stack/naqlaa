# Handoff tooling

## Build runnable student package

```powershell
powershell -ExecutionPolicy Bypass -File .\handoff\build-release.ps1
```

This creates `handoff/release/` with:

- `naqla/` — complete runnable project
- `stages/01…07/` — each a **full runnable** snapshot + `DELIVERY.md`
- English PDF guide
- Verifies `npm install` + web production build

## Regenerate PDF only

```bash
npm run pdf:handoff
```
