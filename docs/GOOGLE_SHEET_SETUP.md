# Google Sheet backend setup

Use a Google Sheet as the database and for authentication (no Supabase).

## 1. Create a Google Sheet

1. Go to [sheets.new](https://sheets.new) and create a new spreadsheet.
2. Create **four** tabs with these exact names and **row 1 headers** (data starts row 2):

   **Tab `users`**  
   Row 1: `id` | `email` | `password_hash` | `name` | `created_at`

   **Tab `sessions`**  
   Row 1: `id` | `user_id` | `token` | `expires_at`

   **Tab `companies`**  
   Row 1: `id` | `name` | `website` | `created_at` | `updated_at` | `user_id`

   **Tab `jobs`**  
   Row 1: `id` | `company_id` | `title` | `status` | `source` | `salary_min` | `salary_max` | `location` | `job_url` | `description` | `notes` | `applied_at` | `updated_at` | `created_at` | `user_id`

3. Copy the **Sheet ID** from the URL:  
   `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`  
   Use the part between `/d/` and `/edit`.

## 2. Google Cloud: Service account

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Enable **Google Sheets API**: APIs & Services → Enable APIs → search “Google Sheets API” → Enable.
3. Create a service account: APIs & Services → Credentials → Create credentials → Service account. Name it (e.g. “Pipeline”) and finish.
4. Open the new service account → Keys → Add key → Create new key → JSON. Download the JSON file.
5. In the JSON, find `client_email` (e.g. `xxx@project.iam.gserviceaccount.com`). Share your Google Sheet with this email as **Editor** (Share button on the sheet).

## 3. Environment variables

In `jobtracker/.env.local` add:

```env
GOOGLE_SHEET_ID=your_sheet_id_from_step_1
```

Then either:

**Option A – JSON in env (e.g. Vercel)**  
Paste the whole JSON from the downloaded key into one line and set:

```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...", ...}
```

**Option B – Key file path (local)**  
Put the JSON file in the project (e.g. `jobtracker/sheet-credentials.json`) and add to `.gitignore`. Then:

```env
GOOGLE_APPLICATION_CREDENTIALS=./sheet-credentials.json
```

Restart the dev server. Open the app and **sign up** to create an account; your user and session are stored in the `users` and `sessions` tabs, and your jobs/companies are stored with your `user_id` so each user only sees their own data.
