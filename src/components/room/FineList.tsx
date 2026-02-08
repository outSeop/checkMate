'use client'

import { Check, Clock, AlertCircle } from 'lucide-react'

interface Fine {
    id: string
    amount: number
    status: 'PENDING' | 'CONFIRMED' | 'DISPUTED' | 'PAID'
    created_at: string
    reason?: string // Assuming we might add this later or join with rules
    user_id: string
    users?: {
        username: string | null
    } | null
    rules?: {
        description: string | null
    } | null
}

const statusConfig = {
    'PENDING': { label: '미납', color: 'var(--destructive)', icon: AlertCircle },
    'PAID': { label: '확인 대기', color: 'var(--secondary)', icon: Clock }, // User said paid, waiting owner
    'CONFIRMED': { label: '납부 완료', color: 'var(--primary)', icon: Check },
    'DISPUTED': { label: '이의 제기', color: 'var(--warning)', icon: AlertCircle },
}

export default function FineList({ fines, currentUserId }: { fines: Fine[], currentUserId: string }) {
    if (fines.length === 0) {
        return (
            <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: 'var(--muted-foreground)',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
            }}>
                <p>벌금 내역이 없습니다.</p>
            </div>
        )
    }

    // Sort by Date DESC
    const sortedFines = [...fines].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedFines.map((fine) => {
                const config = statusConfig[fine.status] || statusConfig['PENDING']
                const isMyFine = fine.user_id === currentUserId
                const Icon = config.icon

                return (
                    <div key={fine.id} style={{
                        padding: '1rem',
                        backgroundColor: 'var(--card)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                                    {fine.rules?.description || '기타 벌금'}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '99px',
                                    backgroundColor: isMyFine ? 'rgba(99, 102, 241, 0.1)' : 'var(--muted)',
                                    color: isMyFine ? 'var(--primary)' : 'var(--muted-foreground)'
                                }}>
                                    {isMyFine ? '나' : fine.users?.username || 'Unknown'}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                {new Date(fine.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                {fine.amount.toLocaleString()}원
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.875rem',
                                color: config.color,
                                justifySelf: 'end'
                            }}>
                                <Icon size={14} />
                                <span>{config.label}</span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
