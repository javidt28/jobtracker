import Link from "next/link";
import { hasSheetConfig } from "@/lib/sheets/client";
import { hasFirebaseConfig } from "@/lib/firebase/config";

export default function HomePage() {
  const useSheet = hasSheetConfig();
  const useFirebase = hasFirebaseConfig();
  const useBackend = useSheet || useFirebase;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="font-display text-xl font-semibold text-[var(--foreground)]">
            Pipeline
          </span>
          <nav className="flex items-center gap-4">
            {useBackend ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:opacity-90"
              >
                Open app
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:opacity-90"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h1 className="font-display text-5xl font-normal tracking-tight text-[var(--foreground)] sm:text-6xl">
          Job tracking that
          <br />
          <span className="text-[var(--accent)]">gets you hired</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--muted-foreground)]">
          Track every application, nail your interviews, and land your next
          role. Your search, one place.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {useBackend ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-medium text-[var(--accent-foreground)] hover:opacity-90"
            >
              Open app
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-medium text-[var(--accent-foreground)] hover:opacity-90"
              >
                Start free
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-base font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                Sign in
              </Link>
            </>
          )}
          <Link
            href="/api/guest"
            className="rounded-xl border border-dashed border-[var(--border)] px-6 py-3 text-base font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Try without signing in
          </Link>
        </div>

        <div className="mt-24 grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Pipeline view",
              desc: "Drag applications through stages from Applied to Offer.",
            },
            {
              title: "Analytics",
              desc: "See conversion rates and where you get stuck.",
            },
            {
              title: "All in one",
              desc: "Companies, contacts, notes, and links in one place.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-left"
            >
              <h3 className="font-semibold text-[var(--foreground)]">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
