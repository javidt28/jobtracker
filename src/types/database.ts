export type PipelineStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

export const PIPELINE_ORDER: PipelineStatus[] = [
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
];

export const PIPELINE_LABELS: Record<PipelineStatus, string> = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

export interface Company {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  company_id: string | null;
  title: string;
  status: PipelineStatus;
  source: string | null;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  job_url: string | null;
  description: string | null;
  notes: string | null;
  applied_at: string | null;
  updated_at: string;
  created_at: string;
  company?: Company | null;
}

export interface Contact {
  id: string;
  user_id: string;
  company_id: string | null;
  name: string;
  email: string | null;
  role: string | null;
  linkedin_url: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  job_id: string;
  type: string;
  title: string | null;
  notes: string | null;
  happened_at: string;
  created_at: string;
}

export type JobInsert = Omit<Job, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type JobUpdate = Partial<Omit<Job, 'id' | 'user_id' | 'created_at'>>;

export type CompanyInsert = Omit<Company, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};
