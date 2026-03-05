# Pipeline — Job Tracking SaaS

A modern, portfolio-grade job application tracker built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **Supabase**. Track applications, manage a pipeline, and see analytics at a glance.

## Features

- **Auth** — Sign up, log in, and protected routes via Supabase Auth
- **Dashboard** — Stats (total applications, active, offers, conversion %) and a pipeline funnel chart
- **Pipeline (Kanban)** — Drag-and-drop columns: Applied → Screening → Interview → Offer | Rejected
- **Jobs list** — Table with search and status filter
- **Job detail** — View and edit application details; delete
- **CRUD** — Add/edit jobs; create companies on the fly or pick existing
- **Design** — Custom theme (teal accent, Instrument Serif + DM Sans), responsive layout

## Tech stack

| Layer      | Choice        |
|-----------|----------------|
| Framework | Next.js 16 (App Router) |
| Language  | TypeScript     |
| Styling   | Tailwind CSS 4 |
| Backend   | Firebase (Auth + Firestore), Google Sheet, or Supabase (Auth, Postgres, RLS) |
| Charts    | Recharts       |

## Setup

### 1. Install dependencies

```bash
cd jobtracker
npm install
```

### 2a. Google Sheet backend (recommended)

Use a Google Sheet as the database **and for authentication** (users and sessions stored in the sheet).

1. Follow **[docs/GOOGLE_SHEET_SETUP.md](docs/GOOGLE_SHEET_SETUP.md)** to create the sheet (tabs: `users`, `sessions`, `companies`, `jobs`), service account, and env vars.
2. Set `GOOGLE_SHEET_ID` and either `GOOGLE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local`.
3. Run `npm run dev`, open the app, and **sign up** to create an account. Your data is stored in the sheet and scoped to your user.

### 2b. Firebase (optional)

Use **Firebase Auth** and **Firestore** for auth and data. You can also deploy the static site to **Firebase Hosting**.

1. Follow **[docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)** to create a project, enable Email/Password auth, create Firestore, and get the web app config and service account JSON.
2. Set the `NEXT_PUBLIC_FIREBASE_*` and `FIREBASE_SERVICE_ACCOUNT_JSON` vars in `.env.local`.
3. Run `npm run dev` and sign up; data is stored in Firestore.  
   To deploy the static demo to Firebase Hosting: set your project in `.firebaserc` and run `npm run deploy:firebase`.

### 2c. Supabase (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the migration:
   - Open `supabase/migrations/001_initial_schema.sql`
   - Copy its contents and run in the SQL Editor

3. In **Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Environment variables

Create `.env.local` in the `jobtracker` folder (or replace the placeholders in the existing one):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

If you skip this or leave placeholders, **Sign in / Sign up will show “Failed to fetch”**. Use **Try without signing in** on the home or login page to explore the app with sample data.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You can **try without signing in** (guest mode with sample data), or sign up to save your own jobs.

### 5. Demo / Admin user (optional)

To get a pre-made **demo + admin** account with sample data:

1. Run the second migration in the Supabase SQL Editor:  
   `supabase/migrations/002_profiles_and_demo.sql`
2. In Supabase **Settings → API**, copy the **service_role** secret (not the anon key).
3. From the `jobtracker` folder:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret npm run seed
```

4. Log in at [http://localhost:3000/login](http://localhost:3000/login) with:

| Field    | Value          |
|----------|----------------|
| Email    | `demo@example.com` |
| Password | `DemoAdmin1!`   |

That user has the **admin** role and pre-seeded companies and jobs. You can also sign up with your own email; to make that account an admin, set its profile in the DB:  
`update public.profiles set role = 'admin' where user_id = 'your-auth-user-id';`

## Project structure

```
jobtracker/
├── src/
│   ├── app/
│   │   ├── (dashboard)/     # Protected: dashboard, pipeline, jobs
│   │   ├── login/, signup/
│   │   ├── api/              # Route handlers (jobs CRUD, auth) — excluded from static export
│   │   └── page.tsx          # Landing
│   ├── components/          # UI (nav, pipeline, forms, charts)
│   ├── lib/supabase/        # Browser + server clients, middleware
├── lib/sheets/          # Google Sheets client + data layer
│   └── types/               # DB types, pipeline status
├── docs/                # GOOGLE_SHEET_SETUP.md
├── supabase/migrations/     # 001_initial_schema.sql, 002_profiles_and_demo.sql
├── scripts/                 # seed-demo-user.mjs (demo + admin user)
└── README.md
```

## Deploy

- **Vercel**: Connect the repo, set the same env vars, deploy.
- Ensure the Supabase project URL is allowed in **Authentication → URL Configuration** (e.g. `https://your-app.vercel.app`).

- **GitHub Pages**: Static export; see workflow [.github/workflows/deploy-gh-pages.yml](.github/workflows/deploy-gh-pages.yml). Demo mode only.

- **Firebase Hosting**: `npm run deploy:firebase` builds the static export and deploys to Firebase Hosting. Set your project in `.firebaserc`. Demo mode only on the static site. For full Firebase Auth + Firestore, run the app on Vercel (or another Node host) with Firebase env vars (see [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)).

## License

MIT.
