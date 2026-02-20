import { createClient } from '@/lib/supabase/server'
import type { RoomData } from '@/types/database'

export type { RoomData }

export async function getRoomDetails(roomId: string): Promise<{ data: RoomData | null, error: Error | null }> {
    const supabase = await createClient()

    // 1. Fetch User & Room
    const [
        { data: { user } },
        { data: room, error: roomError },
    ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('rooms').select('*').eq('id', roomId).single(),
    ])

    if (roomError || !room) {
        return { data: null, error: roomError || new Error('Room not found') }
    }

    // 2. Fetch all data in parallel
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [
        { data: membership },
        { data: activeSession },
        { data: todayLogs },
        { data: participants },
        { data: rules },
        { data: fines },
        { data: myStreak },
        { data: streaks }
    ] = await Promise.all([
        user
            ? supabase.from('room_participants').select('*').eq('room_id', roomId).eq('user_id', user.id).single()
            : Promise.resolve({ data: null }),
        user
            ? supabase.from('attendance_logs').select('*').eq('room_id', roomId).eq('user_id', user.id).is('check_out_time', null).maybeSingle()
            : Promise.resolve({ data: null }),
        user
            ? supabase.from('attendance_logs').select('duration_seconds').eq('room_id', roomId).eq('user_id', user.id).gte('check_in_time', todayStart.toISOString())
            : Promise.resolve({ data: null }),
        supabase.from('room_participants').select('*, users(username, profile_image_url)').eq('room_id', roomId),
        supabase.from('rules').select('*').eq('room_id', roomId),
        supabase.from('fines').select('*, users(username), rules(description)').eq('room_id', roomId).order('created_at', { ascending: false }).limit(50),
        user
            ? supabase.from('user_streaks').select('*').eq('room_id', roomId).eq('user_id', user.id).maybeSingle()
            : Promise.resolve({ data: null }),
        supabase.from('user_streaks').select('*').eq('room_id', roomId)
    ])

    const todayTotalSeconds = todayLogs
        ? todayLogs.reduce((acc: number, log: { duration_seconds: number | null }) => acc + (log.duration_seconds || 0), 0)
        : 0

    return {
        data: {
            room,
            user,
            membership,
            activeSession,
            todayTotalSeconds,
            participants: participants || [],
            rules: rules || [],
            fines: fines || [],
            myStreak: myStreak || null,
            streaks: streaks || []
        },
        error: null
    }
}

export async function getUserRooms() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: rooms, error } = await supabase
        .from('rooms')
        .select(`
            *,
            room_participants!inner (
                role
            ),
            rules (
                description,
                condition_json,
                penalty_amount
            )
        `)
        .eq('room_participants.user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching user rooms:', error)
        return []
    }

    return rooms
}
