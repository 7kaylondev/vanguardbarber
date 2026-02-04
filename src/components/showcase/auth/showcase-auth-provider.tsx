"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface ShowcaseAuthContextType {
    user: User | null
    profile: any | null
    loading: boolean
    signOut: () => Promise<void>
    refresh: () => void
}

const ShowcaseAuthContext = createContext<ShowcaseAuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    refresh: () => { }
})

export function ShowcaseAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    const fetchUser = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
            const { data: clientData } = await supabase
                .from('clients')
                .select('*')
                .eq('auth_user_id', user.id)
                .single()
            setProfile(clientData)
        } else {
            setProfile(null)
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (!session?.user) setProfile(null)
            // If user changed, we could fetch profile again or rely on fetchUser logic if triggered elsewhere. 
            // Ideally we call fetchUser here too or duplicate fetch logic.
            // For simplicity, let's just re-fetch everything if user exists.
            if (session?.user) {
                supabase.from('clients').select('*').eq('auth_user_id', session.user.id).single()
                    .then(({ data }) => setProfile(data))
            }
            setLoading(false)
            router.refresh()
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
        setProfile(null)
        router.refresh()
    }

    return (
        <ShowcaseAuthContext.Provider value={{ user, profile, loading, signOut, refresh: fetchUser }}>
            {children}
        </ShowcaseAuthContext.Provider>
    )
}

export const useShowcaseAuth = () => useContext(ShowcaseAuthContext)
