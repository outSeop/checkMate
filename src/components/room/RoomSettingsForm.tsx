'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateRoomNotice } from '@/app/actions/room'
import { updateRoomSettings } from '@/app/actions/room'
import { Check, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function RoomSettingsForm({ roomId, initialNotice, initialSettlementDay }: { roomId: string, initialNotice: string, initialSettlementDay: number }) {
    const [notice, setNotice] = useState(initialNotice || '')
    const [settlementDay, setSettlementDay] = useState(initialSettlementDay ?? 1)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        setLoading(true)
        try {
            // Update Notice
            await updateRoomNotice(roomId, notice)

            // Update Settlement Day
            await updateRoomSettings(roomId, Number(settlementDay))

            alert('설정이 저장되었습니다.')
            router.refresh()
        } catch (e) {
            console.error(e)
            alert('저장 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const days = [
        { value: 1, label: '월요일 (지난 주 월~일 정산)' },
        { value: 2, label: '화요일 (지난 주 화~월 정산)' },
        { value: 3, label: '수요일 (지난 주 수~화 정산)' },
        { value: 4, label: '목요일 (지난 주 목~수 정산)' },
        { value: 5, label: '금요일 (지난 주 금~목 정산)' },
        { value: 6, label: '토요일 (지난 주 토~금 정산)' },
        { value: 0, label: '일요일 (지난 주 일~토 정산)' },
    ]

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Link href={`/room/${roomId}`} style={{ display: 'flex', alignItems: 'center', color: 'var(--muted-foreground)' }}>
                    <ArrowLeft size={24} />
                </Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>방 설정</h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* 1. Notice Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: '600', color: 'var(--foreground)' }}>공지사항</label>
                    <textarea
                        value={notice}
                        onChange={(e) => setNotice(e.target.value)}
                        placeholder="공지사항을 입력하세요..."
                        style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            minHeight: '120px',
                            backgroundColor: 'var(--background)',
                            color: 'var(--foreground)',
                            resize: 'vertical'
                        }}
                    />
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                        방 상단에 표시되는 공지사항입니다.
                    </p>
                </div>

                {/* 2. Settlement Day Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: '600', color: 'var(--foreground)' }}>주간 정산 요일</label>
                    <select
                        value={settlementDay}
                        onChange={(e) => setSettlementDay(Number(e.target.value))}
                        style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--background)',
                            color: 'var(--foreground)',
                            fontSize: '1rem'
                        }}
                    >
                        {days.map(day => (
                            <option key={day.value} value={day.value}>
                                {day.label}
                            </option>
                        ))}
                    </select>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                        해당 요일에 지난 일주일치 벌금을 자동으로 정산합니다.<br />
                        예: 월요일 선택 시, 월요일에 접속하면 <strong>지난 주 월~일</strong> 기록을 정산합니다.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                        padding: '1rem',
                        backgroundColor: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        borderRadius: 'var(--radius)',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: '1rem',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Check />}
                    설정 저장하기
                </button>
            </div>
        </div>
    )
}
