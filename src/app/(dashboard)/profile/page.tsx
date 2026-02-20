import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserPoints } from '@/app/actions/points'
import Image from 'next/image'
import { User, Clock, Flame, BookOpen, LogOut } from 'lucide-react'
import PointsBadge from '@/components/common/PointsBadge'
import LogoutButton from '@/components/profile/LogoutButton'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 병렬로 데이터 조회
    const [
        { data: profile },
        { data: rooms },
        { data: allLogs },
        { data: streaks },
        points
    ] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('room_participants').select('room_id, role, rooms(name)').eq('user_id', user.id),
        supabase.from('attendance_logs').select('duration_seconds').eq('user_id', user.id).not('duration_seconds', 'is', null),
        supabase.from('user_streaks').select('current_streak, max_streak').eq('user_id', user.id),
        getUserPoints(user.id),
    ])

    const totalStudySeconds = allLogs?.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) || 0
    const totalHours = Math.floor(totalStudySeconds / 3600)
    const totalMinutes = Math.floor((totalStudySeconds % 3600) / 60)
    const roomCount = rooms?.length || 0
    const bestStreak = streaks?.reduce((max, s) => Math.max(max, s.max_streak || 0), 0) || 0

    return (
        <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }}>
            {/* Profile Header */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                padding: '2rem',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                marginBottom: '1.5rem',
            }}>
                <div style={{
                    width: '80px', height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                }}>
                    {profile?.profile_image_url ? (
                        <Image src={profile.profile_image_url} alt="profile" width={80} height={80} style={{ objectFit: 'cover' }} />
                    ) : (
                        <User size={36} color="var(--muted-foreground)" />
                    )}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.25rem' }}>
                        {profile?.username || user.email?.split('@')[0] || 'User'}
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0 }}>
                        {user.email}
                    </p>
                </div>
                {points > 0 && <PointsBadge points={points} />}
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
            }}>
                <StatCard icon={<Clock size={20} color="var(--primary)" />} label="총 공부시간" value={`${totalHours}시간 ${totalMinutes}분`} />
                <StatCard icon={<BookOpen size={20} color="var(--primary)" />} label="참여 스터디" value={`${roomCount}개`} />
                <StatCard icon={<Flame size={20} color="hsl(25, 95%, 53%)" />} label="최고 연속 출석" value={`${bestStreak}일`} />
                <StatCard icon={<Clock size={20} color="var(--primary)" />} label="총 세션" value={`${allLogs?.length || 0}회`} />
            </div>

            {/* My Rooms */}
            {rooms && rooms.length > 0 && (
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    marginBottom: '1.5rem',
                }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 1rem' }}>참여 중인 스터디</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {rooms.map((r: any) => (
                            <a key={r.room_id} href={`/room/${r.room_id}`} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                backgroundColor: 'var(--muted)',
                                textDecoration: 'none',
                                color: 'var(--foreground)',
                                fontSize: '0.9rem',
                            }}>
                                <span>{r.rooms?.name || '스터디'}</span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '0.15rem 0.4rem',
                                    borderRadius: '99px',
                                    backgroundColor: r.role === 'OWNER' ? 'var(--primary)' : 'var(--border)',
                                    color: r.role === 'OWNER' ? 'var(--primary-foreground)' : 'var(--foreground)',
                                }}>
                                    {r.role === 'OWNER' ? '방장' : '멤버'}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Logout */}
            <LogoutButton />
        </div>
    )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div style={{
            padding: '1rem',
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
        }}>
            <div style={{ marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '700' }}>{value}</div>
        </div>
    )
}
