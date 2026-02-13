import { createClient } from '@/lib/supabase/server'

export interface RoomData {
    room: any // Using 'any' for now to match current detailed types, or define explicit helper types
    user: any
    membership: any
    activeSession: any
    todayTotalSeconds: number
    participants: any[]
    rules: any[]
    fines: any[]
}

export async function getRoomDetails(roomId: string): Promise<{ data: RoomData | null, error: any }> {
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

    // 2. Check Membership & Active Session
    let membership = null
    let activeSession = null
    let todayTotalSeconds = 0

    if (user) {
        const { data: participant } = await supabase
            .from('room_participants')
            .select('*')
            .eq('room_id', roomId)
            .eq('user_id', user.id)
            .single()
        membership = participant

        // Fetch active session (check_out_time is null)
        const { data: session } = await supabase
            .from('attendance_logs')
            .select('*')
            .eq('room_id', roomId)
            .eq('user_id', user.id)
            .is('check_out_time', null)
            .maybeSingle()

        activeSession = session

        // Fetch today's total study time
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const { data: logs } = await supabase
            .from('attendance_logs')
            .select('duration_seconds')
            .eq('room_id', roomId)
            .eq('user_id', user.id)
            .gte('check_in_time', todayStart.toISOString())

        if (logs) {
            todayTotalSeconds = logs.reduce((acc, log) => acc + (log.duration_seconds || 0), 0)
        }
    }

    // 3. Fetch Tab Data (Parallel)
    const [
        { data: participants },
        { data: rules },
        { data: fines }
    ] = await Promise.all([
        supabase.from('room_participants').select('*, users(username, profile_image_url)').eq('room_id', roomId),
        supabase.from('rules').select('*').eq('room_id', roomId),
        supabase.from('fines').select('*, users(username), rules(description)').eq('room_id', roomId)
    ])

    return {
        data: {
            room,
            user,
            membership,
            activeSession,
            todayTotalSeconds,
            participants: participants || [],
            rules: rules || [],
            fines: fines || []
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
