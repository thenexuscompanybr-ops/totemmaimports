"use client"

import * as React from "react"
import { getStats, SessionData } from "@/lib/coupon-service"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, Activity } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<{ total: number, today: number, sessions: SessionData[] } | null>(null)

  React.useEffect(() => {
    setStats(getStats())
  }, [])

  if (!stats) return null

  const chartData = [
    { name: 'Caixas', value: stats.sessions.filter(s => s.game === 'Caixa Premiada').length },
    { name: 'Roleta', value: stats.sessions.filter(s => s.game === 'Roda Tech').length },
    { name: 'Reflexo', value: stats.sessions.filter(s => s.game === 'Toque Rápido').length },
  ]

  const COLORS = ['#1D1D1F', '#404040', '#A0A0A0']

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-8 font-body">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-black">MA Discovery Admin</h1>
            <p className="text-muted-foreground font-medium opacity-60 uppercase text-[10px] tracking-[0.2em] mt-2">Métricas de Engajamento</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Interações Totais', value: stats.total, icon: Users, color: 'text-black' },
            { label: 'Sessões Hoje', value: stats.today, icon: TrendingUp, color: 'text-black' },
            { label: 'Status Sistema', value: 'Online', icon: Activity, color: 'text-green-500' },
          ].map((stat, i) => (
            <Card key={i} className="bg-white border-black/5 rounded-[2rem] shadow-sm">
              <CardContent className="pt-8">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl bg-zinc-50 border border-black/5 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2 text-black">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-extrabold opacity-40">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border-black/5 rounded-[2rem] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight text-black">Popularidade por Jogo</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #00000005', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                    itemStyle={{ color: '#000' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white border-black/5 rounded-[2rem] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight text-black">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.sessions.slice(-5).reverse().map((session, i) => (
                  <div key={i} className="flex justify-between items-center p-6 rounded-3xl bg-zinc-50 border border-black/5">
                    <div>
                      <div className="font-bold text-lg leading-none mb-1 text-black">{session.reward}</div>
                      <div className="text-sm opacity-40 font-bold uppercase tracking-wider">{session.game}</div>
                    </div>
                    <div className="text-[10px] opacity-40 font-black uppercase bg-white px-3 py-1 rounded-full border border-black/5">
                      {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                {stats.sessions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground opacity-40 font-bold">Nenhuma atividade registrada ainda.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}