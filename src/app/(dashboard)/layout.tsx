import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/ensure-profile";
import { isGuestMode } from "@/lib/guest";
import { hasSheetConfig } from "@/lib/sheets/client";
import { hasFirebaseConfig } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/session";
import { DashboardNav } from "@/components/dashboard-nav";
import { GuestBanner } from "@/components/guest-banner";

const GUEST_USER = { id: "guest", email: "guest@example.com" };
const SHEET_USER = { id: "sheet", email: "Google Sheet" };

const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (STATIC_EXPORT) {
    return (
      <div className="flex min-h-screen bg-[var(--background)]">
        <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--card)]" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex h-16 shrink-0 items-center border-b border-[var(--border)] px-5">
            <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
              JobsPipeline
            </Link>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <DashboardNav user={{ id: "static", email: "Demo" }} role="user" guest />
          </div>
        </aside>
        <main className="flex-1 pl-64">
          <GuestBanner />
          <div className="min-h-screen px-6 py-8 lg:px-8">{children}</div>
        </main>
      </div>
    );
  }

  const cookieStore = await cookies();
  const guest = isGuestMode(cookieStore);
  const useSheet = hasSheetConfig();
  const useFirebase = hasFirebaseConfig();

  if (guest) {
    return (
      <div className="flex min-h-screen bg-[var(--background)]">
        <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--card)]" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex h-16 shrink-0 items-center border-b border-[var(--border)] px-5">
            <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
              JobsPipeline
            </Link>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <DashboardNav user={GUEST_USER as { id: string; email: string | null }} role="user" guest />
          </div>
        </aside>
        <main className="flex-1 pl-64">
          <GuestBanner />
          <div className="min-h-screen px-6 py-8 lg:px-8">{children}</div>
        </main>
      </div>
    );
  }

  if (useFirebase) {
    const firebaseUser = await getFirebaseUser();
    if (!firebaseUser) redirect("/login");
    return (
      <div className="flex min-h-screen bg-[var(--background)]">
        <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--card)]" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex h-16 shrink-0 items-center border-b border-[var(--border)] px-5">
            <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
              JobsPipeline
            </Link>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <DashboardNav user={{ id: firebaseUser.uid, email: firebaseUser.email }} role="user" firebaseMode />
          </div>
        </aside>
        <main className="flex-1 pl-64">
          <div className="min-h-screen px-6 py-8 lg:px-8">{children}</div>
        </main>
      </div>
    );
  }

  if (useSheet) {
    const { getSheetSessionUser } = await import("@/lib/sheets/auth");
    const sheetUser = await getSheetSessionUser();
    if (!sheetUser) redirect("/login");
    return (
      <div className="flex min-h-screen bg-[var(--background)]">
        <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--card)]" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex h-16 shrink-0 items-center border-b border-[var(--border)] px-5">
            <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
              JobsPipeline
            </Link>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <DashboardNav user={{ id: sheetUser.id, email: sheetUser.email }} role="user" sheetMode />
          </div>
        </aside>
        <main className="flex-1 pl-64">
          <div className="min-h-screen px-6 py-8 lg:px-8">{children}</div>
        </main>
      </div>
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const profile = await ensureProfile(supabase, user.id);

    return (
      <div className="flex min-h-screen bg-[var(--background)]">
        <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--card)]" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex h-16 shrink-0 items-center border-b border-[var(--border)] px-5">
            <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
              JobsPipeline
            </Link>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <DashboardNav user={user} role={profile.role} />
          </div>
        </aside>
        <main className="flex-1 pl-64">
          <div className="min-h-screen px-6 py-8 lg:px-8">{children}</div>
        </main>
      </div>
    );
  } catch {
    redirect("/login");
  }
}
