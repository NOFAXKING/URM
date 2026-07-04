# User Registration Manager

A production-ready, full-stack registration portal and admin dashboard built with Next.js 15 (App Router), TypeScript, Prisma, PostgreSQL, and NextAuth.

## Features

- **Public registration form** — Russian full name, phone number, and bank name, with Zod validation, duplicate phone-number prevention, and instant success feedback.
- **Single-administrator authentication** — credentials-based login sourced entirely from environment variables (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), no admin sign-up flow, password compared via bcrypt.
- **Protected `/admin` dashboard** — guarded by NextAuth middleware; unauthenticated visitors are redirected to `/login`.
- **Registrations grouped by date** (newest first), with search (by name/phone/bank), date filters (Today / Yesterday / This Week / This Month / Custom), sorting, view/edit/delete actions, and 25-records-per-page pagination.
- **Statistics cards** — total, today's, weekly, and monthly registrations.
- **Export** to Excel (.xlsx), CSV, and PDF, respecting active filters.
- **Light/Dark mode**, responsive sidebar, loading skeletons, toast notifications, and empty states.
- **Security** — middleware-protected routes, bcrypt password hashing, Prisma parameterized queries (SQL-injection safe), Zod server-side validation on every mutation, and React's built-in output escaping (XSS safe).

## Tech Stack

Next.js 15 · React 18 · TypeScript · Tailwind CSS · Prisma ORM · PostgreSQL · NextAuth (Credentials Provider) · Server Actions · Zod · Lucide Icons · Radix-based shadcn-style UI components

## Getting Started Locally

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in the values:

   ```bash
   cp .env.example .env
   ```

   | Variable          | Description                                                        |
   | ----------------- | ------------------------------------------------------------------- |
   | `ADMIN_EMAIL`     | The administrator's login email                                     |
   | `ADMIN_PASSWORD`  | The administrator's login password (compared using bcrypt)          |
   | `DATABASE_URL`    | PostgreSQL connection string (Neon, Supabase, or any Postgres host) |
   | `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32`             |
   | `NEXTAUTH_URL`    | `http://localhost:3000` locally, your deployed URL in production    |

3. **Push the database schema**

   ```bash
   npx prisma db push
   ```

   (Or `npm run db:migrate` if you prefer tracked migrations.)

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   - Registration form: [http://localhost:3000](http://localhost:3000)
   - Admin login: [http://localhost:3000/login](http://localhost:3000/login)

## Deploying to Vercel

1. Push this repository to GitHub (or GitLab/Bitbucket) and import it into [Vercel](https://vercel.com/new).
2. Provision a Postgres database (Neon and Supabase both have first-class Vercel integrations) and copy its connection string.
3. In **Project Settings → Environment Variables**, add:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set this to your production URL, e.g. `https://your-app.vercel.app`)
4. Deploy. The `postinstall` script runs `prisma generate` automatically, and `npm run build` runs `prisma generate && next build`.
5. After the first deploy, run `npx prisma db push` once (locally, pointed at the production `DATABASE_URL`, or via a Vercel deployment hook) to create the `users` table.
6. Visit `/login` and sign in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD` to reach `/admin`.

No code changes are required beyond setting these environment variables.

## Project Structure

```
app/
  page.tsx                 Public registration page
  login/                   Admin login page
  admin/                   Protected dashboard (layout, page, server actions)
  api/auth/[...nextauth]/  NextAuth route handler
  api/admin/export/        CSV / XLSX / PDF export endpoint
  actions/register.ts      Server action for public registration
components/
  ui/                      Reusable shadcn-style primitives (button, dialog, table, ...)
  admin/                   Dashboard-specific components (table, filters, stats, dialogs)
lib/
  auth.ts                  NextAuth configuration
  prisma.ts                Prisma client singleton
  validations.ts           Zod schemas
  query.ts                 Filter/sort/pagination query builders
prisma/schema.prisma       Database schema
middleware.ts              Route protection for /admin
```

## Notes

- Only one administrator account exists; it is never persisted in the database. There is intentionally no admin registration page.
- Phone numbers are normalized (E.164) before being stored, so formatting differences don't defeat duplicate detection.
- The `users` table's `id` column auto-increments (1, 2, 3, ...) via PostgreSQL's `SERIAL`/identity column, managed by Prisma's `@default(autoincrement())`.
