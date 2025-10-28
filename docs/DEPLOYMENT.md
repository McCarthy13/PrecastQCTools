# Deployment & Environment Setup

This project now relies on a shared database so everyone sees the same data (strand patterns, gradation records, etc.). Follow the checklist below whenever you stand up a new environment (home laptop, work machine, CI, production).

---

## 1. Provision the database

1. Choose a managed Postgres service (Supabase, Neon, RDS, Planetscale with PG adapter, etc.).
2. Create a new database and copy its connection string.\
   Example (Supabase):\
   `postgresql://USER:PASSWORD@DB_HOST:6543/postgres?sslmode=require`

> **Tip:** For local development you can keep using SQLite, but production/staging should share a single Postgres instance.

---

## 2. Update `.env`

Create or edit `.env` in the project root:

```dotenv
# App
NEXT_PUBLIC_APP_URL=https://your-app-url.example.com

# Database
DATABASE_URL="postgresql://USER:PASSWORD@DB_HOST:6543/postgres?sslmode=require"

# (Optional) Protect backend endpoints with an API key
# API/auth
STRAND_PATTERNS_API_KEY="super-secret-api-key"
NEXT_PUBLIC_STRAND_PATTERNS_API_KEY="super-secret-api-key"
```

> Do **not** commit `.env`. Set the same values in your hosting provider (Vercel, Fly.io, Railway, etc.).

For local development with SQLite, keep using:

```dotenv
DATABASE_URL="file:./prisma/dev.db"
```

---

## 3. Apply migrations

Once `DATABASE_URL` points at the target database:

```bash
# Generate & apply schema changes (development)
npx prisma migrate dev

# Production/staging (applies existing migrations only)
npx prisma migrate deploy

# Optional: push seed data for aggregates / defaults
npx ts-node scripts/seed.ts
```

This project already contains the migration `add_strand_patterns`; running the commands will create the necessary tables in the shared database.

---

## 4. Redeploy / restart the app

### Local dev

1. Restart the Next.js dev server (`npm run dev` – handled by Vibecode runner).
2. Clear any cached Zustand storage if you were previously using local storage.

### Hosted environments

1. Push your branch or trigger a redeploy.
2. Verify logs to confirm Prisma connects to the managed database.
3. Visit `/api/strand-patterns` to make sure it returns JSON instead of an error.

---

## 5. Optional: secure the API

The strand-pattern endpoints can be protected with an API key.

1. Set `STRAND_PATTERNS_API_KEY` in `.env`.
2. Include the same key in the `Authorization` header when calling the API (`Authorization: Bearer <key>`).
3. Update `src/lib/api/strand-patterns.ts` to send the header when the key is present.

> This prevents anonymous access when the routes are exposed publicly.

---

## 6. Sharing data across machines

Once the shared database is configured and the app redeployed:

1. Ensure both home and work machines use the same `.env` pointing at the hosted DB.
2. Run `npm install` (if necessary) and start the Vibecode workspace.
3. Data entered in one location will be visible on the other after a refresh.

---

## 7. Next steps

- **Authentication / authorization:** lock down the API routes based on your auth provider.
- **Migrate remaining tools:** Gradation already uses Prisma; plan to convert slippage history, camber logs, etc. to shared APIs.
- **Backups:** schedule automatic backups in your managed database dashboard.

Document any environment-specific notes (VPN requirements, firewall rules) inside `docs/` so other team members can onboard quickly.
