import { createClient } from '@/lib/supabase/server'
import { getRoomDetails } from '@/services/roomService'
import { checkAndRunWeeklySettlement } from '@/services/fineService' // Automation
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, Settings, Share2, LogOut } from 'lucide-react'
import SiTimer from '@/components/timer/SiTimer'
import RoomTabs from '@/components/room/RoomTabs'
import MemberList from '@/components/room/MemberList'
import RuleList from '@/components/room/RuleList'
import MyFineStatus from '@/components/room/MyFineStatus'
import FineList from '@/components/room/FineList'
import JoinButton from '@/components/room/JoinButton'
import AdminFineControls from '@/components/room/AdminFineControls'
import RoomNotice from '@/components/room/RoomNotice'
import StreakDisplay from '@/components/room/StreakDisplay'
import StatsOverview from '@/components/room/StatsOverview'
import WeeklyChart from '@/components/room/WeeklyChart'
import Leaderboard from '@/components/room/Leaderboard'
import { getPersonalStats, getWeeklyStudy, getMemberRankings } from '@/services/statsService'

export default async function RoomDetailPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ tab?: string }>
}) {
    const { id } = await params

    // Automation: Check and run weekly settlement (Fire & Forget)
    checkAndRunWeeklySettlement(id).catch(err => {
        console.error(`[Settlement] Failed for room ${id}:`, err instanceof Error ? err.message : err)
    })

    const { data, error } = await getRoomDetails(id)

    if (error || !data || !data.room) {
        notFound()
    }

    const {
        room,
        user,
        membership,
        activeSession,
        todayTotalSeconds,
        participants,
        rules,
        fines,
        myStreak,
        streaks
    } = data

    const isOwner = membership?.role === 'OWNER'
    const isMember = !!membership

    // Tabs Logic
    const tab = (await searchParams).tab || 'home'
    const memberCount = participants?.length || 0

    return (
        <div style={{ paddingBottom: '80px' }}>
            {/* Header Section */}
            <header style={{
                padding: '2rem 1.5rem',
                backgroundColor: 'var(--card)',
                borderBottom: '1px solid var(--border)'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', lineHeight: 1.2, margin: 0 }}>
                            {room.name}
                        </h1>
                        {isOwner && (
                            <Link href={`/room/${id}/settings`} style={{ padding: '0.5rem', color: 'var(--muted-foreground)' }}>
                                <Settings size={20} />
                            </Link>
                        )}
                    </div>

                    <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                        {room.description || '스터디 설명이 없습니다.'}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} className="text-indigo-500" />
                            <span>{room.start_date} ~ {room.end_date || '종료일 없음'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} className="text-indigo-500" />
                            <span>멤버 {memberCount}명</span>
                        </div>
                    </div>

                    {isMember && (
                        <SiTimer
                            roomId={id}
                            initialSessionId={activeSession?.id}
                            initialStartTime={activeSession?.check_in_time}
                            initialTotalSeconds={todayTotalSeconds}
                        />
                    )}

                    {!isMember && (
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
                            <JoinButton roomId={id} />
                            <button style={{
                                padding: '0.75rem',
                                backgroundColor: 'var(--muted)',
                                border: 'none',
                                borderRadius: 'var(--radius)',
                                color: 'var(--foreground)'
                            }}>
                                <Share2 size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Tab Navigation */}
            <RoomTabs roomId={id} />

            {/* Content Area */}
            <main key={tab} className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
                {tab === 'home' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Streak + Fine Status (Only for members) */}
                        {isMember && (
                            <StreakDisplay streak={myStreak} />
                        )}

                        {isMember && fines && (
                            <MyFineStatus fines={fines.filter((f: any) => f.user_id === user?.id)} roomId={id} />
                        )}

                        {/* Notice Section */}
                        <RoomNotice roomId={id} notice={room.notice} isOwner={isOwner} />

                        {isOwner && <AdminFineControls roomId={id} />}
                    </div>
                )}

                {tab === 'stats' && isMember && user && (
                    <StatsTab userId={user.id} roomId={id} />
                )}

                {tab === 'members' && (
                    <MemberList participants={participants || []} streaks={streaks} />
                )}

                {tab === 'rules' && (
                    <RuleList rules={rules || []} />
                )}

                {tab === 'fines' && (
                    <FineList fines={fines || []} currentUserId={user?.id || ''} isOwner={isOwner} roomId={room.id} />
                )}
            </main>
        </div>
    )
}

async function StatsTab({ userId, roomId }: { userId: string, roomId: string }) {
    const [personalStats, weeklyData, rankings] = await Promise.all([
        getPersonalStats(userId, roomId),
        getWeeklyStudy(userId, roomId),
        getMemberRankings(roomId),
    ])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <StatsOverview stats={personalStats} />
            <WeeklyChart data={weeklyData} />
            <Leaderboard rankings={rankings} />
        </div>
    )
}
