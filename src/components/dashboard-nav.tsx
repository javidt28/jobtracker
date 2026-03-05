"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { apiSignOut, apiFirebaseSignOut } from "@/lib/api-client";
import type { User } from "@supabase/supabase-js";
import { clsx } from "clsx";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/jobs", label: "All jobs" },
];

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
    <nav className="flex flex-col gap-1 p-3">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={clsx(
            "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-[var(--accent)]/10 text-[var(--accent)]"
              : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          {item.label}
        </Link>
      ))}
      <div className="mt-auto border-t border-[var(--border)] pt-3">
        {role === "admin" && (
          <span className="mx-3 mb-1 inline-block rounded bg-[var(--accent)]/20 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
            Admin
          </span>
        )}
        <p className="truncate px-3 py-1 text-xs text-[var(--muted-foreground)]">
          {guest ? "Guest" : sheetMode ? user.email : user.email}
        </p>
        <button
          onClick={signOut}
          type="button"
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
        >
          {guest ? "Exit guest mode" : sheetMode ? "Sign out" : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
