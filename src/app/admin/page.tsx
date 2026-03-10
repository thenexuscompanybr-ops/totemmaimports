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

  const COLORS = ['#001D3D', '#003566', '#C5A059', '#E8E8ED']

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-12 font-body selection:bg-[#001D3D] selection:text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-16">
          <div>
            <Link href="/" className="flex items-center gap-2 text-sm font-bold text-[#001D3D]/30 hover:text-[#001D3D] transition-all mb-4">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Totem
            </Link>
            <h1 className="text-5xl font-bold tracking-tight text-[#001D3D]">MA Discovery Admin</h1>
            <p className="text-[#C5A059] font-bold uppercase text-[10px] tracking-[0.4em] mt-3">Gestão de Engajamento</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { label: 'Interações Totais', value: stats.total, icon: Users, color: 'text-[#001D3D]' },
            { label: 'Sessões Hoje', value: stats.today, icon: TrendingUp, color: 'text-[#C5A059]' },
            { label: 'Status Sistema', value: 'Online', icon: Activity, color: 'text-green-500' },
          ].map((stat, i) => (
            <Card key={i} className="bg-white border-none rounded-[3rem] shadow-sm p-10">
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl bg-[#F7F8FA] ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
              </div>
              <div className="text-5xl font-bold mb-2 text-[#001D3D]">{stat.value}</div>
              <div className="text-[10px] text-[#001D3D]/30 uppercase tracking-[0.3em] font-black">{stat.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="bg-white border-none rounded-[3rem] shadow-sm p-8">
            <CardHeader className="px-0 pt-0 pb-10">
              <CardTitle className="text-2xl font-bold tracking-tight text-[#001D3D]">Popularidade por Jogo</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] px-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00000005" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#001D3D05' }}
                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,29,61,0.05)' }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white border-none rounded-[3rem] shadow-sm p-8">
            <CardHeader className="px-0 pt-0 pb-10">
              <CardTitle className="text-2xl font-bold tracking-tight text-[#001D3D]">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-4">
                {stats.sessions.slice(-6).reverse().map((session, i) => (
                  <div key={i} className="flex justify-between items-center p-8 rounded-[2.5rem] bg-[#F7F8FA] border border-[#001D3D]/05">
                    <div>
                      <div className="font-bold text-xl leading-none mb-2 text-[#C5A059]">{session.reward}</div>
                      <div className="text-xs text-[#001D3D]/30 font-black uppercase tracking-widest">{session.game}</div>
                    </div>
                    <div className="text-[10px] text-[#001D3D]/40 font-black uppercase bg-white px-4 py-2 rounded-full border border-[#001D3D]/05">
                      {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                {stats.sessions.length === 0 && (
                  <div className="text-center py-20 text-[#001D3D]/20 font-bold">Nenhuma atividade registrada ainda.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
