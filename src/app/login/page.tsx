import Link from "next/link";
import { hasSheetConfig } from "@/lib/sheets/client";
import { hasFirebaseConfig } from "@/lib/firebase/config";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  const useSheet = hasSheetConfig();
  const useFirebase = hasFirebaseConfig();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-xl font-semibold text-[var(--foreground)]">
          Pipeline
        </Link>
        <h1 className="mt-8 font-display text-2xl font-normal text-[var(--foreground)]">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Sign in to your account
        </p>

        <LoginForm useSheet={useSheet} useFirebase={useFirebase} />

        <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
          Don’t have an account?{" "}
          <Link href="/signup" className="font-medium text-[var(--accent)]">
            Sign up
          </Link>
        </p>
        {!useSheet && !useFirebase && (
          <p className="mt-3 text-center">
            <Link
              href="/api/guest"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              Try without signing in →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
