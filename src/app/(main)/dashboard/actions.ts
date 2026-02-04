
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// --- SHOP SETTINGS ---
export async function updateShopSettings(formData: FormData) {
    const supabase = await createClient()

    // Get Current User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Não autorizado" }

    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const primary_color = formData.get('primary_color') as string
    const instagram_url = formData.get('instagram_url') as string
    const whatsapp = formData.get('whatsapp') as string
    const logo_url = formData.get('logo_url') as string
    const banner_url = formData.get('banner_url') as string
    const notice_msg = formData.get('notice_msg') as string
    const status_manual = formData.get('status_manual') === 'true'
    const address = formData.get('address') as string
    const whatsapp_orders = formData.get('whatsapp_orders') as string
    const facebook_url = formData.get('facebook_url') as string
    const min_order_value = parseFloat(formData.get('min_order_value') as string || '0')
    const modulo_produtos_ativo = formData.get('modulo_produtos_ativo') === 'true'
    const modulo_agendamento_ativo = formData.get('modulo_agendamento_ativo') === 'true'
    const modulo_sobre_nos_ativo = formData.get('modulo_sobre_nos_ativo') === 'true'
    const inactivity_threshold_days = parseInt(formData.get('inactivity_threshold_days') as string || '45')

    const { error } = await supabase
        .from('barbershops')
        .update({
            name,
            bio,
            primary_color,
            instagram_url,
            whatsapp,
            logo_url,
            banner_url,
            notice_msg,
            status_manual,
            address,
            whatsapp_orders,
            facebook_url,
            min_order_value,
            modulo_produtos_ativo,
            modulo_agendamento_ativo,
            modulo_sobre_nos_ativo,
            inactivity_threshold_days
        })
        .eq('owner_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/posicionamento')
    revalidatePath('/dashboard/configuracoes')
    revalidatePath('/v/[slug]', 'page')
    return { success: true }
}

// --- PRODUCTS / SERVICES ---
export async function upsertProduct(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Não autorizado" }

    const id = formData.get('id') as string // Optional (if editing)
    const barbershop_id = formData.get('barbershop_id') as string
    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const description = formData.get('description') as string
    const type = formData.get('type') as string || 'service'
    const category = formData.get('category') as string || 'retail' // NEW: retail or bar
    const image_url = formData.get('image_url') as string
    const highlight = formData.get('highlight') === 'true'

    // Logic: Bar items are hidden online
    const is_visible_online = category === 'retail'

    const payload = {
        barbershop_id,
        name,
        price,
        description,
        type,
        category,
        is_visible_online, // NEW: Enforce visibility rule
        image_url,
        highlight,
        status: true // Active by default
    }

    let error
    if (id) {
        // Update
        const res = await supabase.from('products_v2').update(payload).eq('id', id)
        error = res.error
    } else {
        // Insert
        const res = await supabase.from('products_v2').insert(payload)
        error = res.error
    }

    if (error) return { error: error.message }

    revalidatePath('/dashboard/servicos')
    revalidatePath('/dashboard/produtos')
    revalidatePath('/dashboard/bar')
    return { success: true }
}

export async function deleteProduct(productId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('products_v2').delete().eq('id', productId)
    if (error) return { error: error.message }
    revalidatePath('/dashboard/servicos')
    revalidatePath('/dashboard/produtos')
    revalidatePath('/dashboard/bar')
    return { success: true }
}

// --- OPERATING HOURS ---
export async function upsertOperatingHours(barbershopId: string, hoursData: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Não autorizado" }

    // Security check: ensure user owns the shop
    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).eq('id', barbershopId).single()
    if (!shop) return { error: "Acesso negado à barbearia." }

    // Upsert logic
    const { error } = await supabase
        .from('horarios_config')
        .upsert(
            hoursData.map(h => ({
                barbershop_id: barbershopId,
                day_of_week: h.day_of_week,
                start_time: h.start_time || '09:00',
                end_time: h.end_time || '19:00',
                lunch_start: h.lunch_start || null,
                lunch_end: h.lunch_end || null,
                slot_duration: h.slot_duration || 30,
                is_closed: h.is_closed
            })),
            { onConflict: 'barbershop_id, day_of_week' }
        )

    if (error) return { error: error.message }

    revalidatePath('/dashboard/configuracoes')
    return { success: true }
}

