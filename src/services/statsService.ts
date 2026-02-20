import { createClient } from '@/lib/supabase/server'
import { formatInTimeZone } from 'date-fns-tz'
import { subDays } from 'date-fns'
import { DEFAULT_TIMEZONE } from '@/lib/dateUtils'

export interface PersonalStats {
    totalStudySeconds: number
    totalSessions: number
    totalFines: number
    pendingFineAmount: number
}

export interface DailyStudy {
    date: string       // YYYY-MM-DD
    label: string      // 요일 (월, 화, ...)
    seconds: number
}

export interface MemberRanking {
    user_id: string
    username: string | null
    profile_image_url: string | null
    totalSeconds: number
    currentStreak: number
}

export async function getPersonalStats(userId: string, roomId: string): Promise<PersonalStats> {
    const supabase = await createClient()

    const [{ data: logs }, { data: fines }] = await Promise.all([
        supabase.from('attendance_logs').select('duration_seconds').eq('room_id', roomId).eq('user_id', userId).not('duration_seconds', 'is', null),
        supabase.from('fines').select('amount, status').eq('room_id', roomId).eq('user_id', userId),
    ])

    const totalStudySeconds = logs?.reduce((sum, l) => sum + (l.duration_seconds || 0), 0) || 0
    const totalSessions = logs?.length || 0
    const totalFines = fines?.reduce((sum, f) => sum + f.amount, 0) || 0
    const pendingFineAmount = fines?.filter(f => f.status === 'PENDING').reduce((sum, f) => sum + f.amount, 0) || 0

    return { totalStudySeconds, totalSessions, totalFines, pendingFineAmount }
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export async function getWeeklyStudy(userId: string, roomId: string): Promise<DailyStudy[]> {
    const supabase = await createClient()
    const now = new Date()

    const result: DailyStudy[] = []
    for (let i = 6; i >= 0; i--) {
        const day = subDays(now, i)
        const dateStr = formatInTimeZone(day, DEFAULT_TIMEZONE, 'yyyy-MM-dd')
        const dayOfWeek = Number(formatInTimeZone(day, DEFAULT_TIMEZONE, 'i')) % 7 // 0=Sun
        result.push({ date: dateStr, label: DAY_LABELS[dayOfWeek], seconds: 0 })
    }

    const startDate = result[0].date
    const endDate = result[result.length - 1].date

    const { data: logs } = await supabase
        .from('attendance_logs')
        .select('check_in_time, duration_seconds')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .gte('check_in_time', `${startDate}T00:00:00`)
        .lt('check_in_time', `${endDate}T23:59:59`)
        .not('duration_seconds', 'is', null)

    for (const log of logs || []) {
        const logDate = formatInTimeZone(new Date(log.check_in_time), DEFAULT_TIMEZONE, 'yyyy-MM-dd')
        const entry = result.find(r => r.date === logDate)
        if (entry) {
            entry.seconds += log.duration_seconds || 0
        }
    }

    return result
}

export async function getMemberRankings(roomId: string): Promise<MemberRanking[]> {
    const supabase = await createClient()

    const [{ data: participants }, { data: logs }, { data: streaks }] = await Promise.all([
        supabase.from('room_participants').select('user_id, users(username, profile_image_url)').eq('room_id', roomId),
        supabase.from('attendance_logs').select('user_id, duration_seconds').eq('room_id', roomId).not('duration_seconds', 'is', null),
        supabase.from('user_streaks').select('user_id, current_streak').eq('room_id', roomId),
    ])

    const durationMap = new Map<string, number>()
    for (const log of logs || []) {
        durationMap.set(log.user_id, (durationMap.get(log.user_id) || 0) + (log.duration_seconds || 0))
    }
    const streakMap = new Map((streaks || []).map(s => [s.user_id, s.current_streak || 0]))

    const rankings: MemberRanking[] = (participants || []).map((p: any) => ({
        user_id: p.user_id,
        username: p.users?.username || null,
        profile_image_url: p.users?.profile_image_url || null,
        totalSeconds: durationMap.get(p.user_id) || 0,
        currentStreak: streakMap.get(p.user_id) || 0,
    }))

    rankings.sort((a, b) => b.totalSeconds - a.totalSeconds)
    return rankings
}
