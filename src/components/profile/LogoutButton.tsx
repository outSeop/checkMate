'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <button
            onClick={handleLogout}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.875rem',
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'hsl(0, 84%, 60%)',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
            }}
        >
            <LogOut size={18} />
            로그아웃
        </button>
    )
}
