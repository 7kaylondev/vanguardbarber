import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export default async function SuperAdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Simple protection: only allow the specific user ID that is having trouble (or me)
    // For now, open it because the user demanded it.
    if (!user) redirect('/login')

    const admin = createAdminClient()
    const { data: shops } = await admin.from('barbershops').select('id, name, slug, owner_id')

    async function updateOwner(formData: FormData) {
        'use server'
        const shopId = formData.get('shopId') as string
        const newOwnerId = formData.get('newOwnerId') as string

        if (!shopId || !newOwnerId) return

        const admin = createAdminClient()

        // 1. Update Shop
        await admin.from('barbershops').update({ owner_id: newOwnerId }).eq('id', shopId)

        // 2. Cascade Update (Auto-Heal) to Clients & Appointments
        await admin.from('clients').update({ owner_id: newOwnerId }).eq('barbershop_id', shopId)
        await admin.from('agendamentos').update({ owner_id: newOwnerId }).eq('barbershop_id', shopId)

        revalidatePath('/dashboard/super-admin')
        revalidatePath('/dashboard/clientes')
    }

    return (
        <div className="p-8 space-y-8 text-zinc-100">
            <h1 className="text-3xl font-bold text-red-500">🔥 SUPER ADMIN - OWNERSHIP FIX</h1>
            <p>Use com cuidado. Isso transfere a posse da loja e todos os dados.</p>

            <div className="space-y-4">
                {shops?.map(shop => (
                    <div key={shop.id} className="bg-zinc-900 p-4 rounded border border-zinc-800">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-bold">{shop.name}</h2>
                                <p className="text-sm text-zinc-500">ID: {shop.id}</p>
                                <p className="text-sm text-zinc-500">Slug: {shop.slug}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-zinc-400">Current Owner</p>
                                <code className="bg-black p-1 rounded text-yellow-500">{shop.owner_id}</code>
                            </div>
                        </div>

                        <form action={updateOwner} className="flex gap-4 items-end bg-black/30 p-4 rounded">
                            <input type="hidden" name="shopId" value={shop.id} />
                            <div className="flex-1">
                                <label className="text-xs text-zinc-500 block mb-1">Novo Owner ID (UUID)</label>
                                <input
                                    name="newOwnerId"
                                    className="w-full bg-zinc-800 border-zinc-700 rounded p-2 text-white"
                                    placeholder="Cole o UUID do usuário aqui"
                                    defaultValue={user.id}
                                />
                            </div>
                            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold">
                                FORÇAR TROCA DE DONO
                            </button>
                        </form>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-blue-900/20 p-4 rounded border border-blue-800">
                <h3 className="font-bold mb-2">Seu ID Atual:</h3>
                <code className="text-xl bg-black p-2 rounded block">{user.id}</code>
            </div>
        </div>
    )
}
