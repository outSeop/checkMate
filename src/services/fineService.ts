import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/app/actions/notifications'
import { getHoursMinutesInTimezone } from '@/lib/dateUtils'
import type { AttendanceLog, Rule, RuleConditionJson } from '@/types/database'

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

    // 3.5 Fetch Approved Vacations
    const { data: vacations } = await supabase
        .from('vacations')
        .select('*')
        .eq('room_id', roomId)
        .eq('status', 'APPROVED')
        .lte('start_date', dateStr)
        .gte('end_date', dateStr)

    const vacationUserIds = new Set(vacations?.map(v => v.user_id) || [])

    let finesCreated = 0

    // 4. Batch fetch existing fines for idempotency check (avoids N+1 queries)
    const { data: existingFines } = await supabase
        .from('fines')
        .select('user_id, rule_id')
        .eq('room_id', roomId)
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay)

    const existingFineKeys = new Set(
        (existingFines || []).map(f => `${f.user_id}:${f.rule_id}`)
    )

    // 5. Iterate and Apply Rules
    for (const p of participants) {
        if (vacationUserIds.has(p.user_id)) {
            continue
        }

        const userLogs = logs?.filter(l => l.user_id === p.user_id) || []
        const dailyDuration = userLogs.reduce((acc, l) => acc + (l.duration_seconds || 0), 0)

        const firstLog = userLogs.length > 0
            ? userLogs.sort((a, b) => new Date(a.check_in_time).getTime() - new Date(b.check_in_time).getTime())[0]
            : undefined

        for (const rule of rules) {
            const fineToCreate = await evaluateRule(rule, firstLog, p.user_id, startOfDay, endOfDay, dailyDuration)

            if (fineToCreate) {
                if (!existingFineKeys.has(`${p.user_id}:${rule.id}`)) {
                    await supabase.from('fines').insert({
                        room_id: roomId,
                        user_id: p.user_id,
                        rule_id: rule.id,
                        amount: rule.penalty_amount,
                        status: 'PENDING',
                        created_at: new Date().toISOString()
                    })
                    finesCreated++

                    // Notification Logic
                    const ruleName = rule.type === 'ATTENDANCE' ? '출석' : '목표'
                    await createNotification({
                        userId: p.user_id,
                        roomId: roomId,
                        type: 'FINE',
                        title: '벌금 발생 💸',
                        message: `[${ruleName}] 규칙 위반으로 ${rule.penalty_amount.toLocaleString()}원의 벌금이 생성되었습니다.`,
                        link: `/room/${roomId}?tab=fines`
                    })
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
        const checkInDate = new Date(log.check_in_time)
        const { hours: checkInHours, minutes: checkInMinutes } = getHoursMinutesInTimezone(checkInDate)

        if (!condition.time) return false
        const [ruleHours, ruleMinutes] = condition.time.split(':').map(Number)
        const checkInTotal = checkInHours * 60 + checkInMinutes
        const ruleTotal = ruleHours * 60 + ruleMinutes

        if (checkInTotal > ruleTotal) {
            return true // Is Late
        }
    }

    return false
}

export async function generateWeeklyFinesService(roomId: string, endDateStr: string) {
    const supabase = await createClient()

    // 1. Fetch Room Rules (Only WEEKLY type)
    const { data: rules } = await supabase
        .from('rules')
        .select('*')
        .eq('room_id', roomId)

    const weeklyRules = rules?.filter(r => r.condition_json?.subtype === 'WEEKLY') || []

    if (weeklyRules.length === 0) {
        return { success: false, message: '주간 규칙이 없습니다.' }
    }

    // 2. Fetch Participants
    const { data: participants } = await supabase
        .from('room_participants')
        .select('user_id')
        .eq('room_id', roomId)

    if (!participants) return { success: false, message: '참여자가 없습니다.' }

    // 3. Define Week Range (EndDate is inclusive, usually Sunday)
    const end = new Date(endDateStr)
    end.setHours(23, 59, 59, 999)
    const start = new Date(end)
    start.setDate(start.getDate() - 6) // Go back 6 days (total 7 days)
    start.setHours(0, 0, 0, 0)

    const startIso = start.toISOString()
    const endIso = end.toISOString()

    // 4. Fetch Logs for the Week
    const { data: logs } = await supabase
        .from('attendance_logs')
        .select('user_id, check_in_time, duration_seconds')
        .eq('room_id', roomId)
        .gte('check_in_time', startIso)
        .lt('check_in_time', endIso)

    // 4.5 Fetch Approved Vacations overlapping this week
    const { data: vacations } = await supabase
        .from('vacations')
        .select('*')
        .eq('room_id', roomId)
        .eq('status', 'APPROVED')
        .or(`start_date.lte.${endDateStr},end_date.gte.${start.toISOString().split('T')[0]}`)
    // Logic: Vacation Start <= Week End AND Vacation End >= Week Start

    // Helper to check if a specific date is a vacation day for a user
    const isVacationDay = (userId: string, dateStr: string) => {
        return vacations?.some(v =>
            v.user_id === userId &&
            v.start_date <= dateStr &&
            v.end_date >= dateStr
        ) || false
    }

    let finesCreated = 0

    // 5. Batch fetch existing weekly fines for idempotency (avoids N+1 queries)
    const todayStr = new Date().toISOString().split('T')[0]
    const { data: existingWeeklyFines } = await supabase
        .from('fines')
        .select('user_id, rule_id')
        .eq('room_id', roomId)
        .gte('created_at', todayStr)

    const existingWeeklyFineKeys = new Set(
        (existingWeeklyFines || []).map(f => `${f.user_id}:${f.rule_id}`)
    )

    // 6. Evaluate Rules
    for (const p of participants) {
        const userLogs = logs?.filter(l => l.user_id === p.user_id) || []

        const attendedDaysSet = new Set(userLogs.map(l => new Date(l.check_in_time).toISOString().split('T')[0]))
        let attendedCount = attendedDaysSet.size

        for (let i = 0; i < 7; i++) {
            const d = new Date(start)
            d.setDate(d.getDate() + i)
            const dStr = d.toISOString().split('T')[0]

            if (!attendedDaysSet.has(dStr) && isVacationDay(p.user_id, dStr)) {
                attendedCount++
            }
        }

        for (const rule of weeklyRules) {
            const requiredCount = rule.condition_json.count || 3

            if (attendedCount < requiredCount) {
                const missedDays = requiredCount - attendedCount
                const totalFineAmount = missedDays * rule.penalty_amount

                if (!existingWeeklyFineKeys.has(`${p.user_id}:${rule.id}`)) {
                    await supabase.from('fines').insert({
                        room_id: roomId,
                        user_id: p.user_id,
                        rule_id: rule.id,
                        amount: totalFineAmount,
                        status: 'PENDING',
                        created_at: new Date().toISOString()
                    })
                    finesCreated++

                    // Notification Logic (Weekly)
                    await createNotification({
                        userId: p.user_id,
                        roomId: roomId,
                        type: 'FINE',
                        title: '주간 벌금 발생 🗓️',
                        message: `주간 목표 미달성으로 ${totalFineAmount.toLocaleString()}원의 벌금이 생성되었습니다.`,
                        link: `/room/${roomId}?tab=fines`
                    })
                }
            }
        }
    }

    return { success: true, finesCreated }
}


export async function markFineAsPaid(fineId: string) {
    const supabase = await createClient()

    // 1. Mark as Paid
    const { data: fine, error } = await supabase
        .from('fines')
        .update({ status: 'PAID' })
        .eq('id', fineId)
        .select('*, users(username), rooms(owner_id)') // Fetch Username and Owner ID
        .single()

    if (error) {
        console.error('Error marking fine as paid:', error)
        return { success: false, message: error.message }
    }

    // 2. Notify Owner
    if (fine && fine.rooms?.owner_id) {
        // Don't notify if owner paid their own fine (rare but possible)
        if (fine.user_id !== fine.rooms.owner_id) {
            await createNotification({
                userId: fine.rooms.owner_id,
                roomId: fine.room_id,
                type: 'PAYMENT',
                title: '벌금 납부 알림 💰',
                message: `${fine.users?.username || '멤버'}님이 벌금을 입금했습니다. 확인해주세요.`,
                link: `/room/${fine.room_id}?tab=fines`
            })
        }
    }

    return { success: true, data: fine }
}

export async function confirmFinePayment(fineId: string) {
    const supabase = await createClient()

    // 1. Confirm Payment
    const { data: fine, error } = await supabase
        .from('fines')
        .update({ status: 'CONFIRMED' })
        .eq('id', fineId)
        .select('*, users(username)')
        .single()

    if (error) {
        console.error('Error confirming fine:', error)
        return { success: false, message: error.message }
    }

    // 2. Notify Payer
    if (fine) {
        await createNotification({
            userId: fine.user_id,
            roomId: fine.room_id,
            type: 'SYSTEM',
            title: '납부 확인 완료 ✅',
            message: `벌금 납부가 정상적으로 승인되었습니다.`,
            link: `/room/${fine.room_id}?tab=fines`
        })
    }

    return { success: true, data: fine }
}


/**
 * Check if the room needs weekly settlement and run it if necessary.
 * This should be called when visiting the room page.
 */
// 인메모리 캐시: 같은 방에 대해 30분 내 중복 체크 방지
const settlementCheckCache = new Map<string, number>()
const SETTLEMENT_CACHE_TTL = 30 * 60 * 1000 // 30분

export async function checkAndRunWeeklySettlement(roomId: string) {
    const now = Date.now()
    const lastCheck = settlementCheckCache.get(roomId)
    if (lastCheck && now - lastCheck < SETTLEMENT_CACHE_TTL) {
        return // 캐시 유효 → DB 조회 스킵
    }
    settlementCheckCache.set(roomId, now)

    const supabase = await createClient()

    // 1. Fetch Room Settings
    const { data: room } = await supabase
        .from('rooms')
        .select('last_settlement_date, settlement_day')
        .eq('id', roomId)
        .single()

    if (!room) return

    const today = new Date()
    const settlementDay = room.settlement_day ?? 1 // Default Monday (1)

    // If today is the settlement day (or after), check if we ran it already
    const currentDay = today.getDay()
    const diff = currentDay - settlementDay

    // Target: Most recent Settlement Day (could be today or in the past week)
    const targetDate = new Date(today)
    if (diff < 0) {
        // We are before the day in this week. So target is LAST week's settlement day.
        targetDate.setDate(today.getDate() - (7 + diff))
    } else {
        // We are on or after the day. Target is THIS week's settlement day.
        targetDate.setDate(today.getDate() - diff)
    }
    targetDate.setHours(0, 0, 0, 0)
    targetDate.setMilliseconds(0)

    // Check last run
    const lastRun = room.last_settlement_date ? new Date(room.last_settlement_date) : null

    // If never run, run it if targetDate is reasonably recent
    if (!lastRun || lastRun < targetDate) {
        console.log(`[Automation] Running Weekly Settlement for Room ${roomId}. Target: ${targetDate.toISOString()}`)

        // Settlement Period: The 7 days ENDING yesterday (if settlement day is today).
        // Standard: "Weekly" usually means "Previous Week".
        // If Settlement Day is Monday, we settle Mon-Sun of last week.
        // So end date is Yesterday (Sunday).

        const settlementEndDate = new Date(targetDate)
        settlementEndDate.setDate(settlementEndDate.getDate() - 1)
        const dateStr = settlementEndDate.toISOString().split('T')[0]

        // 1. Run Daily Fines for each day of the past week (7 days)
        // From (Date - 6) to Date
        let totalDailyFines = 0
        const currentCheckDate = new Date(settlementEndDate)
        currentCheckDate.setDate(currentCheckDate.getDate() - 6) // Start Date

        for (let i = 0; i < 7; i++) {
            const checkDateStr = currentCheckDate.toISOString().split('T')[0]
            // Skip check if date is in future
            if (checkDateStr <= new Date().toISOString().split('T')[0]) {
                const dailyRes = await generateDailyFinesService(roomId, checkDateStr)
                if (dailyRes.finesCreated) totalDailyFines += dailyRes.finesCreated
            }
            currentCheckDate.setDate(currentCheckDate.getDate() + 1)
        }

        // 2. Run Weekly Fines
        const result = await generateWeeklyFinesService(roomId, dateStr)

        if (result.success) {
            await supabase
                .from('rooms')
                .update({ last_settlement_date: new Date().toISOString() })
                .eq('id', roomId)

            console.log(`[Automation] Success. Daily Fines: ${totalDailyFines}, Weekly Fines: ${result.finesCreated}`)
        } else {
            console.error(`[Automation] Failed: ${result.message}`)
        }
    }
}
