"use client";

import { useOptimistic, useState } from "react";
import { apiUpdateJobStatus } from "@/lib/api-client";
import { PipelineColumn } from "./pipeline-column";
import { JobCard } from "./job-card";
import type { Job, PipelineStatus } from "@/types/database";

interface PipelineBoardProps {
  initialColumns: Record<string, Job[]>;
  labels: Record<PipelineStatus, string>;
  guestMode?: boolean;
}

const ORDER: PipelineStatus[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
];

export function PipelineBoard({ initialColumns, labels, guestMode = false }: PipelineBoardProps) {
  const [columns, setColumns] = useOptimistic(
    initialColumns as Record<PipelineStatus, Job[]>,
    (state, { jobId, newStatus }: { jobId: string; newStatus: PipelineStatus }) => {
      const next = { ...state };
      for (const status of ORDER) {
        next[status] = next[status].filter((j) => j.id !== jobId);
      }
      const job = Object.values(state)
        .flat()
        .find((j) => j.id === jobId);
      if (job) {
        next[newStatus] = [...(next[newStatus] ?? []), { ...job, status: newStatus }];
      }
      return next;
    }
  );
  const [dragging, setDragging] = useState<string | null>(null);

  async function handleDrop(jobId: string, fromStatus: PipelineStatus, toStatus: PipelineStatus) {
    if (fromStatus === toStatus) return;
    setDragging(null);
    setColumns({ jobId, newStatus: toStatus });
    if (!guestMode) await apiUpdateJobStatus(jobId, toStatus);
  }

  return (
    <div className="-mx-4 flex gap-4 overflow-x-auto pb-4 pl-4 scroll-smooth [overscroll-behavior-x:contain] sm:mx-0 sm:pl-0" style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
      {ORDER.map((status) => (
        <PipelineColumn
          key={status}
          status={status}
          title={labels[status]}
          jobs={columns[status] ?? []}
          onDrop={(jobId, from) => handleDrop(jobId, from, status)}
          onDragStart={setDragging}
          onDragEnd={() => setDragging(null)}
          isDragging={!!dragging}
        >
          {(columns[status] ?? []).map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isDragging={dragging === job.id}
              onDragStart={() => setDragging(job.id)}
            />
          ))}
        </PipelineColumn>
      ))}
    </div>
  );
}
