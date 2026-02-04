
'use client'

import { Scissors, Star, ShoppingBag, Phone, Instagram } from "lucide-react"

interface MobileMockupProps {
    data: {
        name: string
        bio: string
        primary_color: string
        logo_url: string
        banner_url: string
        notice_msg?: string
    }
}

export function MobileMockup({ data }: MobileMockupProps) {
    const { name, bio, primary_color, logo_url, banner_url, notice_msg } = data

    return (
        <div className="relative mx-auto border-gray-800 bg-gray-900 border-[8px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl flex flex-col overflow-hidden">
            {/* Notch */}
            <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>

            {/* Screen Content */}
            <div className="flex-1 bg-black overflow-y-auto no-scrollbar relative w-full h-full text-white">

                {/* STATUS BAR PLACEHOLDER */}
                <div className="h-6 w-full bg-black/50 absolute top-0 z-20 flex justify-between px-4 items-center text-[10px] font-bold">
                    <span>9:41</span>
                    <span>5G</span>
                </div>

                {/* HEADER / HERO */}
                <div className="relative h-40 bg-zinc-800">
                    {banner_url ? (
                        <img src={banner_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black" />
                    )}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Logo & Info */}
                    <div className="absolute bottom-4 left-4 flex items-end gap-3 z-10 w-full pr-4">
                        <div className="h-16 w-16 bg-black border-2 rounded-xl overflow-hidden shrink-0 shadow-lg" style={{ borderColor: primary_color }}>
                            {logo_url ? <img src={logo_url} className="w-full h-full object-cover" /> : <Scissors className="m-auto mt-4 text-white" size={24} />}
                        </div>
                        <div className="flex-1 min-w-0 mb-1">
                            <h2 className="font-bold text-lg leading-tight truncate">{name || "Nome da Barbearia"}</h2>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">Barbearia</span>
                                <Star size={10} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-[10px] font-bold">5.0</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* NOTICE BANNER */}
                {notice_msg && (
                    <div className="bg-gradient-to-r from-red-900/50 to-red-600/20 border-b border-red-500/30 p-2 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
                        <p className="text-[10px] font-medium text-red-100 relative z-10">{notice_msg}</p>
                    </div>
                )}

                {/* CONTENT */}
                <div className="p-3 space-y-4">

                    {/* Actions */}
                    <div className="flex gap-2">
                        <div className="flex-1 h-8 bg-green-600 rounded-lg flex items-center justify-center text-[10px] font-bold gap-1 shadow-lg shadow-green-900/20">
                            <Phone size={10} /> Agendar
                        </div>
                        <div className="h-8 w-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                            <Instagram size={12} />
                        </div>
                    </div>

                    {/* Services Skeleton */}
                    <div>
                        <h3 className="text-xs font-bold mb-2 flex items-center gap-1" style={{ borderLeft: `2px solid ${primary_color}`, paddingLeft: '4px' }}>
                            Serviços
                        </h3>
                        <div className="space-y-2">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-2 rounded-lg flex items-center gap-2">
                                    <div className="h-8 w-8 bg-zinc-800 rounded flex items-center justify-center"><Scissors size={10} className="text-zinc-600" /></div>
                                    <div className="flex-1 px-1">
                                        <div className="h-2 w-20 bg-zinc-800 rounded mb-1"></div>
                                        <div className="h-1.5 w-12 bg-zinc-800/50 rounded"></div>
                                    </div>
                                    <div className="h-3 w-8 bg-zinc-800 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                        <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-3">
                            {bio || "Sobre nós..."}
                        </p>
                    </div>

                </div>

                {/* HOME BAR */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white/20 rounded-full"></div>
            </div>
        </div>
    )
}
