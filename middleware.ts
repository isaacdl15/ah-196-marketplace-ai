import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth needed
  const isPublicRoute =
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/page-view') ||
    pathname.startsWith('/api/link-click') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth/') ||
    pathname === '/';

  // Dynamic creator pages (/@username or /username patterns)
  // Anything that doesn't start with /dashboard, /admin, /api, /auth, /onboarding
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/onboarding');

  if (isPublicRoute && !isDashboard) {
    return NextResponse.next();
  }

  // Check if it looks like a username route (single path segment, no special prefix)
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 1 && !['api', 'auth', 'dashboard', 'admin', 'onboarding', '_next'].includes(segments[0])) {
    return NextResponse.next(); // Public creator page
  }

  // Protected routes need session
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
