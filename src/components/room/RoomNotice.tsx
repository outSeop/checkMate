'use client'

import { useState } from 'react'
import { updateRoomNotice } from '@/app/actions/room'
import { Edit2, Save, X, Loader2, Pin } from 'lucide-react'

interface RoomNoticeProps {
    roomId: string
    notice: string | null
    isOwner: boolean
}

export default function RoomNotice({ roomId, notice, isOwner }: RoomNoticeProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [content, setContent] = useState(notice || '')
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        const result = await updateRoomNotice(roomId, content)
        setLoading(false)

        if (result.success) {
            setIsEditing(false)
        } else {
            alert(result.message)
        }
    }

    if (isEditing) {
        return (
            <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                        <Pin size={18} />
                        공지사항 수정
                    </div>
                    <button
                        onClick={() => setIsEditing(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <X size={20} />
                    </button>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{
                        width: '100%',
                        minHeight: '150px',
                        padding: '1rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)',
                        lineHeight: '1.6',
                        resize: 'vertical'
                    }}
                    placeholder="공지사항을 입력하세요..."
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'var(--primary)',
                            color: 'var(--primary-foreground)',
                            borderRadius: 'var(--radius)',
                            border: 'none',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        저장
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            padding: '1.5rem',
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    <Pin size={18} className="text-indigo-500" />
                    공지사항
                </div>
                {isOwner && (
                    <button
                        onClick={() => {
                            setContent(notice || '')
                            setIsEditing(true)
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                            fontSize: '0.875rem', color: 'var(--muted-foreground)',
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '0.25rem 0.5rem', borderRadius: '4px'
                        }}
                    >
                        <Edit2 size={14} />
                        수정
                    </button>
                )}
            </div>

            <div style={{
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                color: notice ? 'var(--foreground)' : 'var(--muted-foreground)'
            }}>
                {notice || '아직 등록된 공지사항이 없습니다.'}
            </div>
        </div>
    )
}
