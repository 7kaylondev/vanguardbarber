
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginAdmin(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return redirect('/vanguarda-hq?error=Credenciais obrigatórias')
    }

    const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error("Admin Login Error:", error.message)
        // Redirect back to HQ, not generic login
        return redirect(`/vanguarda-hq?error=${encodeURIComponent(error.message)}`)
    }

    if (!session) {
        return redirect('/vanguarda-hq?error=Sessão não criada')
    }

    // Success -> Middleware will redirect to /admin-command, but we can be explicit
    // Force revalidation of the layout to ensure server components see the new session
    revalidatePath('/', 'layout')
    redirect('/admin-command')
}
