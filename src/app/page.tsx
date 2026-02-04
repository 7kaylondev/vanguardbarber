
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { LeadTrapForm } from "@/components/landing/lead-trap-form"
import { motion, AnimatePresence, Variants } from 'framer-motion'
import {
    TrendingUp,
    ShieldCheck,
    Layers,
    ArrowRight,
    Check,
    Zap,
    Database,
    Lock,
    BarChart3,
    Smartphone,
    UserCheck,
    AlertTriangle,
    Minus,
    Plus,
    ChevronDown,
    Menu,
    X,
    Users,
    DollarSign,
    CalendarCheck,
    Rocket,
    Palette,
    Clock
} from "lucide-react"

// --- Animation Variants ---
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
}

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
}

export default function Home() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="flex flex-col min-h-screen bg-[#050505] text-white font-sans selection:bg-[#d4af37] selection:text-black overflow-x-hidden">

            {/* --- HEADER --- */}
            <header className="fixed w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-[#ffffff]/5 h-20 transition-all">
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/5 overflow-hidden">
                            <Image src="/logo.png" alt="Vanguard Logo" width={80} height={80} className="w-16 h-16 object-contain" />
                        </div>
                        <div className="hidden sm:flex flex-col">
                            <span className="text-xl font-bold font-serif text-[#d4af37] tracking-[0.2em] leading-none">VANGUARD</span>
                            <span className="text-[10px] text-zinc-500 tracking-[0.4em] font-medium mt-1 pl-0.5">EST. 2026</span>
                        </div>
                    </div>

                    <nav className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
                        <Link href="#problema" className="hover:text-white transition-colors duration-300">O Problema</Link>
                        <Link href="#solucoes" className="hover:text-white transition-colors duration-300">Soluções</Link>
                        <Link href="#diferenciais" className="hover:text-white transition-colors duration-300">Diferenciais</Link>
                    </nav>

                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors hidden sm:block">
                            LOGIN
                        </Link>
                        <Button className="hidden md:inline-flex bg-[#d4af37] text-black font-bold hover:bg-[#b8860b] transition-all rounded-full px-6 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)]" asChild>
                            <Link href="#hero">TESTE GRÁTIS</Link>
                        </Button>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-white hover:text-[#d4af37] transition-colors p-2"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={28} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col"
                        style={{ backgroundColor: '#000000' }}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-[#ffffff]/10">
                            <div className="flex items-center gap-3">
                                <Image src="/logo.png" alt="Vanguard Logo" width={40} height={40} className="w-10 h-10 object-contain" />
                                <span className="text-xl font-bold font-serif text-[#d4af37] tracking-widest">VANGUARD</span>
                            </div>
                            <button
                                className="text-zinc-400 hover:text-white transition-colors p-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <X size={28} />
                            </button>
                        </div>

                        <nav className="flex flex-col items-center justify-center flex-1 gap-8 text-2xl font-serif text-white">
                            {['O Problema', 'Soluções', 'Diferenciais'].map((item, i) => (
                                <motion.div
                                    key={item}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 + (i * 0.1) }}
                                >
                                    <Link
                                        href={`#${item.toLowerCase().replace(' ', '')}`}
                                        className="hover:text-[#d4af37] transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Link
                                    href="/login"
                                    className="text-zinc-500 hover:text-white transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            </motion.div>
                        </nav>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="p-8 pb-12"
                        >
                            <Button className="w-full h-14 bg-[#d4af37] text-black font-bold text-lg hover:bg-[#b8860b] rounded-full shadow-[0_0_20px_rgba(212,175,55,0.2)]" asChild>
                                <Link href="#hero" onClick={() => setIsMobileMenuOpen(false)}>
                                    TESTE GRÁTIS POR 7 DIAS
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- HERO SECTION --- */}
            <section id="hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex items-center min-h-[90vh]">
                <motion.div
                    animate={{ opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#d4af37]/10 via-[#050505] to-[#050505]"
                />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="space-y-8 text-center lg:text-left"
                        >
                            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] text-[10px] font-bold tracking-widest uppercase">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"
                                />
                                Plataforma 360º de Elite
                            </motion.div>

                            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white tracking-tight leading-[1.1]">
                                <span className="text-[#d4af37] inline-block">Vanguard Barber:</span><br />
                                Transforme Sua Barbearia em um Negócio Digital e Lucrativo.
                            </motion.h1>

                            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed max-w-xl mx-auto lg:mx-0 border-l-2 border-[#d4af37]/20 pl-6">
                                Controle total da agenda, gestão de equipe transparente e uma vitrine digital 24/7 para vender seus produtos. Pare de gerenciar, comece a escalar.
                            </motion.p>

                            <motion.div variants={fadeInUp} className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Button size="lg" className="bg-[#d4af37] text-black hover:bg-white text-lg px-8 font-bold h-14 rounded-full transition-all group" asChild>
                                    <Link href="#solucoes">
                                        TESTE GRÁTIS POR 7 DIAS
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </motion.div>

                            <motion.p variants={fadeInUp} className="text-sm text-zinc-500 pt-4 flex items-center justify-center lg:justify-start gap-2">
                                <Users size={16} className="text-[#d4af37]" />
                                Junte-se a mais de 17 barbearias que já dobram o faturamento.
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-[#d4af37] blur-[100px] opacity-10 rounded-full" />
                            <LeadTrapForm />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- PROBLEM SECTION --- */}
            <section id="problema" className="py-24 bg-[#080808] border-y border-[#ffffff]/5 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="max-w-4xl mx-auto text-center mb-16 space-y-6"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold font-serif text-white">Sua barbearia merece mais do que planilhas e estresse.</h2>
                        <p className="text-xl text-zinc-400 leading-relaxed">
                            O sistema <span className="text-white font-bold">Vanguard Barber</span> foi construído por quem entende o mercado, eliminando a complexidade para que você foque no que realmente importa: a arte e o cliente.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                icon: AlertTriangle,
                                title: "O Ralo Financeiro",
                                text: "Estoque não controlado e comissões manuais geram prejuízos invisíveis todos os dias."
                            },
                            {
                                icon: UserCheck,
                                title: "A Cadeira Vazia",
                                text: "Sem CRM, você não traz o cliente de volta. No-shows destroem sua margem de lucro."
                            },
                            {
                                icon: Smartphone,
                                title: "A Invisibilidade Digital",
                                text: "Sem um site próprio e agendamento online, você perde autoridade e conveniência."
                            }
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                whileHover={{ scale: 1.05, backgroundColor: "#0f0f0f" }}
                                className="group p-8 rounded-2xl bg-[#0a0a0a] border border-[#ffffff]/5 transition-colors relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <card.icon size={100} />
                                </div>
                                <div className="w-12 h-12 bg-[#d4af37]/10 rounded-lg flex items-center justify-center text-[#d4af37] mb-6">
                                    <card.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                                <p className="text-zinc-500 leading-relaxed text-sm">
                                    {card.text}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- CORE PILLARS (BLOCKS 1, 2, 3) --- */}
            <section id="solucoes" className="py-24 relative">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="mb-20 text-center"
                    >
                        <span className="text-[#d4af37] font-bold tracking-widest uppercase text-xs mb-2 block">DIFERENCIAIS OPERACIONAIS</span>
                        <h2 className="text-4xl md:text-5xl font-bold font-serif text-white">Escalabilidade em 3 Dimensões</h2>
                    </motion.div>

                    <div className="space-y-32">
                        {/* BLOCK 1: VITRINE */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="flex flex-col lg:flex-row gap-12 items-center"
                        >
                            <div className="lg:w-1/2 space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-6xl font-serif text-[#d4af37]/20 font-bold">01</span>
                                    <div className="h-px bg-[#d4af37]/20 flex-1" />
                                </div>
                                <h3 className="text-3xl font-bold text-white leading-tight">Estoque que <span className="text-[#d4af37]">Vende Sozinho</span>.</h3>
                                <p className="text-zinc-400 text-lg leading-relaxed">
                                    Transforme seu estoque em uma fonte de receita passiva. Com a Vanguard, você tem um e-commerce integrado, onde seus clientes comprem produtos 24/7 sem intermediários.
                                </p>
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="bg-[#111] p-4 rounded-lg border border-[#ffffff]/5">
                                        <Smartphone className="text-[#d4af37] mb-2" size={20} />
                                        <h4 className="font-bold text-white text-sm">Venda 24/7</h4>
                                        <p className="text-zinc-500 text-xs mt-1">Sua loja nunca fecha.</p>
                                    </div>
                                    <div className="bg-[#111] p-4 rounded-lg border border-[#ffffff]/5">
                                        <DollarSign className="text-[#d4af37] mb-2" size={20} />
                                        <h4 className="font-bold text-white text-sm">Pagamento Direto</h4>
                                        <p className="text-zinc-500 text-xs mt-1">Sem taxas abusivas.</p>
                                    </div>
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="lg:w-1/2 bg-[#111] rounded-2xl border border-[#ffffff]/10 relative overflow-hidden group shadow-2xl flex flex-col justify-end"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-[#111] to-[#000] opacity-90 z-10" />
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay z-0" />

                                {/* UI MOCKUP CONTAINER */}
                                <div className="relative z-20 p-6 pt-12 transform translate-y-4 transition-transform duration-700 hover:translate-y-0 text-left">
                                    {/* MOCKUP HEADER */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center text-black font-bold text-xl font-serif">V</div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Vanguard Barber</h4>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 font-bold uppercase tracking-wider">Aberto</span>
                                                <div className="flex text-[#d4af37]">
                                                    {[1, 2, 3, 4, 5].map(s => <span key={s}>★</span>)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SERVICES LIST */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-4 bg-[#d4af37] rounded-full" />
                                            <span className="font-bold text-white text-sm">Serviços Populares</span>
                                        </div>
                                        {[
                                            { name: "Corte Degradê", price: "R$ 45,00", time: "45 min" },
                                            { name: "Barba Lenhador", price: "R$ 35,00", time: "30 min" },
                                            { name: "Combo Completo", price: "R$ 70,00", time: "1h 15m" }
                                        ].map((s, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a1a] border border-[#ffffff]/5 hover:border-[#d4af37]/30 transition-colors cursor-pointer group/item">
                                                <div>
                                                    <p className="font-medium text-zinc-200 text-sm">{s.name}</p>
                                                    <p className="text-xs text-zinc-500">{s.time}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-[#d4af37] text-sm">{s.price}</p>
                                                    <span className="text-[10px] text-zinc-600 group-hover/item:text-[#d4af37] transition-colors">Agendar</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* PRODUCTS CAROUSEL PREVIEW */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1 h-4 bg-[#d4af37] rounded-full" />
                                            <span className="font-bold text-white text-sm">Produtos em Destaque</span>
                                        </div>
                                        <div className="flex gap-3 overflow-hidden opacity-80">
                                            {[1, 2, 3].map((p, i) => (
                                                <div key={i} className="w-24 shrink-0 bg-[#1a1a1a] p-2 rounded-lg border border-[#ffffff]/5">
                                                    <div className="aspect-square rounded bg-[#000] mb-2 relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/20 to-transparent" />
                                                    </div>
                                                    <div className="h-2 w-12 bg-zinc-800 rounded mb-1" />
                                                    <div className="h-2 w-8 bg-[#d4af37]/30 rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* BLOCK 2: COMISSÕES (Transparência) */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="flex flex-col lg:flex-row-reverse gap-12 items-center"
                        >
                            <div className="lg:w-1/2 space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-6xl font-serif text-[#d4af37]/20 font-bold">02</span>
                                    <div className="h-px bg-[#d4af37]/20 flex-1" />
                                </div>
                                <h3 className="text-3xl font-bold text-white leading-tight">Transparência que <span className="text-[#d4af37]">Motiva a Equipe</span>.</h3>
                                <p className="text-zinc-400 text-lg leading-relaxed">
                                    O cálculo automático de comissões elimina conflitos. Seus barbeiros têm um painel individual para acompanhar os ganhos em tempo real, aumentando a confiança e a produtividade.
                                </p>
                                <ul className="space-y-3 pt-2">
                                    <li className="flex items-start gap-3 text-zinc-300">
                                        <Check className="text-[#d4af37] h-5 w-5 mt-0.5 shrink-0" />
                                        <div><strong className="text-white">Regras Claras:</strong> Configure por serviço, produto ou meta.</div>
                                    </li>
                                    <li className="flex items-start gap-3 text-zinc-300">
                                        <Check className="text-[#d4af37] h-5 w-5 mt-0.5 shrink-0" />
                                        <div><strong className="text-white">Cálculo Automático:</strong> Adeus planilhas manuais.</div>
                                    </li>
                                </ul>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="lg:w-1/2 bg-[#111] rounded-2xl border border-[#ffffff]/10 relative overflow-hidden group shadow-2xl flex flex-col"
                            >
                                <div className="absolute inset-0 bg-gradient-to-bl from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                {/* TEAM MOCKUP HEADER */}
                                <div className="p-6 border-b border-[#ffffff]/5 bg-[#0a0a0a]">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Gestão de Equipe</h4>
                                            <p className="text-zinc-500 text-xs">Gerencie profissionais e comissões.</p>
                                        </div>
                                        <div className="bg-[#d4af37] text-black px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                                            <Plus size={12} /> Novo
                                        </div>
                                    </div>

                                    {/* TEAM STATS */}
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-[#1a1a1a] p-3 rounded-lg border border-[#ffffff]/5">
                                            <p className="text-[10px] text-zinc-500 uppercase">Comissões Hoje</p>
                                            <p className="text-[#d4af37] font-bold">R$ 450,00</p>
                                        </div>
                                        <div className="flex-1 bg-[#1a1a1a] p-3 rounded-lg border border-[#ffffff]/5">
                                            <p className="text-[10px] text-zinc-500 uppercase">Profissionais</p>
                                            <p className="text-white font-bold">4 Ativos</p>
                                        </div>
                                    </div>
                                </div>

                                {/* TEAM LIST */}
                                <div className="p-6 space-y-4 flex-1 overflow-hidden relative">
                                    {[
                                        { name: "Kaylon", role: "Corte Degradê", commission: "30%", active: true, image: "/uploaded_media_1769806510088.png" }, /* Using the new image logic placeholder or generic avatar if needed */
                                        { name: "Matheus", role: "Barba & Corte", commission: "40%", active: true },
                                    ].map((member, i) => (
                                        <div key={i} className="bg-[#111] border border-zinc-800 rounded-xl p-4 relative overflow-hidden group/card hover:border-[#d4af37]/30 transition-all">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-[#d4af37]/20 flex items-center justify-center text-zinc-400 font-bold overflow-hidden">
                                                    {member.image ? (
                                                        <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-xs">IMG</div>
                                                    ) : (
                                                        member.name.substring(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-white shadow-black drop-shadow-sm">{member.name}</h4>
                                                            <p className="text-[#d4af37] text-[10px] font-bold tracking-wider uppercase">{member.role}</p>
                                                        </div>
                                                        <div className={`w-2 h-2 rounded-full ${member.active ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(34,197,94,0.4)]`} />
                                                    </div>

                                                    <div className="mt-4 pt-3 border-t border-dashed border-zinc-800 flex justify-between items-center">
                                                        <div className="text-xs text-zinc-400">
                                                            Comissão: <span className="text-white font-bold">{member.commission}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <div className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded text-[10px] text-zinc-300 hover:text-white cursor-pointer transition-colors">Editar</div>
                                                            <div className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded text-[10px] text-green-500 hover:bg-green-500/10 cursor-pointer transition-colors">$</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* BLOCK 3: CRM (Retenção) */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="flex flex-col lg:flex-row gap-12 items-center"
                        >
                            <div className="lg:w-1/2 space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-6xl font-serif text-[#d4af37]/20 font-bold">03</span>
                                    <div className="h-px bg-[#d4af37]/20 flex-1" />
                                </div>
                                <h3 className="text-3xl font-bold text-white leading-tight">Menos Falta, <span className="text-[#d4af37]">Mais Cadeira Ocupada</span>.</h3>
                                <p className="text-zinc-400 text-lg leading-relaxed">
                                    O CRM e o sistema de agendamento inteligente reduzem drasticamente o no-show com lembretes automáticos e histórico do cliente.
                                </p>
                                <div className="flex items-center gap-4 pt-4">
                                    <div className="bg-[#111] px-4 py-3 rounded-full border border-[#d4af37]/30 text-[#d4af37] text-sm flex items-center gap-2">
                                        <Check size={14} /> Lembrete WhatsApp enviado
                                    </div>
                                    <div className="bg-[#111] px-4 py-3 rounded-full border border-[#d4af37]/30 text-[#d4af37] text-sm flex items-center gap-2">
                                        <Check size={14} /> Cliente confirmado
                                    </div>
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="lg:w-1/2 bg-[#111] rounded-2xl border border-[#ffffff]/10 relative overflow-hidden group shadow-2xl flex flex-col"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                {/* CRM MOCKUP HEADER */}
                                <div className="p-6 border-b border-[#ffffff]/5 flex justify-between items-center bg-[#0a0a0a]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                                            <CalendarCheck size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">CRM de Retenção</h4>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Automático</p>
                                        </div>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-[#111] flex items-center justify-center text-[10px] text-zinc-400">
                                                <UserCheck size={12} />
                                            </div>
                                        ))}
                                        <div className="w-8 h-8 rounded-full bg-[#d4af37] border-2 border-[#111] flex items-center justify-center text-[10px] font-bold text-black">+12</div>
                                    </div>
                                </div>

                                {/* CRM LIST */}
                                <div className="p-6 space-y-3 flex-1 overflow-hidden relative">
                                    {[
                                        { name: "Carlos Mendes", status: "Ausente 35 dias", action: "Recuperar", color: "text-red-400", time: "Último: 25/12" },
                                        { name: "Roberto Junior", status: "Ausente 42 dias", action: "Msg Enviada", active: true, color: "text-orange-400", time: "Último: 18/12" },
                                        { name: "André Silva", status: "Agendado", action: "Confirmado", success: true, color: "text-green-400", time: "Hoje 14:00" },
                                    ].map((client, i) => (
                                        <div key={i} className={`p-3 rounded-xl border ${client.active ? 'bg-[#1a1a1a] border-[#d4af37]/30' : 'bg-[#0f0f0f] border-[#ffffff]/5'} flex items-center justify-between group/card transition-all`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${client.success ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <div>
                                                    <p className="font-bold text-white text-sm">{client.name}</p>
                                                    <p className="text-xs text-zinc-500">{client.time}</p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${client.success ? 'bg-green-500/10 text-green-500' : client.active ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'bg-zinc-800 text-zinc-400'}`}>
                                                {client.action}
                                            </div>
                                        </div>
                                    ))}

                                    {/* FLOATING ACTION */}
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="bg-[#d4af37] text-black p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 transform translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                                            <Check size={14} /> 3 Clientes Recuperados Hoje
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- NEW SECTION: DIFERENCIAIS DE ELITE (BLOCKS 4, 5, 6) --- */}
            <section id="diferenciais" className="py-24 bg-[#080808] border-y border-[#ffffff]/5">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="mb-16 text-center"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold font-serif text-white">Por que a Vanguard é a Escolha Definitiva?</h2>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {/* Block 4: Simplicidade */}
                        <motion.div variants={fadeInUp} className="group p-8 rounded-2xl bg-[#0b0b0b] border border-[#ffffff]/5 hover:border-[#d4af37]/30 transition-all relative">
                            <div className="mb-6 bg-[#d4af37]/10 w-14 h-14 rounded-xl flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Simples por fora. <br />Poderoso por dentro.</h3>
                            <p className="text-zinc-500 leading-relaxed text-sm mb-6">
                                Interface limpa e objetiva. Projetada para que qualquer pessoa aprenda a usar em minutos, mas com profundidade para gestores exigentes.
                            </p>
                        </motion.div>

                        {/* Block 5: Migração */}
                        <motion.div variants={fadeInUp} className="group p-8 rounded-2xl bg-[#0b0b0b] border border-[#ffffff]/5 hover:border-[#d4af37]/30 transition-all relative">
                            <div className="mb-6 bg-[#d4af37]/10 w-14 h-14 rounded-xl flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">
                                <Rocket size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Entre em Operação <br />em Dias, não Meses.</h3>
                            <p className="text-zinc-500 leading-relaxed text-sm mb-6">
                                Migração assistida e setup guiado. Importamos seus dados e deixamos tudo pronto para você não perder nenhum dia de faturamento.
                            </p>
                        </motion.div>

                        {/* Block 6: Branding */}
                        <motion.div variants={fadeInUp} className="group p-8 rounded-2xl bg-[#0b0b0b] border border-[#ffffff]/5 hover:border-[#d4af37]/30 transition-all relative">
                            <div className="mb-6 bg-[#d4af37]/10 w-14 h-14 rounded-xl flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">
                                <Palette size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Sua Marca, <br />Sem Cara de Marketplace.</h3>
                            <p className="text-zinc-500 leading-relaxed text-sm mb-6">
                                Domínio próprio e identidade visual alinhada. Seus clientes veem a SUA barbearia, não a nossa logo.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* --- COMPARISON SECTION (Re-used) --- */}
            <section className="py-24 relative">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="max-w-4xl mx-auto bg-[#0a0a0a] rounded-2xl border border-[#ffffff]/10 overflow-hidden"
                    >
                        <div className="grid grid-cols-3 p-6 border-b border-[#ffffff]/10 bg-[#0f0f0f]">
                            <div className="col-span-1 text-sm font-bold text-zinc-500 uppercase tracking-wider">Feature</div>
                            <div className="col-span-1 text-center font-bold text-zinc-500">Comum</div>
                            <div className="col-span-1 text-center font-bold text-[#d4af37] tracking-widest">VANGUARD</div>
                        </div>
                        {[
                            { label: "Agendamento", common: "Manual / ZAP", vanguard: "Automático + CRM" },
                            { label: "Comissões", common: "Calculadora / Erros", vanguard: "Automático + Painel" },
                            { label: "Controle Financeiro", common: "Caderno / Planilha", vanguard: "Dashboard Tempo Real" },
                            { label: "Fidelização (CRM)", common: "Passiva", vanguard: "Retenção Ativa" },
                            { label: "Vitrine de Produtos", common: "Inexistente", vanguard: "E-commerce Integrado" },
                            { label: "Sua Marca", common: "Escondida", vanguard: "Destaque Total" },
                            { label: "Design", common: "Genérico", vanguard: "Premium / Elite" },
                        ].map((row, i) => (
                            <div key={i} className="grid grid-cols-3 p-6 border-b border-[#ffffff]/5 hover:bg-[#ffffff]/[0.02] transition-colors items-center">
                                <div className="font-medium text-zinc-300">{row.label}</div>
                                <div className="text-center text-zinc-600 flex justify-center"><Minus size={16} /></div>
                                <div className="text-center flex justify-center">
                                    <Check className="text-[#d4af37] h-5 w-5" />
                                </div>
                            </div>
                        ))}
                        <div className="p-8 text-center bg-[#d4af37]/5">
                            <p className="text-[#d4af37] font-serif font-bold text-xl">Mais controle. Mais recorrência. Menos achismo.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- FAQ SECTION --- */}
            <section className="py-24 bg-[#080808] border-t border-[#ffffff]/5">
                <div className="container mx-auto px-6 max-w-3xl">
                    <motion.h2
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-3xl font-bold font-serif text-white mb-12 text-center"
                    >
                        Perguntas Frequentes
                    </motion.h2>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="space-y-4"
                    >
                        <motion.details variants={fadeInUp} className="group border border-[#ffffff]/10 rounded-lg bg-[#111] overflow-hidden">
                            <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 font-medium text-white hover:text-[#d4af37] transition-colors focus:outline-none">
                                <span>Como a Vitrine Digital ajuda a vender mais produtos?</span>
                                <span className="ml-2 bg-[#d4af37]/10 p-1 rounded text-[#d4af37] transition-transform group-open:rotate-180">
                                    <ChevronDown size={14} />
                                </span>
                            </summary>
                            <div className="px-6 pb-4 text-zinc-400 text-sm leading-relaxed border-t border-[#ffffff]/5 pt-4">
                                A Vitrine Digital é o seu e-commerce integrado. Ela permite que seus clientes comprem pomadas, óleos e outros produtos diretamente online, 24/7. O sistema gerencia o estoque e o pagamento é processado diretamente para você, transformando seu estoque em uma fonte de receita passiva sem plataformas de terceiros.
                            </div>
                        </motion.details>

                        <motion.details variants={fadeInUp} className="group border border-[#ffffff]/10 rounded-lg bg-[#111] overflow-hidden">
                            <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 font-medium text-white hover:text-[#d4af37] transition-colors focus:outline-none">
                                <span>O cálculo de comissões é realmente transparente?</span>
                                <span className="ml-2 bg-[#d4af37]/10 p-1 rounded text-[#d4af37] transition-transform group-open:rotate-180">
                                    <ChevronDown size={14} />
                                </span>
                            </summary>
                            <div className="px-6 pb-4 text-zinc-400 text-sm leading-relaxed border-t border-[#ffffff]/5 pt-4">
                                Sim. O Vanguard Barber elimina a dor de cabeça do cálculo manual. Você configura as regras (por serviço, meta, produto) e o sistema calcula automaticamente em tempo real. Isso garante total transparência para a equipe, que pode acompanhar seus ganhos em um painel dedicado.
                            </div>
                        </motion.details>

                        <motion.details variants={fadeInUp} className="group border border-[#ffffff]/10 rounded-lg bg-[#111] overflow-hidden">
                            <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 font-medium text-white hover:text-[#d4af37] transition-colors focus:outline-none">
                                <span>O CRM e Agendamento ajudam a reduzir no-show?</span>
                                <span className="ml-2 bg-[#d4af37]/10 p-1 rounded text-[#d4af37] transition-transform group-open:rotate-180">
                                    <ChevronDown size={14} />
                                </span>
                            </summary>
                            <div className="px-6 pb-4 text-zinc-400 text-sm leading-relaxed border-t border-[#ffffff]/5 pt-4">
                                Com certeza. Nosso sistema envia lembretes automáticos via WhatsApp ou SMS, reduzindo drasticamente as faltas. Além disso, o CRM registra o histórico de no-shows de cada cliente, permitindo decisões estratégicas sobre agendamentos futuros.
                            </div>
                        </motion.details>

                        <motion.details variants={fadeInUp} className="group border border-[#ffffff]/10 rounded-lg bg-[#111] overflow-hidden">
                            <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 font-medium text-white hover:text-[#d4af37] transition-colors focus:outline-none">
                                <span>Meu negócio é pequeno. O sistema é acessível?</span>
                                <span className="ml-2 bg-[#d4af37]/10 p-1 rounded text-[#d4af37] transition-transform group-open:rotate-180">
                                    <ChevronDown size={14} />
                                </span>
                            </summary>
                            <div className="px-6 pb-4 text-zinc-400 text-sm leading-relaxed border-t border-[#ffffff]/5 pt-4">
                                O Vanguard Barber foi desenhado para barbearias de todos os tamanhos. A interface é intuitiva e focada na usabilidade. O objetivo é que o sistema se pague rapidamente com o aumento da eficiência e das vendas da Vitrine Digital.
                            </div>
                        </motion.details>

                        <motion.details variants={fadeInUp} className="group border border-[#ffffff]/10 rounded-lg bg-[#111] overflow-hidden">
                            <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 font-medium text-white hover:text-[#d4af37] transition-colors focus:outline-none">
                                <span>Quanto tempo leva para migrar e começar a usar?</span>
                                <span className="ml-2 bg-[#d4af37]/10 p-1 rounded text-[#d4af37] transition-transform group-open:rotate-180">
                                    <ChevronDown size={14} />
                                </span>
                            </summary>
                            <div className="px-6 pb-4 text-zinc-400 text-sm leading-relaxed border-t border-[#ffffff]/5 pt-4">
                                A migração é rápida e assistida. Nossa equipe auxilia na importação dos dados. Em média, uma barbearia pode estar operacional em menos de 48 horas, dependendo da complexidade dos dados atuais.
                            </div>
                        </motion.details>

                        <motion.details variants={fadeInUp} className="group border border-[#ffffff]/10 rounded-lg bg-[#111] overflow-hidden">
                            <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 font-medium text-white hover:text-[#d4af37] transition-colors focus:outline-none">
                                <span>Posso personalizar a Vitrine Digital?</span>
                                <span className="ml-2 bg-[#d4af37]/10 p-1 rounded text-[#d4af37] transition-transform group-open:rotate-180">
                                    <ChevronDown size={14} />
                                </span>
                            </summary>
                            <div className="px-6 pb-4 text-zinc-400 text-sm leading-relaxed border-t border-[#ffffff]/5 pt-4">
                                Sim. Você tem controle total sobre a exibição de serviços, produtos, fotos e informações de contato, garantindo que a Vitrine Digital seja uma extensão fiel e profissional da sua marca Vanguard Barber.
                            </div>
                        </motion.details>
                    </motion.div>
                </div>
            </section>

            {/* --- FOOTER / FINAL CTA --- */}
            <footer className="py-32 relative overflow-hidden bg-black text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/10 to-transparent opacity-50" />

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="container mx-auto px-6 relative z-10 space-y-8"
                >
                    <h2 className="text-4xl md:text-5xl font-bold font-serif text-white">Não Deixe Seu Negócio no Passado.</h2>
                    <p className="text-zinc-500 max-w-xl mx-auto text-lg">
                        A concorrência está se digitalizando. Dê o passo definitivo.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-[#d4af37] text-black hover:bg-white text-lg px-12 font-bold h-16 rounded-full shadow-[0_0_50px_rgba(212,175,55,0.2)] hover:shadow-[0_0_80px_rgba(212,175,55,0.4)] transition-all scale-100 hover:scale-105" asChild>
                            <Link href="#hero">TESTE GRÁTIS POR 7 DIAS</Link>
                        </Button>
                        <Button variant="outline" size="lg" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 h-16 rounded-full px-8 text-lg" asChild>
                            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">FALE COM UM ESPECIALISTA</a>
                        </Button>
                    </div>

                    <div className="pt-20 border-t border-[#ffffff]/10 mt-20 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-600">
                        <p>© 2026 Vanguard Barber.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <span className="hover:text-zinc-400 cursor-pointer">Termos</span>
                            <span className="hover:text-zinc-400 cursor-pointer">Privacidade</span>
                            <span className="hover:text-zinc-400 cursor-pointer">Suporte</span>
                        </div>
                    </div>
                </motion.div>
            </footer>
        </div>
    )
}
