'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sanitizeText, MAX_REASON_LENGTH } from '@/lib/validation'

export async function requestVacation(roomId: string, startDate: string, endDate: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' }
    }

    if (!startDate || !endDate || !reason) {
        return { success: false, message: '모든 필드를 입력해주세요.' }
    }

    if (new Date(startDate) > new Date(endDate)) {
        return { success: false, message: '시작일은 종료일보다 빨라야 합니다.' }
    }

    const sanitizedReason = sanitizeText(reason).slice(0, MAX_REASON_LENGTH)
    if (!sanitizedReason) return { success: false, message: '사유를 입력해주세요.' }

    const { error } = await supabase.from('vacations').insert({
        room_id: roomId,
        user_id: user.id,
        start_date: startDate,
        end_date: endDate,
        reason: sanitizedReason,
        status: 'APPROVED' // Auto-approve for now based on plan
    })

    if (error) {
        console.error('Request Vacation Error:', error)
        return { success: false, message: '휴가 신청 중 오류가 발생했습니다.' }
    }

    revalidatePath(`/room/${roomId}`)
    return { success: true }
}

export async function getRoomVacations(roomId: string) {
    const supabase = await createClient()

    const { data: vacations, error } = await supabase
        .from('vacations')
        .select(`
            *,
            users (
                username,
                profile_image_url
            )
        `)
        .eq('room_id', roomId)
        .order('start_date', { ascending: true })

    if (error) {
        console.error('Get Vacations Error:', error)
        return []
    }

    return vacations
}

export async function cancelVacation(vacationId: string, roomId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: 'Unauthorized' }

    const { error } = await supabase
        .from('vacations')
        .delete()
        .eq('id', vacationId)
        .eq('user_id', user.id) // Security check in addition to RLS

    if (error) {
        return { success: false, message: '취소 실패' }
    }

    revalidatePath(`/room/${roomId}`)
    return { success: true }
}
