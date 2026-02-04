import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ShowcaseAuthProvider } from "@/components/showcase/auth/showcase-auth-provider"
import { ProfileHeader } from "@/components/showcase/profile/profile-header"
import { ProfileEditForm } from "@/components/showcase/profile/profile-edit-form"
import { PasswordChangeForm } from "@/components/showcase/profile/password-change-form"
import { ClubCard } from "@/components/showcase/profile/club-card"
import { HistoryList } from "@/components/showcase/profile/history-list"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ProfilePage({ params }: { params: { slug: string } }) {
    const supabase = await createClient()
    const { slug } = await params

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/v/${slug}`)
    }

    // Fetch Shop
    const { data: shop } = await supabase.from('barbershops').select('*').eq('slug', slug).single()
    if (!shop) return notFound()

    // Fetch Client Data (Linked to User)
    const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('auth_user_id', user.id)
        .eq('barbershop_id', shop.id)
        .single()

    // If client record missing (e.g. user registered on another shop but visiting this one? 
    // Or legacy user? We should create one? For now assume created via RegisterDialog)
    // If missing, maybe show "Complete seu cadastro" or just use Auth data.

    // Fetch History
    const { data: history } = await supabase
        .from('agendamentos')
        .select(`
            *,
            products_v2 (name),
            professionals (name)
        `)
        .eq('client_id', client?.id)
        .order('date', { ascending: false })
        .order('time', { ascending: false })

    // Fetch Club Plan if active
    let clubPlan = null
    if (client?.club_plan_id) {
        const { data: plan } = await supabase.from('products_v2').select('*').eq('id', client.club_plan_id).single()
        clubPlan = plan
    }

    return (
        <ShowcaseAuthProvider>
            <div className="min-h-screen bg-[#000000] text-gray-100 font-sans p-6 pb-24">
                <div className="max-w-md mx-auto space-y-8">
                    {/* Header Nav */}
                    <div className="flex items-center gap-4">
                        <Link href={`/v/${slug}`} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold">Meu Perfil</h1>
                    </div>

                    {/* Profile Header (Avatar, Name, Edit) */}
                    <ProfileHeader user={user} client={client} />

                    {/* Forms: Edit Data & Security */}
                    <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ProfileEditForm user={user} client={client} />
                        <PasswordChangeForm />
                    </div>

                    {/* Club Status Card */}
                    {shop.modulo_clube_ativo && (
                        <ClubCard client={client} plan={clubPlan} shopSlug={slug} />
                    )}

                    {/* History */}
                    <HistoryList appointments={history || []} />
                </div>
            </div>
        </ShowcaseAuthProvider>
    )
}
