import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            res.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            res.cookies.delete({
              name,
              ...options,
            })
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Auth routes - redirect to dashboard if already logged in
    if (req.nextUrl.pathname.startsWith('/auth')) {
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return res
    }

    // Protected routes - redirect to login if not authenticated
    const protectedPaths = [
      '/dashboard',
      '/profile',
      '/settings',
      '/books',
      '/vocabulary',
      '/review',
    ]

    const isProtectedPath = protectedPaths.some((path) =>
      req.nextUrl.pathname.startsWith(path)
    )

    if (isProtectedPath && !session) {
      const searchParams = new URLSearchParams()
      searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(new URL(`/auth/login?${searchParams.toString()}`, req.url))
    }

    // Admin routes - redirect if not admin
    if (req.nextUrl.pathname.startsWith('/admin-secure-dashboard-xyz123')) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/error', req.url))
  }
}

export const config = {
  matcher: [
    '/auth/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/books/:path*',
    '/vocabulary/:path*',
    '/review/:path*',
    '/admin-secure-dashboard-xyz123/:path*',
  ],
}