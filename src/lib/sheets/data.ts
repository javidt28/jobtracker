import { getSheetsClient, hasSheetConfig } from "./client";
import type { Company, Job, PipelineStatus } from "@/types/database";

const COMPANIES_SHEET = "companies";
const JOBS_SHEET = "jobs";

/** When set, only this user's rows are returned. Omit for legacy/all data. */
export type UserIdFilter = string | null;

function uuid() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

function rowToCompany(row: string[]): Company {
  return {
    id: row[0] ?? "",
    user_id: row[5] ?? "",
    name: row[1] ?? "",
    website: row[2] || null,
    logo_url: null,
    created_at: row[3] ?? now(),
    updated_at: row[4] ?? now(),
  };
}

function rowToJob(row: string[], companies: Map<string, Company>): Job {
  const companyId = row[1] || null;
  return {
    id: row[0] ?? "",
    user_id: row[14] ?? "",
    company_id: companyId,
    title: row[2] ?? "",
    status: (row[3] ?? "applied") as PipelineStatus,
    source: row[4] || null,
    salary_min: row[5] ? Number(row[5]) : null,
    salary_max: row[6] ? Number(row[6]) : null,
    location: row[7] || null,
    job_url: row[8] || null,
    description: row[9] || null,
    notes: row[10] || null,
    applied_at: row[11] || null,
    updated_at: row[12] ?? now(),
    created_at: row[13] ?? now(),
    company: companyId ? companies.get(companyId) ?? null : null,
  };
}

export async function getCompanies(userId?: UserIdFilter): Promise<Company[]> {
  if (!hasSheetConfig()) return [];
  const { sheets, sheetId } = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${COMPANIES_SHEET}!A2:F`,
  });
  const rows = (res.data.values ?? []) as string[][];
  const list = rows.map((r) => rowToCompany(r));
  if (userId != null && userId !== "") return list.filter((c) => (c.user_id || "") === userId);
  return list;
}

export async function getJobs(userId?: UserIdFilter): Promise<Job[]> {
  if (!hasSheetConfig()) return [];
  const companies = await getCompanies(userId);
  const companyMap = new Map(companies.map((c) => [c.id, c]));
  const { sheets, sheetId } = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${JOBS_SHEET}!A2:O`,
  });
  const rows = (res.data.values ?? []) as string[][];
  const list = rows.map((r) => rowToJob(r, companyMap));
  if (userId != null && userId !== "") return list.filter((j) => (j.user_id || "") === userId);
  return list;
}

export async function getOrCreateCompany(name: string, userId: string): Promise<Company> {
  const companies = await getCompanies(userId);
  const existing = companies.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
  if (existing) return existing;

  const id = uuid();
  const company: Company = {
    id,
    user_id: userId,
    name: name.trim(),
    website: null,
    logo_url: null,
    created_at: now(),
    updated_at: now(),
  };
  const { sheets, sheetId } = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${COMPANIES_SHEET}!A:F`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[company.id, company.name, company.website ?? "", company.created_at, company.updated_at, company.user_id]],
    },
  });
  return company;
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
  const { sheets, sheetId } = getSheetsClient();
  let companyId = input.company_id;
  if (!companyId && input.company_name?.trim()) {
    const company = await getOrCreateCompany(input.company_name, userId);
    companyId = company.id;
  }

  const id = uuid();
  const created = now();
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${JOBS_SHEET}!A:O`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          id,
          companyId ?? "",
          input.title.trim(),
          input.status,
          input.source ?? "",
          input.salary_min ?? "",
          input.salary_max ?? "",
          input.location ?? "",
          input.job_url ?? "",
          input.description ?? "",
          input.notes ?? "",
          input.applied_at ?? "",
          created,
          created,
          userId,
        ],
      ],
    },
  });
  return id;
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
  const jobs = await getJobs(userId);
  const rowIndex = jobs.findIndex((j) => j.id === jobId);
  if (rowIndex < 0) throw new Error("Job not found");

  let companyId: string | null | undefined = input.company_id;
  if (input.company_name?.trim()) {
    const company = await getOrCreateCompany(input.company_name, userId);
    companyId = company.id;
  }

  const job = jobs[rowIndex];
  const updated = now();
  const row = [
    job.id,
    companyId !== undefined ? (companyId ?? "") : job.company_id ?? "",
    input.title !== undefined ? input.title.trim() : job.title,
    input.status ?? job.status,
    input.source !== undefined ? (input.source?.trim() || "") : (job.source ?? ""),
    input.salary_min !== undefined ? (input.salary_min ?? "") : (job.salary_min ?? ""),
    input.salary_max !== undefined ? (input.salary_max ?? "") : (job.salary_max ?? ""),
    input.location !== undefined ? (input.location?.trim() || "") : (job.location ?? ""),
    input.job_url !== undefined ? (input.job_url?.trim() || "") : (job.job_url ?? ""),
    input.description !== undefined ? (input.description?.trim() || "") : (job.description ?? ""),
    input.notes !== undefined ? (input.notes?.trim() || "") : (job.notes ?? ""),
    input.applied_at !== undefined ? (input.applied_at ?? "") : (job.applied_at ?? ""),
    updated,
    job.created_at,
    userId,
  ];

  const { sheets, sheetId } = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${JOBS_SHEET}!A${rowIndex + 2}:O${rowIndex + 2}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

export async function updateJobStatus(jobId: string, userId: string, status: PipelineStatus): Promise<void> {
  await updateJob(jobId, userId, { status });
}

export async function deleteJob(jobId: string, userId: string): Promise<void> {
  const jobs = await getJobs(userId);
  const rowIndex = jobs.findIndex((j) => j.id === jobId);
  if (rowIndex < 0) throw new Error("Job not found");

  const { sheets, sheetId } = getSheetsClient();
  const sheetRes = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const jobsSheet = sheetRes.data.sheets?.find((s) => s.properties?.title === JOBS_SHEET);
  const sheetIdNum = jobsSheet?.properties?.sheetId;
  if (sheetIdNum == null) throw new Error("Jobs sheet not found");

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetIdNum,
              dimension: "ROWS",
              startIndex: rowIndex + 1,
              endIndex: rowIndex + 2,
            },
          },
        },
      ],
    },
  });
}
