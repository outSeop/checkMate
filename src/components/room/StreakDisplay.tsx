'use client'

import { Flame } from 'lucide-react'
import type { UserStreak } from '@/types/database'

export default function StreakDisplay({ streak }: { streak: UserStreak | null }) {
    const current = streak?.current_streak || 0
    const max = streak?.max_streak || 0

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
        }}>
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: current > 0 ? 'hsl(25, 95%, 95%)' : 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Flame
                    size={22}
                    color={current > 0 ? 'hsl(25, 95%, 53%)' : 'var(--secondary-foreground)'}
                    fill={current > 0 ? 'hsl(25, 95%, 53%)' : 'none'}
                />
            </div>
            <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    {current}일 연속
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                    최대 {max}일
                </div>
            </div>
        </div>
    )
}
