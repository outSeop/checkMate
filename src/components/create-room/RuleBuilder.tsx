'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Clock, Hourglass } from 'lucide-react'

export interface RuleConfig {
    id: string
    type: 'ATTENDANCE' | 'GOAL'
    subtype: 'LATE' | 'DURATION'
    value: string | number // "09:00" or 3
    penalty: number
    description: string
}

export default function RuleBuilder({ onRulesChange }: { onRulesChange: (rules: RuleConfig[]) => void }) {
    const [rules, setRules] = useState<RuleConfig[]>([])

    useEffect(() => {
        onRulesChange(rules)
    }, [rules, onRulesChange])

    const addRule = (subtype: 'LATE' | 'DURATION') => {
        const newRule: RuleConfig = {
            id: Math.random().toString(36).substr(2, 9),
            type: subtype === 'LATE' ? 'ATTENDANCE' : 'GOAL',
            subtype,
            value: subtype === 'LATE' ? '09:00' : 1,
            penalty: 1000,
            description: subtype === 'LATE' ? '지각 (9시 이후)' : '일일 최소 1시간 공부'
        }
        setRules([...rules, newRule])
    }

    const removeRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id))
    }

    const updateRule = (id: string, field: keyof RuleConfig, value: any) => {
        setRules(rules.map(r => {
            if (r.id === id) {
                const updated = { ...r, [field]: value }
                // Update description automatically for convenience
                if (field === 'value' || field === 'penalty') {
                    if (updated.subtype === 'LATE') {
                        updated.description = `지각 (${updated.value} 이후)`
                    } else if (updated.subtype === 'DURATION') {
                        updated.description = `일일 최소 ${updated.value}시간 공부`
                    }
                }
                return updated
            }
            return r
        }))
    }

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                스터디 규칙 설정
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                    type="button"
                    onClick={() => addRule('LATE')}
                    style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    <Clock size={16} />
                    지각 규칙 추가
                </button>
                <button
                    type="button"
                    onClick={() => addRule('DURATION')}
                    style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    <Hourglass size={16} />
                    최소 시간 규칙 추가
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {rules.map((rule) => (
                    <div key={rule.id} style={{
                        padding: '1rem',
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        display: 'flex', flexDirection: 'column', gap: '0.75rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {rule.subtype === 'LATE' ? <Clock size={16} /> : <Hourglass size={16} />}
                                {rule.subtype === 'LATE' ? '지각 체크' : '최소 공부 시간'}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeRule(rule.id)}
                                style={{ color: 'var(--destructive)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.3rem' }}>
                                    {rule.subtype === 'LATE' ? '기준 시간' : '시간 (시간 단위)'}
                                </label>
                                {rule.subtype === 'LATE' ? (
                                    <input
                                        type="time"
                                        value={rule.value}
                                        onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                ) : (
                                    <input
                                        type="number"
                                        min="1" max="24"
                                        value={rule.value}
                                        onChange={(e) => updateRule(rule.id, 'value', Number(e.target.value))}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.3rem' }}>
                                    벌금 (원)
                                </label>
                                <input
                                    type="number"
                                    step="100" min="0"
                                    value={rule.penalty}
                                    onChange={(e) => updateRule(rule.id, 'penalty', Number(e.target.value))}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {rules.length === 0 && (
                    <div style={{
                        textAlign: 'center', padding: '1.5rem',
                        color: 'var(--muted-foreground)', fontSize: '0.875rem',
                        border: '1px dashed var(--border)', borderRadius: 'var(--radius)'
                    }}>
                        규칙을 추가하여 자동 벌금 시스템을 활용해보세요.
                    </div>
                )}
            </div>

            {/* Hidden Input to pass stringified rules to Server Action */}
            <input type="hidden" name="rulesJson" value={JSON.stringify(rules)} />
        </div>
    )
}
