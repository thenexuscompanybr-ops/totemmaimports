"use client"

import * as React from "react"
import Image from "next/image"
import { 
  ChevronRight, Star, Smartphone, Box, RotateCcw, Zap, 
  QrCode, MessageCircle, Trophy, Timer, MousePointer2, ArrowLeft
} from "lucide-react"
import { GlassButton } from "@/components/ma/GlassButton"
import { cn } from "@/lib/utils"
import { CouponRewards, saveGameSession } from "@/lib/coupon-service"
import { PlaceHolderImages } from "@/lib/placeholder-images"

type AppState = 'hero' | 'choice' | 'game-box' | 'game-wheel' | 'game-speed' | 'result' | 'evaluation' | 'final'

export default function MADiscovery() {
  const [state, setState] = React.useState<AppState>('hero')
  const [reward, setReward] = React.useState<string | null>(null)
  
  // Game States
  const [isSpinning, setIsSpinning] = React.useState(false)
  const [rotation, setRotation] = React.useState(0)
  const [speedScore, setSpeedScore] = React.useState(0)
  const [speedActive, setSpeedActive] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(10)
  const [targetPos, setTargetPos] = React.useState({ top: '50%', left: '50%' })

  const resetToHero = () => {
    setState('hero')
    setIsSpinning(false)
    setSpeedActive(false)
    setSpeedScore(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const finalizeGame = (gameName: string) => {
    const prize = CouponRewards[Math.floor(Math.random() * CouponRewards.length)]
    setReward(prize)
    saveGameSession(gameName, prize)
    setTimeout(() => {
      setState('result')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 500)
  }

  // --- Roda Tech Logic ---
  const spinWheel = () => {
    if (isSpinning) return
    setIsSpinning(true)
    const newRotation = rotation + 1440 + Math.random() * 360
    setRotation(newRotation)
    setTimeout(() => {
      finalizeGame('Roda Tech')
      setIsSpinning(false)
    }, 4000)
  }

  // --- Toque Rápido Logic ---
  const startSpeedGame = () => {
    setSpeedScore(0)
    setTimeLeft(10)
    setSpeedActive(true)
    moveTarget()
  }

  const moveTarget = () => {
    const top = Math.random() * 60 + 20 + '%'
    const left = Math.random() * 60 + 20 + '%'
    setTargetPos({ top, left })
  }

  const handleTargetHit = () => {
    if (!speedActive) return
    setSpeedScore(s => s + 1)
    moveTarget()
  }

  React.useEffect(() => {
    if (speedActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (speedActive && timeLeft === 0) {
      setSpeedActive(false)
      finalizeGame('Toque Rápido')
    }
  }, [speedActive, timeLeft])

  const iphoneImg = PlaceHolderImages.find(img => img.id === 'iphone-hero')

  return (
    <main className="relative z-10 mx-auto max-w-7xl min-h-screen flex flex-col pb-20 font-body antialiased">
      {/* Navigation */}
      <nav className="p-8 flex justify-between items-center animate-fade-in shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white text-background rounded-xl flex items-center justify-center shadow-sm">
            <Smartphone className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight">MA <span className="opacity-50">Discovery</span></span>
        </div>
        {state !== 'hero' && state !== 'final' && state !== 'result' && (
          <button 
            onClick={() => setState('choice')}
            className="flex items-center gap-2 text-sm font-medium opacity-50 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        )}
      </nav>

      <div className="relative flex-1 flex flex-col items-center justify-center py-12">
        
        {/* HERO STATE */}
        {state === 'hero' && (
          <div className="flex flex-col items-center text-center px-6 animate-fade-in max-w-5xl">
            <div className="relative mb-12 animate-float">
              <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-125" />
              <div className="relative w-[240px] h-[480px] md:w-[320px] md:h-[640px]">
                <Image 
                  src={iphoneImg?.imageUrl || ""} 
                  alt="iPhone Premium"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-[0.9]">
              Pura Magia.<br/><span className="opacity-40">Em suas mãos.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 font-medium max-w-2xl">
              A experiência Apple elevada ao máximo pela MA Imports.
            </p>
            <GlassButton size="xl" onClick={() => setState('choice')} className="min-w-[280px] h-20 text-xl rounded-2xl shadow-xl">
              Começar Desafio <ChevronRight className="ml-2 w-6 h-6" />
            </GlassButton>
          </div>
        )}

        {/* CHOICE STATE */}
        {state === 'choice' && (
          <div className="w-full px-6 animate-fade-in max-w-5xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center tracking-tight">Escolha seu caminho.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { id: 'game-box', icon: Box, name: 'Caixas', desc: 'Escolha uma das caixas surpresa.', color: 'bg-zinc-900' },
                { id: 'game-wheel', icon: RotateCcw, name: 'Roleta', desc: 'Gire para ganhar benefícios.', color: 'bg-zinc-900' },
                { id: 'game-speed', icon: Zap, name: 'Reflexo', desc: 'Teste sua agilidade em 10s.', color: 'bg-zinc-900' },
              ].map((game) => (
                <button
                  key={game.id}
                  onClick={() => setState(game.id as any)}
                  className="p-10 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col items-center text-center group hover:bg-zinc-900 transition-all duration-300 shadow-sm"
                >
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 bg-zinc-800 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                    <game.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">{game.name}</h3>
                  <p className="text-muted-foreground leading-relaxed opacity-60">{game.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: CAIXA PREMIADA */}
        {state === 'game-box' && (
          <div className="flex flex-col items-center animate-fade-in px-6">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Caixa Premiada</h2>
            <p className="text-xl text-muted-foreground mb-16 opacity-60">Escolha uma para revelar seu benefício.</p>
            <div className="flex flex-wrap justify-center gap-8">
              {[0, 1, 2].map((i) => (
                <button 
                  key={i} 
                  onClick={() => finalizeGame('Caixa Premiada')}
                  className="w-48 h-48 md:w-56 md:h-56 bg-zinc-900/80 rounded-[40px] border border-white/5 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center group"
                >
                  <Box className="w-20 h-20 text-white opacity-20 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: RODA TECH */}
        {state === 'game-wheel' && (
          <div className="flex flex-col items-center animate-fade-in px-6">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Roda Tech</h2>
            <p className="text-xl text-muted-foreground mb-16 opacity-60">Gire a roleta premium.</p>
            
            <div className="relative mb-16">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
                <div className="w-6 h-10 bg-white rounded-full border-4 border-zinc-900 shadow-xl" />
              </div>
              <div 
                className="w-72 h-72 md:w-[420px] md:h-[420px] rounded-full border-8 border-white/5 bg-zinc-900 shadow-2xl transition-transform duration-[4000ms] ease-out flex items-center justify-center overflow-hidden"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="grid grid-cols-2 grid-rows-2 w-full h-full rotate-45 opacity-40">
                   <div className="border-r border-b border-white/5 flex items-center justify-center"><Star className="w-12 h-12 -rotate-45" /></div>
                   <div className="border-l border-b border-white/5 flex items-center justify-center"><Smartphone className="w-12 h-12 -rotate-45" /></div>
                   <div className="border-r border-t border-white/5 flex items-center justify-center"><Zap className="w-12 h-12 -rotate-45" /></div>
                   <div className="border-l border-t border-white/5 flex items-center justify-center"><Trophy className="w-12 h-12 -rotate-45" /></div>
                </div>
              </div>
            </div>

            <GlassButton size="lg" onClick={spinWheel} disabled={isSpinning} className="min-w-[240px] h-16 rounded-2xl font-bold">
              {isSpinning ? 'Girando...' : 'Girar'}
            </GlassButton>
          </div>
        )}

        {/* GAME: TOQUE RÁPIDO */}
        {state === 'game-speed' && (
          <div className="flex flex-col items-center w-full px-6 animate-fade-in max-w-4xl">
            {!speedActive && speedScore === 0 ? (
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4 tracking-tight">Toque Rápido</h2>
                <p className="text-xl text-muted-foreground mb-12 opacity-60">Toque no maior número de iPhones em 10 segundos.</p>
                <GlassButton size="lg" onClick={startSpeedGame} className="min-w-[240px] h-16 rounded-2xl">Começar</GlassButton>
              </div>
            ) : (
              <div className="relative w-full aspect-square md:aspect-video bg-zinc-900/50 border border-white/5 rounded-[40px] overflow-hidden min-h-[400px] shadow-2xl">
                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-16 z-20">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Tempo</span>
                    <div className="text-4xl font-bold flex items-center gap-2"> {timeLeft}s</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Pontos</span>
                    <div className="text-4xl font-bold flex items-center gap-2"> {speedScore}</div>
                  </div>
                </div>
                
                <button
                  onClick={handleTargetHit}
                  className="absolute w-24 h-24 bg-white text-background rounded-3xl shadow-2xl animate-pulse flex items-center justify-center transition-all duration-100 active:scale-125"
                  style={{ top: targetPos.top, left: targetPos.left }}
                >
                  <Smartphone className="w-12 h-12" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESULT STATE */}
        {state === 'result' && (
          <div className="flex flex-col items-center text-center px-6 animate-scale-in max-w-3xl">
            <div className="w-24 h-24 rounded-3xl bg-white text-background flex items-center justify-center mb-12 shadow-2xl">
              <Trophy className="w-12 h-12" />
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Incrível.</h2>
            <p className="text-2xl md:text-3xl font-medium opacity-60 mb-16">Você conquistou:</p>
            
            <div className="bg-white text-background px-12 py-10 rounded-[40px] mb-16 shadow-2xl w-full">
              <h3 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">{reward}</h3>
            </div>

            <GlassButton size="lg" onClick={() => setState('evaluation')} className="min-w-[280px] h-16 rounded-2xl">
              Próximo Passo <ChevronRight className="ml-2 w-6 h-6" />
            </GlassButton>
          </div>
        )}

        {/* EVALUATION STATE */}
        {state === 'evaluation' && (
          <div className="flex flex-col items-center text-center px-6 animate-fade-in max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight leading-[1.1]">Conte sua<br/>experiência.</h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-16 font-medium leading-relaxed opacity-60">
              Sua avaliação nos ajuda a manter o padrão premium MA Imports.
            </p>
            
            <div className="flex flex-col gap-6 w-full">
              <GlassButton variant="primary" size="lg" className="w-full h-20 text-xl rounded-2xl bg-white text-background hover:bg-zinc-200">
                <Star className="w-6 h-6 fill-current" /> Avaliar no Google
              </GlassButton>
              <button 
                onClick={() => setState('final')}
                className="text-lg opacity-40 hover:opacity-100 transition-opacity py-4 font-medium"
              >
                Pular
              </button>
            </div>
          </div>
        )}

        {/* FINAL STATE */}
        {state === 'final' && (
          <div className="flex flex-col items-center text-center px-6 animate-fade-in max-w-2xl">
            <div className="bg-white p-10 rounded-[50px] mb-16 shadow-2xl">
              <QrCode className="w-64 h-64 text-background" />
            </div>
            
            <h2 className="text-5xl font-bold mb-6 tracking-tight">Catálogo Digital.</h2>
            <p className="text-xl text-muted-foreground mb-16 font-medium opacity-60">Escaneie para explorar todos os nossos produtos.</p>

            <div className="flex flex-col gap-6 w-full">
              <GlassButton className="bg-[#25D366] hover:bg-[#20ba59] border-none h-20 text-xl rounded-2xl text-white shadow-lg">
                <MessageCircle className="w-6 h-6 fill-current" /> Falar com Especialista
              </GlassButton>
              <button 
                onClick={resetToHero}
                className="text-lg opacity-40 hover:opacity-100 transition-opacity py-4 font-medium"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="p-12 text-center text-xs tracking-[0.3em] font-bold uppercase opacity-20 shrink-0">
        MA IMPORTS — Premium Quality Since 2012
      </footer>
    </main>
  )
}
