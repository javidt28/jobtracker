import { NextRequest, NextResponse } from "next/server";
import { updateJobStatus } from "@/lib/jobs-api";
import type { PipelineStatus } from "@/types/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status as PipelineStatus;
    if (!status) return NextResponse.json({ error: "status required" }, { status: 400 });
    await updateJobStatus(id, status);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update status";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
