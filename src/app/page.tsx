"use client"

import * as React from "react"
import Image from "next/image"
import { 
  ChevronRight, Star, Smartphone, Box, RotateCcw, Zap, 
  QrCode, MessageCircle, Trophy, ArrowLeft
} from "lucide-react"
import { GlassButton } from "@/components/ma/GlassButton"
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
    const newRotation = rotation + 1800 + Math.random() * 360
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
          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-sm">
            <Smartphone className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-black">MA <span className="opacity-30">Discovery</span></span>
        </div>
        {state !== 'hero' && state !== 'final' && state !== 'result' && (
          <button 
            onClick={() => setState('choice')}
            className="flex items-center gap-2 text-sm font-semibold opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        )}
      </nav>

      <div className="relative flex-1 flex flex-col items-center justify-center py-8">
        
        {/* HERO STATE */}
        {state === 'hero' && (
          <div className="flex flex-col items-center text-center px-6 animate-fade-in max-w-5xl">
            <div className="relative mb-12 animate-float">
              <div className="relative w-[280px] h-[560px] md:w-[380px] md:h-[760px]">
                <Image 
                  src={iphoneImg?.imageUrl || ""} 
                  alt="iPhone Premium"
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-[0.9] text-black">
              Simplesmente.<br/><span className="opacity-30">Incrível.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 font-medium max-w-2xl">
              Descubra por que a MA Imports é o seu destino Apple.
            </p>
            <GlassButton size="xl" onClick={() => setState('choice')} className="min-w-[280px] rounded-full shadow-lg">
              Explorar <ChevronRight className="ml-2 w-6 h-6" />
            </GlassButton>
          </div>
        )}

        {/* CHOICE STATE */}
        {state === 'choice' && (
          <div className="w-full px-6 animate-fade-in max-w-5xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center tracking-tight text-black">Escolha um Desafio.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { id: 'game-box', icon: Box, name: 'Caixas', desc: 'Sorte pura.', color: 'bg-zinc-100' },
                { id: 'game-wheel', icon: RotateCcw, name: 'Roda Tech', desc: 'Gire e ganhe.', color: 'bg-zinc-100' },
                { id: 'game-speed', icon: Zap, name: 'Reflexo', desc: 'Seja veloz.', color: 'bg-zinc-100' },
              ].map((game) => (
                <button
                  key={game.id}
                  onClick={() => setState(game.id as any)}
                  className="p-12 rounded-[2.5rem] bg-white border border-black/5 flex flex-col items-center text-center group hover:bg-zinc-50 transition-all duration-500 shadow-sm hover:shadow-xl"
                >
                  <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 bg-zinc-50 border border-black/5 group-hover:scale-110 transition-transform duration-500">
                    <game.icon className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight text-black">{game.name}</h3>
                  <p className="text-muted-foreground font-medium opacity-60">{game.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: CAIXA PREMIADA */}
        {state === 'game-box' && (
          <div className="flex flex-col items-center animate-fade-in px-6">
            <h2 className="text-4xl font-bold mb-4 tracking-tight text-black">Caixa Premiada</h2>
            <p className="text-xl text-muted-foreground mb-16 opacity-60">Escolha uma caixa.</p>
            <div className="flex flex-wrap justify-center gap-8">
              {[0, 1, 2].map((i) => (
                <button 
                  key={i} 
                  onClick={() => finalizeGame('Caixa Premiada')}
                  className="w-56 h-56 bg-white rounded-[3rem] border border-black/5 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center group"
                >
                  <Box className="w-20 h-20 text-black opacity-10 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: RODA TECH */}
        {state === 'game-wheel' && (
          <div className="flex flex-col items-center animate-fade-in px-6">
            <h2 className="text-4xl font-bold mb-4 tracking-tight text-black">Roda Tech</h2>
            <p className="text-xl text-muted-foreground mb-16 opacity-60">Toque para girar.</p>
            
            <div className="relative mb-16">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
                <div className="w-6 h-12 bg-black rounded-full border-4 border-white shadow-xl" />
              </div>
              <div 
                className="w-72 h-72 md:w-[460px] md:h-[460px] rounded-full border-[12px] border-white bg-white shadow-2xl transition-transform duration-[4000ms] ease-out flex items-center justify-center overflow-hidden"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="grid grid-cols-2 grid-rows-2 w-full h-full rotate-45 opacity-20">
                   <div className="border-r border-b border-black/5 flex items-center justify-center"><Star className="w-16 h-16 -rotate-45" /></div>
                   <div className="border-l border-b border-black/5 flex items-center justify-center"><Smartphone className="w-16 h-16 -rotate-45" /></div>
                   <div className="border-r border-t border-black/5 flex items-center justify-center"><Zap className="w-16 h-16 -rotate-45" /></div>
                   <div className="border-l border-t border-black/5 flex items-center justify-center"><Trophy className="w-16 h-16 -rotate-45" /></div>
                </div>
              </div>
            </div>

            <GlassButton size="lg" onClick={spinWheel} disabled={isSpinning} className="min-w-[240px] rounded-full">
              {isSpinning ? 'Girando...' : 'Girar'}
            </GlassButton>
          </div>
        )}

        {/* GAME: TOQUE RÁPIDO */}
        {state === 'game-speed' && (
          <div className="flex flex-col items-center w-full px-6 animate-fade-in max-w-4xl">
            {!speedActive && speedScore === 0 ? (
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4 tracking-tight text-black">Toque Rápido</h2>
                <p className="text-xl text-muted-foreground mb-12 opacity-60">Toque no maior número de iPhones em 10 segundos.</p>
                <GlassButton size="lg" onClick={startSpeedGame} className="min-w-[240px] rounded-full">Começar</GlassButton>
              </div>
            ) : (
              <div className="relative w-full aspect-square md:aspect-video bg-white border border-black/5 rounded-[3rem] overflow-hidden min-h-[450px] shadow-sm">
                <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-20 z-20">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">Tempo</span>
                    <div className="text-5xl font-bold text-black">{timeLeft}s</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">Score</span>
                    <div className="text-5xl font-bold text-black">{speedScore}</div>
                  </div>
                </div>
                
                <button
                  onClick={handleTargetHit}
                  className="absolute w-24 h-24 bg-black text-white rounded-[2rem] shadow-2xl animate-pulse flex items-center justify-center transition-all duration-100 active:scale-125"
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
            <div className="w-24 h-24 rounded-[2rem] bg-black text-white flex items-center justify-center mb-12 shadow-xl">
              <Trophy className="w-12 h-12" />
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-black">Parabéns.</h2>
            <p className="text-2xl font-medium opacity-40 mb-16">Seu benefício exclusivo é:</p>
            
            <div className="bg-white text-black px-12 py-12 rounded-[3rem] mb-16 shadow-2xl border border-black/5 w-full">
              <h3 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">{reward}</h3>
            </div>

            <GlassButton size="lg" onClick={() => setState('evaluation')} className="min-w-[280px] rounded-full">
              Continuar <ChevronRight className="ml-2 w-6 h-6" />
            </GlassButton>
          </div>
        )}

        {/* EVALUATION STATE */}
        {state === 'evaluation' && (
          <div className="flex flex-col items-center text-center px-6 animate-fade-in max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight leading-[1.1] text-black">Deixe sua<br/>avaliação.</h2>
            <p className="text-xl text-muted-foreground mb-16 font-medium leading-relaxed opacity-60">
              Sua opinião é fundamental para mantermos o padrão MA Imports.
            </p>
            
            <div className="flex flex-col gap-6 w-full">
              <GlassButton variant="primary" size="lg" className="w-full h-20 text-xl rounded-3xl">
                <Star className="w-6 h-6 fill-current" /> Avaliar no Google
              </GlassButton>
              <button 
                onClick={() => setState('final')}
                className="text-lg font-semibold opacity-30 hover:opacity-100 transition-opacity py-4"
              >
                Agora não
              </button>
            </div>
          </div>
        )}

        {/* FINAL STATE */}
        {state === 'final' && (
          <div className="flex flex-col items-center text-center px-6 animate-fade-in max-w-2xl">
            <div className="bg-white p-12 rounded-[4rem] mb-16 shadow-2xl border border-black/5">
              <QrCode className="w-64 h-64 text-black" />
            </div>
            
            <h2 className="text-5xl font-bold mb-6 tracking-tight text-black">Catálogo Digital.</h2>
            <p className="text-xl text-muted-foreground mb-16 font-medium opacity-60">Acesse nossa vitrine completa de produtos.</p>

            <div className="flex flex-col gap-6 w-full">
              <GlassButton className="bg-[#25D366] hover:bg-[#20ba59] border-none h-20 text-xl rounded-3xl text-white shadow-lg">
                <MessageCircle className="w-6 h-6 fill-current" /> WhatsApp
              </GlassButton>
              <button 
                onClick={resetToHero}
                className="text-lg font-semibold opacity-30 hover:opacity-100 transition-opacity py-4"
              >
                Finalizar
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="p-12 text-center text-xs tracking-[0.4em] font-bold uppercase opacity-20 shrink-0 text-black">
        MA IMPORTS — THE PREMIUM EXPERIENCE
      </footer>
    </main>
  )
}