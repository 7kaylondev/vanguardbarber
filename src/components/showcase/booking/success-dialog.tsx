"use client"

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

interface SuccessDialogProps {
    isOpen: boolean
    onClose: () => void
    shopName: string
}

export function SuccessDialog({ isOpen, onClose, shopName }: SuccessDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#111] border-zinc-800 text-white sm:max-w-md flex flex-col items-center justify-center text-center p-8">

                {/* Accessibility: Description is required if we want to be clean, or just Title. 
                    Let's add a Visually Hidden description or just rely on Title.
                    Radix requires Title. Description is optional but recommended.
                */}
                <DialogDescription className="sr-only">
                    Confirmação de agendamento realizado com sucesso.
                </DialogDescription>

                {/* Animation Container */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="mb-6 rounded-full bg-green-500/20 p-4"
                >
                    <CheckCircle2 className="w-16 h-16 text-green-500" strokeWidth={3} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <DialogTitle className="text-2xl font-bold mb-2 text-white">Sucesso!</DialogTitle>
                    <p className="text-zinc-400 text-lg">
                        Agendamento confirmado na <span className="font-bold text-[#d4af37]">{shopName}</span> com sucesso!
                    </p>
                </motion.div>

            </DialogContent>
        </Dialog>
    )
}
