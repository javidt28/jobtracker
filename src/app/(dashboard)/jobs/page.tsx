import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isGuestMode } from "@/lib/guest";
import { hasSheetConfig } from "@/lib/sheets/client";
import { getJobs } from "@/lib/sheets/data";
import { hasFirebaseConfig } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/session";
import * as firebaseData from "@/lib/firebase/data";
import { MOCK_JOBS } from "@/lib/mock-data";
import { JobsTable } from "./jobs-table";
import type { Job } from "@/types/database";

const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

export default async function JobsPage() {
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

  let jobList: Job[] = [];
  if (guest) jobList = MOCK_JOBS;
  else if (useFirebase) {
    const firebaseUser = await getFirebaseUser();
    jobList = await firebaseData.getJobs(firebaseUser?.uid ?? "");
  } else if (useSheet) {
    const { getSheetSessionUser } = await import("@/lib/sheets/auth");
    const sheetUser = await getSheetSessionUser();
    jobList = await getJobs(sheetUser?.id ?? undefined);
  } else {
    const supabase = await createClient();
    const { data } = await supabase.from("jobs").select("*, company:companies(*)").order("applied_at", { ascending: false });
    jobList = (data ?? []) as Job[];
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-normal tracking-tight text-[var(--foreground)]">
            All jobs
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Search and filter your applications
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex shrink-0 items-center rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-foreground)] shadow-sm transition hover:opacity-95"
        >
          Add application
        </Link>
      </header>

      <JobsTable jobs={jobList} />
    </div>
  );
}
