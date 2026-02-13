'use client'

import { useState, useEffect } from 'react'

export interface RuleConfig {
    id: string
    type: 'GOAL'
    subtype: 'DURATION' | 'WEEKLY'
    value: number
    penalty: number
    description: string
}

export default function RuleBuilder({ onRulesChange }: { onRulesChange: (rules: RuleConfig[]) => void }) {
    // Single Activation State
    const [isActive, setIsActive] = useState(true)

    // Unififed Helper States
    const [dailyHours, setDailyHours] = useState(3)
    const [weeklyDays, setWeeklyDays] = useState(5)
    // Single Fine Amount (Integrated)
    const [penalty, setPenalty] = useState(1000)

    useEffect(() => {
        const rules: RuleConfig[] = []

        if (isActive) {
            // 1. Daily Rule
            rules.push({
                id: 'daily-rule',
                type: 'GOAL',
                subtype: 'DURATION',
                value: dailyHours,
                penalty: penalty,
                description: `일일 ${dailyHours}시간 이상 공부`
            })

            // 2. Weekly Rule
            rules.push({
                id: 'weekly-rule',
                type: 'GOAL',
                subtype: 'WEEKLY',
                value: weeklyDays,
                penalty: penalty,
                description: `주 ${weeklyDays}회 이상 출석`
            })
        }

        onRulesChange(rules)
    }, [isActive, dailyHours, weeklyDays, penalty, onRulesChange])

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                스터디 규칙 설정
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                스터디원들이 지켜야 할 인증 목표입니다.
            </p>

            <div style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                backgroundColor: isActive ? 'var(--card)' : 'var(--background)',
                opacity: isActive ? 1 : 0.7,
                transition: 'all 0.2s'
            }}>
                {/* Main Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: isActive ? '1.5rem' : 0 }}>
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        id="activateRules"
                        style={{ marginRight: '0.75rem', width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <label htmlFor="activateRules" style={{ fontWeight: '600', fontSize: '1rem', cursor: 'pointer', flex: 1 }}>
                        목표 및 벌금 설정하기
                    </label>
                </div>

                {isActive && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '0.5rem' }}>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem' }}>
                            {/* Daily Input */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                    하루 최소 공부 시간
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        min="1" max="24"
                                        value={dailyHours}
                                        onChange={(e) => setDailyHours(Number(e.target.value))}
                                        style={{
                                            width: '100%', padding: '0.75rem',
                                            borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                                            backgroundColor: 'var(--background)', fontSize: '1rem'
                                        }}
                                    />
                                    <span style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>시간</span>
                                </div>
                            </div>

                            {/* Weekly Input */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                    주간 최소 출석 일수
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        min="1" max="7"
                                        value={weeklyDays}
                                        onChange={(e) => setWeeklyDays(Number(e.target.value))}
                                        style={{
                                            width: '100%', padding: '0.75rem',
                                            borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                                            backgroundColor: 'var(--background)', fontSize: '1rem'
                                        }}
                                    />
                                    <span style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>일</span>
                                </div>
                            </div>

                            {/* Fine Input - integrated */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                    목표 미달성 시 벌금
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        step="100" min="0"
                                        value={penalty}
                                        onChange={(e) => setPenalty(Number(e.target.value))}
                                        style={{
                                            width: '100%', padding: '0.75rem',
                                            borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                                            backgroundColor: 'var(--background)', fontSize: '1rem'
                                        }}
                                    />
                                    <span style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>원</span>
                                </div>
                                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                    * 하루 {dailyHours}시간 이상 공부한 날이 주 {weeklyDays}회 미만일 경우, {penalty.toLocaleString()}원의 벌금이 부과됩니다.
                                </p>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* Hidden Input for Server Action */}
            <input type="hidden" name="rulesJson" value={JSON.stringify(isActive ? [
                {
                    id: 'integrated',
                    type: 'GOAL',
                    subtype: 'WEEKLY',
                    value: weeklyDays,
                    dailyTarget: dailyHours,
                    penalty: penalty,
                    description: `주 ${weeklyDays}회 (일 ${dailyHours}시간) 이상 공부`
                }
            ] : [])} />
        </div>
    )
}
