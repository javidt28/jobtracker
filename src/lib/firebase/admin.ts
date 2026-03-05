import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App | null {
  if (getApps().length) return getApps()[0] as App;
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (key) {
    try {
      const credentials = JSON.parse(key);
      return initializeApp({ credential: cert(credentials) });
    } catch {
      return null;
    }
  }
  if (keyPath) {
    return initializeApp({ credential: cert(keyPath) });
  }
  return null;
}

export function getAdminAuth() {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export function getAdminFirestore() {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}
