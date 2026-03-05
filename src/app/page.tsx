import Link from "next/link";
import { hasSheetConfig } from "@/lib/sheets/client";
import { hasFirebaseConfig } from "@/lib/firebase/config";

export default function HomePage() {
  const useSheet = hasSheetConfig();
  const useFirebase = hasFirebaseConfig();
  const useBackend = useSheet || useFirebase;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-semibold tracking-tight text-[var(--foreground)]">
              JobsPipeline
            </span>
            <span className="hidden text-sm font-normal text-[var(--muted-foreground)] sm:inline">
              Job search command center
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            {useBackend ? (
              <Link
                href="/dashboard"
                className="inline-flex min-h-[44px] items-center rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-foreground)] shadow-sm transition hover:opacity-95"
              >
                Open app
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex min-h-[44px] items-center rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex min-h-[44px] items-center rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-foreground)] shadow-sm transition hover:opacity-95"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-[var(--accent)]">
              Job search, organized
            </p>
            <h1 className="mt-4 font-display text-4xl font-normal tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              Track every application.
              <br />
              <span className="text-[var(--accent)]">Land the role.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[var(--muted-foreground)] sm:text-xl">
              JobsPipeline keeps your job search in one place—applications, interviews, and offers—so you stay on top of every opportunity.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {useBackend ? (
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-[var(--accent)] px-6 py-3.5 text-base font-medium text-[var(--accent-foreground)] shadow-sm transition hover:opacity-95"
                >
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex min-h-[44px] items-center rounded-xl bg-[var(--accent)] px-6 py-3.5 text-base font-medium text-[var(--accent-foreground)] shadow-sm transition hover:opacity-95"
                  >
                    Get started free
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex min-h-[44px] items-center rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-3.5 text-base font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--border)] bg-[var(--muted)]/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center font-display text-2xl font-normal tracking-tight text-[var(--foreground)] sm:text-3xl">
              Everything you need to run your search
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-[var(--muted-foreground)]">
              Built for serious job seekers who want clarity and control.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-3 sm:gap-8">
              {[
                {
                  title: "Pipeline view",
                  description: "See every application by stage—Applied, Screening, Interview, Offer—and move deals with drag and drop.",
                },
                {
                  title: "Analytics",
                  description: "Conversion rates, funnel breakdown, and time-in-stage so you know where you stand and where to focus.",
                },
                {
                  title: "One place",
                  description: "Companies, roles, notes, links, and deadlines in a single dashboard. No more scattered spreadsheets.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-left"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <h3 className="font-semibold text-[var(--foreground)]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-[var(--border)] py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
            <span className="font-display text-sm font-medium text-[var(--foreground)]">
              JobsPipeline
            </span>
            <p className="text-sm text-[var(--muted-foreground)]">
              © {new Date().getFullYear()} JobsPipeline. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
