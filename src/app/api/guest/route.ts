import { NextRequest, NextResponse } from "next/server";
import { GUEST_COOKIE_NAME, GUEST_COOKIE_VALUE } from "@/lib/guest";

const basePath = process.env.BASE_PATH ?? "";

export const dynamic = "force-static";

export function GET(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "1") {
    const dashboardUrl = `${basePath}/dashboard`;
    const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${dashboardUrl}"><script>window.location.href="${dashboardUrl}"</script></head><body>Redirecting...</body></html>`;
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/dashboard";
  const res = NextResponse.redirect(url);
  res.cookies.set(GUEST_COOKIE_NAME, GUEST_COOKIE_VALUE, {
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    httpOnly: false,
    sameSite: "lax",
  });
  return res;
}
