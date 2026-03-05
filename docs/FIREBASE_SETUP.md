# Firebase setup — step by step

Use Firebase for **login/signup** and **storing jobs and companies** in Firestore. Follow these steps in order.

---

## Step 1: Create a Firebase project

1. Open **[Firebase Console](https://console.firebase.google.com/)** and sign in with Google.
2. Click **“Create a project”** (or **“Add project”** if you already have one).
3. Enter a **project name** (e.g. `jobtracker`) → **Continue**.
4. Turn off Google Analytics if you don’t need it → **Create project** → **Continue** when it’s ready.

---

## Step 2: Enable Email/Password sign-in

1. In the left sidebar, open **Build** → **Authentication**.
2. Click **“Get started”** if you see it.
3. Open the **“Sign-in method”** tab.
4. Click **“Email/Password”**.
5. Turn **Enable** ON → **Save**.

---

## Step 3: Create the Firestore database

1. In the left sidebar, open **Build** → **Firestore Database**.
2. Click **“Create database”**.
3. Choose **“Start in test mode”** (we’ll add rules next) → **Next**.
4. Pick a location (e.g. `us-central1`) → **Enable**. Wait for the database to be created.

---

## Step 4: Set Firestore security rules

1. In **Firestore Database**, open the **“Rules”** tab.
2. Replace the entire rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /companies/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
    }
    match /jobs/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
    }
  }
}
```

3. Click **“Publish”**.

---

## Step 5: Get your web app config (client keys)

1. Click the **gear icon** next to “Project Overview” → **Project settings**.
2. Scroll to **“Your apps”**. If there’s no web app yet:
   - Click the **</>** (web) icon.
   - Register a nickname (e.g. `jobtracker-web`) → **Register app**.
   - You can skip the Firebase SDK snippets and click **“Continue to console”**.
3. In **“Your apps”**, open your **web app** and find the **firebaseConfig** object, e.g.:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

4. Keep this tab open; you’ll copy these values into `.env.local` in Step 7.

---

## Step 6: Create a service account key (server)

The server needs a **service account** to verify logins and read/write Firestore.

1. Still in **Project settings**, open the **“Service accounts”** tab.
2. Click **“Generate new private key”** → **Generate key**. A JSON file will download.
3. Open that JSON file. It looks like:
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "...",
     "client_id": "...",
     ...
   }
   ```
4. You will put this **entire JSON on one line** into `.env.local` in the next step. You can:
   - Minify it (remove all newlines and extra spaces), or
   - Use a small script to copy it as one line.

---

## Step 7: Add environment variables in the app

1. Open your project folder and go to **`jobtracker`**.
2. Open (or create) **`.env.local`** in the `jobtracker` folder (same level as `package.json`).
3. Add these lines, using **your** values from Step 5 and Step 6:

```env
# --- Firebase (from Step 5 - web app config) ---
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...

# --- Firebase service account (from Step 6 - one line JSON) ---
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project-id",...}
```

- Replace `AIza...`, `your-project-id`, `123456789`, `1:123456789:web:abc...` with the values from your **firebaseConfig**.
- For `FIREBASE_SERVICE_ACCOUNT_JSON`, paste the **entire** service account JSON as a **single line** (no line breaks inside the value). If the JSON contains double quotes, keep them (the value is one long string).

**Minimum required** for the app to use Firebase: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, and `FIREBASE_SERVICE_ACCOUNT_JSON`.

---

## Step 8: Run the app and sign up

1. In a terminal, from the **`jobtracker`** folder, run:

   ```bash
   npm run dev
   ```

2. Open **http://localhost:3000** in your browser.
3. Click **“Get started”** or **“Sign in”**, then **“Sign up”**.
4. Enter an email and password (e.g. your real email, 6+ characters) → **Sign up**.
5. You should be redirected to the dashboard. Add a job or company — it will be stored in **Firestore** (you can check the **Firestore Database** → **Data** tab in the Firebase Console to see `companies` and `jobs` collections).

---

## Troubleshooting

- **“Firebase not configured”** or login does nothing  
  - Make sure `.env.local` has at least `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, and `FIREBASE_SERVICE_ACCOUNT_JSON`.
  - Restart the dev server (`Ctrl+C`, then `npm run dev` again) after changing `.env.local`.

- **“Failed to create session”** when signing in  
  - Check that `FIREBASE_SERVICE_ACCOUNT_JSON` is valid JSON on one line and that the service account has not been deleted in Firebase.

- **Permission denied in Firestore**  
  - Confirm the Firestore **Rules** match the ones in Step 4 and that you clicked **Publish**. The app uses the Admin SDK on the server, so rules mainly protect direct client access.

---

## Optional: Deploy static site to Firebase Hosting

To host the **demo-only** static site (no login, mock data) on Firebase Hosting:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Log in: `firebase login`
3. In `jobtracker`, edit **`.firebaserc`** and set your project ID:
   ```json
   { "projects": { "default": "your-project-id" } }
   ```
4. Run: `npm run deploy:firebase`

The site will be at `https://your-project-id.web.app` (or the URL shown in the console). For full login and Firestore, run the app on a Node host (e.g. Vercel) with the same `.env` vars.
