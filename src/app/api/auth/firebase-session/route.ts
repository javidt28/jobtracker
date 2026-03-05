import { NextRequest, NextResponse } from "next/server";
import {
  setFirebaseSessionCookie,
  getFirebaseSessionCookieOptions,
} from "@/lib/firebase/session";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const idToken = body.idToken ?? body.token;
  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "idToken required" }, { status: 400 });
  }
  const result = await setFirebaseSessionCookie(idToken);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const opts = getFirebaseSessionCookieOptions();
  const res = NextResponse.json({ redirect: "/dashboard" });
  res.cookies.set(opts.name, result.sessionCookie, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  return res;
}
