'use server'

import { revalidatePath } from 'next/cache'
import { generateDailyFinesService, markFineAsPaid, confirmFinePayment } from '@/services/fineService'
import { createClient } from '@/lib/supabase/server'
import { validateFineAmount, sanitizeText, MAX_REASON_LENGTH } from '@/lib/validation'

async function verifyRoomAdmin(roomId: string): Promise<{ userId: string } | { error: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다.' }

    const { data: participant } = await supabase
        .from('room_participants')
        .select('role')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single()

    if (!participant || (participant.role !== 'OWNER' && participant.role !== 'ADMIN')) {
        return { error: '관리자 권한이 필요합니다.' }
    }
    return { userId: user.id }
}

/**
 * Mark a fine as PAID (User action)
 */
export async function markAsPaidAction(fineId: string, roomId: string) {
    const result = await markFineAsPaid(fineId)
    if (result.success) {
        revalidatePath(`/room/${roomId}`)
        return { success: true }
    }
    return { success: false, message: result.message || 'Failed to mark as paid' }
}

/**
 * Confirm a fine payment (Owner action)
 */
export async function confirmPaymentAction(fineId: string, roomId: string) {
    const auth = await verifyRoomAdmin(roomId)
    if ('error' in auth) return { success: false, message: auth.error }

    const result = await confirmFinePayment(fineId)
    if (result.success) {
        revalidatePath(`/room/${roomId}`)
        return { success: true }
    }
    return { success: false, message: result.message || 'Failed to confirm payment' }
}

/**
 * Generate fines for a specific date based on room rules.
 * Intended to be called manually by the owner or via cron.
 */
export async function generateDailyFines(roomId: string, dateStr: string) {
    const auth = await verifyRoomAdmin(roomId)
    if ('error' in auth) return { success: false, message: auth.error }

    const result = await generateDailyFinesService(roomId, dateStr)

    if (result.success) {
        revalidatePath(`/room/${roomId}`)
        return { success: true, finesCreated: result.finesCreated }
    }

    return { success: false, message: result.message || 'Error generating fines' }
}

/**
 * Generate Weekly Fines
 */
export async function generateWeeklyFinesAction(roomId: string, dateStr: string) {
    const auth = await verifyRoomAdmin(roomId)
    if ('error' in auth) return { success: false, message: auth.error }

    const { generateWeeklyFinesService } = await import('@/services/fineService')
    const result = await generateWeeklyFinesService(roomId, dateStr)

    if (result.success) {
        revalidatePath(`/room/${roomId}`)
        return { success: true, finesCreated: result.finesCreated }
    } else {
        return { success: false, message: result.message || 'Error generating weekly fines' }
    }
}

/**
 * DEV ONLY: Seed Test Data
 */
export async function seedFineTestData(roomId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Create a LATE Rule (09:00 AM)
    const { data: rule } = await supabase.from('rules').insert({
        room_id: roomId,
        type: 'ATTENDANCE',
        condition_json: { subtype: 'LATE', time: '09:00' },
        penalty_amount: 1000,
        description: '지각 (9시 이후)'
    }).select().single()

    // 2. Create a LATE Log (Yesterday 09:30)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 30, 0, 0) // 09:30 KST is 00:30 UTC

    await supabase.from('attendance_logs').insert({
        room_id: roomId,
        user_id: user.id,
        status: 'LATE', // Manually setting
        check_in_time: yesterday.toISOString(),
        study_type: 'STOPWATCH'
    })

    return { success: true, message: 'Test data seeded (Rule + Late Log)' }
}

/**
 * Create a Manual Fine (Voluntary or Admin)
 */
export async function createManualFineAction(roomId: string, amount: number, reason: string, immediatelyPaid: boolean = false) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' }
    }

    const amountError = validateFineAmount(amount)
    if (amountError) return { success: false, message: amountError }

    const sanitizedReason = sanitizeText(reason).slice(0, MAX_REASON_LENGTH)
    if (!sanitizedReason) return { success: false, message: '사유를 입력해주세요.' }

    const { error } = await supabase.from('fines').insert({
        room_id: roomId,
        user_id: user.id,
        rule_id: null, // Manual fine
        amount: amount,
        reason: sanitizedReason,
        status: immediatelyPaid ? 'PAID' : 'PENDING',
        created_at: new Date().toISOString()
    })

    if (error) {
        console.error('Create Manual Fine Error:', error)
        return { success: false, message: '벌금 생성 중 오류가 발생했습니다.' }
    }

    revalidatePath(`/room/${roomId}`)
    return { success: true }
}

/**
 * Confirm ALL pending payments in a room (Owner action)
 */
export async function confirmAllPaymentsAction(roomId: string) {
    const auth = await verifyRoomAdmin(roomId)
    if ('error' in auth) return { success: false, message: auth.error }

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('fines')
        .update({ status: 'CONFIRMED' })
        .eq('room_id', roomId)
        .eq('status', 'PAID') // Only confirm those marked as PAID
        .select()

    if (error) {
        console.error('Confirm All Error:', error)
        return { success: false, message: '일괄 승인 중 오류가 발생했습니다.' }
    }

    const count = data ? data.length : 0
    revalidatePath(`/room/${roomId}`)
    return { success: true, count }
}
