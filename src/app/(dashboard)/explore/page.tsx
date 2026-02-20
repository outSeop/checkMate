import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Search } from 'lucide-react'
import styles from '../Dashboard.module.css'

export default async function ExplorePage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams
    const supabase = await createClient()

    let query = supabase
        .from('rooms')
        .select('*, room_participants(user_id)')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

    if (q) {
        query = query.ilike('name', `%${q}%`)
    }

    const { data: rooms } = await query

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>공개 스터디 탐색</h1>
            </div>

            {/* Search */}
            <form style={{ marginBottom: '1.5rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                }}>
                    <Search size={18} color="var(--muted-foreground)" />
                    <input
                        name="q"
                        type="text"
                        placeholder="스터디 이름으로 검색..."
                        defaultValue={q || ''}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            fontSize: '0.9rem',
                            color: 'var(--foreground)',
                        }}
                    />
                </div>
            </form>

            {!rooms || rooms.length === 0 ? (
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
                    color: 'var(--muted-foreground)',
                }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                        {q ? '검색 결과가 없습니다' : '공개된 스터디가 없습니다'}
                    </h3>
                    <p style={{ fontSize: '0.875rem' }}>
                        {q ? '다른 키워드로 검색해 보세요.' : '새로운 스터디를 공개로 만들어 보세요.'}
                    </p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {rooms.map((room) => {
                        const memberCount = room.room_participants?.length || 0
                        return (
                            <Link href={`/room/${room.id}`} key={room.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}>{room.name}</h3>
                                    <div className={styles.cardDesc}>
                                        {room.description || '스터디 설명이 없습니다.'}
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                            {room.start_date} ~ {room.end_date || '종료일 없음'}
                                        </span>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            fontSize: '0.75rem',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '99px',
                                            backgroundColor: 'var(--muted)',
                                            marginLeft: 'auto',
                                        }}>
                                            <Users size={12} />
                                            {memberCount}명
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
