# PrintPro Admin

Nuxt 4 admin dashboard. It has no backend of its own: every `/api/**` request is proxied to the PrintPro API (`../api`), so browser calls stay same-origin.

## Run with the API

```bash
# 1. API on http://localhost:4000
cd ../api && npm install && cp .env.example .env && npm run dev

# 2. Admin on http://localhost:3001
cd ../admin && npm install && npm run dev
```

Sign in at http://localhost:3001 with `amr@example.com` / `Studio#2026Pass` (the `SEED_ADMIN_*` values in `api/.env.example`).
Only admin accounts can sign in; there is no self-service registration.

The API address defaults to `http://localhost:4000`. Override it with `NUXT_API_BASE` (set it when running `dev` or `build`).

## Build

```bash
npm run build
```
