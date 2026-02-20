import { Calendar } from 'lucide-react'

export default function SchedulePage() {
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
                backgroundColor: 'var(--muted)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem',
                color: 'var(--muted-foreground)',
            }}>
                <Calendar size={32} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.5rem' }}>
                일정 기능 준비 중
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '300px' }}>
                스터디 일정을 한눈에 확인할 수 있는 기능을 준비하고 있습니다.
            </p>
        </div>
    )
}
