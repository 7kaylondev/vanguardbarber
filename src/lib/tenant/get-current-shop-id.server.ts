import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

export async function getCurrentShopId(injectedSupabase?: SupabaseClient) {
    const supabase = injectedSupabase || await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // 1. Check Cookie
    const cookieStore = await cookies()
    const shopCookie = cookieStore.get('current_shop_id')

    if (shopCookie?.value) {
        // Optional: Verify existence/access? 
        // For performance, we assume if cookie is set, it's valid.
        // Or we can do a quick check if paranoid.
        return shopCookie.value
    }

    // 2. Fetch User Shops
    const { data: shops } = await supabase
        .from('barbershops')
        .select('id')
        .eq('owner_id', user.id)

    if (!shops || shops.length === 0) {
        return null
    }

    // 3. Single Shop Logic
    if (shops.length === 1) {
        return shops[0].id
    }

    // 4. Multiple Shops & No Cookie -> FORCE SELECTION
    return null
}
