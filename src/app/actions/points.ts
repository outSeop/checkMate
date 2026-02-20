'use server'

import { createClient } from '@/lib/supabase/server'

export async function awardPoints(userId: string, amount: number, reason: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('points').insert({
        user_id: userId,
        amount,
        reason,
    })

    if (error) {
        console.error('[Points] Award failed:', error)
    }
}

export async function getUserPoints(userId: string): Promise<number> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('points')
        .select('amount')
        .eq('user_id', userId)

    if (!data) return 0
    return data.reduce((sum, row) => sum + row.amount, 0)
}
