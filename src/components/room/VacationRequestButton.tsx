'use client'

import { useState } from 'react'
import { requestVacation } from '@/app/actions/vacations'
import { Loader2, Plane } from 'lucide-react'
import Modal from '@/components/common/Modal'

export default function VacationRequestButton({ roomId }: { roomId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!startDate || !endDate || !reason) return

        setLoading(true)
        try {
            const result = await requestVacation(roomId, startDate, endDate, reason)
            if (result.success) {
                setIsOpen(false)
                setStartDate('')
                setEndDate('')
                setReason('')
                alert('휴가가 신청되었습니다.')
            } else {
                alert(result.message)
            }
        } catch (e) {
            console.error('VacationRequestButton error:', e)
            alert('휴가 신청 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.875rem',
                    color: 'var(--foreground)',
                    cursor: 'pointer'
                }}
            >
                <Plane size={16} />
                휴가 신청
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="휴가 / 면제권 신청">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>시작일</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '0.75rem',
                                borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                                backgroundColor: 'var(--background)'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>종료일</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            min={startDate}
                            style={{
                                width: '100%', padding: '0.75rem',
                                borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                                backgroundColor: 'var(--background)'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>사유</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="예: 여름 휴가, 개인 사정"
                            required
                            style={{
                                width: '100%', padding: '0.75rem',
                                borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                                backgroundColor: 'var(--background)'
                            }}
                        />
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                        * 휴가기간 동안 발생하는 지각/미션 실패 벌금이 면제됩니다.
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0.75rem',
                            backgroundColor: 'var(--primary)',
                            color: 'var(--primary-foreground)',
                            borderRadius: 'var(--radius)',
                            border: 'none',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        {loading && <Loader2 className="animate-spin" size={16} />}
                        신청하기
                    </button>
                </form>
            </Modal>
        </>
    )
}
