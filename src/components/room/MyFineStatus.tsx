'use client'

import { useMemo } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Fine } from '@/types/database'

import VacationRequestButton from './VacationRequestButton'
import ManualFineButton from './ManualFineButton'

export default function MyFineStatus({ fines, roomId }: { fines: Fine[], roomId: string }) {
    const { unpaidFines, totalUnpaid } = useMemo(() => {
        const unpaid = fines.filter(f => f.status === 'PENDING' || f.status === 'DISPUTED')
        return {
            unpaidFines: unpaid,
            totalUnpaid: unpaid.reduce((acc, f) => acc + f.amount, 0)
        }
    }, [fines])

    const ActionButtons = () => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ManualFineButton roomId={roomId} />
            <VacationRequestButton roomId={roomId} />
        </div>
    )

    if (totalUnpaid === 0) {
        return (
            <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '40px', height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' // Removed 'flex-shrink-0' if not needed, added later if layout breaks
                    }}>
                        <CheckCircle2 size={24} className="text-green-500" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.2rem' }}>납부할 벌금이 없습니다</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>훌륭합니다! 규칙을 잘 지키고 계시네요.</p>
                    </div>
                </div>
                <ActionButtons />
            </div>
        )
    }

    return (
        <div style={{
            padding: '1.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.05)', // Subtle red tint
            borderRadius: 'var(--radius)',
            border: '1px solid var(--destructive)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <AlertCircle size={24} className="text-red-500" />
                </div>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.2rem', color: 'var(--muted-foreground)' }}>
                        미납 벌금
                    </h3>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--destructive)', lineHeight: 1.2 }}>
                        {totalUnpaid.toLocaleString()}원
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
                        {unpaidFines.length}건의 미납 내역이 있습니다.
                    </p>
                </div>
            </div>
            <ActionButtons />
        </div>
    )
}
