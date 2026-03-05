import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup';
  const isPublic = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/api');
  const isGuest = request.cookies.get('pipeline_guest')?.value === '1';
  const isDashboardArea = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/pipeline') || request.nextUrl.pathname.startsWith('/jobs');
  const useGoogleSheet = !!(process.env.GOOGLE_SHEET_ID && (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS));
  const hasFirebaseSession = !!request.cookies.get('firebase_session')?.value;

  if (useGoogleSheet) {
    return supabaseResponse;
  }

  if (hasFirebaseSession && isDashboardArea) {
    return supabaseResponse;
  }

  if (!user && !isAuthPage && !isPublic && !(isGuest && isDashboardArea)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
