"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronRight, Star, Smartphone, Box, RotateCcw, Zap, ExternalLink, QrCode, MessageCircle } from "lucide-react"
import { GlassButton } from "@/components/ma/GlassButton"
import { cn } from "@/lib/utils"
import { generateCouponCode, CouponRewards, saveGameSession } from "@/lib/coupon-service"
import { PlaceHolderImages } from "@/lib/placeholder-images"

type AppState = 'hero' | 'choice' | 'game' | 'result' | 'evaluation' | 'final'

export default function MADiscovery() {
  const [state, setState] = React.useState<AppState>('hero')
  const [selectedGame, setSelectedGame] = React.useState<string | null>(null)
  const [reward, setReward] = React.useState<{ text: string, code: string } | null>(null)
  const [isOpening, setIsOpening] = React.useState(false)

  const iphoneImg = PlaceHolderImages.find(img => img.id === 'iphone-hero')

  const handleStart = () => setState('choice')
  
  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId)
    setState('game')
  }

  const handleBoxClick = (index: number) => {
    if (isOpening) return
    setIsOpening(true)
    
    // Simulate premium reveal animation
    setTimeout(() => {
      const code = generateCouponCode()
      const prize = CouponRewards[Math.floor(Math.random() * CouponRewards.length)]
      setReward({ text: prize, code })
      saveGameSession('Caixa Premiada', prize, code)
      setState('result')
      setIsOpening(false)
    }, 1200)
  }

  const renderHero = () => (
    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-6 animate-fade-in">
      <div className="relative mb-12 animate-float">
        <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-125" />
        <Image 
          src={iphoneImg?.imageUrl || ""} 
          alt="iPhone Premium"
          width={280}
          height={560}
          className="relative drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[40px]"
          data-ai-hint="iphone premium 3d"
        />
      </div>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-gradient">
        Teste sua sorte
      </h1>
      <p className="text-xl text-muted-foreground max-w-md mb-12 font-light">
        Jogue o mini game e descubra uma vantagem exclusiva na MA Imports.
      </p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <GlassButton size="xl" onClick={handleStart} className="w-full">
          COMEÇAR <ChevronRight className="w-5 h-5" />
        </GlassButton>
        <button className="text-muted-foreground hover:text-white transition-colors text-sm font-medium py-2 flex items-center justify-center gap-2">
          Avaliar nossa loja <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  const renderChoice = () => (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-6 animate-fade-in">
      <h2 className="text-3xl font-bold mb-12 text-gradient">Escolha seu desafio</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {[
          { id: 'box', icon: Box, name: 'Caixa Premiada', desc: 'Escolha uma caixa e revele seu prêmio' },
          { id: 'wheel', icon: RotateCcw, name: 'Roda Tech', desc: 'Gire a roleta de tecnologia MA' },
          { id: 'speed', icon: Zap, name: 'Toque Rápido', desc: 'Desafio de reflexos com o iPhone' },
        ].map((game) => (
          <button
            key={game.id}
            onClick={() => handleGameSelect(game.id)}
            className="glass-dark p-8 rounded-[32px] flex flex-col items-center text-center group hover:bg-primary/10 transition-all duration-500 border-white/5 hover:border-primary/50"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <game.icon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">{game.name}</h3>
            <p className="text-sm text-muted-foreground font-light">{game.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )

  const renderGame = () => (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-6 animate-fade-in">
      <h2 className="text-3xl font-bold mb-4 text-gradient">Caixa Premiada</h2>
      <p className="text-muted-foreground mb-16 font-light">Toque em uma das caixas para abrir</p>
      
      <div className="flex gap-8 perspective-1000">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            onClick={() => handleBoxClick(i)}
            className={cn(
              "w-28 h-28 md:w-40 md:h-40 glass-dark rounded-3xl cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95 flex items-center justify-center group",
              isOpening && "animate-pulse"
            )}
          >
            <Box className={cn(
              "w-12 h-12 md:w-16 md:h-16 text-primary group-hover:text-accent transition-colors duration-500",
              isOpening && "opacity-50"
            )} />
          </div>
        ))}
      </div>
    </div>
  )

  const renderResult = () => (
    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-6 animate-scale-in">
      <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mb-8">
        <Star className="w-12 h-12 text-accent" />
      </div>
      <h2 className="text-4xl font-bold mb-2">Vantagem Desbloqueada!</h2>
      <p className="text-xl text-muted-foreground mb-12 font-light">{reward?.text}</p>
      
      <div className="glass-dark px-12 py-8 rounded-[32px] border-accent/20 mb-12 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <span className="text-xs uppercase tracking-[0.2em] text-accent font-bold mb-2 block">CÓDIGO DE RESGATE</span>
        <span className="text-5xl font-bold font-mono tracking-widest">{reward?.code}</span>
      </div>

      <p className="text-muted-foreground mb-12 max-w-sm font-light">
        Apresente este código para um atendente e aproveite sua condição especial.
      </p>

      <GlassButton size="lg" onClick={() => setState('evaluation')} className="min-w-[200px]">
        CONTINUAR
      </GlassButton>
    </div>
  )

  const renderEvaluation = () => (
    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-6 animate-fade-in">
      <h2 className="text-3xl font-bold mb-6">Curtiu a experiência?</h2>
      <p className="text-muted-foreground max-w-md mb-12 font-light">
        Sua avaliação no Google nos ajuda a trazer mais tecnologia e segurança para a região.
      </p>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <GlassButton variant="gold" size="lg" className="w-full flex gap-2">
          <Star className="w-5 h-5 fill-current" /> AVALIAR NO GOOGLE
        </GlassButton>
        <button 
          onClick={() => setState('final')}
          className="text-muted-foreground hover:text-white transition-colors"
        >
          Pular por enquanto
        </button>
      </div>
    </div>
  )

  const renderFinal = () => (
    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-6 animate-fade-in">
      <div className="glass-dark p-6 rounded-[40px] mb-12">
        <div className="bg-white p-4 rounded-3xl">
          <QrCode className="w-48 h-48 text-background" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold mb-4">Veja nossas ofertas</h2>
      <p className="text-muted-foreground mb-12 font-light">Escaneie o QR Code ou fale com um especialista.</p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <GlassButton className="bg-[#25D366] hover:bg-[#20ba59] border-none">
          <MessageCircle className="w-5 h-5 fill-current" /> WHATSAPP
        </GlassButton>
        <GlassButton variant="secondary">
          VER TODAS AS OFERTAS
        </GlassButton>
      </div>

      <button 
        onClick={() => setState('hero')}
        className="mt-12 text-muted-foreground/50 hover:text-muted-foreground text-sm flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" /> REINICIAR EXPERIÊNCIA
      </button>
    </div>
  )

  return (
    <main className="relative z-10 mx-auto max-w-7xl">
      <nav className="p-8 flex justify-between items-center animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <Smartphone className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">MA <span className="text-primary">Discovery</span></span>
        </div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold glass-dark px-4 py-2 rounded-full border-white/5">
          Premium Experience
        </div>
      </nav>

      <div className="relative">
        {state === 'hero' && renderHero()}
        {state === 'choice' && renderChoice()}
        {state === 'game' && renderGame()}
        {state === 'result' && renderResult()}
        {state === 'evaluation' && renderEvaluation()}
        {state === 'final' && renderFinal()}
      </div>

      <footer className="p-8 text-center text-muted-foreground/30 text-xs tracking-widest font-medium uppercase">
        MA IMPORTS © {new Date().getFullYear()} — TECNOLOGIA PREMIUM
      </footer>
    </main>
  )
}
