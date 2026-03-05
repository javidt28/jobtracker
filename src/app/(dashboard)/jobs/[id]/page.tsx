import { notFound } from "next/navigation";
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
import { PIPELINE_LABELS } from "@/types/database";
import type { Job, PipelineStatus } from "@/types/database";
import { DeleteJobButton } from "./delete-job-button";

const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

export function generateStaticParams() {
  if (!STATIC_EXPORT) return [];
  return MOCK_JOBS.map((j) => ({ id: j.id }));
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  let job: Job | null = null;
  if (guest) {
    job = MOCK_JOBS.find((j) => j.id === id) ?? null;
  } else if (useFirebase) {
    const firebaseUser = await getFirebaseUser();
    const jobs = await firebaseData.getJobs(firebaseUser?.uid ?? "");
    job = jobs.find((j) => j.id === id) ?? null;
  } else if (useSheet) {
    const { getSheetSessionUser } = await import("@/lib/sheets/auth");
    const sheetUser = await getSheetSessionUser();
    const jobs = await getJobs(sheetUser?.id ?? undefined);
    job = jobs.find((j) => j.id === id) ?? null;
  } else {
    const supabase = await createClient();
    const { data } = await supabase.from("jobs").select("*, company:companies(*)").eq("id", id).single();
    job = data as Job | null;
  }

  if (!job) notFound();

  const company = job.company as { name?: string; website?: string } | null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/jobs"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            ← All jobs
          </Link>
          <h1 className="mt-2 font-display text-2xl font-normal text-[var(--foreground)]">
            {job.title}
          </h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            {company?.name ?? "Unknown company"}
          </p>
        </div>
        {!guest && (
          <div className="flex items-center gap-2">
            <Link
              href={`/jobs/${job.id}/edit`}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
            >
              Edit
            </Link>
            <DeleteJobButton jobId={job.id} />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              Status
            </p>
            <p className="mt-1">
              <span className="inline-flex rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-sm font-medium">
                {PIPELINE_LABELS[job.status as PipelineStatus]}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              Applied
            </p>
            <p className="mt-1 text-[var(--foreground)]">
              {job.applied_at
                ? new Date(job.applied_at).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              Source
            </p>
            <p className="mt-1 text-[var(--foreground)]">
              {job.source ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              Location
            </p>
            <p className="mt-1 text-[var(--foreground)]">
              {job.location ?? "—"}
            </p>
          </div>
          {(job.salary_min != null || job.salary_max != null) && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-[var(--muted-foreground)]">
                Salary range
              </p>
              <p className="mt-1 text-[var(--foreground)]">
                {job.salary_min != null && job.salary_max != null
                  ? `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}`
                  : job.salary_min != null
                    ? `From $${job.salary_min.toLocaleString()}`
                    : `Up to $${job.salary_max!.toLocaleString()}`}
              </p>
            </div>
          )}
        </div>

        {job.job_url && (
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              Job posting
            </p>
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-[var(--accent)] hover:underline"
            >
              {job.job_url}
            </a>
          </div>
        )}

        {company?.website && (
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              Company website
            </p>
            <a
              href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-[var(--accent)] hover:underline"
            >
              {company.website}
            </a>
          </div>
        )}

        {job.notes && (
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              Notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-[var(--foreground)]">
              {job.notes}
            </p>
          </div>
        )}

        {job.description && (
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              Description
            </p>
            <p className="mt-1 whitespace-pre-wrap text-[var(--foreground)] text-sm">
              {job.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
