# QC Tools Web App

This project recreates the QC Tools Gradation workflow as a Next.js 16 application. The Gradation tool now runs as a legacy-styled static page, but it persists data through API routes that talk to a Prisma-backed database, so any user on any machine can view the same records.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), embedded legacy HTML UI for Gradation
- **State/UX:** Inline script state, Tailwind-style utility classes
- **Backend:** Next.js route handlers + Prisma ORM
- **Database:** SQLite for local development (swap to Postgres/MySQL for shared environments)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

   - The default `.env` uses a local SQLite database at `prisma/dev.db`.
   - For multi-user deployments, set `DATABASE_URL` to a shared database (e.g. PostgreSQL on Neon/Supabase) **before** running migrations.

3. Apply database migrations and generate the Prisma client:

   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000> to work with the app.

## API Overview

All Gradation tooling runs through the `/api/gradation/*` namespace.

- `GET /api/gradation/aggregates` – list aggregates (auto-seeds defaults on first load)
- `POST /api/gradation/aggregates` – create a new aggregate with sieves
- `PUT /api/gradation/aggregates/:id` – update an aggregate + sieve configuration
- `DELETE /api/gradation/aggregates/:id` – remove an aggregate
- `PUT /api/gradation/aggregates/defaults` – persist the ordered list of default aggregates
- `GET /api/gradation/records` – list saved gradation tests
- `POST /api/gradation/records` – create a new gradation record
- `DELETE /api/gradation/records/:id` – delete a record

## Deployment Notes

1. Provision a production database and update `DATABASE_URL`.
2. Run migrations in CI/CD before serving the app:

   ```bash
   npx prisma migrate deploy
   ```

3. Deploy the Next.js application (Vercel, Render, etc.).
4. Because the legacy Gradation UI uses `fetch('/api/...')`, no additional environment wiring is needed once the backend is live.

## Development Tips

- `npx prisma studio` opens a GUI to inspect/edit your database.
- Logs for Prisma client queries are enabled in development for easier debugging.
- If you adjust default aggregates, update `src/lib/gradation-defaults.ts`.

## Future Enhancements

- Authenticate users (Supabase Auth, NextAuth, or custom JWT) before exposing the API.
- Add server-side validation for CSV exports/imports.
- Introduce automated tests for the Gradation API and critical UI flows.
