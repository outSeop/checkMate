// ============================
// Core Database Row Types
// ============================

export interface UserProfile {
    username: string | null
    profile_image_url: string | null
}

export interface Room {
    id: string
    name: string
    description: string | null
    start_date: string
    end_date: string | null
    communication_link: string | null
    is_public: boolean
    owner_id: string
    invite_code: string
    notice: string | null
    settlement_day: number | null
    last_settlement_date: string | null
    created_at: string
}

export interface RoomParticipant {
    user_id: string
    room_id: string
    role: 'OWNER' | 'ADMIN' | 'MEMBER'
    vacation_count: number
    joined_at: string
    users: UserProfile | null
}

export type RuleType = 'ATTENDANCE' | 'GOAL'
export type RuleSubtype = 'LATE' | 'DURATION' | 'WEEKLY'

export interface RuleConditionJson {
    subtype: RuleSubtype
    time?: string
    min_hours?: number
    interval?: 'WEEK'
    count?: number
}

export interface Rule {
    id: string
    room_id: string
    type: RuleType
    condition_json: RuleConditionJson
    penalty_amount: number
    description: string | null
}

export type FineStatus = 'PENDING' | 'PAID' | 'CONFIRMED' | 'DISPUTED'

export interface Fine {
    id: string
    room_id: string
    user_id: string
    rule_id: string | null
    amount: number
    status: FineStatus
    reason?: string | null
    created_at: string
    users?: UserProfile | null
    rules?: { description: string | null } | null
    rooms?: { owner_id: string } | null
}

export interface AttendanceLog {
    id: string
    room_id: string
    user_id: string
    check_in_time: string
    check_out_time: string | null
    duration_seconds: number | null
    status: string
    message: string | null
    study_type: 'STOPWATCH'
}

export interface Vacation {
    id: string
    room_id: string
    user_id: string
    start_date: string
    end_date: string
    reason: string
    status: 'APPROVED' | 'PENDING' | 'REJECTED'
    users?: UserProfile | null
}

export type NotificationType = 'FINE' | 'NOTICE' | 'SYSTEM' | 'PAYMENT' | 'VACATION'

export interface Notification {
    id: string
    user_id: string
    room_id?: string
    type: NotificationType
    title: string
    message: string
    link?: string
    is_read: boolean
    created_at: string
}

export interface UserStreak {
    user_id: string
    room_id: string
    current_streak: number
    max_streak: number
    last_activity_date: string | null
}

export interface PointEntry {
    id: string
    user_id: string
    amount: number
    reason: string | null
    created_at: string
}

// ============================
// Composite/View Types
// ============================

export interface RoomData {
    room: Room
    user: { id: string; email?: string } | null
    membership: RoomParticipant | null
    activeSession: AttendanceLog | null
    todayTotalSeconds: number
    participants: RoomParticipant[]
    rules: Rule[]
    fines: Fine[]
    myStreak: UserStreak | null
    streaks: UserStreak[]
}

export interface RoomWithDetails extends Room {
    room_participants: Array<{ role: string }>
    rules: Array<Pick<Rule, 'description' | 'condition_json' | 'penalty_amount'>>
}
