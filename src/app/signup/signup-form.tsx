"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { createClient } from "@/lib/supabase/client";
import { apiSignUp, apiFirebaseSession } from "@/lib/api-client";
import { getFirebaseAuth } from "@/lib/firebase/app";

export function SignupForm({
  useSheet,
  useFirebase,
}: {
  useSheet: boolean;
  useFirebase?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (useFirebase) {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase not configured");
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await user.getIdToken();
        const { redirect: to } = await apiFirebaseSession(idToken);
        await new Promise((r) => setTimeout(r, 150));
        window.location.assign(to ?? "/dashboard");
        return;
      }
      if (useSheet) {
        const { redirect: to } = await apiSignUp(email, password, name || undefined);
        router.push(to);
        router.refresh();
        return;
      }
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard` },
      });
      if (err) {
        setError(err.message);
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err?.code === "auth/email-already-in-use") {
        setError("This email is already registered. Sign in instead.");
        return;
      }
      setError(err?.message ?? (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }

  if (success && !useSheet && !useFirebase) {
    return (
      <div className="mt-8 text-center">
        <h2 className="font-display text-xl font-normal text-[var(--foreground)]">
          Check your email
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          We sent a confirmation link to {email}. Click it to activate your account, then sign in.
        </p>
        <Link href="/login" className="mt-6 inline-block font-medium text-[var(--accent)]">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
          {error.includes("already registered") && (
            <p className="mt-2">
              <Link href="/login" className="font-medium text-[var(--accent)] hover:underline">
                Go to sign in →
              </Link>
            </p>
          )}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)]">
          Name (optional)
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          placeholder="At least 6 characters"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 font-medium text-[var(--accent-foreground)] hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
