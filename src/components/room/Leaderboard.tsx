'use client'

import Image from 'next/image'
import { User, Flame, Trophy } from 'lucide-react'
import type { MemberRanking } from '@/services/statsService'

const RANK_COLORS = ['hsl(45, 93%, 47%)', 'hsl(0, 0%, 60%)', 'hsl(25, 70%, 50%)']

export default function Leaderboard({ rankings }: { rankings: MemberRanking[] }) {
    if (rankings.length === 0) return null

    return (
        <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
        }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 1rem' }}>멤버 랭킹</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {rankings.map((member, idx) => {
                    const hours = Math.floor(member.totalSeconds / 3600)
                    const mins = Math.floor((member.totalSeconds % 3600) / 60)

                    return (
                        <div key={member.user_id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius)',
                            backgroundColor: idx < 3 ? 'var(--muted)' : 'transparent',
                        }}>
                            <span style={{
                                width: '24px',
                                textAlign: 'center',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                color: idx < 3 ? RANK_COLORS[idx] : 'var(--muted-foreground)',
                            }}>
                                {idx < 3 ? <Trophy size={16} color={RANK_COLORS[idx]} /> : idx + 1}
                            </span>
                            <div style={{
                                width: '28px', height: '28px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden',
                                flexShrink: 0,
                            }}>
                                {member.profile_image_url ? (
                                    <Image src={member.profile_image_url} alt="" width={28} height={28} style={{ objectFit: 'cover' }} />
                                ) : (
                                    <User size={14} color="var(--muted-foreground)" />
                                )}
                            </div>
                            <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: '500' }}>
                                {member.username || 'Unknown'}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                {hours}h {mins}m
                            </span>
                            {member.currentStreak > 0 && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.75rem', color: 'hsl(25, 95%, 53%)' }}>
                                    <Flame size={12} fill="hsl(25, 95%, 53%)" />
                                    {member.currentStreak}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
