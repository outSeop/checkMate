'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function RoomTabs({ roomId }: { roomId: string }) {
    const searchParams = useSearchParams()
    const activeTab = searchParams.get('tab') || 'home'

    const tabs = [
        { id: 'home', label: '홈' },
        { id: 'stats', label: '통계' },
        { id: 'rules', label: '규칙' },
        { id: 'fines', label: '벌금' },
        { id: 'members', label: '멤버' },
    ]

    return (
        <div style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            zIndex: 10
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex' }}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <Link
                            key={tab.id}
                            href={`/room/${roomId}?tab=${tab.id}`}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                textAlign: 'center',
                                textDecoration: 'none',
                                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                                fontWeight: isActive ? '600' : '400',
                                transition: 'all 0.2s',
                            }}
                        >
                            {tab.label}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
