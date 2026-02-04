import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, ShieldCheck } from "lucide-react"

export default async function UsersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Não autorizado</div>

    // Get Shop ID
    const { data: shop } = await supabase.from('barbershops').select('id, name').eq('owner_id', user.id).single()

    if (!shop) return <div>Barbearia não encontrada</div>

    // Fetch Clients who have a LOGIN (auth_user_id is not null)
    // We filter by barbershop_id to ensure "Separate Access" view (only users of THIS shop)
    const { data: users, error } = await supabase
        .from('clients')
        .select('*')
        .eq('barbershop_id', shop.id)
        .not('auth_user_id', 'is', null)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching users:", error)
        return <div>Erro ao carregar usuários</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Usuários da Vitrine</h1>
                <p className="text-zinc-400">
                    Monitore os clientes que criaram conta na sua vitrine ({shop.name}).
                </p>
            </div>

            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <ShieldCheck className="text-[#d4af37]" />
                        Contas Registradas ({users?.length || 0})
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                        Lista de usuários com login ativo na sua plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                                <TableHead className="text-zinc-400">Usuário</TableHead>
                                <TableHead className="text-zinc-400">Email / Contato</TableHead>
                                <TableHead className="text-zinc-400">Data de Registro</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                                        Nenhum usuário registrado ainda.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users?.map((client) => (
                                    <TableRow key={client.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-zinc-700">
                                                    <AvatarImage src={client.photo_url} />
                                                    <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                                        {client.name?.substring(0, 2).toUpperCase() || <User size={14} />}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{client.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{client.email || '—'}</span>
                                                <span className="text-xs text-zinc-500">{client.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-400">
                                            {format(new Date(client.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>
                                            <span className="bg-green-900/20 text-green-400 text-xs px-2 py-1 rounded border border-green-900/30">
                                                Ativo
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
