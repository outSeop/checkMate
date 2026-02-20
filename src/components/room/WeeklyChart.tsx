'use client'

import type { DailyStudy } from '@/services/statsService'

export default function WeeklyChart({ data }: { data: DailyStudy[] }) {
    const maxSeconds = Math.max(...data.map(d => d.seconds), 1)

    return (
        <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
        }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 1rem' }}>주간 학습 시간</h3>
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '0.5rem',
                height: '120px',
            }}>
                {data.map((d) => {
                    const height = d.seconds > 0 ? Math.max((d.seconds / maxSeconds) * 100, 4) : 0
                    const hours = Math.floor(d.seconds / 3600)
                    const mins = Math.floor((d.seconds % 3600) / 60)

                    return (
                        <div key={d.date} style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                        }}>
                            {d.seconds > 0 && (
                                <span style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>
                                    {hours > 0 ? `${hours}h` : `${mins}m`}
                                </span>
                            )}
                            <div style={{
                                width: '100%',
                                height: `${height}%`,
                                backgroundColor: d.seconds > 0 ? 'var(--primary)' : 'var(--muted)',
                                borderRadius: '4px 4px 0 0',
                                minHeight: d.seconds > 0 ? '4px' : '2px',
                                transition: 'height 0.3s ease',
                            }} />
                            <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                                {d.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
