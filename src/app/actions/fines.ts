'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Generate fines for a specific date based on room rules.
 * Intended to be called manually by the owner or via cron.
 */
export async function generateDailyFines(roomId: string, dateStr: string) {
    const supabase = await createClient()

    // 1. Fetch Room Rules
    const { data: rules } = await supabase
        .from('rules')
        .select('*')
        .eq('room_id', roomId)

    if (!rules || rules.length === 0) {
        return { message: '적용할 규칙이 없습니다.' }
    }

    // 2. Fetch All Participants
    const { data: participants } = await supabase
        .from('room_participants')
        .select('user_id')
        .eq('room_id', roomId)

    if (!participants) return { message: '참여자가 없습니다.' }

    // 3. Fetch Attendance Logs for the Date
    // Date range: dateStr 00:00:00 to 23:59:59 (UTC? We need to be careful with Timezones)
    // IMPORTANT: The app currently uses ISO strings. Let's assume dateStr is YYYY-MM-DD.
    // For simplicity V1, we just check if there is a log starting on that day (in UTC/Server time).
    const startOfDay = new Date(dateStr).toISOString()
    const endOfDay = new Date(new Date(dateStr).getTime() + 86400000).toISOString()

    const { data: logs } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('room_id', roomId)
        .gte('check_in_time', startOfDay)
        .lt('check_in_time', endOfDay)

    const logsMap = new Map(logs?.map(l => [l.user_id, l]) || [])

    let finesCreated = 0

    // 4. Iterate and Apply Rules
    for (const p of participants) {
        const log = logsMap.get(p.user_id)

        for (const rule of rules) {
            // Rule: ATTENDANCE (LATE)
            if (rule.type === 'ATTENDANCE') {
                const condition = rule.condition_json as any // { subtype: 'LATE', time: 'HH:mm', threshold: number }

                if (condition.subtype === 'LATE') {
                    // Start Time (Assume UTC for simpler comparison or handle KST)
                    // Let's assume the rule time is local HH:mm, and log time is ISO UTC.
                    // This creates a timezone headache.
                    // FIX: Let's rely on the client/admin passing the timezone offset or force KST.
                    // For MVP: Compare HH:mm parts.

                    if (log) {
                        // Parse Check-in Time (UTC) and convert to KST
                        // TODO: Use a robust timezone library (e.g. date-fns-tz) for production.
                        // For now, we manually add 9 hours to the UTC timestamp to simulate KST.
                        const checkInDate = new Date(log.check_in_time)
                        const kstCheckIn = new Date(checkInDate.getTime() + (9 * 60 * 60 * 1000))
                        const checkInHours = kstCheckIn.getUTCHours()
                        const checkInMinutes = kstCheckIn.getUTCMinutes()

                        const [ruleHours, ruleMinutes] = condition.time.split(':').map(Number)

                        const checkInTotal = checkInHours * 60 + checkInMinutes
                        const ruleTotal = ruleHours * 60 + ruleMinutes

                        // Threshold: e.g. 1 minute grace period?
                        // Currently strict comparison.
                        if (checkInTotal > ruleTotal) {
                            // Check for existing fine to prevent duplicates (Idempotency)
                            const { data: existingFine } = await supabase
                                .from('fines')
                                .select('id')
                                .eq('user_id', p.user_id)
                                .eq('rule_id', rule.id)
                                // Check if created today? Or check if fine is for this specific date?
                                // Ideally 'fines' should have a 'target_date' column.
                                // For MVP, we check if a fine was created *today* for this rule.
                                .gte('created_at', startOfDay)
                                .lt('created_at', endOfDay)
                                .maybeSingle()

                            if (!existingFine) {
                                await supabase.from('fines').insert({
                                    room_id: roomId,
                                    user_id: p.user_id,
                                    rule_id: rule.id,
                                    amount: rule.penalty_amount,
                                    status: 'PENDING',
                                    created_at: new Date().toISOString()
                                })
                                finesCreated++
                            }
                        }
                    } else {
                        // ABSENT handling (Future implementation)
                    }
                }
            }
        }
    }

    revalidatePath(`/room/${roomId}`)
    return { success: true, finesCreated }
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
