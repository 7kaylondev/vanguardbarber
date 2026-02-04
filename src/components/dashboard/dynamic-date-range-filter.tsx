"use client"

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"

const DateRangeFilter = dynamic(() => import('./date-range-filter').then(mod => mod.DateRangeFilter), {
    ssr: false,
    loading: () => <Button variant="outline" size="sm" className="h-8">Carregando...</Button>
})

export function DynamicDateRangeFilter() {
    return <DateRangeFilter />
}
