'use client'

import { User } from 'lucide-react'

interface Participant {
    user_id: string
    role: 'OWNER' | 'ADMIN' | 'MEMBER'
    joined_at: string
    users: {
        username: string | null
        profile_image_url: string | null
    } | null
    isOnline?: boolean // To be implemented
}

export default function MemberList({ participants }: { participants: any[] }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {participants.map((p) => (
                <div key={p.user_id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    backgroundColor: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {p.users?.profile_image_url ? (
                                <img src={p.users.profile_image_url} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={20} color="var(--muted-foreground)" />
                            )}
                        </div>
                        <div>
                            <div style={{ fontWeight: '600' }}>
                                {p.users?.username || 'Unknown User'}
                                {p.role === 'OWNER' && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.1rem 0.4rem', borderRadius: '99px' }}>방장</span>}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                {new Date(p.joined_at).toISOString().split('T')[0]} 가입
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
