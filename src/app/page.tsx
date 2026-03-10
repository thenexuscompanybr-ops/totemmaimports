"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronRight, Star, Smartphone, Box, RotateCcw, Zap, ExternalLink, QrCode, MessageCircle } from "lucide-react"
import { GlassButton } from "@/components/ma/GlassButton"
import { cn } from "@/lib/utils"
import { generateCouponCode, CouponRewards, saveGameSession } from "@/lib/coupon-service"
import { PlaceHolderImages } from "@/lib/placeholder-images"

type AppState = 'hero' | 'choice' | 'game' | 'result' | 'evaluation' | 'final'

const IDLE_TIMEOUT = 120000 // 2 minutos para totem

export default function MADiscovery() {
  const [state, setState] = React.useState<AppState>('hero')
  const [selectedGame, setSelectedGame] = React.useState<string | null>(null)
  const [reward, setReward] = React.useState<{ text: string, code: string } | null>(null)
  const [isOpening, setIsOpening] = React.useState(false)

  // Reset por inatividade para Totem
  React.useEffect(() => {
    let timer: NodeJS.Timeout
    
    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (state !== 'hero') setState('hero')
      }, IDLE_TIMEOUT)
    }

    window.addEventListener('mousedown', resetTimer)
    window.addEventListener('touchstart', resetTimer)
    window.addEventListener('scroll', resetTimer)
    window.addEventListener('keydown', resetTimer)

    resetTimer()

    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousedown', resetTimer)
      window.removeEventListener('touchstart', resetTimer)
      window.removeEventListener('scroll', resetTimer)
      window.removeEventListener('keydown', resetTimer)
    }
  }, [state])

  const iphoneImg = PlaceHolderImages.find(img => img.id === 'iphone-hero')

  const handleStart = () => setState('choice')
  
  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId)
    setState('game')
  }

  const handleBoxClick = (index: number) => {
    if (isOpening) return
    setIsOpening(true)
    
    // Simulação de abertura
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
          width={320}
          height={640}
          className="relative drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[40px]"
          priority
        />
      </div>
      <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 text-gradient">
        Teste sua sorte
      </h1>
      <p className="text-2xl text-muted-foreground max-w-lg mb-12 font-light leading-relaxed">
        Toque abaixo para começar a sua jornada premium na MA Imports.
      </p>
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <GlassButton size="xl" onClick={handleStart} className="w-full h-24 text-2xl">
          COMEÇAR AGORA <ChevronRight className="w-8 h-8" />
        </GlassButton>
      </div>
    </div>
  )

  const renderChoice = () => (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-6 animate-fade-in">
      <h2 className="text-4xl font-bold mb-12 text-gradient">Escolha seu desafio</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {[
          { id: 'box', icon: Box, name: 'Caixa Premiada', desc: 'Escolha uma caixa e revele seu prêmio' },
          { id: 'wheel', icon: RotateCcw, name: 'Roda Tech', desc: 'Gire a roleta de tecnologia MA' },
          { id: 'speed', icon: Zap, name: 'Toque Rápido', desc: 'Desafio de reflexos com o iPhone' },
        ].map((game) => (
          <button
            key={game.id}
            onClick={() => handleGameSelect(game.id)}
            className="glass-dark p-10 rounded-[40px] flex flex-col items-center text-center group hover:bg-primary/10 transition-all duration-500 border-white/5 hover:border-primary/50"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <game.icon className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{game.name}</h3>
            <p className="text-lg text-muted-foreground font-light">{game.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )

  const renderGame = () => (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-6 animate-fade-in">
      <h2 className="text-4xl font-bold mb-6 text-gradient">Caixa Premiada</h2>
      <p className="text-xl text-muted-foreground mb-20 font-light">Toque em uma das caixas para abrir</p>
      
      <div className="flex gap-12 perspective-1000">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            onClick={() => handleBoxClick(i)}
            className={cn(
              "w-40 h-40 md:w-56 md:h-56 glass-dark rounded-[40px] cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95 flex items-center justify-center group",
              isOpening && "animate-pulse"
            )}
          >
            <Box className={cn(
              "w-20 h-20 md:w-28 md:h-28 text-primary group-hover:text-accent transition-colors duration-500",
              isOpening && "opacity-50"
            )} />
          </div>
        ))}
      </div>
    </div>
  )

  const renderResult = () => (
    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-6 animate-scale-in">
      <div className="w-32 h-32 rounded-full bg-accent/20 flex items-center justify-center mb-10">
        <Star className="w-16 h-16 text-accent" />
      </div>
      <h2 className="text-5xl font-bold mb-4">Vantagem Desbloqueada!</h2>
      <p className="text-2xl text-muted-foreground mb-16 font-light">{reward?.text}</p>
      
      <div className="glass-dark px-16 py-10 rounded-[48px] border-accent/20 mb-16 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <span className="text-sm uppercase tracking-[0.3em] text-accent font-bold mb-4 block">CÓDIGO DE RESGATE</span>
        <span className="text-6xl md:text-7xl font-bold font-mono tracking-widest">{reward?.code}</span>
      </div>

      <p className="text-xl text-muted-foreground mb-16 max-w-md font-light">
        Apresente este código para um atendente e aproveite sua condição especial.
      </p>

      <GlassButton size="xl" onClick={() => setState('evaluation')} className="min-w-[280px] h-20">
        CONTINUAR
      </GlassButton>
    </div>
  )

  const renderEvaluation = () => (
    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-6 animate-fade-in">
      <h2 className="text-4xl font-bold mb-8">Curtiu a experiência?</h2>
      <p className="text-2xl text-muted-foreground max-w-lg mb-16 font-light leading-relaxed">
        Sua avaliação no Google nos ajuda a trazer mais tecnologia e segurança para a região.
      </p>
      
      <div className="flex flex-col gap-6 w-full max-w-md">
        <GlassButton variant="gold" size="xl" className="w-full h-24 flex gap-3 text-2xl">
          <Star className="w-8 h-8 fill-current" /> AVALIAR NO GOOGLE
        </GlassButton>
        <button 
          onClick={() => setState('final')}
          className="text-xl text-muted-foreground hover:text-white transition-colors py-4"
        >
          Pular por enquanto
        </button>
      </div>
    </div>
  )

  const renderFinal = () => (
    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-6 animate-fade-in">
      <div className="glass-dark p-8 rounded-[48px] mb-12">
        <div className="bg-white p-6 rounded-3xl">
          <QrCode className="w-64 h-64 text-background" />
        </div>
      </div>
      
      <h2 className="text-4xl font-bold mb-6">Veja nossas ofertas</h2>
      <p className="text-xl text-muted-foreground mb-16 font-light">Escaneie o QR Code ou fale com um especialista.</p>

      <div className="flex flex-col gap-6 w-full max-w-md">
        <GlassButton className="bg-[#25D366] hover:bg-[#20ba59] border-none h-20 text-xl">
          <MessageCircle className="w-6 h-6 fill-current" /> CHAMAR NO WHATSAPP
        </GlassButton>
        <GlassButton variant="secondary" className="h-20 text-xl">
          VER TODAS AS OFERTAS
        </GlassButton>
      </div>

      <button 
        onClick={() => setState('hero')}
        className="mt-16 text-muted-foreground/50 hover:text-muted-foreground text-lg flex items-center gap-3"
      >
        <RotateCcw className="w-6 h-6" /> REINICIAR EXPERIÊNCIA
      </button>
    </div>
  )

  return (
    <main className="relative z-10 mx-auto max-w-7xl h-screen flex flex-col overflow-hidden">
      <nav className="p-10 flex justify-between items-center animate-fade-in shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
            <Smartphone className="text-white w-8 h-8" />
          </div>
          <span className="font-bold text-3xl tracking-tight">MA <span className="text-primary">Discovery</span></span>
        </div>
        <div className="text-sm uppercase tracking-widest text-muted-foreground font-bold glass-dark px-6 py-3 rounded-full border-white/5">
          Kiosk Edition
        </div>
      </nav>

      <div className="relative flex-1">
        {state === 'hero' && renderHero()}
        {state === 'choice' && renderChoice()}
        {state === 'game' && renderGame()}
        {state === 'result' && renderResult()}
        {state === 'evaluation' && renderEvaluation()}
        {state === 'final' && renderFinal()}
      </div>

      <footer className="p-10 text-center text-muted-foreground/30 text-sm tracking-widest font-medium uppercase shrink-0">
        MA IMPORTS © {new Date().getFullYear()} — TECNOLOGIA PREMIUM
      </footer>
    </main>
  )
}
