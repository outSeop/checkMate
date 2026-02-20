'use client'

import { useState } from 'react'
import { generateDailyFines, seedFineTestData, generateWeeklyFinesAction, confirmAllPaymentsAction } from '@/app/actions/fines'
import { Loader2, Zap, Database, CalendarDays, CheckCircle } from 'lucide-react'
import { getYesterdayDateString, getTodayDateString } from '@/lib/dateUtils'

export default function AdminFineControls({ roomId }: { roomId: string }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [successId, setSuccessId] = useState<string | null>(null)
    const [message, setMessage] = useState('')

    const handleGenerate = async () => {
        setLoadingId('generate')
        setMessage('')

        const dateStr = getYesterdayDateString()

        try {
            const res = await generateDailyFines(roomId, dateStr)
            if (res.finesCreated !== undefined) {
                setMessage(`${res.finesCreated}건의 벌금이 생성되었습니다.`)
                setSuccessId('generate')
                setTimeout(() => setSuccessId(null), 2000)
            } else {
                setMessage(res.message || 'Error')
            }
        } catch (e) {
            console.error('Daily fine generation error:', e)
            setMessage('오류가 발생했습니다.')
        } finally {
            setLoadingId(null)
        }
    }

    const handleSeed = async () => {
        setLoadingId('seed')
        try {
            await seedFineTestData(roomId)
            setMessage('테스트 데이터(규칙+지각기록)가 생성되었습니다.')
            setSuccessId('seed')
            setTimeout(() => setSuccessId(null), 2000)
        } catch (e) {
            console.error('Seed data error:', e)
            setMessage('Seed Error')
        } finally {
            setLoadingId(null)
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
                    disabled={loadingId !== null || successId === 'generate'}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: successId === 'generate' ? 'var(--success)' : 'var(--primary)',
                        color: successId === 'generate' ? 'var(--success-foreground)' : 'var(--primary-foreground)',
                        borderRadius: 'var(--radius)',
                        border: 'none',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: (loadingId !== null || successId === 'generate') ? 'default' : 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {loadingId === 'generate' ? <Loader2 className="animate-spin" size={16} /> : (successId === 'generate' ? <CheckCircle size={16} /> : <Zap size={16} />)}
                    {successId === 'generate' ? '최근 1일 정산 완료' : '어제 벌금 정산하기'}
                </button>

                <button
                    onClick={async () => {
                        setLoadingId('weekly')
                        setMessage('')
                        const today = getTodayDateString()
                        try {
                            const res = await generateWeeklyFinesAction(roomId, today)
                            if (res.finesCreated !== undefined) {
                                setMessage(`${res.finesCreated}건의 주간 벌금이 생성되었습니다.`)
                                setSuccessId('weekly')
                                setTimeout(() => setSuccessId(null), 2000)
                            } else setMessage(res.message || 'Error')
                        } catch (e) { console.error('Weekly fine generation error:', e); setMessage('오류 발생') }
                        finally { setLoadingId(null) }
                    }}
                    disabled={loadingId !== null || successId === 'weekly'}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: successId === 'weekly' ? 'var(--success)' : 'transparent',
                        color: successId === 'weekly' ? 'var(--success-foreground)' : 'var(--primary)',
                        borderRadius: 'var(--radius)',
                        border: successId === 'weekly' ? '1px solid var(--success)' : '1px solid var(--primary)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: (loadingId !== null || successId === 'weekly') ? 'default' : 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {loadingId === 'weekly' ? <Loader2 className="animate-spin" size={16} /> : (successId === 'weekly' ? <CheckCircle size={16} /> : <CalendarDays size={16} />)}
                    {successId === 'weekly' ? '주간 정산 완료' : '주간 정산 (최근 7일)'}
                </button>

                <button
                    onClick={async () => {
                        if (!confirm('정말 모든 "납부 완료" 건을 승인하시겠습니까?')) return

                        setLoadingId('confirmAll')
                        setMessage('')
                        try {
                            const res = await confirmAllPaymentsAction(roomId)
                            if (res.success) {
                                setMessage(`${res.count}건의 벌금을 일괄 승인했습니다.`)
                                setSuccessId('confirmAll')
                                setTimeout(() => setSuccessId(null), 2000)
                            } else setMessage(res.message || 'Error')
                        } catch (e) { console.error('Confirm all payments error:', e); setMessage('오류가 발생했습니다.') }
                        finally { setLoadingId(null) }
                    }}
                    disabled={loadingId !== null || successId === 'confirmAll'}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: successId === 'confirmAll' ? 'var(--success)' : 'transparent',
                        color: successId === 'confirmAll' ? 'var(--success-foreground)' : 'var(--success)',
                        borderRadius: 'var(--radius)',
                        border: successId === 'confirmAll' ? '1px solid var(--success)' : '1px solid var(--success)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: (loadingId !== null || successId === 'confirmAll') ? 'default' : 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {loadingId === 'confirmAll' ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                    {successId === 'confirmAll' ? '전체 승인 완료' : '일괄 납부 승인'}
                </button>

                <button
                    onClick={handleSeed}
                    disabled={loadingId !== null || successId === 'seed'}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: successId === 'seed' ? 'var(--success)' : 'transparent',
                        color: successId === 'seed' ? 'var(--success-foreground)' : 'var(--muted-foreground)',
                        borderRadius: 'var(--radius)',
                        border: successId === 'seed' ? '1px solid var(--success)' : '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: (loadingId !== null || successId === 'seed') ? 'default' : 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {loadingId === 'seed' ? <Loader2 className="animate-spin" size={16} /> : (successId === 'seed' ? <CheckCircle size={16} /> : <Database size={16} />)}
                    {successId === 'seed' ? '데이터 생성됨' : '(개발용) 테스트 데이터 생성'}
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
