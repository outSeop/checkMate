
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
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

    // Refreshing the auth token
    const { data: { user } } = await supabase.auth.getUser()

    // Protected Routes Logic
    const url = request.nextUrl.clone()

    // List of public routes that don't require authentication
    const publicRoutes = ['/login', '/auth/callback', '/test', '/']
    // Or we can define protected routes. Let's protect everything and exclude public.
    // Actually, '/' is the dashboard. If not logged in, maybe we show landing or just empty dashboard.
    // But for '/create-room', we definitely need auth.

    // Simple logic: If not logged in and not on a public route, redirect to login.
    // Let's make '/' public for now (Shell handles it).

    const isPublic = publicRoutes.some(path => url.pathname === path || url.pathname.startsWith('/auth/'))

    if (!user && !isPublic) {
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If logged in and on login page, redirect to dashboard
    if (user && url.pathname === '/login') {
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