// --- BOOKING LOGIC ---
export async function getAvailableSlots(slug: string, dateStr: string, professionalId?: string) {
    const supabase = await createClient() // Anon client is fine due to public policies

    // 1. Get Shop ID
    const { data: shop } = await supabase.from('barbershops').select('id').eq('slug', slug).single()
    if (!shop) return { error: "Barbearia não encontrada" }

    // 2. Determine Day of Week
    const [year, month, day] = dateStr.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day) // Local construction
    const dayOfWeek = dateObj.getDay() // 0 = Sunday

    console.log(`[DEBUG_SLOTS] Checking ${dateStr} (Day: ${dayOfWeek}) for slug ${slug}, Pro: ${professionalId}`)

    // 3. Get Config for that day
    // Logic: Try to find specific config for pro. If not, fallback to shop general config (professional_id is null).
    let query = supabase
        .from('horarios_config')
        .select('*')
        .eq('barbershop_id', shop.id)
        .eq('day_of_week', dayOfWeek)

    if (professionalId) {
        // We want either the specific pro config OR the general config
        // But supabase simple query doesn't do OR easily across rows like this without `or()`.
        // Cleaner: Fetch both, pick best in JS.
        query = query.or(`professional_id.eq.${professionalId},professional_id.is.null`)
    } else {
        query = query.is('professional_id', null)
    }

    const { data: configs } = await query

    if (!configs || configs.length === 0) return { slots: [] } // Closed

    // Pick best config: Specific Pro > General
    // Sor by professional_id desc (Assuming UUID or string, non-null comes before null? actually no.)
    // Let's find manually.
    const specificConfig = configs.find(c => c.professional_id === professionalId)
    const generalConfig = configs.find(c => c.professional_id === null)
    const config = specificConfig || generalConfig

    console.log('[DEBUG_SLOTS] Config found:', config ? `Yes (Closed: ${config.is_closed})` : 'No')

    if (!config || config.is_closed) return { slots: [] } // Closed

    // 4. Generate All Slots
    const slots = []
    let current = parseTime(config.start_time)
    const end = parseTime(config.end_time)
    const lunchStart = config.lunch_start ? parseTime(config.lunch_start) : -1
    const lunchEnd = config.lunch_end ? parseTime(config.lunch_end) : -1

    while (current + config.slot_duration <= end) {
        // Check Lunch
        const isLunch = (lunchStart !== -1 && lunchEnd !== -1) &&
            (current >= lunchStart && current < lunchEnd)

        if (!isLunch) {
            slots.push(formatTime(current))
        }
        current += config.slot_duration
    }

    // 5. Fetch Existing Appointments
    let appointmentQuery = supabase
        .from('agendamentos')
        .select('time')
        .eq('barbershop_id', shop.id)
        .eq('date', dateStr)
        .in('status', ['confirmed', 'pending'])

    if (professionalId) {
        appointmentQuery = appointmentQuery.eq('professional_id', professionalId)
    }
    // If no professionalId logic (e.g. "Any"), we'd need to check if ALL pros are busy. 
    // For now assuming we only support Pro Selection flow.

    const { data: appointments } = await appointmentQuery

    // 6. Filter Busy Slots (Collision Detection & Past Time)
    const busyIntervals = (appointments || []).map((a: any) => {
        const start = parseTime(a.time.substring(0, 5))
        return { start, end: start + config.slot_duration } // Assuming same duration rule
    })

    // Current Time in Brazil (for "Past Slots" check)
    let minMinutes = -1
    const nowBrl = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
    const todayStrBrl = nowBrl.toISOString().split('T')[0] // YYYY-MM-DD roughly, but better to format manually to be safe

    // Manual format YYYY-MM-DD for BRL
    const yearBrl = nowBrl.getFullYear()
    const monthBrl = String(nowBrl.getMonth() + 1).padStart(2, '0')
    const dayBrl = String(nowBrl.getDate()).padStart(2, '0')
    const currentDateStr = `${yearBrl}-${monthBrl}-${dayBrl}`

    if (dateStr === currentDateStr) {
        minMinutes = nowBrl.getHours() * 60 + nowBrl.getMinutes()
    }

    const available = slots.filter(timeStr => {
        const start = parseTime(timeStr)
        const end = start + config.slot_duration

        // 1. Block Past Slots (only if today)
        if (minMinutes !== -1 && start < minMinutes) return false

        // 2. Anti-Collision (Overlap Check)
        // Overlap condition: (StartA < EndB) and (EndA > StartB)
        const isBusy = busyIntervals.some((busy: any) => {
            return start < busy.end && end > busy.start
        })

        return !isBusy
    })

    console.log(`[DEBUG_SLOTS] Final available slots: ${available.length}`)
    return { slots: available }
}

