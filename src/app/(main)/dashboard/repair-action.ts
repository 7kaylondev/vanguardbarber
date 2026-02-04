
'use server'

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function repairShopLink() {
    const supabase = await createClient()
    const admin = createAdminClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return { success: false, error: "No user" }

    // 2. Check if Shop Exists
    const { data: shop } = await admin.from('barbershops').select('id').eq('owner_id', user.id).single()
    if (shop) return { success: true, repaired: false }

    // 3. Find Approved Lead with this Email
    const { data: lead } = await admin
        .from('leads')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'approved')
        .single() // Take the most recent approved one ideally, but single works for now

    if (!lead) return { success: false, error: "Nenhum lead aprovado encontrado para este email." }

    // 4. Create Shop (REPAIR)
    console.log(`[Repair] Creating shop for orphans user ${user.email} based on lead ${lead.id}`)

    // Slug Logic
    let baseSlug = lead.barbershop_name
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

    let slug = baseSlug
    let created = false
    let attempts = 0

    while (!created && attempts < 5) {
        const trySlug = attempts === 0 ? baseSlug : `${baseSlug}-${Math.floor(Math.random() * 1000)}`
        const { error } = await admin.from('barbershops').insert({
            owner_id: user.id,
            name: lead.barbershop_name,
            slug: trySlug,
            bio: "Gerado automaticamente pela Vanguarda.",
            primary_color: "#d4af37",
            status: 'active'
        })
        if (!error) {
            created = true
            slug = trySlug
        }
        attempts++
    }

    if (created) {
        revalidatePath('/dashboard')
        return { success: true, repaired: true, slug }
    }

    return { success: false, error: "Falha ao criar barbearia." }
}
