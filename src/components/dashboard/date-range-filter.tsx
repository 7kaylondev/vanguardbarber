
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { startOfDay, endOfDay, subDays, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"

export function DateRangeFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [date, setDate] = useState<DateRange | undefined>()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])


    const updateUrl = (start: Date, end: Date) => {
        const params = new URLSearchParams(searchParams)
        params.set('start', format(start, 'yyyy-MM-dd'))
        params.set('end', format(end, 'yyyy-MM-dd'))
        // Remove period to ensure truth is only dates
        params.delete('period')
        router.push(`?${params.toString()}`)
    }

    // Helper to update URL for presets
    const setPreset = (days: number | 'today' | 'yesterday') => {
        const now = new Date()
        let start: Date
        let end: Date = endOfDay(now)

        if (days === 'today') {
            start = startOfDay(now)
        } else if (days === 'yesterday') {
            start = startOfDay(subDays(now, 1))
            end = endOfDay(subDays(now, 1))
        } else {
            start = startOfDay(subDays(now, days - 1))
        }

        setDate(undefined) // Clear custom calendar state
        updateUrl(start, end)
    }

    const handleCalendarSelect = (range: DateRange | undefined) => {
        setDate(range)
        if (range?.from) {
            const end = range.to ? endOfDay(range.to) : endOfDay(range.from)
            updateUrl(range.from, end)
        }
    }

    // Unified Truth: active button is derived strictly from start/end dates
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')

    const getTargetRange = (days: number | 'today' | 'yesterday') => {
        const now = new Date()
        let start: Date
        let end: Date = endOfDay(now)

        if (days === 'today') {
            start = startOfDay(now)
        } else if (days === 'yesterday') {
            start = startOfDay(subDays(now, 1))
            end = endOfDay(subDays(now, 1))
        } else {
            start = startOfDay(subDays(now, days - 1))
        }
        return {
            s: format(start, 'yyyy-MM-dd'),
            e: format(end, 'yyyy-MM-dd')
        }
    }

    const isMatch = (days: number | 'today' | 'yesterday') => {
        if (!isMounted) return false
        const target = getTargetRange(days)
        // Default to Today if no parameters are present
        if (!startParam && !endParam && days === 'today') return true
        return startParam === target.s && endParam === target.e
    }

    const isCustom = !!startParam && !isMatch('today') && !isMatch('yesterday') && !isMatch(7) && !isMatch(30)

    return (
        <div className="flex items-center gap-2 bg-[#111] p-1 rounded-lg border border-zinc-800">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreset('today')}
                className={cn(
                    "h-8 text-xs font-medium hover:text-white hover:bg-zinc-800",
                    isMatch('today') && "bg-[#d4af37] text-black hover:bg-[#b5952f] hover:text-black"
                )}
            >
                Hoje
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreset('yesterday')}
                className={cn(
                    "h-8 text-xs font-medium hover:text-white hover:bg-zinc-800",
                    isMatch('yesterday') && "bg-[#d4af37] text-black hover:bg-[#b5952f] hover:text-black"
                )}
            >
                Ontem
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreset(7)}
                className={cn(
                    "h-8 text-xs font-medium hover:text-white hover:bg-zinc-800",
                    isMatch(7) && "bg-[#d4af37] text-black hover:bg-[#b5952f] hover:text-black"
                )}
            >
                7 dias
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreset(30)}
                className={cn(
                    "h-8 text-xs font-medium hover:text-white hover:bg-zinc-800",
                    isMatch(30) && "bg-[#d4af37] text-black hover:bg-[#b5952f] hover:text-black"
                )}
            >
                30 dias
            </Button>

            <div className="w-px h-4 bg-zinc-800 mx-1" />

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-8 text-xs font-medium hover:text-white hover:bg-zinc-800 gap-2 px-2",
                            isCustom && "bg-[#d4af37] text-black hover:bg-[#b5952f]"
                        )}
                    >
                        <CalendarIcon size={14} />
                        {isCustom ? "Personalizado" : ""}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={handleCalendarSelect}
                        numberOfMonths={2}
                        locale={ptBR}
                        className="text-white"
                        classNames={{
                            day_selected: "bg-[#d4af37] text-black hover:bg-[#d4af37] hover:text-black focus:bg-[#d4af37] focus:text-black",
                            day_today: "bg-zinc-800 text-white",
                            day_range_middle: "bg-[#d4af37]/20 text-white hover:bg-[#d4af37]/30",
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