// --- CLIENT MANAGEMENT ---
export async function upsertClientAction(data: { name: string, phone: string, lastVisit?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Não autorizado" }

    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).single()
    if (!shop) return { error: "Loja não encontrada" }

    // Use the RPC for safe upsert
    const { data: clientId, error } = await supabase.rpc('upsert_client', {
        p_barbershop_id: shop.id,
        p_name: data.name,
        p_phone: data.phone
    })

    if (error) {
        console.error("Erro upsert_client:", error)
        return { error: "Erro ao salvar cliente." }
    }

    // History Injection (If manual last visit is provided)
    if (data.lastVisit && clientId) {
        // Check if client already has appointments to avoid dupes if editing? 
        // For now, assume this is mostly for new manual adds.
        const { error: appError } = await supabase.from('agendamentos').insert({
            barbershop_id: shop.id,
            client_id: clientId,
            client_name: data.name,
            client_phone: data.phone,
            date: data.lastVisit,
            time: '00:00', // Dummy time
            status: 'confirmed', // Treat as confirmed/completed
            origin: 'manual_history', // Marker
            service_id: null // Or a generic 'Corte' if we had ID? Null is safer.
        })

        if (appError) console.error("Erro ao criar histórico manual:", appError)
    }

    revalidatePath('/dashboard/clientes')
    return { success: true, clientId }
}

// Helper: HH:MM to minutes
function parseTime(timeStr: string) {
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
}

// Helper: minutes to HH:MM
// Helper: minutes to HH:MM
function formatTime(minutes: number) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

// --- PERSISTENCE ACTIONS ---

// --- PERSISTENCE ACTIONS ---

import { createAdminClient } from "@/lib/supabase/admin"

