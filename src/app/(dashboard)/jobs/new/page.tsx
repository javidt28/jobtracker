import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isGuestMode } from "@/lib/guest";
import { hasSheetConfig } from "@/lib/sheets/client";
import { getCompanies } from "@/lib/sheets/data";
import { hasFirebaseConfig } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/session";
import * as firebaseData from "@/lib/firebase/data";
import { JobForm } from "@/components/job-form";
import Link from "next/link";

const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

export default async function NewJobPage() {
  let guest: boolean;
  let useSheet: boolean;
  let useFirebase: boolean;
  if (STATIC_EXPORT) {
    guest = true;
    useSheet = false;
    useFirebase = false;
  } else {
    const cookieStore = await cookies();
    guest = isGuestMode(cookieStore);
    useSheet = hasSheetConfig();
    useFirebase = hasFirebaseConfig();
  }

  if (guest && !useSheet && !useFirebase) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/jobs" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          ← All jobs
        </Link>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <h2 className="font-display text-xl font-normal text-[var(--foreground)]">Add application</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">Sign up or log in to add and save applications.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/signup" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:opacity-90">
              Sign up
            </Link>
            <Link href="/login" className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let companies: { id: string; name: string }[] = [];
  if (useFirebase) {
    const firebaseUser = await getFirebaseUser();
    const list = await firebaseData.getCompanies(firebaseUser?.uid ?? "");
    companies = list.map((c) => ({ id: c.id, name: c.name }));
  } else if (useSheet) {
    const { getSheetSessionUser } = await import("@/lib/sheets/auth");
    const sheetUser = await getSheetSessionUser();
    const list = await getCompanies(sheetUser?.id ?? undefined);
    companies = list.map((c) => ({ id: c.id, name: c.name }));
  } else {
    const supabase = await createClient();
    const { data } = await supabase.from("companies").select("id, name").order("name");
    companies = (data ?? []) as { id: string; name: string }[];
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/jobs" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          ← All jobs
        </Link>
        <h1 className="mt-2 font-display text-2xl font-normal text-[var(--foreground)]">
          Add application
        </h1>
      </div>

      <JobForm companies={companies} />
    </div>
  );
}
