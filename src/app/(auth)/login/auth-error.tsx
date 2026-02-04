
'use client'

import { useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

export default function AuthErrorMessage() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    if (!error) return null

    return (
        <div className="px-6 pb-2">
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/50 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro na Autenticação</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        </div>
    )
}