export async function createAppointment(data: {
    barbershop_id: string
    service_id: string
    client_name: string
    client_phone: string
    date: string
    time: string
    professional_id?: string
}) {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    // 1. Identify User Context
    const { data: { user } } = await supabase.auth.getUser()

    // 2. FETCH SHOP OWNER (Crucial for Identity & RLS)
    // We must know WHO owns this shop to link the client/appointment correctly.
    // Use Admin Client to ensure we can read the shop details.
    const { data: shop } = await adminSupabase
        .from('barbershops')
        .select('owner_id')
        .eq('id', data.barbershop_id)
        .single()

    if (!shop || !shop.owner_id) {
        throw new Error("CRITICAL: Barbershop Owner not found. Cannot create secure appointment.")
    }
    const shopOwnerId = shop.owner_id

    let clientId: string | null = null;
    let authUserId = user ? user.id : null;

    // 3. STRATEGY A: Resolve by Auth ID (Preferred)
    if (authUserId) {
        // Use Admin Client to ensure we can find the client even if RLS is strict
        const { data: existingClient } = await adminSupabase
            .from('clients')
            .select('id')
            .eq('barbershop_id', data.barbershop_id)
            .eq('auth_user_id', authUserId)
            .single()

        if (existingClient) {
            clientId = existingClient.id
        }
    }

    // 4. STRATEGY B: Resolve by Phone (Fallback)
    if (!clientId) {
        // Choose the client linked to this shop
        // (Note: owner_id check here is implicit if RLS works, but with Admin client we rely on barbershop_id)
        const { data: phoneClient } = await adminSupabase
            .from('clients')
            .select('id, auth_user_id')
            .eq('barbershop_id', data.barbershop_id)
            .eq('phone', data.client_phone)
            .limit(1)
            .single()

        if (phoneClient) {
            clientId = phoneClient.id

            // Link Auth if needed
            if (authUserId && !phoneClient.auth_user_id) {
                await adminSupabase
                    .from('clients')
                    .update({ auth_user_id: authUserId })
                    .eq('id', clientId)
            }
        }
    }

    // 5. STRATEGY C: Create New Client (Last Resort)
    if (!clientId) {
        // Use Admin Client to Insert
        const { data: newClient, error: createError } = await adminSupabase
            .from('clients')
            .insert({
                barbershop_id: data.barbershop_id,
                owner_id: shopOwnerId, // <--- EXPLICIT IDENTITY LINK
                name: data.client_name,
                phone: data.client_phone,
                auth_user_id: authUserId
            })
            .select('id')
            .single()

        if (createError || !newClient) {
            console.error("CRITICAL CRM ERROR: Failed to create client", createError)
            throw new Error("CRITICAL: Failed to resolve client. Cannot create orphan appointment.")
        }

        clientId = newClient.id
    }

    // 6. FINAL GAURD RAIL
    if (!clientId) {
        throw new Error("CRITICAL: Client ID Resolution Failed. Aborting appointment.")
    }

    // 7. AUTO-HEAL IDENTITY (The Bulletproof Fix)
    // Even if we found an existing client, we must ensure it is linked to the current shop owner.
    // This fixes "Orphan Clients" (created before the fix) and "Partial Migrations".
    await adminSupabase
        .from('clients')
        .update({
            owner_id: shopOwnerId,
            // Also ensure barbershop_id is correct (in case of multi-shop drift, though less likely)
            barbershop_id: data.barbershop_id
        })
        .eq('id', clientId)

    // 8. Create Appointment
    // Use Admin Client to ensure appointment is created regardless of specific insertion policies for Anon
    const { error } = await adminSupabase.from('agendamentos').insert({
        barbershop_id: data.barbershop_id,
        owner_id: shopOwnerId, // <--- EXPLICIT IDENTITY LINK
        client_name: data.client_name,
        client_phone: data.client_phone,
        client_id: clientId,
        service_id: data.service_id,
        date: data.date,
        time: data.time,
        professional_id: data.professional_id || null,
        status: 'pending',
        origin: 'site'
    })

    if (error) {
        console.error("Erro ao criar agendamento:", error)
        return { error: "Erro ao salvar agendamento." }
    }

    // Revalidate CRM
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/clientes')

    return { success: true }
}

export async function createOrder(data: {
    barbershop_id: string
    items: any[]
    total: number
    delivery_type: string
    address?: string
    client_name: string
    client_phone: string
}) {
    const supabase = await createClient()
    const { error } = await supabase.from('pedidos').insert({
        barbershop_id: data.barbershop_id,
        items: data.items,
        total: data.total,
        delivery_type: data.delivery_type,
        address: data.address || null,
        client_name: data.client_name,
        client_phone: data.client_phone,
        status: 'pending'
    })

    if (error) {
        console.error("Erro ao criar pedido:", error)
        return { error: "Erro ao salvar pedido." }
    }

    return { success: true }
}

