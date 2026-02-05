import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { shopId } = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!shopId) {
        return NextResponse.json({ error: 'Shop ID required' }, { status: 400 })
    }

    // Verify ownership
    const { data: shop } = await supabase
        .from('barbershops')
        .select('id')
        .eq('id', shopId)
        .eq('owner_id', user.id)
        .single()

    if (!shop) {
        return NextResponse.json({ error: 'Shop not found or access denied' }, { status: 403 })
    }

    // Set Cookie
    const cookieStore = await cookies()
    // Set for 30 days
    cookieStore.set('current_shop_id', shopId, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax'
    })

    return NextResponse.json({ success: true })
}
