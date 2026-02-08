import { Shell } from '@/components/shell/Shell'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Ensure user object is serializable by stripping any methods
    const serializedUser = user ? JSON.parse(JSON.stringify(user)) : null

    return <Shell user={serializedUser}>{children}</Shell>
}
