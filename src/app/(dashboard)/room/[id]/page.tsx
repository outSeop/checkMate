import { createClient } from '@/lib/supabase/server'
import { getRoomDetails } from '@/services/roomService'
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

export default async function RoomDetailPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ tab?: string }>
}) {
    const { id } = await params
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
        fines
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
                            <span>{room.start_date} ~ {room.end_date}</span>
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
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
                {tab === 'home' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Fine Status Card (Only for members) */}
                        {isMember && fines && (
                            <MyFineStatus fines={fines.filter((f: any) => f.user_id === user?.id)} />
                        )}

                        <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: 'var(--muted-foreground)',
                            backgroundColor: 'var(--card)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border)'
                        }}>
                            <p>📢 공지사항</p>
                            <br />
                            <p>아직 등록된 공지사항이 없습니다.</p>
                        </div>

                        {isOwner && <AdminFineControls roomId={id} />}
                    </div>
                )}

                {tab === 'members' && (
                    <MemberList participants={participants || []} />
                )}

                {tab === 'rules' && (
                    <RuleList rules={rules || []} />
                )}

                {tab === 'fines' && (
                    <FineList fines={fines || []} currentUserId={user?.id || ''} />
                )}
            </main>
        </div>
    )
}
