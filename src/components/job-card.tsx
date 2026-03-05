"use client";

import Link from "next/link";
import type { Job } from "@/types/database";
import { clsx } from "clsx";

interface JobCardProps {
  job: Job;
  isDragging?: boolean;
  onDragStart?: () => void;
}

export function JobCard({ job, isDragging, onDragStart }: JobCardProps) {
  const companyName = job.company?.name ?? "Unknown company";

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ id: job.id, fromStatus: job.status })
    );
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.();
  }

  return (
    <Link
      href={`/jobs/${job.id}`}
      draggable
      onDragStart={handleDragStart}
      className={clsx(
        "block rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5 transition-shadow hover:shadow-md",
        isDragging && "cursor-grabbing opacity-50"
      )}
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <p className="font-medium text-[var(--foreground)] line-clamp-2">
        {job.title}
      </p>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        {companyName}
      </p>
      {job.applied_at && (
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Applied {new Date(job.applied_at).toLocaleDateString()}
        </p>
      )}
    </Link>
  );
}
