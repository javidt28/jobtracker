"use client";

import { useCallback } from "react";
import type { PipelineStatus } from "@/types/database";

interface PipelineColumnProps {
  status: PipelineStatus;
  title: string;
  jobs: { id: string }[];
  onDrop: (jobId: string, fromStatus: PipelineStatus) => void;
  onDragStart: (jobId: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  children: React.ReactNode;
}

export function PipelineColumn({
  status,
  title,
  jobs,
  onDrop,
  onDragStart,
  onDragEnd,
  isDragging,
  children,
}: PipelineColumnProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const jobId = e.dataTransfer.getData("application/json");
      if (!jobId) return;
      try {
        const { id, fromStatus } = JSON.parse(jobId) as {
          id: string;
          fromStatus: PipelineStatus;
        };
        onDrop(id, fromStatus);
      } catch {
        // ignore
      }
      onDragEnd();
    },
    [onDrop, onDragEnd]
  );

  return (
    <div
      className={`flex min-w-[280px] flex-1 flex-col rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 transition-colors ${
        isDragging ? "border-[var(--accent)]/50 bg-[var(--accent)]/5" : ""
      }`}
      style={{ boxShadow: "var(--shadow-sm)" }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={onDragEnd}
    >
      <div className="sticky top-0 z-10 rounded-t-xl border-b border-[var(--border)] bg-[var(--card)] px-4 py-3.5">
        <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
          {jobs.length} application{jobs.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex min-h-[200px] flex-1 flex-col gap-2.5 p-3">
        {children}
      </div>
    </div>
  );
}
