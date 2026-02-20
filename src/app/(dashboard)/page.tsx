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
                    padding: '3rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--muted-foreground)'
                }}>
                    <p>참여 중인 스터디가 없습니다.</p>
                    <Link href="/create-room" style={{
                        display: 'inline-block',
                        marginTop: '1rem',
                        color: 'var(--primary)',
                        textDecoration: 'underline'
                    }}>
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
