import { NextRequest, NextResponse } from "next/server";
import { updateJob, deleteJob } from "@/lib/jobs-api";
import type { PipelineStatus } from "@/types/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await updateJob(id, {
      title: body.title,
      company_id: body.company_id,
      company_name: body.company_name,
      status: body.status as PipelineStatus | undefined,
      source: body.source,
      salary_min: body.salary_min,
      salary_max: body.salary_max,
      location: body.location,
      job_url: body.job_url,
      description: body.description,
      notes: body.notes,
      applied_at: body.applied_at,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update job";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteJob(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete job";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
