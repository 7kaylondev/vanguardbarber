
'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function approveLead(leadId: string) {
    // 1. Init Clients
    const supabaseAdmin = createAdminClient()
    const supabase = await createClient()

    try {
        console.log(`[Approve] Starting approval for lead ${leadId}`)

        // 2. Fetch Lead Data
        const { data: lead, error: leadError } = await supabaseAdmin
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .single()

        if (leadError || !lead) throw new Error("Lead não encontrado ou erro de acesso.")

        // 3. Create OR Find Auth User
        const tempPassword = '123456'
        let userId: string | undefined

        // Try creating first
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: lead.email || `${lead.whatsapp.replace(/\D/g, '')}@vanguarda.temp`,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                name: lead.barber_name,
                role: 'barber_partner'
            }
        })

        // CHECK: Handle error or success
        // Supabase error: "A user with this email address has already been registered"
        const errorMessage = userError?.message || ""

        if (!userError && userData.user) {
            userId = userData.user.id
            console.log(`[Approve] User created: ${userId}`)
        } else if (errorMessage.includes("registered") || errorMessage.includes("exists")) {
            console.log(`[Approve] User exists (Error: ${errorMessage}), finding ID...`)

            // Find user by email
            const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
            if (listError) throw new Error("Erro ao listar usuários: " + listError.message)

            const targetEmail = lead.email || `${lead.whatsapp.replace(/\D/g, '')}@vanguarda.temp`
            const found = usersData.users.find(u => u.email === targetEmail)

            if (found) {
                userId = found.id
                console.log(`[Approve] User found via list: ${userId}`)
            } else {
                throw new Error(`Usuário reportado como existente (${errorMessage}) mas não encontrado na lista. Email: ${targetEmail}`)
            }
        } else {
            throw new Error("Erro ao criar usuário: " + errorMessage)
        }

        if (!userId) throw new Error("Falha fatal: ID do usuário não determinado.")

        // 4. Check if Shop already exists for this user (Idempotency)
        const { data: existingShop } = await supabaseAdmin
            .from('barbershops')
            .select('slug')
            .eq('owner_id', userId)
            .single()

        let slug = existingShop?.slug

        if (!existingShop) {
            // Generate Slug
            let baseSlug = lead.barbershop_name
                .toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")

            slug = baseSlug

            // Create Barbershop with Retry for Slug Collision
            let created = false
            let attempts = 0
            while (!created && attempts < 5) {
                const trySlug = attempts === 0 ? baseSlug : `${baseSlug}-${Math.floor(Math.random() * 1000)}`

                const { error: shopError } = await supabaseAdmin.from('barbershops').insert({
                    owner_id: userId,
                    name: lead.barbershop_name,
                    slug: trySlug,
                    primary_color: '#d4af37', // Default
                    status: 'active'
                })

                if (!shopError) {
                    created = true
                    slug = trySlug
                    console.log(`[Approve] Shop created: ${trySlug}`)
                } else if (!shopError.message.includes("unique constrain") && !shopError.message.includes("duplicate key")) {
                    throw shopError // Real error
                }
                attempts++
            }

            if (!created) throw new Error("Falha ao gerar slug único para a barbearia.")
        } else {
            console.log(`[Approve] Shop already exists: ${slug}`)
        }

        // 6. Update Lead Status
        await supabaseAdmin.from('leads').update({ status: 'approved' }).eq('id', leadId)

        return {
            success: true,
            slug: slug,
            credentials: {
                email: lead.email,
                password: tempPassword
            }
        }

    } catch (error: any) {
        console.error("[Approve] Critical Error:", error)
        return { success: false, error: error.message || "Erro desconhecido no servidor." }
    }
}

export async function signOutAdmin() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}

export async function rejectLead(leadId: string) {
    const supabaseAdmin = createAdminClient()

    try {
        console.log(`[Reject] Rejecting lead ${leadId}`)

        const { error } = await supabaseAdmin
            .from('leads')
            .update({ status: 'rejected' })
            .eq('id', leadId)

        if (error) throw error

        return { success: true }
    } catch (error: any) {
        console.error("[Reject] Error:", error)
        return { success: false, error: error.message }
    }
}

export async function createContract(data: { client_name: string, amount: number, due_day: number }) {
    const supabaseAdmin = createAdminClient()

    try {
        const { error } = await supabaseAdmin
            .from('admin_contracts')
            .insert({
                client_name: data.client_name,
                amount: data.amount,
                due_day: data.due_day,
                status: 'active'
            })

        if (error) throw error
        revalidatePath('/admin-command')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function deleteContract(id: string) {
    const supabaseAdmin = createAdminClient()

    try {
        const { error } = await supabaseAdmin
            .from('admin_contracts')
            .delete()
            .eq('id', id)

        if (error) throw error
        revalidatePath('/admin-command')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
