
'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
    {
        name: "Seg",
        total: 1200,
    },
    {
        name: "Ter",
        total: 900,
    },
    {
        name: "Qua",
        total: 1600,
    },
    {
        name: "Qui",
        total: 1100,
    },
    {
        name: "Sex",
        total: 2100,
    },
    {
        name: "Sab",
        total: 2400,
    },
    {
        name: "Dom",
        total: 800,
    },
]

export function Overview() {
    return (
        <Card className="border-primary/20 bg-card col-span-4">
            <CardHeader>
                <CardTitle className="text-primary">Faturamento Semanal</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `R$${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: '#333333', opacity: 0.4 }}
                            contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#B8860B', color: '#fff' }}
                        />
                        <Bar
                            dataKey="total"
                            fill="#B8860B"
                            radius={[4, 4, 0, 0]}
                            className="fill-primary"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
