'use client'

import { useState } from 'react'
import { createManualFineAction } from '@/app/actions/fines'
import { PlusCircle, X, Loader2 } from 'lucide-react'

export default function ManualFineButton({ roomId }: { roomId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [amount, setAmount] = useState('')
    const [reason, setReason] = useState('')
    const [payImmediately, setPayImmediately] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || !reason) return

        setLoading(true)
        const result = await createManualFineAction(roomId, Number(amount), reason, payImmediately)
        setLoading(false)

        if (result.success) {
            setIsOpen(false)
            setAmount('')
            setReason('')
            setPayImmediately(false)
            // Ideally toast success
            alert('벌금이 추가되었습니다.')
        } else {
            alert(result.message)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.875rem',
                    color: 'var(--foreground)',
                    cursor: 'pointer'
                }}
            >
                <PlusCircle size={16} />
                벌금/후원 추가
            </button>

            {isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 50
                }}>
                    <div style={{
                        backgroundColor: 'var(--card)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius)',
                        width: '90%', maxWidth: '400px',
                        border: '1px solid var(--border)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontWeight: 'bold' }}>벌금 직접 추가</h3>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>금액 (원)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="예: 3000"
                                    required
                                    min="100"
                                    step="100"
                                    style={{
                                        width: '100%', padding: '0.75rem',
                                        borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                                        backgroundColor: 'var(--background)'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>사유 (메모)</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="예: 어제 지각해서 자진 납부"
                                    required
                                    style={{
                                        width: '100%', padding: '0.75rem',
                                        borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                                        backgroundColor: 'var(--background)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="payImmediately"
                                    checked={payImmediately}
                                    onChange={(e) => setPayImmediately(e.target.checked)}
                                    style={{ width: '1rem', height: '1rem' }}
                                />
                                <label htmlFor="payImmediately" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                                    바로 납부 완료 처리하기
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'var(--primary)',
                                    color: 'var(--primary-foreground)',
                                    borderRadius: 'var(--radius)',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                {loading && <Loader2 className="animate-spin" size={16} />}
                                추가하기
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
