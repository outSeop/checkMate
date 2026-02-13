'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function resetAndSeedData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { message: '로그인이 필요합니다.' }
    }

    try {
        // 1. Delete all rooms owned by the user
        // Cascading delete should handle participants, rules, fines, logs
        const { error: deleteError } = await supabase
            .from('rooms')
            .delete()
            .eq('owner_id', user.id)

        if (deleteError) throw deleteError

        // 2. Create Demo Room
        const { data: room, error: roomError } = await supabase
            .from('rooms')
            .insert({
                name: '🔥 빡코딩 스터디 1기 (Demo)',
                description: '매일 2시간 공부하고 인증하는 스터디입니다. 지각하면 벌금!',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
                is_public: true,
                owner_id: user.id,
                invite_code: 'DEMO01'
            })
            .select()
            .single()

        if (roomError) throw roomError

        // 3. Add Owner as Participant
        await supabase.from('room_participants').insert({
            room_id: room.id,
            user_id: user.id,
            role: 'OWNER'
        })

        // 4. Add Rules
        const rules = [
            {
                room_id: room.id,
                type: 'ATTENDANCE',
                description: '매일 2시간 이상 공부',
                condition_json: { subtype: 'DURATION', min_hours: 2 },
                penalty_amount: 3000
            },
            {
                room_id: room.id,
                type: 'GOAL',
                description: '주 5회 출석 목표',
                condition_json: { subtype: 'WEEKLY', count: 5, min_hours: 2 },
                penalty_amount: 5000
            }
        ]
        await supabase.from('rules').insert(rules)

        // 5. Generate Mock Attendance Logs (Past 7 Days)
        const logs = []
        const now = new Date()

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]

            // Randomize status
            // 0: Success (3h), 1: Short (1h), 2: Absent (No log)
            const scenario = i % 3

            if (scenario === 0) {
                // Success
                logs.push({
                    room_id: room.id,
                    user_id: user.id,
                    check_in_time: `${dateStr}T09:00:00Z`,
                    check_out_time: `${dateStr}T12:00:00Z`, // 3h
                    duration_seconds: 3 * 3600,
                    status: 'PRESENT'
                })
            } else if (scenario === 1) {
                // Short (Fail)
                logs.push({
                    room_id: room.id,
                    user_id: user.id,
                    check_in_time: `${dateStr}T10:00:00Z`,
                    check_out_time: `${dateStr}T11:00:00Z`, // 1h
                    duration_seconds: 1 * 3600,
                    status: 'PRESENT' // But duration failed
                })

                // Create Fine for rule 1
                await supabase.from('fines').insert({
                    room_id: room.id,
                    user_id: user.id,
                    amount: 3000,
                    status: 'PENDING',
                    created_at: `${dateStr}T23:59:59Z`,
                    reason: `${dateStr} 공부 시간 부족 (1시간/2시간)`
                })
            }
            // Scenario 2: Absent (No log) -> Fine
            else {
                await supabase.from('fines').insert({
                    room_id: room.id,
                    user_id: user.id,
                    amount: 3000,
                    status: 'PENDING',
                    created_at: `${dateStr}T23:59:59Z`,
                    reason: `${dateStr} 미출석`
                })
            }
        }

        if (logs.length > 0) {
            await supabase.from('attendance_logs').insert(logs)
        }

        // 6. Create a Manual Paid Fine (Example)
        await supabase.from('fines').insert({
            room_id: room.id,
            user_id: user.id,
            amount: 10000,
            status: 'PAID', // Already paid
            reason: '간식비 후원',
            created_at: new Date().toISOString()
        })

        revalidatePath('/')
        return { success: true }

    } catch (e: any) {
        console.error('Seed Data Error:', e)
        return { message: e.message || '데이터 초기화 중 오류가 발생했습니다.' }
    }
}
