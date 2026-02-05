import { SupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

export type CurrentShop = {
    id: string
    name: string
    slug: string
}

export async function getCurrentShop(supabase: SupabaseClient): Promise<CurrentShop> {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch ALL shops to make a determinstic decision
    const { data: shops } = await supabase
        .from('barbershops')
        .select('id, name, slug, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true }) // Default: Oldest first

    if (!shops || shops.length === 0) {
        // Handle "No Shop" case - maybe redirect to onboarding?
        // For now, return null or throw (Dashboard handles check)
        // But dashboard expects a shop.
        // Let's redirect to a "create shop" page if we had one, or return null and let caller handle.
        // Caller currently expects valid shop.
        redirect('/entrar-loja') // Or some onboarding route
    }

    // DETERMINE ACTIVE SHOP
    // 1. Prefer strict ID if known (Fix for conflict reported by user)
    const preferredId = 'df01934c-6447-4952-ba61-689e3a620b7a'
    const match = shops.find(s => s.id === preferredId)

    if (match) {
        return match
    }

    // 2. Fallback: Return the first one (Oldest)
    // If strict ID not found, we assume the oldest is the main one.
    return shops[0]
}
