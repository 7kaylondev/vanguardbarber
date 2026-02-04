"use client"

import { MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FloatingWhatsAppProps {
    whatsapp: string
    shopName: string
    hasCart?: boolean
}

export function FloatingWhatsApp({ whatsapp, shopName, hasCart }: FloatingWhatsAppProps) {
    if (!whatsapp) return null

    const cleanNumber = whatsapp.replace(/\D/g, '')
    if (cleanNumber.length < 8) return null

    const link = `https://wa.me/55${cleanNumber}?text=Olá! Vim pelo site da ${encodeURIComponent(shopName)}.`

    return (
        <motion.a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`fixed right-4 z-[100] bg-[#25D366] text-white p-3 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${hasCart ? 'bottom-24' : 'bottom-6'}`}
            aria-label="Fale conosco no WhatsApp"
        >
            <MessageCircle size={28} fill="white" className="text-white" />
        </motion.a>
    )
}
