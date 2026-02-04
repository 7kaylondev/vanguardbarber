"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { syncUserProfile } from "@/app/(main)/dashboard/actions"

interface ProfileHeaderProps {
    user: any
    client: any
}

export function ProfileHeader({ user, client }: ProfileHeaderProps) {
    const [uploading, setUploading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        setUploading(true)
        console.log("Starting upload...", file.name)

        try {
            // 1. Upload to Supabase Storage (Assumes 'avatars' bucket exists and is public)
            // If not, we might fail. Usually we need to setup storage.
            // For now, let's try 'avatars' bucket.
            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) {
                // If bucket doesn't exist, we can't create it from here.
                throw uploadError
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)

            // 2. Update Client Record AND Auth User Metadata
            await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            })

            // Update Client table if linked
            if (client) {
                const { error: clientError } = await supabase.from('clients')
                    .update({ photo_url: publicUrl })
                    .eq('id', client.id)

                if (clientError) {
                    console.error("Failed to sync photo to CRM client record:", clientError)
                    toast.error("Foto salva no perfil, mas falhou ao sincronizar com CRM.")
                }
            }

            toast.success("Foto de perfil atualizada!")
            router.refresh()

        } catch (error: any) {
            console.error("Upload error:", error)
            toast.error("Erro no upload: " + (error.message || "Verifique se o bucket 'avatars' existe."))
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 py-6 border-b border-zinc-900">
            <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-zinc-900 shadow-xl">
                    <AvatarImage src={user.user_metadata?.avatar_url || client?.photo_url} />
                    <AvatarFallback className="bg-zinc-800 text-3xl font-bold text-zinc-500">
                        {user.user_metadata?.name?.substring(0, 2).toUpperCase() || <User />}
                    </AvatarFallback>
                </Avatar>

                <label className="absolute bottom-0 right-0 bg-[#d4af37] text-black p-2 rounded-full cursor-pointer hover:bg-[#b5952f] transition-colors shadow-lg">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
            </div>

            <div className="text-center">
                <h2 className="text-xl font-bold text-white">{user.user_metadata?.name || client?.name || 'Cliente'}</h2>
                <p className="text-sm text-zinc-500">{user.email}</p>
                {client?.phone && <p className="text-xs text-zinc-600 mt-1">{client.phone}</p>}
            </div>
        </div>
    )
}
