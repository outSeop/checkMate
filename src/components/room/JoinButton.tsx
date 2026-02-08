'use client'

import { useState, useTransition } from 'react'
import { joinRoom } from '@/app/actions/room'

export default function JoinButton({ roomId }: { roomId: string }) {
    const [isPending, startTransition] = useTransition()

    const handleJoin = () => {
        if (confirm('이 스터디에 참여하시겠습니까?')) {
            startTransition(async () => {
                const res = await joinRoom(roomId)
                if (res.message) {
                    alert(res.message)
                } else {
                    // Success is handled by revalidatePath -> UI update
                    // But we can show a welcome message
                    // alert('참여 완료! 환영합니다.') 
                }
            })
        }
    }

    return (
        <button
            onClick={handleJoin}
            disabled={isPending}
            style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontWeight: '600',
                opacity: isPending ? 0.7 : 1,
                cursor: isPending ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
            }}
        >
            {isPending ? '참여 처리 중...' : '스터디 참여하기'}
        </button>
    )
}
