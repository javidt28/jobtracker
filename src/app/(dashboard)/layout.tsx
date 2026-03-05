import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/ensure-profile";
import { isGuestMode } from "@/lib/guest";
import { hasSheetConfig } from "@/lib/sheets/client";
import { hasFirebaseConfig } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/session";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardShell } from "@/components/dashboard-shell";
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
      <DashboardShell sidebarContent={<DashboardNav user={{ id: "static", email: "Demo" }} role="user" guest />}>
        <GuestBanner />
        <div className="min-h-screen px-4 py-6 md:px-6 md:py-8 lg:px-8">{children}</div>
      </DashboardShell>
    );
  }

  const cookieStore = await cookies();
  const guest = isGuestMode(cookieStore);
  const useSheet = hasSheetConfig();
  const useFirebase = hasFirebaseConfig();

  if (guest) {
    return (
      <DashboardShell sidebarContent={<DashboardNav user={GUEST_USER as { id: string; email: string | null }} role="user" guest />}>
        <GuestBanner />
        <div className="min-h-screen px-4 py-6 md:px-6 md:py-8 lg:px-8">{children}</div>
      </DashboardShell>
    );
  }

  if (useFirebase) {
    const firebaseUser = await getFirebaseUser();
    if (!firebaseUser) redirect("/login");
    return (
      <DashboardShell sidebarContent={<DashboardNav user={{ id: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName }} role="user" firebaseMode />}>
        <div className="min-h-screen px-4 py-6 md:px-6 md:py-8 lg:px-8">{children}</div>
      </DashboardShell>
    );
  }

  if (useSheet) {
    const { getSheetSessionUser } = await import("@/lib/sheets/auth");
    const sheetUser = await getSheetSessionUser();
    if (!sheetUser) redirect("/login");
    return (
      <DashboardShell sidebarContent={<DashboardNav user={{ id: sheetUser.id, email: sheetUser.email, name: sheetUser.name }} role="user" sheetMode />}>
        <div className="min-h-screen px-4 py-6 md:px-6 md:py-8 lg:px-8">{children}</div>
      </DashboardShell>
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const profile = await ensureProfile(supabase, user.id);

    const displayName =
      (user.user_metadata?.full_name as string | undefined)?.trim() ||
      (user.user_metadata?.name as string | undefined)?.trim() ||
      null;
    return (
      <DashboardShell sidebarContent={<DashboardNav user={{ id: user.id, email: user.email ?? null, displayName }} role={profile.role} />}>
        <div className="min-h-screen px-4 py-6 md:px-6 md:py-8 lg:px-8">{children}</div>
      </DashboardShell>
    );
  } catch {
    redirect("/login");
  }
}
