'use client'

interface Rule {
    id: string
    type: string
    description: string | null
    penalty_amount: number
    condition_json?: {
        subtype: string
        min_hours?: number
        count?: number
        interval?: string
    }
}

export default function RuleList({ rules }: { rules: Rule[] }) {
    if (rules.length === 0) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
                textAlign: 'center',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border)',
                color: 'var(--muted-foreground)'
            }}>
                <div style={{
                    width: '48px', height: '48px',
                    backgroundColor: 'var(--muted)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                    color: 'var(--muted-foreground)'
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--foreground)', marginBottom: '0.25rem' }}>
                    등록된 규칙이 없습니다
                </h3>
                <p style={{ fontSize: '0.875rem' }}>
                    방장이 아직 스터디 규칙을 설정하지 않았어요.
                </p>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {rules.map((rule) => {
                const condition = (rule.condition_json || {}) as {
                    subtype?: string
                    min_hours?: number
                    count?: number
                }
                const isWeeklyGoal = condition.subtype === 'WEEKLY'
                const dailyHours = condition.min_hours
                const weeklyCount = condition.count

                return (
                    <div key={rule.id} style={{
                        padding: '1.5rem',
                        backgroundColor: 'var(--card)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                                    {isWeeklyGoal ? '주간 목표 달성' : '스터디 규칙'}
                                </h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                                    {rule.description}
                                </p>
                            </div>
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--destructive)',
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius)',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                textAlign: 'right'
                            }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'normal', marginBottom: '0.1rem' }}>미달성 1회당</span>
                                {rule.penalty_amount.toLocaleString()}원
                            </div>
                        </div>

                        {/* Detail Grid */}
                        {isWeeklyGoal && (
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
                                paddingTop: '1rem', borderTop: '1px solid var(--border)'
                            }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>
                                        하루 최소 공부
                                    </span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                                        {dailyHours ? `${dailyHours}시간` : '-'}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>
                                        주간 목표 횟수
                                    </span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                                        {weeklyCount ? `주 ${weeklyCount}회` : '-'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
