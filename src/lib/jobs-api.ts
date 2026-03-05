import * as sheets from "@/lib/sheets/data";
import { getSheetSessionUser } from "@/lib/sheets/auth";
import { hasSheetConfig } from "@/lib/sheets/client";
import { hasFirebaseConfig } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/session";
import * as firebaseData from "@/lib/firebase/data";
import type { PipelineStatus } from "@/types/database";

async function getCurrentUserId(): Promise<string | null> {
  if (hasFirebaseConfig()) {
    const user = await getFirebaseUser();
    return user?.uid ?? null;
  }
  if (hasSheetConfig()) {
    const user = await getSheetSessionUser();
    return user?.id ?? null;
  }
  return null;
}

export interface CreateJobBody {
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

export async function createJob(body: CreateJobBody): Promise<{ id: string }> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");
  if (hasFirebaseConfig()) {
    const id = await firebaseData.createJob(userId, body);
    return { id };
  }
  const id = await sheets.createJob(userId, body);
  return { id };
}

export interface UpdateJobBody {
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

export async function updateJob(jobId: string, body: UpdateJobBody): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");
  if (hasFirebaseConfig()) {
    await firebaseData.updateJob(jobId, userId, body);
    return;
  }
  await sheets.updateJob(jobId, userId, body);
}

export async function updateJobStatus(jobId: string, status: PipelineStatus): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  if (hasFirebaseConfig()) {
    await firebaseData.updateJobStatus(jobId, userId, status);
    return;
  }
  await sheets.updateJobStatus(jobId, userId, status);
}

export async function deleteJob(jobId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  if (hasFirebaseConfig()) {
    await firebaseData.deleteJob(jobId, userId);
    return;
  }
  await sheets.deleteJob(jobId, userId);
}
