'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, BellRing, Check, CheckCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/app/actions/notifications'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Notification } from '@/types/database'

export default function NotificationBell({ userId, align = 'right' }: { userId: string, align?: 'left' | 'right' }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()
    const supabaseRef = useRef(createClient())
    const supabase = supabaseRef.current

    // Fetch notifications
    useEffect(() => {
        if (!userId) return

        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) {
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.is_read).length)
            }
        }

        fetchNotifications()

        // Realtime Subscription
        const channel = supabase
            .channel('notification-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const newNotif = payload.new as Notification
                    setNotifications(prev => [newNotif, ...prev])
                    setUnreadCount(prev => prev + 1)
                    // Optional: Play sound or show toast
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const toggleOpen = () => setIsOpen(!isOpen)

    const handleMarkAsRead = async (id: string) => {
        // Optimistic Update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))

        await markNotificationAsRead(id)
    }

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
        await markAllNotificationsAsRead()
    }

    // Close dropdown when clicking outside (simple implementation: use a backdrop or just on navigation)
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={toggleOpen}
                style={{
                    position: 'relative',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    backgroundColor: isOpen ? 'var(--muted)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--foreground)'
                }}
            >
                {unreadCount > 0 ? <BellRing size={20} /> : <Bell size={20} />}
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        backgroundColor: 'var(--red-500, #ef4444)',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--card)'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close on click outside */}
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: align === 'right' ? 0 : 'auto',
                        left: align === 'left' ? 0 : 'auto',
                        width: '320px',
                        maxWidth: 'calc(100vw - 2rem)',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        zIndex: 50,
                        marginTop: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'var(--muted)',
                            zIndex: 51
                        }}>
                            <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>알림</span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--primary)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}
                                >
                                    <CheckCheck size={14} />
                                    모두 읽음
                                </button>
                            )}
                        </div>

                        {notifications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                                새로운 알림이 없습니다.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderBottom: '1px solid var(--border)',
                                            backgroundColor: notif.is_read ? 'transparent' : 'rgba(var(--primary-rgb), 0.05)',
                                            transition: 'background-color 0.2s',
                                            display: 'flex',
                                            gap: '0.75rem',
                                            position: 'relative'
                                        }}
                                        onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{notif.title}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                                                    {new Date(notif.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.4 }}>
                                                {notif.message}
                                            </p>
                                            {notif.link && (
                                                <Link
                                                    href={notif.link}
                                                    style={{
                                                        marginTop: '0.5rem',
                                                        display: 'inline-block',
                                                        fontSize: '0.75rem',
                                                        color: 'var(--primary)',
                                                        textDecoration: 'none'
                                                    }}
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    바로가기 &rarr;
                                                </Link>
                                            )}
                                        </div>
                                        {/* Unread indicator dot */}
                                        {!notif.is_read && (
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--primary)',
                                                marginTop: '0.4rem',
                                                flexShrink: 0
                                            }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
