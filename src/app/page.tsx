"use client"

import * as React from "react"
import { 
  ChevronRight, Box, RotateCcw, Zap, 
  QrCode, Star, Trophy, ArrowLeft, Gift, 
  Smartphone, Monitor
} from "lucide-react"
import { GlassButton } from "@/components/ma/GlassButton"
import { CouponRewards, saveGameSession } from "@/lib/coupon-service"
import { cn } from "@/lib/utils"

type AppState = 'hero' | 'choice' | 'game-box' | 'game-wheel' | 'game-speed' | 'result' | 'google-incentive' | 'qr-code'

export default function TotemExperience() {
  const [state, setState] = React.useState<AppState>('hero')
  const [reward, setReward] = React.useState<string | null>(null)
  
  // Game States
  const [isSpinning, setIsSpinning] = React.useState(false)
  const [rotation, setRotation] = React.useState(0)
  const [speedScore, setSpeedScore] = React.useState(0)
  const [speedActive, setSpeedActive] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(5) // Fast 5s game
  const [targetPos, setTargetPos] = React.useState({ top: '50%', left: '50%' })
  const [selectedBox, setSelectedBox] = React.useState<number | null>(null)

  const resetToHero = React.useCallback(() => {
    setState('hero')
    setIsSpinning(false)
    setSpeedActive(false)
    setSpeedScore(0)
    setSelectedBox(null)
    setReward(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // 1. Reset por Inatividade (2 minutos)
  React.useEffect(() => {
    if (state === 'hero') return;
    const timer = setTimeout(() => resetToHero(), 120000);
    const handleInteraction = () => clearTimeout(timer);
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('mousedown', handleInteraction);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
    };
  }, [state, resetToHero]);

  // 2. Reset Automático Final (15 segundos na tela de QR)
  React.useEffect(() => {
    if (state === 'qr-code') {
      const timer = setTimeout(() => resetToHero(), 15000);
      return () => clearTimeout(timer);
    }
  }, [state, resetToHero]);

  const finalizeGame = (gameName: string) => {
    const prize = CouponRewards[Math.floor(Math.random() * CouponRewards.length)]
    setReward(prize)
    saveGameSession(gameName, prize)
    setTimeout(() => {
      setState('result')
    }, 800)
  }

  // Wheel Logic (3s duration)
  const spinWheel = () => {
    if (isSpinning) return
    setIsSpinning(true)
    const extraDegrees = 1440 + Math.random() * 360
    const newRotation = rotation + extraDegrees
    setRotation(newRotation)
    setTimeout(() => {
      finalizeGame('Roda Tech')
      setIsSpinning(false)
    }, 3000)
  }

  // Speed Game Logic (5s duration)
  const startSpeedGame = () => {
    setSpeedScore(0)
    setTimeLeft(5)
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

  return (
    <main className="fixed inset-0 w-screen h-screen flex flex-col bg-[#F7F8FA] overflow-hidden select-none">
      
      {/* Header Fixo */}
      <header className="h-24 px-12 flex justify-between items-center glass-nav border-b border-black/5 z-50">
        <div className="flex items-center gap-4" onClick={resetToHero}>
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">MA Discovery</span>
        </div>
        {state !== 'hero' && (
          <button onClick={resetToHero} className="flex items-center gap-2 text-lg font-bold opacity-30 active:opacity-100">
            <ArrowLeft className="w-5 h-5" /> Início
          </button>
        )}
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* TELA 1: HERO */}
        {state === 'hero' && (
          <div className="flex flex-col items-center text-center px-12 animate-reveal max-w-5xl">
            <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-extrabold tracking-tight leading-[1] mb-12">
              Teste sua sorte.
            </h1>
            <p className="text-2xl md:text-3xl text-black/50 font-medium mb-20 max-w-3xl leading-relaxed">
              Interaja com nossa tecnologia e ganhe um benefício exclusivo agora mesmo.
            </p>
            <GlassButton size="totem" onClick={() => setState('choice')} className="w-full max-w-md">
              COMEÇAR <ChevronRight className="w-8 h-8" />
            </GlassButton>
          </div>
        )}

        {/* TELA DE ESCOLHA */}
        {state === 'choice' && (
          <div className="w-full max-w-7xl px-12 animate-reveal text-center">
            <h2 className="text-5xl font-bold mb-20 tracking-tight">Qual desafio você prefere?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { id: 'game-box', icon: Box, name: 'Caixa Surpresa', desc: 'Sua intuição.' },
                { id: 'game-wheel', icon: RotateCcw, name: 'Roleta Tech', desc: 'Momento de sorte.' },
                { id: 'game-speed', icon: Zap, name: 'Toque Rápido', desc: 'Reflexos digitais.' },
              ].map((game) => (
                <button
                  key={game.id}
                  onClick={() => setState(game.id as any)}
                  className="bg-white p-16 rounded-[40px] shadow-sm border border-black/5 flex flex-col items-center group active:scale-95 transition-all duration-300"
                >
                  <div className="w-24 h-24 rounded-3xl bg-black/5 flex items-center justify-center mb-10 group-active:bg-black group-active:text-white transition-colors">
                    <game.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 tracking-tight">{game.name}</h3>
                  <p className="text-xl text-black/40 font-medium">{game.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: CAIXA SURPRESA */}
        {state === 'game-box' && (
          <div className="w-full max-w-6xl px-12 animate-reveal text-center">
            <h2 className="text-4xl font-bold mb-16 opacity-40">Escolha uma caixa</h2>
            <div className="grid grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <button 
                  key={i} 
                  onClick={() => { setSelectedBox(i); finalizeGame('Caixa Surpresa'); }}
                  className={cn(
                    "relative aspect-square bg-white rounded-[40px] border border-black/5 flex items-center justify-center active:scale-90 transition-all duration-300 shadow-sm",
                    selectedBox === i && "border-black animate-pulse"
                  )}
                >
                  <Gift className="w-24 h-24 text-black/10" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: ROLETA TECH */}
        {state === 'game-wheel' && (
          <div className="flex flex-col items-center animate-reveal">
            <div className="relative mb-20">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-black" />
              </div>
              <div className="p-6 bg-white rounded-full shadow-2xl border border-black/5">
                <div 
                  className="w-[450px] h-[450px] md:w-[600px] md:h-[600px] rounded-full bg-[#F7F8FA] relative transition-transform duration-[3000ms] ease-[cubic-bezier(0.15,0,0.15,1)] flex items-center justify-center overflow-hidden border border-black/5"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {[0, 1, 2, 3].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-full h-full" 
                      style={{ 
                        transform: `rotate(${i * 90}deg)`,
                        background: i % 2 === 0 ? 'white' : 'rgba(0,0,0,0.02)',
                        transformOrigin: 'center'
                      }} 
                    />
                  ))}
                  <div className="absolute z-20 w-40 h-40 bg-white rounded-full shadow-xl flex items-center justify-center">
                    <Smartphone className="w-12 h-12 text-black" />
                  </div>
                </div>
              </div>
            </div>
            <GlassButton size="totem" onClick={spinWheel} disabled={isSpinning} className="w-full min-w-[400px]">
              {isSpinning ? 'Girando...' : 'GIRAR AGORA'}
            </GlassButton>
          </div>
        )}

        {/* GAME: TOQUE RÁPIDO */}
        {state === 'game-speed' && (
          <div className="w-full max-w-5xl px-12 animate-reveal flex flex-col items-center">
            {!speedActive && speedScore === 0 ? (
              <div className="text-center">
                <h2 className="text-5xl font-extrabold mb-12">Você é rápido?</h2>
                <GlassButton size="totem" onClick={startSpeedGame} className="min-w-[400px]">COMEÇAR (5s)</GlassButton>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="flex justify-between w-full mb-12">
                  <div className="text-3xl font-bold opacity-30 uppercase tracking-widest">Tempo: {timeLeft}s</div>
                  <div className="text-3xl font-bold uppercase tracking-widest">Score: {speedScore}</div>
                </div>
                <div className="relative w-full aspect-[16/9] bg-white border-2 border-black/5 rounded-[48px] overflow-hidden shadow-inner">
                  <button
                    onClick={handleTargetHit}
                    className="absolute w-32 h-32 bg-black text-white rounded-[32px] shadow-2xl flex items-center justify-center transition-all duration-100 active:scale-125"
                    style={{ top: targetPos.top, left: targetPos.left }}
                  >
                    <Zap className="w-12 h-12 fill-current" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TELA 3: RESULTADO */}
        {state === 'result' && (
          <div className="flex flex-col items-center text-center px-12 animate-reveal">
            <div className="w-32 h-32 rounded-[40px] bg-black flex items-center justify-center mb-16 shadow-2xl animate-float">
              <Trophy className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-6xl font-bold mb-6 tracking-tight">Parabéns!</h2>
            <p className="text-xl uppercase tracking-[0.4em] font-bold opacity-30 mb-16">Seu benefício exclusivo é:</p>
            <div className="bg-white border border-black/5 px-20 py-16 rounded-[48px] shadow-sm mb-20">
               <h3 className="text-4xl md:text-6xl font-black tracking-tight">{reward}</h3>
            </div>
            <GlassButton size="totem" onClick={() => setState('google-incentive')} className="w-full max-w-md">
              RESGATAR <ChevronRight className="w-8 h-8" />
            </GlassButton>
          </div>
        )}

        {/* TELA 4: INCENTIVO GOOGLE */}
        {state === 'google-incentive' && (
          <div className="flex flex-col items-center text-center px-12 animate-reveal">
            <div className="flex gap-2 mb-12">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-12 h-12 fill-yellow-400 text-yellow-400" />)}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-10 tracking-tight">Nos ajude a crescer.</h2>
            <p className="text-2xl text-black/50 font-medium mb-20 max-w-2xl leading-relaxed">
              Sua avaliação no Google é muito importante para nós e para outros clientes.
            </p>
            <GlassButton variant="google" size="totem" onClick={() => setState('qr-code')} className="w-full max-w-lg">
              AVALIAR AGORA
            </GlassButton>
          </div>
        )}

        {/* TELA 5: QR CODE */}
        {state === 'qr-code' && (
          <div className="flex flex-col items-center text-center px-12 animate-reveal">
            <div className="bg-white p-20 rounded-[64px] mb-16 shadow-2xl border border-black/5 animate-reveal">
              <QrCode className="w-72 h-72 text-black/90" />
            </div>
            <h2 className="text-4xl font-bold mb-6 tracking-tight">Escaneie para avaliar</h2>
            <p className="text-xl text-black/30 font-bold uppercase tracking-[0.3em] mb-20">
              Obrigado pela preferência!
            </p>
            <div className="text-sm font-bold opacity-10 uppercase tracking-widest">
              O totem reiniciará em instantes...
            </div>
          </div>
        )}

      </div>

      {/* Footer Fixo */}
      <footer className="h-20 px-12 flex justify-center items-center border-t border-black/5 bg-white/50">
        <span className="text-xs tracking-[0.6em] font-black uppercase opacity-10">
          MA IMPORTS — PREMIUM KIOSK EXPERIENCE
        </span>
      </footer>

    </main>
  )
}
