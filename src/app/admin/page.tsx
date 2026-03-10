"use client"

import * as React from "react"
import { getStats, SessionData } from "@/lib/coupon-service"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, Ticket, Activity } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<{ total: number, today: number, sessions: SessionData[] } | null>(null)

  React.useEffect(() => {
    setStats(getStats())
  }, [])

  if (!stats) return null

  const chartData = [
    { name: 'Caixa Premiada', value: stats.sessions.filter(s => s.game === 'Caixa Premiada').length },
    { name: 'Roda Tech', value: 5 }, // Mock for visual
    { name: 'Toque Rápido', value: 8 }, // Mock for visual
  ]

  const COLORS = ['#2E97F5', '#C9A24A', '#8b5cf6']

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gradient">MA Discovery Admin</h1>
            <p className="text-muted-foreground">Monitoramento de interação em tempo real</p>
          </div>
          <div className="glass px-6 py-2 rounded-full border-primary/20 text-primary text-sm font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 animate-pulse" /> LIVE STATS
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Partidas Totais', value: stats.total, icon: Users, color: 'text-primary' },
            { label: 'Hoje', value: stats.today, icon: TrendingUp, color: 'text-green-400' },
            { label: 'Cupons Gerados', value: stats.total, icon: Ticket, color: 'text-accent' },
            { label: 'Uso do Cupom (Est.)', value: Math.round(stats.total * 0.4), icon: Activity, color: 'text-blue-400' },
          ].map((stat, i) => (
            <Card key={i} className="glass border-none">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass border-none">
            <CardHeader>
              <CardTitle className="text-lg">Popularidade dos Jogos</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass border-none">
            <CardHeader>
              <CardTitle className="text-lg">Últimos Cupons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.sessions.slice(-5).reverse().map((session, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <div className="font-bold text-sm tracking-widest">{session.coupon}</div>
                      <div className="text-xs text-muted-foreground">{session.reward}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase bg-white/5 px-2 py-1 rounded">
                      {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                {stats.sessions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">Nenhuma atividade registrada ainda.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
