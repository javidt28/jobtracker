import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isGuestMode } from "@/lib/guest";
import { hasSheetConfig } from "@/lib/sheets/client";
import { getJobs, getCompanies } from "@/lib/sheets/data";
import { hasFirebaseConfig } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/session";
import * as firebaseData from "@/lib/firebase/data";
import { MOCK_JOBS } from "@/lib/mock-data";
import { JobForm } from "@/components/job-form";
import type { PipelineStatus } from "@/types/database";

export function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT !== "1") return [];
  return MOCK_JOBS.map((j) => ({ id: j.id }));
}

const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

export default async function EditJobPage({
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
  if (guest && !useSheet && !useFirebase) redirect(`/jobs/${id}`);

  let job: { id: string; title: string; company_id: string | null; company?: { name?: string } | null; status: string; source: string | null; salary_min: number | null; salary_max: number | null; location: string | null; job_url: string | null; description: string | null; notes: string | null; applied_at: string | null } | null = null;
  let companies: { id: string; name: string }[] = [];

  if (useFirebase) {
    const firebaseUser = await getFirebaseUser();
    const [jobsList, companiesList] = await Promise.all([
      firebaseData.getJobs(firebaseUser?.uid ?? ""),
      firebaseData.getCompanies(firebaseUser?.uid ?? ""),
    ]);
    job = jobsList.find((j) => j.id === id) ?? null;
    companies = companiesList.map((c) => ({ id: c.id, name: c.name }));
  } else if (useSheet) {
    const { getSheetSessionUser } = await import("@/lib/sheets/auth");
    const sheetUser = await getSheetSessionUser();
    const [jobsList, companiesList] = await Promise.all([
      getJobs(sheetUser?.id ?? undefined),
      getCompanies(sheetUser?.id ?? undefined),
    ]);
    job = jobsList.find((j) => j.id === id) ?? null;
    companies = companiesList.map((c) => ({ id: c.id, name: c.name }));
  } else {
    const supabase = await createClient();
    const { data: jobData } = await supabase
      .from("jobs")
      .select("*, company:companies(*)")
      .eq("id", id)
      .single();
    const { data: companiesData } = await supabase.from("companies").select("id, name").order("name");
    job = jobData as typeof job | null;
    companies = (companiesData ?? []) as { id: string; name: string }[];
  }

  if (!job) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/jobs/${job.id}`}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          ← Back to job
        </Link>
        <h1 className="mt-2 font-display text-2xl font-normal text-[var(--foreground)]">
          Edit application
        </h1>
      </div>

      <JobForm
        companies={companies}
        job={{
          id: job.id,
          title: job.title,
          company_id: job.company_id,
          company_name: (job.company as { name?: string } | null)?.name,
          status: job.status as PipelineStatus,
          source: job.source,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          location: job.location,
          job_url: job.job_url,
          description: job.description,
          notes: job.notes,
          applied_at: job.applied_at,
        }}
      />
    </div>
  );
}
