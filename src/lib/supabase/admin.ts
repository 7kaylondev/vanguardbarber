
import { createClient } from '@supabase/supabase-js'

// Note: This client uses the SERVICE_ROLE_KEY which bypasses RLS.
// Use ONLY in trusted server-side contexts.
export const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
