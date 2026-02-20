'use client'

import { Clock, Hash, AlertCircle } from 'lucide-react'
import type { PersonalStats } from '@/services/statsService'

export default function StatsOverview({ stats }: { stats: PersonalStats }) {
    const hours = Math.floor(stats.totalStudySeconds / 3600)
    const minutes = Math.floor((stats.totalStudySeconds % 3600) / 60)

    const items = [
        { icon: <Clock size={18} color="var(--primary)" />, label: '총 공부시간', value: `${hours}시간 ${minutes}분` },
        { icon: <Hash size={18} color="var(--primary)" />, label: '총 세션', value: `${stats.totalSessions}회` },
        { icon: <AlertCircle size={18} color="hsl(0, 84%, 60%)" />, label: '미납 벌금', value: `${stats.pendingFineAmount.toLocaleString()}원` },
    ]

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
        }}>
            {items.map((item) => (
                <div key={item.label} style={{
                    padding: '1rem',
                    backgroundColor: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                }}>
                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>{item.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>{item.label}</div>
                </div>
            ))}
        </div>
    )
}
