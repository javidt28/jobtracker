"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiCreateJob, apiUpdateJob, apiExtractJobFromUrl } from "@/lib/api-client";
import { PIPELINE_ORDER, PIPELINE_LABELS } from "@/types/database";
import type { PipelineStatus } from "@/types/database";

type CompanyOption = { id: string; name: string };

interface JobFormProps {
  companies: CompanyOption[];
  job?: {
    id: string;
    title: string;
    company_id: string | null;
    company_name?: string | null;
    status: PipelineStatus;
    source?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    location?: string | null;
    job_url?: string | null;
    description?: string | null;
    notes?: string | null;
    applied_at?: string | null;
  };
}

export function JobForm({ companies, job }: JobFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!job;
  const [useNewCompany, setUseNewCompany] = useState(!job?.company_id && !job?.company_name);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const companyId = formData.get("company_id") as string | null;
    const companyName = (formData.get("company_name") as string) || undefined;
    const status = formData.get("status") as PipelineStatus;
    const source = (formData.get("source") as string) || null;
    const salaryMin = formData.get("salary_min")
      ? Number(formData.get("salary_min"))
      : null;
    const salaryMax = formData.get("salary_max")
      ? Number(formData.get("salary_max"))
      : null;
    const location = (formData.get("location") as string) || null;
    const jobUrl = (formData.get("job_url") as string) || null;
    const description = (formData.get("description") as string) || null;
    const notes = (formData.get("notes") as string) || null;
    const appliedAt = (formData.get("applied_at") as string) || null;

    try {
      if (isEdit) {
        await apiUpdateJob(job.id, {
          title,
          company_id: useNewCompany ? null : companyId || null,
          company_name: useNewCompany ? companyName : undefined,
          status,
          source,
          salary_min: salaryMin,
          salary_max: salaryMax,
          location,
          job_url: jobUrl,
          description,
          notes,
          applied_at: appliedAt || null,
        });
        router.push(`/jobs/${job.id}`);
      } else {
        const { id } = await apiCreateJob({
          title,
          company_id: useNewCompany ? null : companyId || null,
          company_name: useNewCompany ? companyName : undefined,
          status,
          source,
          salary_min: salaryMin,
          salary_max: salaryMax,
          location,
          job_url: jobUrl,
          description,
          notes,
          applied_at: appliedAt,
        });
        router.push(`/jobs/${id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleExtract() {
    const form = formRef.current;
    const urlInput = form?.elements.namedItem("job_url") as HTMLInputElement | null;
    const url = urlInput?.value?.trim();
    if (!url) {
      setError("Paste a job posting URL first, then click Extract.");
      return;
    }
    setError(null);
    setExtracting(true);
    try {
      const data = await apiExtractJobFromUrl(url);
      if (data.company) setUseNewCompany(true);
      if (form) {
        const set = (name: string, value: string | number | undefined) => {
          const el = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
          if (el && value !== undefined && value !== "") el.value = String(value);
        };
        if (data.title) set("title", data.title);
        if (data.description) set("description", data.description);
        if (data.source) set("source", data.source);
        if (data.location) set("location", data.location);
        if (data.salary_min != null) set("salary_min", data.salary_min);
        if (data.salary_max != null) set("salary_max", data.salary_max);
        if (data.company) {
          setTimeout(() => set("company_name", data.company), 0);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not extract from URL");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
    >
      {error && (
        <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="job_url" className="block text-sm font-medium text-[var(--foreground)]">
          Job posting URL
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="job_url"
            name="job_url"
            type="url"
            defaultValue={job?.job_url ?? ""}
            className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder="https://..."
          />
          <button
            type="button"
            onClick={handleExtract}
            disabled={extracting}
            className="shrink-0 rounded-lg border border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)]/20 disabled:opacity-50"
          >
            {extracting ? "Extracting…" : "Extract"}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
          Paste the link, then click Extract to fill title, company, description, location, salary, and source.
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[var(--foreground)]">
          Job title *
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={job?.title}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          placeholder="e.g. Senior Software Engineer"
        />
      </div>

      <div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!useNewCompany}
              onChange={() => setUseNewCompany(false)}
              className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <span className="text-sm text-[var(--foreground)]">Existing company</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={useNewCompany}
              onChange={() => setUseNewCompany(true)}
              className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <span className="text-sm text-[var(--foreground)]">New company</span>
          </label>
        </div>
        {!useNewCompany ? (
          <select
            name="company_id"
            defaultValue={job?.company_id ?? ""}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            <option value="">Select company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="company_name"
            defaultValue={job?.company_name ?? ""}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder="Company name"
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-[var(--foreground)]">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={job?.status ?? "applied"}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            {PIPELINE_ORDER.map((s) => (
              <option key={s} value={s}>
                {PIPELINE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="applied_at" className="block text-sm font-medium text-[var(--foreground)]">
            Applied date
          </label>
          <input
            id="applied_at"
            name="applied_at"
            type="date"
            defaultValue={job?.applied_at?.slice(0, 10) ?? ""}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="source" className="block text-sm font-medium text-[var(--foreground)]">
          Source
        </label>
        <input
          id="source"
          name="source"
          defaultValue={job?.source ?? ""}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          placeholder="e.g. LinkedIn, company website"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-[var(--foreground)]">
          Location
        </label>
        <input
          id="location"
          name="location"
          defaultValue={job?.location ?? ""}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          placeholder="e.g. Remote, NYC"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="salary_min" className="block text-sm font-medium text-[var(--foreground)]">
            Salary min
          </label>
          <input
            id="salary_min"
            name="salary_min"
            type="number"
            min={0}
            defaultValue={job?.salary_min ?? ""}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="salary_max" className="block text-sm font-medium text-[var(--foreground)]">
            Salary max
          </label>
          <input
            id="salary_max"
            name="salary_max"
            type="number"
            min={0}
            defaultValue={job?.salary_max ?? ""}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-[var(--foreground)]">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={job?.notes ?? ""}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          placeholder="Interview notes, follow-up reminders..."
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[var(--foreground)]">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={job?.description ?? ""}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          placeholder="Paste job description if helpful"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-[var(--accent-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving…" : isEdit ? "Save changes" : "Add application"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
