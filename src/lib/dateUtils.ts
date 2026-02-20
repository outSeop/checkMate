import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { subDays } from 'date-fns'

export const DEFAULT_TIMEZONE = 'Asia/Seoul'

export function getYesterdayDateString(tz: string = DEFAULT_TIMEZONE): string {
    const now = toZonedTime(new Date(), tz)
    const yesterday = subDays(now, 1)
    return formatInTimeZone(yesterday, tz, 'yyyy-MM-dd')
}

export function getTodayDateString(tz: string = DEFAULT_TIMEZONE): string {
    return formatInTimeZone(new Date(), tz, 'yyyy-MM-dd')
}

/** UTC Date를 지정된 타임존의 시/분으로 변환 */
export function getHoursMinutesInTimezone(utcDate: Date, tz: string = DEFAULT_TIMEZONE): { hours: number, minutes: number } {
    const zonedDate = toZonedTime(utcDate, tz)
    return { hours: zonedDate.getHours(), minutes: zonedDate.getMinutes() }
}

export function formatTime(totalSec: number): string {
    const hours = Math.floor(totalSec / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function sortByDateDesc<T extends { created_at: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}
