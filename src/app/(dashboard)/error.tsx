'use client'

import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '2rem',
            textAlign: 'center',
        }}>
            <div style={{
                width: '64px', height: '64px',
                backgroundColor: 'hsl(0, 84%, 95%)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem',
            }}>
                <AlertTriangle size={32} color="hsl(0, 84%, 60%)" />
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem' }}>
                문제가 발생했습니다
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '300px', lineHeight: 1.6 }}>
                일시적인 오류가 발생했습니다. 다시 시도해 주세요.
            </p>
            <button
                onClick={reset}
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                }}
            >
                다시 시도
            </button>
        </div>
    )
}
