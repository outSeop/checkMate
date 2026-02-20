'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { updateStreak } from '@/services/streakService'

export async function startSession(roomId: string, message: string = '') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' }
    }

    // Insert new log with status 'PRESENT'
    const { data, error } = await supabase
        .from('attendance_logs')
        .insert({
            room_id: roomId,
            user_id: user.id,
            status: 'PRESENT',
            message: message,
            check_in_time: new Date().toISOString(),
            study_type: 'STOPWATCH' // Default
        })
        .select()
        .single()

    if (error) {
        console.error('Start Session Error:', error)
        return { success: false, message: '공부 시작 처리에 실패했습니다.' }
    }

    revalidatePath(`/room/${roomId}`)
    return { success: true, sessionId: data.id }
}

export async function endSession(sessionId: string, durationSeconds: number, roomId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('attendance_logs')
        .update({
            check_out_time: new Date().toISOString(),
            duration_seconds: durationSeconds
        })
        .eq('id', sessionId)

    if (error) {
        console.error('End Session Error:', error)
        return { success: false, message: '종료 처리에 실패했습니다.' }
    }

    // 스트릭 업데이트 (fire & forget)
    if (user) {
        updateStreak(user.id, roomId).catch(err =>
            console.error('[Streak] Update failed:', err)
        )
    }

    revalidatePath(`/room/${roomId}`)
    return { success: true }
}