// --- UNIFIED SAVE ACTION ---
export async function saveFullShopConfiguration(data: {
    // Exact fields requested by user (mapped to DB columns inside)
    endereco_completo: string
    whatsapp_pedidos: string
    facebook_link: string
    valor_minimo_entrega: number
    modo_emergencia: boolean
    tipo_agendamento: string // 'whatsapp' | 'crm'

    // Modules
    modulo_agendamento_ativo: boolean
    modulo_produtos_ativo: boolean
    modulo_clube_ativo: boolean
    modulo_sobre_nos_ativo: boolean
    inactivity_threshold_days: number

    grade_horarios: any[] // Array of hour objects

    // Other existing fields that need to be preserved or updated
    instagram_url: string
    whatsapp: string // Main whatsapp
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Não autorizado" }

    // 1. Update Barbershop Table
    const { error: shopError } = await supabase
        .from('barbershops')
        .update({
            address: data.endereco_completo,
            whatsapp_orders: data.whatsapp_pedidos,
            facebook_url: data.facebook_link,
            min_order_value: data.valor_minimo_entrega,
            status_manual: data.modo_emergencia,
            booking_method: data.tipo_agendamento,

            // Save Modules
            modulo_agendamento_ativo: data.modulo_agendamento_ativo,
            modulo_produtos_ativo: data.modulo_produtos_ativo,
            modulo_clube_ativo: data.modulo_clube_ativo,
            modulo_sobre_nos_ativo: data.modulo_sobre_nos_ativo,
            inactivity_threshold_days: data.inactivity_threshold_days,

            // Allow updating these too if they are providing them
            instagram_url: data.instagram_url,
            whatsapp: data.whatsapp
        })
        .eq('owner_id', user.id)

    if (shopError) {
        console.error("Erro ao salvar barbearia:", shopError)
        return { error: `Erro ao salvar configurações: ${shopError.message}` }
    }

    // 2. Update Hours (Relational)
    // First, get the shop ID to be sure
    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).single()
    if (!shop) return { error: "Barbearia não encontrada." }

    const hoursData = data.grade_horarios.map((h: any) => ({
        barbershop_id: shop.id,
        day_of_week: h.day_of_week,
        start_time: h.start_time || '09:00',
        end_time: h.end_time || '19:00',
        lunch_start: h.lunch_start || null,
        lunch_end: h.lunch_end || null,
        slot_duration: h.slot_duration || 30,
        is_closed: h.is_closed,
        professional_id: null // Explicitly general settings
    }))

    // FIX: Using partial unique indexes makes simple upsert difficult.
    // Strategy: Delete existing GENERAL config for this shop, then Insert new.
    // This avoids "no unique constraint" errors with partial indexes.

    // 1. Delete old general config
    const { error: deleteError } = await supabase
        .from('horarios_config')
        .delete()
        .eq('barbershop_id', shop.id)
        .is('professional_id', null)

    if (deleteError) {
        console.error("Erro ao limpar horários antigos:", deleteError)
        return { error: "Erro ao atualizar horários." }
    }

    // 2. Insert new config
    const { error: hoursError } = await supabase
        .from('horarios_config')
        .insert(hoursData)

    if (hoursError) {
        console.error("Erro ao salvar horários:", hoursError)
        return { error: `Erro ao salvar horários: ${hoursError.message}` }
    }

    revalidatePath('/dashboard/configuracoes')
    revalidatePath('/v/[slug]', 'page')
    return { success: true }
}

// --- TEAM MANAGEMENT ---

export async function upsertProfessional(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Não autorizado" }

    const id = formData.get('id') as string
    const barbershop_id = formData.get('barbershop_id') as string
    const name = formData.get('name') as string
    const specialty = formData.get('specialty') as string
    const commission_percent = parseFloat(formData.get('commission_percent') as string || '0')
    const active = formData.get('active') === 'true'
    const photo_url = formData.get('photo_url') as string

    // Verify ownership
    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).eq('id', barbershop_id).single()
    if (!shop) return { error: "Acesso negado à barbearia." }

    const payload = {
        barbershop_id,
        name,
        specialty,
        commission_percent,
        active,
        photo_url
    }

    let error
    if (id) {
        const res = await supabase.from('professionals').update(payload).eq('id', id)
        error = res.error
    } else {
        const res = await supabase.from('professionals').insert(payload)
        error = res.error
    }

    if (error) return { error: error.message }
    revalidatePath('/dashboard/equipe')
    return { success: true }
}

