import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no auth needed
  const isPublicRoute =
    pathname.startsWith('/rankings') ||
    pathname.startsWith('/events') ||
    pathname.startsWith('/rules') ||
    pathname.startsWith('/api/rankings') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/auth/confirm') ||
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Admin routes - need session
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
