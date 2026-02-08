import { createClient } from '@/lib/supabase/server'

interface AttendanceLog {
    check_in_time: string
    status: string
    // ... other fields
}

interface Rule {
    id: string
    type: string
    condition_json: any
    penalty_amount: number
}

export async function generateDailyFinesService(roomId: string, dateStr: string) {
    const supabase = await createClient()

    // 1. Fetch Room Rules
    const { data: rules } = await supabase
        .from('rules')
        .select('*')
        .eq('room_id', roomId)

    if (!rules || rules.length === 0) {
        return { success: false, message: '적용할 규칙이 없습니다.' }
    }

    // 2. Fetch All Participants
    const { data: participants } = await supabase
        .from('room_participants')
        .select('user_id')
        .eq('room_id', roomId)

    if (!participants) return { success: false, message: '참여자가 없습니다.' }

    // 3. Fetch Attendance Logs for the Date
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
        // Collect all logs for this user
        const userLogs = logs?.filter(l => l.user_id === p.user_id) || []

        // Calculate Total Duration
        // duration_seconds might be null if strictly typed, so handle default 0
        const dailyDuration = userLogs.reduce((acc, l) => acc + (l.duration_seconds || 0), 0)

        // Find the First Check-in Log (for Lateness check)
        const firstLog = userLogs.length > 0
            ? userLogs.sort((a, b) => new Date(a.check_in_time).getTime() - new Date(b.check_in_time).getTime())[0]
            : undefined

        for (const rule of rules) {
            const fineToCreate = await evaluateRule(rule, firstLog, p.user_id, startOfDay, endOfDay, dailyDuration)

            if (fineToCreate) {
                // Check Idempotency
                const { data: existingFine } = await supabase
                    .from('fines')
                    .select('id')
                    .eq('user_id', p.user_id)
                    .eq('rule_id', rule.id)
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
        }
    }

    return { success: true, finesCreated }
}

async function evaluateRule(rule: Rule, log: AttendanceLog | undefined, userId: string, startOfDay: string, endOfDay: string, dailyDuration: number = 0): Promise<boolean> {
    switch (rule.type) {
        case 'ATTENDANCE':
            return evaluateAttendanceRule(rule, log)
        case 'GOAL':
            return evaluateGoalRule(rule, dailyDuration)
        default:
            return false
    }
}

function evaluateGoalRule(rule: Rule, dailyDurationSeconds: number): boolean {
    const condition = rule.condition_json

    if (condition.subtype === 'DURATION') {
        // min_hours to seconds
        const minSeconds = (condition.min_hours || 0) * 3600

        // If duration is less than minimum, FINE!
        if (dailyDurationSeconds < minSeconds) {
            return true
        }
    }
    return false
}

function evaluateAttendanceRule(rule: Rule, log: AttendanceLog | undefined): boolean {
    const condition = rule.condition_json

    // Subtype: LATE
    if (condition.subtype === 'LATE') {
        if (!log) return false // No log means ABSENT (handled by separate rule usually)

        // Parse Check-in Time (UTC) and convert to KST
        // TODO: Use a robust timezone library (e.g. date-fns-tz) for production.
        const checkInDate = new Date(log.check_in_time)
        const kstCheckIn = new Date(checkInDate.getTime() + (9 * 60 * 60 * 1000))
        const checkInHours = kstCheckIn.getUTCHours()
        const checkInMinutes = kstCheckIn.getUTCMinutes()

        const [ruleHours, ruleMinutes] = condition.time.split(':').map(Number)
        const checkInTotal = checkInHours * 60 + checkInMinutes
        const ruleTotal = ruleHours * 60 + ruleMinutes

        if (checkInTotal > ruleTotal) {
            return true // Is Late
        }
    }

    return false
}
