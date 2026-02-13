'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Notification Type
type NotificationType = 'FINE' | 'NOTICE' | 'SYSTEM' | 'PAYMENT' | 'VACATION'

/**
 * Creates a notification for a user.
 * This function should be called from other server actions.
 */
export async function createNotification({
    userId,
    roomId,
    type,
    title,
    message,
    link
}: {
    userId: string
    roomId?: string
    type: NotificationType
    title: string
    message: string
    link?: string
}) {
    const supabase = await createClient()

    // We use the authenticated client (Service Role is safer but Auth works if policy allows INSERT)
    // Assuming policy allows insert for now as per migration plan.
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            room_id: roomId,
            type,
            title,
            message,
            link
        })

    if (error) {
        console.error('Create Notification Error:', error)
        // We generally don't throw here to avoid failing the main action (fire & forget)
    }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Mark Read Error:', error)
    }

    // Optimistic UI updates handle this well, but revalidate just in case
    // revalidatePath('/') 
}

/**
 * Marks all notifications as read for the current user.
 */
export async function markAllNotificationsAsRead() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    if (error) {
        console.error('Mark All Read Error:', error)
    }

    // revalidatePath('/')
}

/**
 * Deletes a notification.
 */
export async function deleteNotification(notificationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Delete Notification Error:', error)
    }
}
