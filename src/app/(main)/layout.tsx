
import { DashboardSidebar } from "@/components/admin/sidebar"
import { MobileSidebar } from "@/components/admin/mobile-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { createClient } from "@/lib/supabase/server"

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let shopName = undefined
    let shopSlug = undefined

    if (user) {
        const { data: shop } = await supabase.from('barbershops').select('name, slug').eq('owner_id', user.id).single()
        if (shop) {
            shopName = shop.name
            shopSlug = shop.slug
        }
    }

    return (
        <div className="flex h-full w-full bg-black text-gray-200">
            {/* Desktop Sidebar: hidden on mobile, fixed width which doesn't scroll with main */}
            <div className="hidden md:block w-64 fixed inset-y-0 h-full z-50">
                <DashboardSidebar shopSlug={shopSlug} />
            </div>

            {/* Main Content Area */}
            {/* Added relative and z-0 to ensure it doesn't overlap sidebar, but pl-64 pushes it */}
            <main className="md:pl-64 flex flex-col w-full min-h-screen relative z-0">
                <DashboardHeader initialShopName={shopName} />

                <div className="flex-1 overflow-y-auto relative p-0">
                    {/* Mobile Trigger (Only visible on mobile) */}
                    {/* Using MobileSidebar inside here is fine, header logic handled inside it */}
                    <div className="md:hidden p-4 flex items-center gap-4 border-b border-[#333] sticky top-0 bg-black z-30">
                        <MobileSidebar shopSlug={shopSlug} />
                        <span className="font-bold text-[#d4af37]">VANGUARD</span>
                    </div>

                    <div className="w-full max-w-[1600px] mx-auto pt-20 md:pt-28 px-4 md:px-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
