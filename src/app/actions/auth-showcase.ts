'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function registerCustomerAction(data: { name: string, email: string, phone: string, password: string, barbershopId: string }) {
    const supabaseAdmin = createAdminClient()
    const supabase = await createClient()

    // 1. Create User with Admin Client (Confirm email automatically)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true, // FORCE CONFIRMATION
        user_metadata: {
            name: data.name,
            phone: data.phone
        }
    })

    if (authError) {
        // If user already exists, try to fetch and update.
        if (authError.message.includes("already registered") || authError.status === 422) {
            const { data: existingUser } = await supabaseAdmin.from('auth.users').select('id, email, email_confirmed_at').eq('email', data.email).single() // Note: querying auth.users might need RPC or direct Admin method. 

            // Actually, Supabase Admin API has listUsers
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
            const existing = users.find(u => u.email === data.email)

            if (existing) {
                // Force confirm
                await supabaseAdmin.auth.admin.updateUserById(existing.id, { email_confirm: true })
                return { error: 'Usuário já existe. O email foi confirmado. Tente entrar.' }
            }
        }
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'Erro inesperado ao criar usuário.' }
    }

    // 2. Insert into Clients Table
    // We can use the regular client if RLS allows, or Admin client if we want to be sure.
    // Using Admin client for safety since we are in a trusted action.
    const { error: dbError } = await supabaseAdmin.from('clients').insert({
        auth_user_id: authData.user.id,
        barbershop_id: data.barbershopId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        created_at: new Date().toISOString()
    })

    if (dbError) {
        // If DB fails, we might want to delete the auth user? 
        // For now, just return error.
        console.error("DB Insert Error:", dbError)
        return { error: 'Conta criada, mas erro ao salvar perfil: ' + dbError.message }
    }

    return { success: true }
}
