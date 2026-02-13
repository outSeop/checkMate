'use client'

import { useState } from 'react'
import { generateDailyFines, seedFineTestData, generateWeeklyFinesAction, confirmAllPaymentsAction } from '@/app/actions/fines'
import { Loader2, Zap, Database, CalendarDays, CheckCircle } from 'lucide-react'

export default function AdminFineControls({ roomId }: { roomId: string }) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleGenerate = async () => {
        setLoading(true)
        setMessage('')

        // Default to Yesterday for convenience
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const dateStr = yesterday.toISOString().split('T')[0] // YYYY-MM-DD

        try {
            const res = await generateDailyFines(roomId, dateStr)
            if (res.finesCreated !== undefined) {
                setMessage(`${res.finesCreated}건의 벌금이 생성되었습니다.`)
            } else {
                setMessage(res.message || 'Error')
            }
        } catch (e) {
            setMessage('오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const handleSeed = async () => {
        setLoading(true)
        try {
            await seedFineTestData(roomId)
            setMessage('테스트 데이터(규칙+지각기록)가 생성되었습니다.')
        } catch (e) {
            setMessage('Seed Error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            padding: '1.5rem',
            backgroundColor: 'var(--card)',
            border: '1px border var(--border)',
            borderRadius: 'var(--radius)',
            marginTop: '2rem'
        }}>
            <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>🔔 관리자 메뉴</h3>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        borderRadius: 'var(--radius)',
                        border: 'none',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                    어제 벌금 정산하기
                </button>

                <button
                    onClick={async () => {
                        setLoading(true)
                        setMessage('')
                        const today = new Date().toISOString().split('T')[0]
                        try {
                            const res = await generateWeeklyFinesAction(roomId, today)
                            if (res.finesCreated !== undefined) setMessage(`${res.finesCreated}건의 주간 벌금이 생성되었습니다.`)
                            else setMessage(res.message || 'Error')
                        } catch (e) { setMessage('오류 발생') }
                        finally { setLoading(false) }
                    }}
                    disabled={loading}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--secondary)',
                        color: 'var(--secondary-foreground)',
                        borderRadius: 'var(--radius)',
                        border: 'none',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <CalendarDays size={16} />}
                    주간 정산 (최근 7일)
                </button>

                <button
                    onClick={async () => {
                        if (!confirm('정말 모든 "납부 완료" 건을 승인하시겠습니까?')) return

                        setLoading(true)
                        setMessage('')
                        try {
                            const res = await confirmAllPaymentsAction(roomId)
                            if (res.success) setMessage(`${res.count}건의 벌금을 일괄 승인했습니다.`)
                            else setMessage(res.message || 'Error')
                        } catch (e) { setMessage('오류가 발생했습니다.') }
                        finally { setLoading(false) }
                    }}
                    disabled={loading}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--success)',
                        color: 'var(--success-foreground)', // Assuming these vars exist, else use hardcoded green
                        borderRadius: 'var(--radius)',
                        border: 'none',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                    일괄 납부 승인
                </button>

                <button
                    onClick={handleSeed}
                    disabled={loading}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--muted)',
                        color: 'var(--foreground)',
                        borderRadius: 'var(--radius)',
                        border: 'none',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    <Database size={16} />
                    (개발용) 테스트 데이터 생성
                </button>
            </div>

            {message && (
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                    {message}
                </p>
            )}
        </div>
    )
}
