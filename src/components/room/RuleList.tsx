'use client'

interface Rule {
    id: string
    type: string
    description: string | null
    penalty_amount: number
}

export default function RuleList({ rules }: { rules: Rule[] }) {
    if (rules.length === 0) {
        return (
            <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: 'var(--muted-foreground)',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
            }}>
                <p>등록된 규칙이 없습니다.</p>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {rules.map((rule) => (
                <div key={rule.id} style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'var(--primary)',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '99px'
                        }}>
                            {rule.type}
                        </span>
                        <span style={{ fontWeight: 'bold' }}>
                            {rule.penalty_amount.toLocaleString()}원
                        </span>
                    </div>
                    <p style={{ color: 'var(--foreground)' }}>
                        {rule.description || '규칙 설명이 없습니다.'}
                    </p>
                </div>
            ))}
        </div>
    )
}
