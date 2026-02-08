'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--background)'
        }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--destructive)' }}>
                로그인 오류
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--foreground)' }}>
                로그인 중 문제가 발생했습니다.
            </p>

            <div style={{
                backgroundColor: 'var(--card)',
                padding: '1.5rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                marginBottom: '2rem',
                maxWidth: '500px',
                width: '100%',
                overflowWrap: 'anywhere'
            }}>
                <p><strong>Error:</strong> {error}</p>
                {errorCode && <p><strong>Code:</strong> {errorCode}</p>}
                <p><strong>Description:</strong> {errorDescription}</p>
            </div>

            <Link href="/login" style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                fontWeight: '600'
            }}>
                로그인 페이지로 돌아가기
            </Link>
        </div>
    )
}

export default function AuthCodeErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    )
}
