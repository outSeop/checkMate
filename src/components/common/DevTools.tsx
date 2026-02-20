'use client'

import { useState } from 'react'
import { resetAndSeedData } from '@/app/actions/debug'
import { Trash2, Database, Loader2 } from 'lucide-react'

export default function DevTools() {
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    if (process.env.NODE_ENV !== 'development') return null

    const handleReset = async () => {
        if (!confirm('경고: 현재 사용자의 모든 방 데이터가 삭제되고 초기화됩니다.\n정말 진행하시겠습니까?')) return

        setLoading(true)
        const result = await resetAndSeedData()
        setLoading(false)

        if (result.success) {
            alert('데이터가 성공적으로 초기화되었습니다.')
            window.location.reload()
        } else {
            alert(result.message)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed', bottom: '1rem', right: '1rem',
                    padding: '0.5rem',
                    backgroundColor: 'var(--muted)',
                    borderRadius: '50%',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    opacity: 0.5,
                    transition: 'opacity 0.2s',
                    zIndex: 9999
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                title="Dev Tools"
            >
                <Database size={20} />
            </button>
        )
    }

    return (
        <div style={{
            position: 'fixed', bottom: '1rem', right: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            minWidth: '200px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>🛠️ Dev Tools</span>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    ✕
                </button>
            </div>

            <button
                onClick={handleReset}
                disabled={loading}
                style={{
                    padding: '0.5rem',
                    backgroundColor: 'var(--destructive)',
                    color: 'var(--destructive-foreground)',
                    borderRadius: 'var(--radius)',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                데이터 초기화 & 시드 생성
            </button>
        </div>
    )
}
