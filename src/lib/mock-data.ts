import type { Job, Company } from "@/types/database";

const now = new Date().toISOString();
const applied1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const applied2 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export const MOCK_COMPANIES: Company[] = [
  { id: "mc-1", user_id: "guest", name: "Acme Corp", website: "https://acme.example.com", logo_url: null, created_at: now, updated_at: now },
  { id: "mc-2", user_id: "guest", name: "TechStart Inc", website: null, logo_url: null, created_at: now, updated_at: now },
];

export const MOCK_JOBS: Job[] = [
  { id: "mj-1", user_id: "guest", company_id: "mc-1", title: "Senior Software Engineer", status: "interview", source: "LinkedIn", salary_min: 120000, salary_max: 160000, location: "Remote", job_url: null, description: null, notes: null, applied_at: applied1, updated_at: now, created_at: now, company: MOCK_COMPANIES[0] },
  { id: "mj-2", user_id: "guest", company_id: "mc-1", title: "Staff Engineer", status: "applied", source: "Company website", salary_min: null, salary_max: null, location: "NYC", job_url: null, description: null, notes: null, applied_at: applied2, updated_at: now, created_at: now, company: MOCK_COMPANIES[0] },
  { id: "mj-3", user_id: "guest", company_id: "mc-2", title: "Full Stack Developer", status: "offer", source: "Referral", salary_min: 100000, salary_max: 130000, location: "Remote", job_url: null, description: null, notes: null, applied_at: applied2, updated_at: now, created_at: now, company: MOCK_COMPANIES[1] },
];
