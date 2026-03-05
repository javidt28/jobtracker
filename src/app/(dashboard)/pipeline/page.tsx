import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isGuestMode } from "@/lib/guest";
import { hasSheetConfig } from "@/lib/sheets/client";
import { getJobs } from "@/lib/sheets/data";
import { hasFirebaseConfig } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/session";
import * as firebaseData from "@/lib/firebase/data";
import { MOCK_JOBS } from "@/lib/mock-data";
import { PIPELINE_ORDER, PIPELINE_LABELS } from "@/types/database";
import { PipelineBoard } from "@/components/pipeline-board";
import type { Job } from "@/types/database";

const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

export default async function PipelinePage() {
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

  let jobs: Job[] = [];
  if (guest) {
    jobs = MOCK_JOBS;
  } else if (useFirebase) {
    const firebaseUser = await getFirebaseUser();
    jobs = await firebaseData.getJobs(firebaseUser?.uid ?? "");
  } else if (useSheet) {
    const { getSheetSessionUser } = await import("@/lib/sheets/auth");
    const sheetUser = await getSheetSessionUser();
    jobs = await getJobs(sheetUser?.id ?? undefined);
  } else {
    const supabase = await createClient();
    const { data } = await supabase.from("jobs").select("*, company:companies(*)").order("updated_at", { ascending: false });
    jobs = (data ?? []) as Job[];
  }

  const jobsByStatus = PIPELINE_ORDER.reduce(
    (acc, status) => {
      acc[status] = jobs.filter((j) => j.status === status);
      return acc;
    },
    {} as Record<string, Job[]>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-normal text-[var(--foreground)]">
          Pipeline
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Drag cards between columns to update status
        </p>
      </div>

      <PipelineBoard initialColumns={jobsByStatus} labels={PIPELINE_LABELS} guestMode={guest} />
    </div>
  );
}
