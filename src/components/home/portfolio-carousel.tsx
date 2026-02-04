
'use client'

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { PORTFOLIO_ITEMS } from "@/lib/portfolio-data"
import { Scissors } from "lucide-react"

export function PortfolioCarousel() {
    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    )

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-12">
            <div className="text-center mb-10 space-y-2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">Nossa Arte</h2>
                <p className="text-muted-foreground">Transformando visual e autoestima.</p>
                <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
            </div>

            <Carousel
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent className="-ml-1">
                    {PORTFOLIO_ITEMS.map((item) => (
                        <CarouselItem key={item.id} className="pl-1 md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                                <Card className="border-none bg-transparent shadow-none group relative overflow-hidden rounded-xl">
                                    <CardContent className="flex aspect-square items-center justify-center p-0 relative">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                                            <h3 className="text-xl font-bold text-primary font-serif mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{item.title}</h3>
                                            <p className="text-white text-sm mb-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">{item.description}</p>
                                            <Button
                                                className="bg-primary text-black hover:bg-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-150 font-bold"
                                                onClick={() => window.open(`https://wa.me/5511999999999?text=Olá, vi o corte ${item.title} no site e gostaria de agendar!`, '_blank')}
                                            >
                                                <Scissors className="mr-2 h-4 w-4" />
                                                Agendar Este
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex border-primary/50 text-primary hover:bg-primary hover:text-black" />
                <CarouselNext className="hidden md:flex border-primary/50 text-primary hover:bg-primary hover:text-black" />
            </Carousel>

            <div className="mt-12 text-center">
                <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-black font-bold text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/20 animate-pulse hover:animate-none"
                    onClick={() => window.open('https://wa.me/5511999999999?text=Olá, gostaria de agendar um horário!', '_blank')}
                >
                    Agendar Horário Agora
                </Button>
            </div>
        </div>
    )
}
