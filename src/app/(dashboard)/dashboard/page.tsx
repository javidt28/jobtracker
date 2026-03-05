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
import { StatCard } from "@/components/stat-card";
import { FunnelChart } from "@/components/funnel-chart";
import Link from "next/link";

const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

export default async function DashboardPage() {
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

  let jobs: { id: string; status: string; applied_at: string | null }[] = [];
  if (guest) {
    jobs = MOCK_JOBS.map((j) => ({ id: j.id, status: j.status, applied_at: j.applied_at }));
  } else if (useFirebase) {
    const firebaseUser = await getFirebaseUser();
    const sheetJobs = await firebaseData.getJobs(firebaseUser?.uid ?? "");
    jobs = sheetJobs.map((j) => ({ id: j.id, status: j.status, applied_at: j.applied_at }));
  } else if (useSheet) {
    const { getSheetSessionUser } = await import("@/lib/sheets/auth");
    const sheetUser = await getSheetSessionUser();
    const sheetJobs = await getJobs(sheetUser?.id ?? undefined);
    jobs = sheetJobs.map((j) => ({ id: j.id, status: j.status, applied_at: j.applied_at }));
  } else {
    const supabase = await createClient();
    const { data } = await supabase.from("jobs").select("id, status, applied_at").order("applied_at", { ascending: false });
    jobs = data ?? [];
  }

  const total = jobs.length;
  const byStatus = PIPELINE_ORDER.reduce(
    (acc, status) => {
      acc[status] = jobs.filter((j) => j.status === status).length;
      return acc;
    },
    {} as Record<string, number>
  );
  const active = total - (byStatus.rejected ?? 0);
  const offers = byStatus.offer ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-normal text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Overview of your job search
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total applications" value={total} />
        <StatCard label="Active" value={active} />
        <StatCard label="Offers" value={offers} />
        <StatCard
          label="Conversion"
          value={total ? `${Math.round((offers / total) * 100)}%` : "—"}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-semibold text-[var(--foreground)]">
            Pipeline funnel
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Applications by stage
          </p>
          <div className="mt-6">
            <FunnelChart
              data={PIPELINE_ORDER.map((status) => ({
                name: PIPELINE_LABELS[status as keyof typeof PIPELINE_LABELS],
                value: byStatus[status] ?? 0,
              }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-semibold text-[var(--foreground)]">
            Quick actions
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Add or manage applications
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/jobs/new"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:opacity-90"
            >
              Add application
            </Link>
            <Link
              href="/pipeline"
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              View pipeline
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
