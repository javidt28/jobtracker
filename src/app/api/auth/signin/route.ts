import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSession, SESSION_COOKIE_NAME } from "@/lib/sheets/auth";
import { hasSheetConfig } from "@/lib/sheets/client";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  if (!hasSheetConfig()) {
    return NextResponse.json({ error: "Sheet not configured" }, { status: 400 });
  }
  const body = await request.json();
  const email = body.email as string;
  const password = body.password as string;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const user = await verifyPassword(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const token = await createSession(user.id);
  const res = NextResponse.json({ redirect: "/dashboard" });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}
