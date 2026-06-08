import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes under (app) that require a logged-in user
const APP_PREFIXES = ['/ask', '/documents', '/settings', '/training', '/dashboards', '/insights']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const { supabaseResponse, user } = await updateSession(request)

  // Protect app routes — redirect to login if not authenticated
  if (APP_PREFIXES.some(p => pathname.startsWith(p)) && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect already-logged-in users away from auth pages
  if (user && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
    return NextResponse.redirect(new URL('/ask', request.url))
  }

  return supabaseResponse
}

export const config = {
  // Run on every route except static files and _next internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|devtraco-logo.png).*)'],
}
