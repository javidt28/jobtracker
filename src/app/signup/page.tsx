import Link from "next/link";
import { hasSheetConfig } from "@/lib/sheets/client";
import { hasFirebaseConfig } from "@/lib/firebase/config";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  const useSheet = hasSheetConfig();
  const useFirebase = hasFirebaseConfig();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-xl font-semibold text-[var(--foreground)]">
          Pipeline
        </Link>
        <h1 className="mt-8 font-display text-2xl font-normal text-[var(--foreground)]">
          Create an account
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Start tracking your job search
        </p>

        <SignupForm useSheet={useSheet} useFirebase={useFirebase} />

        <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--accent)]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