export async function deleteProfessional(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Não autorizado" }

    const { data: pro } = await supabase.from('professionals').select('barbershop_id').eq('id', id).single()
    if (pro) {
        const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).eq('id', pro.barbershop_id).single()
        if (!shop) return { error: "Não autorizado" }
    }

    const { error } = await supabase.from('professionals').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/dashboard/equipe')
    return { success: true }
}

// --- APPOINTMENT ACTIONS ---
export async function cancelAppointment(appointmentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Verify ownership or permission (optional but recommended, here checking if user owns the shop managing the appointment is complex in one query without shop context,
    // but RLS should handle it if set up correctly. Assuming RLS or basic auth for now.)

    const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'canceled' })
        .eq('id', appointmentId)

    if (error) {
        console.error("Error canceling appointment:", error)
        throw new Error("Failed to cancel appointment")
    }

    revalidatePath("/dashboard")
    return { success: true }
}

export async function getShopProfessionals(barbershopId: string) {
    const supabase = await createClient()
    const { data } = await supabase.from('professionals')
        .select('*')
        .eq('barbershop_id', barbershopId)
        .order('name')
    return data || []
}

export async function updateAppointment(data: {
    appointmentId: string
    newDate: string
    newTime: string
    professionalId?: string
    slug: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // 1. Check availability
    const { slots, error } = await getAvailableSlots(data.slug, data.newDate, data.professionalId)

    if (error || !slots) {
        return { error: error || "Erro ao verificar disponibilidade." }
    }

    const isAvailable = slots.includes(data.newTime.substring(0, 5))

    if (!isAvailable) {
        return { error: "Horário indisponível. Por favor, escolha outro." }
    }

    // 2. Update Appointment
    const { error: updateError } = await supabase
        .from('agendamentos')
        .update({
            date: data.newDate,
            time: data.newTime,
        })
        .eq('id', data.appointmentId)

    if (updateError) {
        console.error("Error updating appointment:", updateError)
        return { error: "Erro ao atualizar agendamento." }
    }

    revalidatePath("/dashboard")
    return { success: true }
}



export async function getShopProducts(barbershopId: string) {
    const supabase = await createClient()

    // Fetch active products (not services)
    const { data } = await supabase
        .from('products_v2')
        .select('*')
        .eq('barbershop_id', barbershopId)
        .eq('status', true)
        // .neq('type', 'service')  // Optional: if you want to exclude services being sold as products
        .order('name')

    return data || []
}

export async function updateAppointmentStatus(data: {
    appointmentId: string
    status: 'confirmed' | 'canceled' | 'pending' | 'completed'
    price?: number
    products?: { id: string, name: string, quantity: number, price: number }[]
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Financial Audit: Explicitly handle concluded_at
    const payload: any = { status: data.status }

    if (data.status === 'completed') {
        // Cash Flow Trigger: The moment money/service is realized
        payload.concluded_at = new Date().toISOString()
    } else {
        // Operational Reset: If moving back, it's no longer realized revenue
        payload.concluded_at = null
    }

    if (data.price !== undefined) {
        payload.price = data.price
    }

    const { error } = await supabase
        .from('agendamentos')
        .update(payload)
        .eq('id', data.appointmentId)

    if (error) {
        console.error("Error updating appointment status:", error)
        return { error: "Erro ao atualizar status." }
    }

    // Save Products if provided
    if (data.products && data.products.length > 0) {
        const productInserts = data.products.map(p => ({
            appointment_id: data.appointmentId,
            product_id: p.id,
            quantity: p.quantity,
            price: p.price,
            name: p.name // Snapshot name in case it changes later (optional, check if column exists)
        }))

        // First clean old ones if any? Or just append?
        // Let's assume on completion we only Add new ones or Replace all? 
        // Safer to Replace All for this specific appointment to avoid dupes if they click 'Complete' twice with edits.
        await supabase.from('appointment_products').delete().eq('appointment_id', data.appointmentId)

        const { error: prodError } = await supabase.from('appointment_products').insert(productInserts)
        if (prodError) {
            console.error("Error saving appointment products:", prodError)
            // Non-blocking but good to know
        }
    }

    // Comprehensive Revalidation
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/relatorios")
    revalidatePath("/dashboard/agenda-futura")

    return { success: true }
}

// SHOWCASE AUTH ACTIONS
export async function registerCustomer(data: {
    userId: string
    barbershopId: string
    name: string
    email: string
    phone: string
}) {
    const supabase = await createClient()

    // Check if client exists with this phone/email?
    // For now, simpler insert. If RLS allows, we might not need this action to bypass RLS, but usually 'clients' is private.
    // However, we added RLS "Users can manage their own client profile". 
    // BUT, on registration, the user just got created.
    // We are running this action from the Client component? No, RegisterDialog calls it.
    // Ideally this runs on server with service role OR we allow authenticated user to INSERT their own row.
    // Let's assume user is authenticated (Supabase has signed them up).

    // UPSERT based on Auth ID or Phone?
    // Best practice: Link via Auth ID.
    const { error } = await supabase.from('clients').insert({
        auth_user_id: data.userId,
        barbershop_id: data.barbershopId,
        name: data.name,
        email: data.email, // If we added email column? Schema didn't specify email in 'clients' originally but usually it's there?
        // Let's check schema. 'clients' has name, phone.
        phone: data.phone,
        created_at: new Date().toISOString()
    })

    if (error) {
        console.error("Error registering client:", error)
        return { error: "Erro ao criar perfil de cliente." }
    }

    return { success: true }
}

export async function getShopServices(slug: string) {
    const supabase = await createClient()

    // 1. Get Shop
    const { data: shop } = await supabase.from('barbershops').select('id').eq('slug', slug).single()
    if (!shop) return []

    // 2. Get Services
    const { data: services } = await supabase
        .from('products_v2')
        .select('*')
        .eq('barbershop_id', shop.id)
        .eq('type', 'service')
        .eq('status', true)
        .order('name')

    return services || []
}

// --- PROFILE SYNC ACTION ---
export async function syncUserProfile(data: {
    photo_url?: string
    name?: string
    phone?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Não autorizado" }

    // Update Client Record
    // We update where auth_user_id = user.id
    // This assumes the user is the client.

    const payload: any = {}
    if (data.photo_url) payload.photo_url = data.photo_url
    if (data.name) payload.name = data.name
    if (data.phone) payload.phone = data.phone

    if (Object.keys(payload).length === 0) return { success: true }

    const { error } = await supabase
        .from('clients')
        .update(payload)
        .eq('auth_user_id', user.id)

    if (error) {
        console.error("Error syncing profile:", error)
        return { error: "Erro ao sincronizar perfil." }
    }

    // Auth Metadata Update (Keep them in sync just in case)
    if (data.name || data.photo_url || data.phone) {
        const metadata: any = {}
        if (data.name) metadata.name = data.name
        if (data.photo_url) metadata.avatar_url = data.photo_url
        if (data.phone) metadata.phone = data.phone

        await supabase.auth.updateUser({ data: metadata })
    }

    // CRITICAL: Revalidate Dashboard
    revalidatePath('/dashboard/clientes')
    revalidatePath('/dashboard/usuarios')
    revalidatePath('/v/[slug]/perfil', 'page')

    return { success: true }
}
// --- ORDER ACTIONS ---
export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase
        .from('pedidos')
        .update({ status })
        .eq('id', orderId)

    if (error) {
        console.error("Error updating order:", error)
        return { error: "Erro ao atualizar pedido." }
    }

    revalidatePath('/dashboard/pedidos')
    revalidatePath('/dashboard/relatorios')
    return { success: true }
}
