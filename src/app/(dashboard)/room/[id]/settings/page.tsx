import { getRoomDetails } from '@/services/roomService'
import { notFound, redirect } from 'next/navigation'
import RoomSettingsForm from '@/components/room/RoomSettingsForm'

export default async function RoomSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { data, error } = await getRoomDetails(id)

    if (error || !data || !data.room) {
        notFound()
    }

    const { room, membership } = data

    // Authorization Check
    if (membership?.role !== 'OWNER') {
        redirect(`/room/${id}`)
    }

    return (
        <RoomSettingsForm
            roomId={id}
            initialNotice={room.notice ?? ''}
            initialSettlementDay={room.settlement_day ?? 1}
        />
    )
}
