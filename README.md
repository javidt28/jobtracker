# JobsPipeline — Job Tracking SaaS

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

## How to host

| Option | Login & data | Best for |
|--------|----------------|----------|
| **Vercel** | ✅ Full (Firebase, Sheet, or Supabase) | Production app with auth and DB |
| **Firebase Hosting (static)** | ❌ Demo only | Quick public demo, no backend |
| **GitHub Pages** | ❌ Demo only | Portfolio link, no backend |

### 1. Vercel (full app with login + data)

1. Push the repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import your repo.
3. **Root Directory**: leave as `.` or set to `jobtracker` if the repo root is the parent folder.
4. **Environment variables**: add the same vars you use in `.env.local` (Firebase, Google Sheet, or Supabase).  
   - For **Firebase**: all `NEXT_PUBLIC_FIREBASE_*` and `FIREBASE_SERVICE_ACCOUNT_JSON`.  
   - For **Supabase**: add your production URL to **Supabase → Authentication → URL Configuration**.
5. Deploy. Your app will run at `https://your-project.vercel.app` with full auth and data.

### 2. Firebase Hosting (demo only, no login)

1. Install CLI: `npm install -g firebase-tools`
2. Log in: `firebase login`
3. In `jobtracker`, set your project in `.firebaserc`: `"default": "your-firebase-project-id"`
4. Run: `npm run deploy:firebase`  
   The site is at `https://your-project-id.web.app`. It runs in **demo mode** (mock data, no sign-in).

### 3. GitHub Pages (demo only, no login)

1. Push the repo to GitHub.
2. **Settings** → **Pages** → **Source**: **GitHub Actions**.
3. On every push to `main`, the workflow [.github/workflows/deploy-gh-pages.yml](.github/workflows/deploy-gh-pages.yml) builds and deploys.  
   Site: `https://<username>.github.io/<repo-name>/`. **Demo mode** only.

## Deploy (short ref)

- **Vercel**: Connect repo, set env vars, deploy. Add your app URL in Supabase **Auth → URL Configuration** if using Supabase.
- **Firebase Hosting**: `npm run deploy:firebase` (demo only).
- **GitHub Pages**: Enable Pages from **GitHub Actions** (demo only).

## License

MIT.
