'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function loginWithSocial(provider: 'google' | 'kakao') {
    const supabase = await createClient()
    const headerList = await headers()

    // Debug logging
    console.log('[Login] Attempting social login with:', provider)

    // Determine the base URL reliably
    const host = headerList.get('host') // e.g. localhost:3000
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const origin = `${protocol}://${host}`

    console.log('[Login] Determined origin:', origin)
    const redirectTo = `${origin}/auth/callback`
    console.log('[Login] Redirect URL:', redirectTo)

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: redirectTo,
        },
    })

    if (error) {
        console.error('[Login] OAuth Sign-In Error:', error)
        redirect('/login?error=oauth_failed')
    }

    if (data.url) {
        console.log('[Login] Redirecting to provider URL:', data.url)
        redirect(data.url)
    }
}
