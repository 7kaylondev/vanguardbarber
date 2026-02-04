
'use client'

import { useEffect, useState } from "react"

interface StatusBadgeProps {
    hours: any[]
    manualClosed: boolean
}

export function StatusBadge({ hours, manualClosed }: StatusBadgeProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (manualClosed) {
            setIsOpen(false)
            return
        }

        const now = new Date()
        const dayOfWeek = now.getDay() // 0-6
        const currentMinutes = now.getHours() * 60 + now.getMinutes()

        const todayConfig = hours.find(h => h.day_of_week === dayOfWeek)

        if (!todayConfig || todayConfig.is_closed) {
            setIsOpen(false)
            return
        }

        const start = parseTime(todayConfig.start_time || '09:00')
        const end = parseTime(todayConfig.end_time || '19:00')

        // Lunch logic?
        if (todayConfig.lunch_start && todayConfig.lunch_end) {
            const lStart = parseTime(todayConfig.lunch_start)
            const lEnd = parseTime(todayConfig.lunch_end)
            if (currentMinutes >= lStart && currentMinutes < lEnd) {
                setIsOpen(false) // Closed for lunch
                return
            }
        }

        if (currentMinutes >= start && currentMinutes < end) {
            setIsOpen(true)
        } else {
            setIsOpen(false)
        }

    }, [hours, manualClosed])

    if (!mounted) return null // Prevent hydration mismatch

    if (isOpen) {
        return (
            <span className="flex items-center gap-1.5 bg-green-900/30 text-green-400 px-3 py-1 rounded-full border border-green-900/50 backdrop-blur-sm shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold tracking-wide uppercase">Aberto</span>
            </span>
        )
    }

    return (
        <span className="flex items-center gap-1.5 bg-red-900/30 text-red-400 px-3 py-1 rounded-full border border-red-900/50 backdrop-blur-sm">
            <span className="inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            <span className="text-xs font-bold tracking-wide uppercase">Fechado</span>
        </span>
    )
}

function parseTime(time: string) {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}
