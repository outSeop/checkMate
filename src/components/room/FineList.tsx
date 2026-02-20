'use client'

import { useMemo, useCallback, useState } from 'react'
import { Check, Clock, AlertCircle } from 'lucide-react'
import { markAsPaidAction, confirmPaymentAction } from '@/app/actions/fines'
import type { Fine } from '@/types/database'

const statusConfig = {
    'PENDING': { label: '미납', color: 'var(--destructive)', icon: AlertCircle },
    'PAID': { label: '확인 대기', color: 'var(--secondary)', icon: Clock },
    'CONFIRMED': { label: '납부 완료', color: 'var(--primary)', icon: Check },
    'DISPUTED': { label: '이의 제기', color: 'var(--warning)', icon: AlertCircle },
}

export default function FineList({ fines, currentUserId, isOwner, roomId }: { fines: Fine[], currentUserId: string, isOwner: boolean, roomId: string }) {
    if (fines.length === 0) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
                textAlign: 'center',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border)',
                color: 'var(--muted-foreground)'
            }}>
                <div style={{
                    width: '48px', height: '48px',
                    backgroundColor: 'var(--muted)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                    color: 'var(--muted-foreground)'
                }}>
                    <AlertCircle size={24} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--foreground)', marginBottom: '0.25rem' }}>
                    등록된 벌금이 없습니다
                </h3>
                <p style={{ fontSize: '0.875rem' }}>
                    현재 부과된 벌금 내역이 존재하지 않아요.
                </p>
            </div>
        )
    }

    const [processingId, setProcessingId] = useState<string | null>(null)
    const [successId, setSuccessId] = useState<string | null>(null)

    const handleMarkAsPaid = useCallback(async (fineId: string) => {
        if (!confirm('벌금을 납부하셨습니까?')) return
        setProcessingId(fineId)
        try {
            const result = await markAsPaidAction(fineId, roomId)
            if (!result.success) {
                alert(result.message)
            } else {
                setSuccessId(fineId)
                setTimeout(() => setSuccessId(null), 2000)
            }
        } finally {
            setProcessingId(null)
        }
    }, [roomId])

    const handleConfirm = useCallback(async (fineId: string) => {
        if (!confirm('납부를 확인하시겠습니까?')) return
        setProcessingId(fineId)
        try {
            const result = await confirmPaymentAction(fineId, roomId)
            if (!result.success) {
                alert(result.message)
            } else {
                setSuccessId(fineId)
                setTimeout(() => setSuccessId(null), 2000)
            }
        } finally {
            setProcessingId(null)
        }
    }, [roomId])

    const sortedFines = useMemo(
        () => [...fines].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        [fines]
    )

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
                                    {fine.rules?.description || fine.reason || '기타 벌금'}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '99px',
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

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                {/* Status Icon/Label */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    fontSize: '0.875rem', color: config.color
                                }}>
                                    <Icon size={14} />
                                    <span>{config.label}</span>
                                </div>

                                {/* Action Buttons */}
                                {fine.status === 'PENDING' && isMyFine && (
                                    <button
                                        onClick={() => handleMarkAsPaid(fine.id)}
                                        disabled={processingId === fine.id || successId === fine.id}
                                        style={{
                                            fontSize: '0.75rem', padding: '0.25rem 0.5rem',
                                            backgroundColor: successId === fine.id ? 'var(--success)' : 'var(--secondary)',
                                            color: successId === fine.id ? 'var(--success-foreground)' : 'var(--secondary-foreground)',
                                            border: 'none', borderRadius: '4px', cursor: (processingId === fine.id || successId === fine.id) ? 'default' : 'pointer', marginLeft: '0.5rem',
                                            transition: 'all 0.2s ease',
                                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        {processingId === fine.id ? '처리 중...' : (successId === fine.id ? <><Check size={12} /> 완료</> : '납부 완료')}
                                    </button>
                                )}

                                {fine.status === 'PAID' && isOwner && (
                                    <button
                                        onClick={() => handleConfirm(fine.id)}
                                        disabled={processingId === fine.id || successId === fine.id}
                                        style={{
                                            fontSize: '0.75rem', padding: '0.25rem 0.5rem',
                                            backgroundColor: successId === fine.id ? 'var(--success)' : 'var(--primary)',
                                            color: successId === fine.id ? 'var(--success-foreground)' : 'var(--primary-foreground)',
                                            border: 'none', borderRadius: '4px', cursor: (processingId === fine.id || successId === fine.id) ? 'default' : 'pointer', marginLeft: '0.5rem',
                                            transition: 'all 0.2s ease',
                                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        {processingId === fine.id ? '처리 중...' : (successId === fine.id ? <><Check size={12} /> 완료</> : '승인')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
