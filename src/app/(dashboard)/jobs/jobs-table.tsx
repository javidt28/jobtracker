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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search roles or companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter((e.target.value || "") as PipelineStatus | "")}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
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

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
              <th className="px-4 py-3 font-medium text-[var(--foreground)]">
                Role
              </th>
              <th className="px-4 py-3 font-medium text-[var(--foreground)]">
                Company
              </th>
              <th className="px-4 py-3 font-medium text-[var(--foreground)]">
                Status
              </th>
              <th className="px-4 py-3 font-medium text-[var(--foreground)]">
                Applied
              </th>
              <th className="w-0" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => (
              <tr
                key={job.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                  >
                    {job.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">
                  {job.company?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
                    {PIPELINE_LABELS[job.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">
                  {job.applied_at
                    ? new Date(job.applied_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-[var(--accent)] hover:underline"
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
