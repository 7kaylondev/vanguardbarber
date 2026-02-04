
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ShowcaseClient } from "@/components/showcase/showcase-client"
import { Scissors, Star, Instagram, Phone, MapPin, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/showcase/status-badge"
import { ShowcaseAuthProvider } from "@/components/showcase/auth/showcase-auth-provider"
import { ShowcaseHeader } from "@/components/showcase/showcase-header"

export default async function ShowcasePage(props: { params: Promise<{ slug: string }> }) {
    const supabase = await createClient()
    const { slug } = await props.params

    // 1. Fetch Shop Data
    const { data: shop } = await supabase
        .from('barbershops')
        .select('*')
        .eq('slug', slug)
        .single()

    if (!shop) {
        return notFound()
    }

    // 2. Fetch Hours (For Status Badge)
    const { data: hours } = await supabase
        .from('horarios_config')
        .select('*')
        .eq('barbershop_id', shop.id)

    // 3. Fetch Items (Services, Products, Club)
    const { data: items } = await supabase
        .from('products_v2')
        .select('*')
        .eq('barbershop_id', shop.id)
        .eq('status', true)
        .or('category.eq.retail,category.is.null') // Show Retail + Legacy items
        .order('highlight', { ascending: false })
        .order('price', { ascending: true })

    // Module Flags (Default True if null, except Club default False)
    const showServices = shop.modulo_agendamento_ativo !== false
    const showProducts = shop.modulo_produtos_ativo !== false
    const showClub = shop.modulo_clube_ativo === true

    const services = showServices ? (items?.filter((i: any) => i.type === 'service' || !i.type) || []) : []
    const products = showProducts ? (items?.filter((i: any) => i.type === 'product') || []) : []
    const clubPlans = showClub ? (items?.filter((i: any) => i.type === 'club') || []) : []

    // 4. Get Professionals
    const { data: professionalList } = await supabase
        .from('professionals')
        .select('*')
        .eq('barbershop_id', shop.id)
        .eq('active', true)
        .order('name')

    const primaryColor = shop.primary_color || '#d4af37'

    // Static WA Link for Header/Footer (General Contact)
    const waNumber = shop.whatsapp ? shop.whatsapp.replace(/\D/g, '') : null
    const waLink = waNumber
        ? `https://wa.me/55${waNumber}?text=Olá, vim pelo site da ${encodeURIComponent(shop.name)}.`
        : '#'

    return (
        <ShowcaseAuthProvider>
            <div className="min-h-screen bg-[#000000] text-gray-100 font-sans">

                {/* NOTICE TOP BANNER */}
                {shop.notice_msg && (
                    <div className="bg-gradient-to-r from-red-900 to-red-800 text-white text-center py-2 px-4 text-xs md:text-sm font-bold animate-in slide-in-from-top duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                        <span className="relative z-10 flex justify-center items-center gap-2">
                            🚨 {shop.notice_msg}
                        </span>
                    </div>
                )}

                {/* HERO BANNER (Replaced with Client Component) */}
                <ShowcaseHeader shop={shop} hours={hours || []} />


                <main className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">

                    {/* PRIMARY CONTENT (CLIENT COMPOENT) */}
                    <div className="md:col-span-2">
                        {/* 5. Render */}
                        <ShowcaseClient
                            shop={shop}
                            services={services}
                            products={products}
                            clubPlans={clubPlans}
                            professionals={professionalList || []}
                        />
                    </div>

                    {/* SIDEBAR / STICKY CTA (DESKTOP ONLY) */}
                    <div className="hidden md:block">
                        <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 sticky top-24 space-y-6">

                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Scissors size={18} /> Horário de Funcionamento</h3>
                                {/* Simple Static List or Dynamic if we want */}
                                <div className="space-y-2 text-sm text-gray-400">
                                    <p className="flex justify-between"><span>Seg - Sex</span> <span className="text-white">09:00 - 19:00</span></p>
                                    <p className="flex justify-between"><span>Sábado</span> <span className="text-white">09:00 - 18:00</span></p>
                                </div>
                            </div>

                            {shop.address && (
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><MapPin size={18} /> Endereço</h3>
                                    <p className="text-sm text-zinc-400">{shop.address}</p>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`}
                                        target="_blank"
                                        className="text-xs text-yellow-500 hover:underline mt-1 block"
                                    >
                                        Ver no Google Maps
                                    </a>
                                </div>
                            )}

                            <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                <p className="text-xs text-gray-500 mb-2">Contato Direto</p>
                                {waLink !== '#' && (
                                    <a href={waLink} target="_blank">
                                        <Button className="w-full bg-[#25D366] hover:bg-[#1caa53] text-white font-bold h-10 shadow-lg">
                                            <Phone className="mr-2 h-4 w-4" />
                                            WhatsApp Geral
                                        </Button>
                                    </a>
                                )}
                                <div className="flex gap-2 justify-center mt-4">
                                    {shop.instagram_url && (
                                        <a href={shop.instagram_url} target="_blank" className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-white transition-colors">
                                            <Instagram size={18} />
                                        </a>
                                    )}
                                    {shop.facebook_url && (
                                        <a href={shop.facebook_url} target="_blank" className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-white transition-colors">
                                            <Facebook size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </main>

                {/* BIO SECTION */}
                {(shop.modulo_sobre_nos_ativo !== false) && (
                    <section className="container mx-auto px-4 pb-12">
                        <div className="bg-[#0f0f0f] p-6 rounded-xl border border-zinc-900 max-w-4xl">
                            <h2 className="text-lg font-bold mb-3 text-white">Sobre nós</h2>
                            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                                {shop.bio || `A ${shop.name} é referência em estilo e tradição. Venha conhecer nosso espaço.`}
                            </p>
                        </div>
                    </section>
                )}

                {/* MOBILE FOOTER (Address & Socials) */}
                <footer className="md:hidden p-8 bg-zinc-900 mt-8 text-center space-y-4">
                    <h2 className="text-xl font-bold font-serif">{shop.name}</h2>
                    {shop.address && (
                        <div className="text-sm text-zinc-400">
                            <MapPin className="mx-auto mb-1" size={20} />
                            {shop.address} <br />
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`}
                                target="_blank"
                                className="text-yellow-500 text-xs"
                            >
                                Abrir no Mapa
                            </a>
                        </div>
                    )}
                    <div className="flex justify-center gap-4 pt-4">
                        {shop.instagram_url && <a href={shop.instagram_url} className="text-zinc-400 hover:text-white"><Instagram /></a>}
                        {shop.facebook_url && <a href={shop.facebook_url} className="text-zinc-400 hover:text-white"><Facebook /></a>}
                    </div>
                    <p className="text-xs text-zinc-600">© 2024 Vanguarda Barber</p>
                </footer>
            </div>
        </ShowcaseAuthProvider>
    )
}
