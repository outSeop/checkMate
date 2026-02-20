
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { validateRoomName, sanitizeText, MAX_DESCRIPTION_LENGTH, MAX_NOTICE_LENGTH } from '@/lib/validation'

interface CreateRoomState {
    message: string
}

export async function createRoom(prevState: CreateRoomState, formData: FormData): Promise<CreateRoomState> {
    const supabase = await createClient()

    // 1. Check Authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: '로그인이 필요합니다.' }
    }

    // 2. Validate Input
    const name = sanitizeText(formData.get('name') as string || '')
    const description = sanitizeText(formData.get('description') as string || '').slice(0, MAX_DESCRIPTION_LENGTH)
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const communicationLink = formData.get('communicationLink') as string
    const isPublic = formData.get('isPublic') === 'on'

    const nameError = validateRoomName(name)
    if (nameError) return { message: nameError }

    if (!startDate) {
        return { message: '시작일을 입력해주세요.' }
    }

    // 3. Insert Room
    const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
            name,
            description,
            start_date: startDate,
            end_date: endDate || null,
            communication_link: communicationLink,
            is_public: isPublic,
            owner_id: user.id,
            invite_code: Array.from(crypto.getRandomValues(new Uint8Array(4)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
                .toUpperCase()
        })
        .select()
        .single()

    if (roomError) {
        console.error('Room Creation Error:', roomError)
        return { message: '스터디 생성 중 오류가 발생했습니다.' }
    }

    // 4. Add Creator as OWNER in participants
    const { error: participantError } = await supabase
        .from('room_participants')
        .insert({
            room_id: room.id,
            user_id: user.id,
            role: 'OWNER',
            vacation_count: 1 // Default
        })

    if (participantError) {
        console.error('Participant Error:', participantError)
        return { message: '참여자 등록 중 오류가 발생했습니다.' }
    }

    // 5. Insert Rules (if any)
    const rulesJson = formData.get('rulesJson') as string
    if (rulesJson) {
        try {
            const rules = JSON.parse(rulesJson) as Array<{
                type: string
                subtype: string
                value: number
                dailyTarget?: number
                penalty: number
                description: string
            }>
            if (rules.length > 0) {
                const rulesToInsert = rules.map(r => ({
                    room_id: room.id,
                    type: r.type,
                    condition_json: {
                        subtype: r.subtype,
                        // min_hours is used for DURATION subtype OR as a condition for WEEKLY subtype
                        min_hours: r.subtype === 'DURATION' ? r.value : (r.dailyTarget || undefined),
                        interval: r.subtype === 'WEEKLY' ? 'WEEK' : undefined,
                        count: r.subtype === 'WEEKLY' ? r.value : undefined
                    },
                    penalty_amount: r.penalty,
                    description: r.description
                }))

                const { error: ruleError } = await supabase.from('rules').insert(rulesToInsert)
                if (ruleError) {
                    console.error('Rule Insertion Error:', ruleError)
                    // Non-fatal, but good to know
                }
            }
        } catch (e) {
            console.error('Rule Parsing Error:', e)
        }
    }

    // 5. Redirect to Room
    redirect(`/room/${room.id}`)
}

export async function joinRoom(roomId: string) {
    const supabase = await createClient()

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' }
    }

    // 2. Check if already a member
    const { data: existingMember } = await supabase
        .from('room_participants')
        .select('role')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single()

    if (existingMember) {
        return { success: false, message: '이미 참여 중인 스터디입니다.' }
    }

    // 3. Insert Participant
    const { error } = await supabase
        .from('room_participants')
        .insert({
            room_id: roomId,
            user_id: user.id,
            role: 'MEMBER',
            vacation_count: 1
        })

    if (error) {
        console.error('Join Room Error:', error)
        return { success: false, message: '스터디 참여 중 오류가 발생했습니다.' }
    }

    // 4. Revalidate
    revalidatePath(`/room/${roomId}`)
    return { success: true }
}

export async function updateRoomNotice(roomId: string, notice: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' }
    }

    const sanitizedNotice = sanitizeText(notice).slice(0, MAX_NOTICE_LENGTH)

    const { error } = await supabase
        .from('rooms')
        .update({ notice: sanitizedNotice })
        .eq('id', roomId)
        .eq('owner_id', user.id)

    if (error) {
        console.error('Update Notice Error:', error)
        return { success: false, message: '공지사항 수정 중 오류가 발생했습니다.' }
    }

    revalidatePath(`/room/${roomId}`)
    return { success: true }
}

export async function updateRoomSettings(roomId: string, settlementDay: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' }
    }

    const { error } = await supabase
        .from('rooms')
        .update({ settlement_day: settlementDay })
        .eq('id', roomId)
        .eq('owner_id', user.id)

    if (error) {
        console.error('Update Settings Error:', error)
        return { success: false, message: '설정 수정 중 오류가 발생했습니다.' }
    }

    revalidatePath(`/room/${roomId}`)
    return { success: true }
}
