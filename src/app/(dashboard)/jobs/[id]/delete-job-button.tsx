"use client";

import { useRouter } from "next/navigation";
import { apiDeleteJob } from "@/lib/api-client";

export function DeleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this application? This can’t be undone.")) return;
    await apiDeleteJob(jobId);
    router.push("/jobs");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900/50"
    >
      Delete
    </button>
  );
}
