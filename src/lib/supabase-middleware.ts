import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase-env'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isPublicPath =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/changelog') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/resources') ||
    pathname.startsWith('/startupperks')

  if (isPublicPath && pathname !== '/') {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Guard this call so transient network failures do not crash middleware.
  let user: unknown = null

  try {
    const { data, error } = await supabase.auth.getClaims()
    if (error) {
      throw error
    }
    user = data?.claims ?? null
  } catch (claimsError) {
    const message = claimsError instanceof Error ? claimsError.message : ''
    const isNetworkFailure = /fetch failed|timeout|connect/i.test(message)

    if (isNetworkFailure) {
      console.warn('[auth] Supabase unreachable in middleware, skipping getUser fallback')
      user = null
    } else {
      console.warn('[auth] getClaims failed in middleware, trying getUser fallback')
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          throw error
        }
        user = data?.user ?? null
      } catch (userError) {
        console.error('[auth] getUser fallback also failed in middleware')
        user = null
      }
    }
  }
  // console.log("---", request.nextUrl.pathname.match('/'))
  if (
    !user &&
    pathname !== '/'
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users from / to /projects
  if (user && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/projects'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}


// request.nextUrl.pathname !== '/' &&
//   !request.nextUrl.pathname.startsWith('/login') &&
//   !request.nextUrl.pathname.startsWith('/changelog') &&
//   !request.nextUrl.pathname.startsWith('/auth') &&
//   !request.nextUrl.pathname.startsWith('/blog') &&
//   !request.nextUrl.pathname.startsWith('/resources') &&
//   !request.nextUrl.pathname.startsWith('/startupperks') 