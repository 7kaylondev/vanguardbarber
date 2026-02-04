
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductSkeleton() {
    return (
        <Card className="overflow-hidden border-primary/10 bg-card">
            <CardHeader className="p-0">
                <Skeleton className="aspect-square w-full rounded-none" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-1/3" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    )
}
