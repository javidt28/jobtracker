import { cookies } from "next/headers";
import { getAdminAuth } from "./admin";
import { hasFirebaseConfig } from "./config";

const FIREBASE_SESSION_COOKIE = "firebase_session";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 5, // 5 days
};

const SESSION_MAX_AGE = 5 * 24 * 60 * 60; // 5 days in seconds

export async function setFirebaseSessionCookie(idToken: string): Promise<
  { ok: true; sessionCookie: string } | { ok: false; error: string }
> {
  const auth = getAdminAuth();
  if (!auth) {
    return { ok: false, error: "Firebase Admin not configured. Check FIREBASE_SERVICE_ACCOUNT_JSON in .env.local." };
  }
  try {
    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days in ms (max 2 weeks)
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    return { ok: true, sessionCookie };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}

export function getFirebaseSessionCookieOptions() {
  return {
    name: FIREBASE_SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export async function clearFirebaseSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(FIREBASE_SESSION_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

export { FIREBASE_SESSION_COOKIE };

export async function getFirebaseUser(): Promise<{ uid: string; email: string | null } | null> {
  if (!hasFirebaseConfig()) return null;
  const auth = getAdminAuth();
  if (!auth) return null;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(FIREBASE_SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;
  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}
