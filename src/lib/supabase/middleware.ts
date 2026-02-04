import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
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
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 1. Get User
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // 2. Define Protected Routes
    const isProtectedAdmin = path.startsWith('/admin')
    const isProtectedSuper = path.startsWith('/superadmin')

    // 3. Auth Logic
    if ((isProtectedAdmin || isProtectedSuper) && !user) {
        // Redirect unauthenticated users to login
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 4. Super Admin Protection (The "God Mode" Lock)
    // 4. Super Admin Protection (The "God Mode" Lock)
    if (path.startsWith('/admin-command')) {
        // Replace this with your actual personal Email or UUID
        const SUPER_ADMIN_EMAIL = 'kaylonuser@gmail.com'

        if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
            // Kick out intruders to the home page
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    // 5. Redirect Logged-in users from Auth Pages
    if (user) {
        if (path === '/login') {
            const url = request.nextUrl.clone()
            if (user.email?.toLowerCase() === 'kaylonuser@gmail.com') { // Check match again
                url.pathname = '/admin-command'
            } else {
                url.pathname = '/dashboard'
            }
            return NextResponse.redirect(url)
        }
        // Note: We deliberately do NOT redirect for /vanguarda-hq to allow re-login if needed
    }

    return response
}
