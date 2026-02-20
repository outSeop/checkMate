import { createClient } from '@/lib/supabase/server'
import { getTodayDateString, getYesterdayDateString } from '@/lib/dateUtils'
import { awardPoints } from '@/app/actions/points'
import type { UserStreak } from '@/types/database'

const STREAK_MILESTONES: Record<number, number> = {
    7: 100,
    14: 250,
    30: 500,
    60: 1000,
    100: 2000,
}

/**
 * 세션 종료 시 스트릭을 업데이트한다.
 * - 어제가 마지막 활동일이면 streak+1
 * - 오늘이면 무시
 * - 그 외 리셋 → 1
 */
export async function updateStreak(userId: string, roomId: string): Promise<void> {
    const supabase = await createClient()
    const today = getTodayDateString()
    const yesterday = getYesterdayDateString()

    // 현재 스트릭 조회
    const { data: existing } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('room_id', roomId)
        .single()

    if (!existing) {
        // 첫 활동 → 스트릭 1로 생성
        await supabase.from('user_streaks').insert({
            user_id: userId,
            room_id: roomId,
            current_streak: 1,
            max_streak: 1,
            last_activity_date: today,
        })
        return
    }

    const lastDate = existing.last_activity_date

    // 오늘 이미 기록됨 → 무시
    if (lastDate === today) return

    let newStreak: number
    if (lastDate === yesterday) {
        // 어제가 마지막 → 연속
        newStreak = existing.current_streak + 1
    } else {
        // 연속 끊김 → 리셋
        newStreak = 1
    }

    const newMax = Math.max(existing.max_streak, newStreak)

    await supabase
        .from('user_streaks')
        .update({
            current_streak: newStreak,
            max_streak: newMax,
            last_activity_date: today,
        })
        .eq('user_id', userId)
        .eq('room_id', roomId)

    // 마일스톤 도달 시 포인트 지급
    if (STREAK_MILESTONES[newStreak]) {
        await awardPoints(userId, STREAK_MILESTONES[newStreak], `${newStreak}일 연속 출석 달성`)
    }
}

export async function getStreaksForRoom(roomId: string): Promise<UserStreak[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('room_id', roomId)

    return data || []
}
