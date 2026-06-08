import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'nyasapoai.com'

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Strip port for local dev (localhost:3000 → localhost)
  const host = hostname.replace(`:${url.port}`, '')

  // Detect subdomain — e.g. "devtraco" from devtraco.nyansapoai.com
  // In dev use: devtraco.localhost
  const subdomain = host.endsWith(`.${ROOT_DOMAIN}`)
    ? host.replace(`.${ROOT_DOMAIN}`, '')
    : host.endsWith('.localhost')
    ? host.replace('.localhost', '')
    : null

  const isAppSubdomain = subdomain && subdomain !== 'www'

  // Refresh Supabase auth session
  const { supabaseResponse, user } = await updateSession(request)

  // Tenant workspace routes — rewrite to /app/* internally
  if (isAppSubdomain) {
    // Protect all app routes — redirect to login if not authenticated
    if (!user && !url.pathname.startsWith('/auth')) {
      url.pathname = '/auth/login'
      url.searchParams.set('tenant', subdomain)
      return NextResponse.redirect(url)
    }

    // Inject tenant subdomain so pages can read it
    const response = NextResponse.rewrite(
      new URL(`/tenant/${subdomain}${url.pathname}`, request.url)
    )
    response.headers.set('x-tenant-subdomain', subdomain)
    return response
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
