
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Settings,
    Layers,
    Banknote,
    Target,
    User,
    FileText,
    ClipboardList,
    Crown
} from "lucide-react"

export const MENU_GROUPS = [
    {
        title: "MENU",
        items: [
            { icon: LayoutDashboard, label: "Início", href: "/dashboard" },
            { icon: Users, label: "Equipe", href: "/dashboard/equipe" },
            { icon: User, label: "CRM", href: "/dashboard/clientes" },
            { icon: User, label: "Usuários", href: "/dashboard/usuarios" },
        ]
    },
    {
        title: "CATÁLOGO",
        items: [
            { icon: Layers, label: "Serviços", href: "/dashboard/servicos" },
            { icon: Package, label: "Produtos", href: "/dashboard/produtos" },
            { icon: ShoppingBag, label: "Bar & Copa", href: "/dashboard/bar" },
            { icon: Crown, label: "Clube", href: "/dashboard/clube" },
            { icon: Target, label: "Posicionamento", href: "/dashboard/posicionamento" },
        ]
    },
    {
        title: "FINANCEIRO",
        items: [
            { icon: FileText, label: "Relatórios", href: "/dashboard/relatorios" },
            { icon: ClipboardList, label: "Pedidos", href: "/dashboard/pedidos" },
            { icon: Banknote, label: "Saques", href: "/dashboard/saques" },
            { icon: Settings, label: "Configurações", href: "/dashboard/configuracoes" },
        ]
    }
]
