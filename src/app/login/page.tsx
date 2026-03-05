import Link from "next/link";
import { hasSheetConfig } from "@/lib/sheets/client";
import { hasFirebaseConfig } from "@/lib/firebase/config";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  const useSheet = hasSheetConfig();
  const useFirebase = hasFirebaseConfig();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-[400px]">
        <Link
          href="/"
          className="inline-block font-display text-xl font-semibold tracking-tight text-[var(--foreground)]"
        >
          JobsPipeline
        </Link>
        <div
          className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-8"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h1 className="font-display text-2xl font-normal text-[var(--foreground)]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Sign in to your account to continue
          </p>

          <div className="mt-6">
            <LoginForm useSheet={useSheet} useFirebase={useFirebase} />
          </div>

          <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            Don’t have an account?{" "}
            <Link href="/signup" className="font-medium text-[var(--accent)] hover:underline">
            Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
