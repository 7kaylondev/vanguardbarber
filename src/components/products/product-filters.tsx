
'use client'

import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"

export function ProductFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get('search') || '')
    // const [priceRange, setPriceRange] = useState([0, 200])
    const debouncedSearch = useDebounce(search, 500)

    // Sync Search with URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams)
        if (debouncedSearch) {
            params.set('search', debouncedSearch)
        } else {
            params.delete('search')
        }
        router.replace(`?${params.toString()}`)
    }, [debouncedSearch, router, searchParams])

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar produtos..."
                    className="pl-9 bg-card border-primary/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-primary">Categorias</h3>
                <div className="space-y-2">
                    {['Pomadas', 'Óleos', 'Shampoos', 'Acessórios', 'Kits'].map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                            <Checkbox id={category} className="border-primary/50 data-[state=checked]:bg-primary" />
                            <Label htmlFor={category} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {category}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-primary">Preço</h3>
                <Slider defaultValue={[100]} max={500} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>R$ 0</span>
                    <span>R$ 500+</span>
                </div>
            </div>
        </div>
    )
}
