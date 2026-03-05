"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { apiSignOut, apiFirebaseSignOut } from "@/lib/api-client";
import type { User } from "@supabase/supabase-js";
import { clsx } from "clsx";

function getInitials(guest: boolean, email: string | null): string {
  if (guest) return "G";
  if (!email) return "?";
  const local = email.split("@")[0] ?? "";
  const domain = email.split("@")[1] ?? "";
  const a = local[0]?.toUpperCase() ?? "?";
  const b = domain[0]?.toUpperCase() ?? "";
  return b ? `${a}${b}` : a;
}

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/pipeline", label: "Pipeline", icon: PipelineIcon },
  { href: "/jobs", label: "All jobs", icon: JobsIcon },
];

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function PipelineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="5" height="16" rx="1" />
      <rect x="9" y="4" width="5" height="16" rx="1" />
      <rect x="16" y="4" width="5" height="16" rx="1" />
    </svg>
  );
}

function JobsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );
}

type UserLike = { id: string; email: string | null };

export function DashboardNav({
  user,
  role = "user",
  guest = false,
  sheetMode = false,
  firebaseMode = false,
}: {
  user: User | UserLike;
  role?: string;
  guest?: boolean;
  sheetMode?: boolean;
  firebaseMode?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const initials = getInitials(guest, user.email ?? null);

  async function signOut() {
    if (guest) {
      document.cookie = "pipeline_guest=; path=/; max-age=0";
      router.push("/");
      router.refresh();
      return;
    }
    if (firebaseMode) {
      await apiFirebaseSignOut();
      router.push("/");
      router.refresh();
      return;
    }
    if (sheetMode) {
      await apiSignOut();
      router.push("/");
      router.refresh();
      return;
    }
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
        {nav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon className={clsx("shrink-0", isActive ? "text-[var(--accent)]" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        {role === "admin" && (
          <span className="mb-2 inline-block rounded-lg bg-[var(--accent)]/15 px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
            Admin
          </span>
        )}
        <div
          className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 p-3"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-[var(--accent-foreground)]"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--foreground)]">
              {guest ? "Guest" : "Account"}
            </p>
            <button
              type="button"
              onClick={signOut}
              className="text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
            >
              {guest ? "Exit guest mode" : "Sign out"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
