import { createClient } from "@/lib/supabase/server"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const supabase = await createClient()
    const { slug } = await params

    const { data: shop } = await supabase
        .from('barbershops')
        .select('name, logo_url, bio')
        .eq('slug', slug)
        .single()

    if (!shop) {
        return {
            title: 'Barbearia Vanguarda',
        }
    }

    return {
        title: shop.name || 'Barbearia',
        description: shop.bio || `Agende seu horário na ${shop.name}`,
        icons: {
            icon: [
                { url: shop.logo_url || '/favicon.ico', rel: 'icon' }
            ],
            shortcut: [shop.logo_url || '/favicon.ico'],
            apple: [shop.logo_url || '/apple-touch-icon.png'],
        },
        openGraph: {
            title: shop.name,
            description: shop.bio || 'Agende seu horário.',
            images: shop.logo_url ? [shop.logo_url] : [],
        }
    }
}

export default function ShowcaseLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
