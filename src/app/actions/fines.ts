'use server'

import { revalidatePath } from 'next/cache'
import { generateDailyFinesService } from '@/services/fineService'
import { createClient } from '@/lib/supabase/server'

/**
 * Generate fines for a specific date based on room rules.
 * Intended to be called manually by the owner or via cron.
 */
export async function generateDailyFines(roomId: string, dateStr: string) {
    const result = await generateDailyFinesService(roomId, dateStr)

    if (result.success) {
        revalidatePath(`/room/${roomId}`)
        return { success: true, finesCreated: result.finesCreated }
    } else {
        return { message: result.message || 'Error generating fines' }
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
