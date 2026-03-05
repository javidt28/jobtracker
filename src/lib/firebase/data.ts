import { getAdminFirestore } from "./admin";
import { hasFirebaseConfig } from "./config";
import type { Company, Job, PipelineStatus } from "@/types/database";

const COMPANIES = "companies";
const JOBS = "jobs";

function now() {
  return new Date().toISOString();
}

export async function getCompanies(userId: string): Promise<Company[]> {
  if (!hasFirebaseConfig()) return [];
  const db = getAdminFirestore();
  if (!db) return [];
  const snap = await db.collection(COMPANIES).where("user_id", "==", userId).get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      user_id: (data.user_id as string) ?? userId,
      name: (data.name as string) ?? "",
      website: (data.website as string) || null,
      logo_url: (data.logo_url as string) || null,
      created_at: (data.created_at as string) ?? now(),
      updated_at: (data.updated_at as string) ?? now(),
    };
  });
}

export async function getJobs(userId: string): Promise<Job[]> {
  if (!hasFirebaseConfig()) return [];
  const db = getAdminFirestore();
  if (!db) return [];
  const [jobsSnap, companiesSnap] = await Promise.all([
    db.collection(JOBS).where("user_id", "==", userId).get(),
    db.collection(COMPANIES).where("user_id", "==", userId).get(),
  ]);
  const companyMap = new Map<string, Company>();
  companiesSnap.docs.forEach((d) => {
    const data = d.data();
    companyMap.set(d.id, {
      id: d.id,
      user_id: (data.user_id as string) ?? userId,
      name: (data.name as string) ?? "",
      website: (data.website as string) || null,
      logo_url: (data.logo_url as string) || null,
      created_at: (data.created_at as string) ?? now(),
      updated_at: (data.updated_at as string) ?? now(),
    });
  });
  return jobsSnap.docs.map((d) => {
    const data = d.data();
    const companyId = (data.company_id as string) || null;
    return {
      id: d.id,
      user_id: (data.user_id as string) ?? userId,
      company_id: companyId,
      title: (data.title as string) ?? "",
      status: (data.status as PipelineStatus) ?? "applied",
      source: (data.source as string) || null,
      salary_min: data.salary_min != null ? Number(data.salary_min) : null,
      salary_max: data.salary_max != null ? Number(data.salary_max) : null,
      location: (data.location as string) || null,
      job_url: (data.job_url as string) || null,
      description: (data.description as string) || null,
      notes: (data.notes as string) || null,
      applied_at: (data.applied_at as string) || null,
      updated_at: (data.updated_at as string) ?? now(),
      created_at: (data.created_at as string) ?? now(),
      company: companyId ? companyMap.get(companyId) ?? null : null,
    };
  });
}

export async function getOrCreateCompany(name: string, userId: string): Promise<Company> {
  const companies = await getCompanies(userId);
  const existing = companies.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
  if (existing) return existing;
  const db = getAdminFirestore();
  if (!db) throw new Error("Firestore not configured");
  const created = now();
  const ref = await db.collection(COMPANIES).add({
    user_id: userId,
    name: name.trim(),
    website: null,
    logo_url: null,
    created_at: created,
    updated_at: created,
  });
  return {
    id: ref.id,
    user_id: userId,
    name: name.trim(),
    website: null,
    logo_url: null,
    created_at: created,
    updated_at: created,
  };
}

export async function createJob(
  userId: string,
  input: {
    title: string;
    company_id: string | null;
    company_name?: string;
    status: PipelineStatus;
    source?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    location?: string | null;
    job_url?: string | null;
    description?: string | null;
    notes?: string | null;
    applied_at?: string | null;
  }
): Promise<string> {
  const db = getAdminFirestore();
  if (!db) throw new Error("Firestore not configured");
  let companyId = input.company_id;
  if (!companyId && input.company_name?.trim()) {
    const company = await getOrCreateCompany(input.company_name, userId);
    companyId = company.id;
  }
  const created = now();
  const ref = await db.collection(JOBS).add({
    user_id: userId,
    company_id: companyId ?? null,
    title: input.title.trim(),
    status: input.status,
    source: input.source ?? null,
    salary_min: input.salary_min ?? null,
    salary_max: input.salary_max ?? null,
    location: input.location ?? null,
    job_url: input.job_url ?? null,
    description: input.description ?? null,
    notes: input.notes ?? null,
    applied_at: input.applied_at ?? null,
    created_at: created,
    updated_at: created,
  });
  return ref.id;
}

export async function updateJob(
  jobId: string,
  userId: string,
  input: {
    title?: string;
    company_id?: string | null;
    company_name?: string;
    status?: PipelineStatus;
    source?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    location?: string | null;
    job_url?: string | null;
    description?: string | null;
    notes?: string | null;
    applied_at?: string | null;
  }
): Promise<void> {
  const db = getAdminFirestore();
  if (!db) throw new Error("Firestore not configured");
  const jobs = await getJobs(userId);
  const job = jobs.find((j) => j.id === jobId);
  if (!job) throw new Error("Job not found");
  let companyId: string | null | undefined = input.company_id;
  if (input.company_name?.trim()) {
    const company = await getOrCreateCompany(input.company_name, userId);
    companyId = company.id;
  }
  const updated = now();
  const updateData: Record<string, unknown> = {
    updated_at: updated,
  };
  if (input.title !== undefined) updateData.title = input.title.trim();
  if (companyId !== undefined) updateData.company_id = companyId;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.source !== undefined) updateData.source = input.source;
  if (input.salary_min !== undefined) updateData.salary_min = input.salary_min;
  if (input.salary_max !== undefined) updateData.salary_max = input.salary_max;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.job_url !== undefined) updateData.job_url = input.job_url;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.notes !== undefined) updateData.notes = input.notes;
  if (input.applied_at !== undefined) updateData.applied_at = input.applied_at;
  await db.collection(JOBS).doc(jobId).update(updateData);
}

export async function updateJobStatus(jobId: string, userId: string, status: PipelineStatus): Promise<void> {
  await updateJob(jobId, userId, { status });
}

export async function deleteJob(jobId: string, userId: string): Promise<void> {
  const db = getAdminFirestore();
  if (!db) throw new Error("Firestore not configured");
  const jobs = await getJobs(userId);
  if (!jobs.some((j) => j.id === jobId)) throw new Error("Job not found");
  await db.collection(JOBS).doc(jobId).delete();
}
