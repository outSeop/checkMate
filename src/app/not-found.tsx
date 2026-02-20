import Link from 'next/link'

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
        }}>
            <div style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                404
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem' }}>
                페이지를 찾을 수 없습니다
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                요청하신 페이지가 존재하지 않거나 이동되었습니다.
            </p>
            <Link href="/" style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500',
            }}>
                홈으로 돌아가기
            </Link>
        </div>
    )
}
