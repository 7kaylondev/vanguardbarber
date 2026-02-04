
export default function Loading() {
    return (
        <div className="space-y-6 pb-10 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="h-8 w-48 bg-zinc-800 rounded mb-2"></div>
                    <div className="h-4 w-64 bg-zinc-800 rounded"></div>
                </div>
                <div className="flex gap-4">
                    <div className="h-8 w-64 bg-zinc-800 rounded"></div>
                    <div className="h-8 w-24 bg-zinc-800 rounded"></div>
                </div>
            </div>

            <div className="bg-[#111] border border-zinc-800 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-zinc-900 p-4 rounded border border-zinc-800 h-24"></div>
                    ))}
                </div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 bg-zinc-900/50 rounded"></div>
                    ))}
                </div>
            </div>
        </div>
    )
}
