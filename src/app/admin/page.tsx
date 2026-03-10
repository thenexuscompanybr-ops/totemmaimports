"use client"

import * as React from "react"
import { getStats, SessionData } from "@/lib/coupon-service"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, Activity, ArrowLeft } from "lucide-react"
import Link from "next/link"

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
    { name: 'Memória', value: stats.sessions.filter(s => s.game === 'Jogo da Memória').length },
  ]

  const COLORS = ['#C5A059', '#D4AF37', '#B8860B', '#DAA520']

  return (
    <div className="min-h-screen bg-[#000814] p-12 font-body selection:bg-[#C5A059] selection:text-white text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-16">
          <div>
            <Link href="/" className="flex items-center gap-2 text-sm font-bold text-white/30 hover:text-white transition-all mb-4 uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Totem
            </Link>
            <h1 className="text-6xl font-black tracking-tighter text-white uppercase">Dashboard</h1>
            <p className="text-[#C5A059] font-black uppercase text-xs tracking-[0.5em] mt-4">Gestão de Engajamento MA Imports</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
          {[
            { label: 'Interações Totais', value: stats.total, icon: Users, color: 'text-[#C5A059]' },
            { label: 'Sessões Hoje', value: stats.today, icon: TrendingUp, color: 'text-[#C5A059]' },
            { label: 'Status Sistema', value: 'Online', icon: Activity, color: 'text-green-500' },
          ].map((stat, i) => (
            <Card key={i} className="bg-white/5 border-white/10 rounded-[48px] p-10 backdrop-blur-3xl shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div className={`p-5 rounded-[24px] bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-10 h-10" />
                </div>
              </div>
              <div className="text-6xl font-black mb-3 text-white tracking-tighter">{stat.value}</div>
              <div className="text-xs text-white/30 uppercase tracking-[0.4em] font-black">{stat.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="bg-white/5 border-white/10 rounded-[48px] p-10 backdrop-blur-3xl shadow-2xl">
            <CardHeader className="px-0 pt-0 pb-12">
              <CardTitle className="text-3xl font-black tracking-tight text-white uppercase">Engajamento por Jogo</CardTitle>
            </CardHeader>
            <CardContent className="h-[450px] px-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#001D3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}
                  />
                  <Bar dataKey="value" radius={[16, 16, 16, 16]} barSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 rounded-[48px] p-10 backdrop-blur-3xl shadow-2xl">
            <CardHeader className="px-0 pt-0 pb-12">
              <CardTitle className="text-3xl font-black tracking-tight text-white uppercase">Sessões Recentes</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-6">
                {stats.sessions.slice(-6).reverse().map((session, i) => (
                  <div key={i} className="flex justify-between items-center p-8 rounded-[32px] bg-white/5 border border-white/5 hover:border-[#C5A059]/30 transition-all">
                    <div>
                      <div className="font-black text-2xl leading-none mb-3 text-[#C5A059] uppercase tracking-tight">{session.reward}</div>
                      <div className="text-xs text-white/30 font-black uppercase tracking-widest">{session.game}</div>
                    </div>
                    <div className="text-xs text-white/50 font-black uppercase bg-white/5 px-5 py-3 rounded-full border border-white/10">
                      {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                {stats.sessions.length === 0 && (
                  <div className="text-center py-24 text-white/10 font-black text-2xl uppercase tracking-widest">Aguardando dados...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
