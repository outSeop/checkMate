import styles from './Dashboard.module.css'
import { getUserRooms } from '@/services/roomService'
import Link from 'next/link'
import DevTools from '@/components/common/DevTools'

export default async function HomePage() {
    const rooms = await getUserRooms()

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    내 스터디
                </h1>
                <Link href="/create-room" className={styles.createButton}>
                    + 새 스터디
                </Link>
            </div>

            {rooms.length === 0 ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px dashed var(--border)',
                    color: 'var(--muted-foreground)'
                }}>
                    <div style={{
                        width: '64px', height: '64px',
                        backgroundColor: 'var(--muted)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '1.5rem',
                        color: 'var(--foreground)'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                        아직 참여 중인 스터디가 없네요!
                    </h3>
                    <p style={{ fontSize: '0.875rem', marginBottom: '2rem', maxWidth: '300px', lineHeight: 1.5 }}>
                        새로운 스터디를 개설하고 팀원들과 함께 목표를 달성해 보세요.
                    </p>
                    <Link href="/create-room" className={styles.createButton} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.5rem', fontSize: '0.9rem'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        첫 스터디 만들기
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {rooms.map((room) => (
                        <Link href={`/room/${room.id}`} key={room.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>{room.name}</h3>
                                <div className={styles.cardDesc}>
                                    {/* structured rule tags */}
                                    {(() => {
                                        const rule = room.rules?.[0]
                                        if (!rule) return room.description || '규칙이 설정되지 않았습니다.'

                                        const condition = rule.condition_json || {}
                                        const isWeekly = condition.subtype === 'WEEKLY'
                                        const dailyHours = condition.min_hours
                                        const weeklyCount = condition.count

                                        if (isWeekly) {
                                            return (
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <span style={{
                                                        backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
                                                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600'
                                                    }}>
                                                        🔥 주 {weeklyCount}회
                                                    </span>
                                                    <span style={{
                                                        backgroundColor: 'var(--muted)', color: 'var(--foreground)',
                                                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem'
                                                    }}>
                                                        ⏱️ 하루 {dailyHours}시간
                                                    </span>
                                                </div>
                                            )
                                        }

                                        return rule.description || room.description
                                    })()}
                                </div>
                                <div className={styles.cardFooter}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                        {room.start_date} ~ {room.end_date}
                                    </span>
                                    {/* Member count requires additional query, skipping for list view performance for now */}
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '99px',
                                        backgroundColor: 'var(--muted)',
                                        marginLeft: 'auto'
                                    }}>
                                        {room.room_participants?.[0]?.role === 'OWNER' ? '방장' : '참여자'}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            <DevTools />
        </div>
    )
}
