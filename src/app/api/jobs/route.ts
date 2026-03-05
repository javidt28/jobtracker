import { NextRequest, NextResponse } from "next/server";
import { createJob } from "@/lib/jobs-api";
import type { PipelineStatus } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createJob({
      title: body.title,
      company_id: body.company_id ?? null,
      company_name: body.company_name,
      status: body.status as PipelineStatus,
      source: body.source ?? null,
      salary_min: body.salary_min ?? null,
      salary_max: body.salary_max ?? null,
      location: body.location ?? null,
      job_url: body.job_url ?? null,
      description: body.description ?? null,
      notes: body.notes ?? null,
      applied_at: body.applied_at ?? null,
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create job";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
