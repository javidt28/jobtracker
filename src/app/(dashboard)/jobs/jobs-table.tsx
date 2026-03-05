"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PIPELINE_LABELS } from "@/types/database";
import type { PipelineStatus } from "@/types/database";
import type { Job } from "@/types/database";

interface JobsTableProps {
  jobs: Job[];
}

export function JobsTable({ jobs }: JobsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | "">("");

  const filtered = useMemo(() => {
    let list = jobs;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.company?.name ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      list = list.filter((j) => j.status === statusFilter);
    }
    return list;
  }, [jobs, search, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search roles or companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-11 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 sm:w-64 sm:flex-initial"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter((e.target.value || "") as PipelineStatus | "")}
          className="min-h-11 min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-base text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
        >
          <option value="">All statuses</option>
          {(Object.entries(PIPELINE_LABELS) as [PipelineStatus, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>
        <span className="text-sm text-[var(--muted-foreground)]">
          {filtered.length} of {jobs.length}
        </span>
      </div>

      <div className="-mx-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] sm:mx-0" style={{ boxShadow: "var(--shadow-card)" }}>
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
              <th className="px-3 py-3 font-medium text-[var(--foreground)] sm:px-5 sm:py-3.5">
                Role
              </th>
              <th className="px-3 py-3 font-medium text-[var(--foreground)] sm:px-5 sm:py-3.5">
                Company
              </th>
              <th className="px-3 py-3 font-medium text-[var(--foreground)] sm:px-5 sm:py-3.5">
                Status
              </th>
              <th className="px-3 py-3 font-medium text-[var(--foreground)] sm:px-5 sm:py-3.5">
                Applied
              </th>
              <th className="w-0" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => (
              <tr
                key={job.id}
                className="border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--muted)]/40"
              >
                <td className="px-3 py-3 sm:px-5 sm:py-3.5">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-medium text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
                  >
                    {job.title}
                  </Link>
                </td>
                <td className="px-3 py-3 text-[var(--muted-foreground)] sm:px-5 sm:py-3.5">
                  {job.company?.name ?? "—"}
                </td>
                <td className="px-3 py-3 sm:px-5 sm:py-3.5">
                  <span className="inline-flex rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)]">
                    {PIPELINE_LABELS[job.status]}
                  </span>
                </td>
                <td className="px-3 py-3 text-[var(--muted-foreground)] sm:px-5 sm:py-3.5">
                  {job.applied_at
                    ? new Date(job.applied_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-3 py-3 sm:px-5 sm:py-3.5">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-sm font-medium text-[var(--accent)] transition-colors hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[var(--muted-foreground)]">
            {jobs.length === 0
              ? "No applications yet."
              : "No jobs match your filters."}
            {jobs.length === 0 && (
              <>
                {" "}
                <Link href="/jobs/new" className="text-[var(--accent)] hover:underline">
                  Add your first one
                </Link>
                .
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
