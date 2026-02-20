
'use client'

import styles from './Shell.module.css'
import { Home, Compass, User as UserIcon, Calendar, LogIn, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import NotificationBell from '@/components/common/NotificationBell'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export function Shell({ children, user }: { children: React.ReactNode, user: User | null }) {
    return (
        <div className={styles.shell}>
            {/* Mobile Header: Visible only on mobile */}
            <header className={styles.mobileHeader}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={24} className="text-primary" />
                    Mogakko Check
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ThemeToggle />
                    {user && <NotificationBell userId={user.id} />}
                </div>
            </header>

            <aside className={styles.sidebar}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={24} className="text-primary" />
                        Mogakko Check
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ThemeToggle />
                        {user && <NotificationBell userId={user.id} align="left" />}
                    </div>
                </div>
                <NavLinks user={user} />
            </aside>

            <main className={styles.main}>
                {children}
            </main>

            <nav className={styles.mobileNav}>
                <NavLinks mobile user={user} />
            </nav>
        </div>
    )
}

function NavLinks({ mobile = false, user }: { mobile?: boolean, user: User | null }) {
    const pathname = usePathname()

    const links = [
        { href: '/', label: '홈', icon: Home },
        { href: '/explore', label: '탐색', icon: Compass },
        { href: '/schedule', label: '일정', icon: Calendar },
    ]

    // Conditional Auth Link
    if (user) {
        links.push({ href: '/profile', label: '프로필', icon: UserIcon })
    } else {
        links.push({ href: '/login', label: '로그인', icon: LogIn })
    }

    return (
        <>
            {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        style={!mobile ? { flexDirection: 'row', justifyContent: 'flex-start', fontSize: '1rem', padding: '0.75rem', borderRadius: '8px' } : {}}
                    >
                        <Icon size={mobile ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{link.label}</span>
                    </Link>
                )
            })}
        </>
    )
}
