'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import { startSession, endSession } from '@/app/actions/timer'

export default function SiTimer({
    roomId,
    initialSessionId,
    initialStartTime,
    initialTotalSeconds = 0
}: {
    roomId: string
    initialSessionId?: string | null
    initialStartTime?: string | null // ISO string of check_in_time
    initialTotalSeconds?: number
}) {
    const [isRunning, setIsRunning] = useState(!!initialSessionId)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId || null)
    const [totalSeconds, setTotalSeconds] = useState(initialTotalSeconds)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Calculate initial elapsed time if resuming
    useEffect(() => {
        if (initialStartTime && initialSessionId) {
            const start = new Date(initialStartTime).getTime()
            const now = Date.now()
            const seconds = Math.floor((now - start) / 1000)
            setElapsedTime(seconds > 0 ? seconds : 0)
            setIsRunning(true)
        }
    }, [initialStartTime, initialSessionId])

    // Update local total seconds when initial prop changes (e.g. revalidation)
    useEffect(() => {
        setTotalSeconds(initialTotalSeconds)
    }, [initialTotalSeconds])

    // Format seconds to HH:MM:SS
    const formatTime = (totalSec: number) => {
        const hours = Math.floor(totalSec / 3600)
        const minutes = Math.floor((totalSec % 3600) / 60)
        const seconds = totalSec % 60

        const pad = (n: number) => n.toString().padStart(2, '0')
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }

    const handleStart = async () => {
        if (!currentSessionId) {
            // New Session
            const res = await startSession(roomId)
            if (res.sessionId) {
                setCurrentSessionId(res.sessionId)
                setIsRunning(true)
                setElapsedTime(0)
            } else {
                alert(res.message) // Simple alert for now
            }
        } else {
            // Resume logic if needed
            setIsRunning(true)
        }
    }

    const handleStop = async () => {
        setIsRunning(false)
        if (currentSessionId) {
            // Optimistic update: Add elapsed to total and reset elapsed
            const sessionDuration = elapsedTime
            setTotalSeconds(prev => prev + sessionDuration)
            setElapsedTime(0)
            setCurrentSessionId(null)

            await endSession(currentSessionId, sessionDuration, roomId)
        }
    }

    useEffect(() => {
        if (isRunning) {
            // Use initialStartTime if available for more accurate drift-less timing
            const baseTime = (initialStartTime && currentSessionId === initialSessionId)
                ? new Date(initialStartTime).getTime()
                : Date.now() - (elapsedTime * 1000)

            intervalRef.current = setInterval(() => {
                const now = Date.now()
                // Prevent negative time if system clock skews
                const seconds = Math.max(0, Math.floor((now - baseTime) / 1000))
                setElapsedTime(seconds)
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isRunning, initialStartTime, currentSessionId, initialSessionId])

    // Display Total (Past) + Current Session
    const displayTime = totalSeconds + elapsedTime

    return (
        <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius)',
            padding: '2rem',
            textAlign: 'center',
            border: '1px solid var(--border)',
            marginTop: '2rem'
        }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '800', fontFamily: 'monospace', margin: '0 0 1.5rem 0', color: 'var(--primary)' }}>
                {formatTime(displayTime)}
            </h2>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                {!isRunning ? (
                    <button
                        onClick={handleStart}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 2rem',
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '9999px',
                            cursor: 'pointer'
                        }}
                    >
                        <Play fill="currentColor" size={24} />
                        START
                    </button>
                ) : (
                    <button
                        onClick={handleStop}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 2rem',
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            backgroundColor: 'var(--destructive)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '9999px',
                            cursor: 'pointer'
                        }}
                    >
                        <Pause fill="currentColor" size={24} />
                        STOP
                    </button>
                )}
            </div>

            <p style={{ marginTop: '1rem', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                {isRunning ? '🔥 열공 중입니다!' : '오늘도 힘내보세요!'}
            </p>
        </div>
    )
}
