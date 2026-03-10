"use client"

import * as React from "react"
import Image from "next/image"
import { 
  ChevronRight, Star, Smartphone, Box, RotateCcw, Zap, 
  QrCode, MessageCircle, Trophy, ArrowLeft, Gift
} from "lucide-react"
import { GlassButton } from "@/components/ma/GlassButton"
import { CouponRewards, saveGameSession } from "@/lib/coupon-service"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { cn } from "@/lib/utils"

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
  const [selectedBox, setSelectedBox] = React.useState<number | null>(null)

  const resetToHero = () => {
    setState('hero')
    setIsSpinning(false)
    setSpeedActive(false)
    setSpeedScore(0)
    setSelectedBox(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const finalizeGame = (gameName: string) => {
    const prize = CouponRewards[Math.floor(Math.random() * CouponRewards.length)]
    setReward(prize)
    saveGameSession(gameName, prize)
    setTimeout(() => {
      setState('result')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 800)
  }

  // --- Roda Tech Logic ---
  const spinWheel = () => {
    if (isSpinning) return
    setIsSpinning(true)
    const extraDegrees = 1800 + Math.random() * 360
    const newRotation = rotation + extraDegrees
    setRotation(newRotation)
    setTimeout(() => {
      finalizeGame('Roda Tech')
      setIsSpinning(false)
    }, 4500)
  }

  // --- Toque Rápido Logic ---
  const startSpeedGame = () => {
    setSpeedScore(0)
    setTimeLeft(10)
    setSpeedActive(true)
    moveTarget()
  }

  const moveTarget = () => {
    const top = Math.random() * 70 + 15 + '%'
    const left = Math.random() * 70 + 15 + '%'
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
          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
            <Smartphone className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tighter text-black">MA <span className="opacity-20 font-light">Discovery</span></span>
        </div>
        {['game-box', 'game-wheel', 'game-speed'].includes(state) && (
          <button 
            onClick={() => setState('choice')}
            className="flex items-center gap-2 text-sm font-semibold opacity-30 hover:opacity-100 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        )}
      </nav>

      <div className="relative flex-1 flex flex-col items-center justify-center py-8 px-4">
        
        {/* HERO STATE */}
        {state === 'hero' && (
          <div className="flex flex-col items-center text-center animate-fade-in max-w-5xl">
            <div className="relative mb-16 animate-float">
              <div className="relative w-[260px] h-[520px] md:w-[360px] md:h-[720px]">
                <Image 
                  src={iphoneImg?.imageUrl || ""} 
                  alt="iPhone Premium"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
            <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-8 leading-[0.85] text-black">
              Experiência.<br/><span className="text-muted-foreground/30 font-light italic">Discovery.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground/60 mb-16 font-medium max-w-2xl tracking-tight">
              Desafie sua sorte e conquiste benefícios exclusivos MA Imports.
            </p>
            <GlassButton size="xl" onClick={() => setState('choice')} className="min-w-[300px] rounded-full shadow-2xl">
              Iniciar Jornada <ChevronRight className="ml-2 w-6 h-6" />
            </GlassButton>
          </div>
        )}

        {/* CHOICE STATE */}
        {state === 'choice' && (
          <div className="w-full animate-fade-in max-w-6xl">
            <h2 className="text-4xl md:text-6xl font-bold mb-20 text-center tracking-tighter text-black">Escolha seu Desafio.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { id: 'game-box', icon: Box, name: 'Caixas', desc: 'Sorte Pura.', color: 'from-zinc-50 to-white' },
                { id: 'game-wheel', icon: RotateCcw, name: 'Roda Tech', desc: 'Gire e Ganhe.', color: 'from-zinc-50 to-white' },
                { id: 'game-speed', icon: Zap, name: 'Reflexo', desc: 'Toque Rápido.', color: 'from-zinc-50 to-white' },
              ].map((game) => (
                <button
                  key={game.id}
                  onClick={() => setState(game.id as any)}
                  className={cn(
                    "relative p-14 rounded-[3rem] bg-gradient-to-br border border-black/5 flex flex-col items-center text-center group hover:scale-[1.02] active:scale-95 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden",
                    game.color
                  )}
                >
                  <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-10 bg-white shadow-lg border border-black/5 group-hover:bg-black group-hover:text-white transition-all duration-500">
                    <game.icon className="w-10 h-10 transition-transform duration-500 group-hover:rotate-12" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 tracking-tighter text-black">{game.name}</h3>
                  <p className="text-lg text-muted-foreground/60 font-medium">{game.desc}</p>
                  <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                    <ChevronRight className="w-12 h-12" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: CAIXA PREMIADA */}
        {state === 'game-box' && (
          <div className="flex flex-col items-center animate-fade-in w-full max-w-5xl">
            <h2 className="text-5xl font-bold mb-4 tracking-tighter text-black">Caixa Premiada</h2>
            <p className="text-xl text-muted-foreground/60 mb-20 font-medium">Sua intuição nunca falha.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
              {[0, 1, 2].map((i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setSelectedBox(i)
                    finalizeGame('Caixa Premiada')
                  }}
                  className={cn(
                    "relative h-[320px] bg-white rounded-[4rem] border border-black/5 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-4 flex flex-col items-center justify-center group overflow-hidden",
                    selectedBox === i && "animate-shake bg-zinc-50 border-black/20"
                  )}
                >
                  <div className="relative">
                    <Gift className={cn(
                      "w-24 h-24 text-black transition-all duration-700",
                      selectedBox === i ? "scale-125 rotate-12 opacity-100" : "opacity-10 group-hover:opacity-100 group-hover:scale-110"
                    )} />
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-zinc-100 rounded-full border border-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-8 text-xs font-bold uppercase tracking-[0.3em] opacity-20">Explorar</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: RODA TECH */}
        {state === 'game-wheel' && (
          <div className="flex flex-col items-center animate-fade-in w-full">
            <h2 className="text-5xl font-bold mb-4 tracking-tighter text-black">Roda Tech</h2>
            <p className="text-xl text-muted-foreground/60 mb-20 font-medium">Toque e sinta a sorte girar.</p>
            
            <div className="relative mb-20">
              {/* Pointer */}
              <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-30 drop-shadow-xl">
                <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-black" />
              </div>

              {/* Wheel */}
              <div className="relative p-4 bg-white rounded-full shadow-2xl border-4 border-black/5">
                <div 
                  className="w-80 h-80 md:w-[500px] md:h-[500px] rounded-full bg-zinc-50 relative transition-transform duration-[4500ms] ease-[cubic-bezier(0.15,0,0.15,1)] flex items-center justify-center overflow-hidden border border-black/5 shadow-inner"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <div className="wheel-segment"></div>
                  <div className="wheel-segment"></div>
                  <div className="wheel-segment"></div>
                  <div className="wheel-segment"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-full h-[1px] bg-black/20 rotate-45" />
                    <div className="w-full h-[1px] bg-black/20 -rotate-45" />
                  </div>

                  <div className="absolute z-20 w-24 h-24 md:w-32 md:h-32 bg-white rounded-full shadow-2xl border-4 border-black/5 flex items-center justify-center">
                    <Smartphone className="w-10 h-10 md:w-12 md:h-12 text-black" />
                  </div>
                </div>
              </div>
            </div>

            <GlassButton size="xl" onClick={spinWheel} disabled={isSpinning} className="min-w-[280px] rounded-full shadow-xl">
              {isSpinning ? 'Sorteando...' : 'Girar Agora'}
            </GlassButton>
          </div>
        )}

        {/* GAME: TOQUE RÁPIDO */}
        {state === 'game-speed' && (
          <div className="flex flex-col items-center w-full animate-fade-in max-w-5xl">
            {!speedActive && speedScore === 0 ? (
              <div className="text-center">
                <h2 className="text-5xl font-bold mb-4 tracking-tighter text-black">Toque Rápido</h2>
                <p className="text-xl text-muted-foreground/60 mb-16 font-medium max-w-md mx-auto">Sua agilidade define seu benefício. Toque nos ícones que surgirem.</p>
                <GlassButton size="xl" onClick={startSpeedGame} className="min-w-[280px] rounded-full">Começar Desafio</GlassButton>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="flex justify-between w-full mb-10 px-8">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.2em] opacity-30 font-bold mb-1">Tempo</span>
                    <div className="text-4xl font-bold tabular-nums">{timeLeft}s</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs uppercase tracking-[0.2em] opacity-30 font-bold mb-1">Score</span>
                    <div className="text-4xl font-bold tabular-nums">{speedScore}</div>
                  </div>
                </div>

                <div className="relative w-full aspect-[4/3] md:aspect-video bg-white border border-black/5 rounded-[4rem] overflow-hidden shadow-2xl cursor-crosshair">
                  <button
                    onClick={handleTargetHit}
                    className="absolute w-24 h-24 bg-black text-white rounded-3xl shadow-2xl flex items-center justify-center transition-all duration-75 active:scale-125 scale-in animate-pulse"
                    style={{ top: targetPos.top, left: targetPos.left }}
                  >
                    <Smartphone className="w-10 h-10" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESULT STATE */}
        {state === 'result' && (
          <div className="flex flex-col items-center text-center px-6 animate-scale-in max-w-4xl">
            <div className="w-28 h-28 rounded-[2.5rem] bg-black text-white flex items-center justify-center mb-16 shadow-2xl animate-bounce">
              <Trophy className="w-14 h-14" />
            </div>
            <h2 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter text-black">Incrível.</h2>
            <p className="text-2xl font-medium opacity-30 mb-20 tracking-tight">Sua conquista exclusiva é:</p>
            
            <div className="relative w-full max-w-2xl bg-white border border-black/5 p-16 rounded-[4rem] shadow-2xl mb-20 overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5">
                 <Star className="w-40 h-40 fill-black" />
               </div>
               <h3 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight relative z-10">{reward}</h3>
            </div>

            <GlassButton size="xl" onClick={() => setState('evaluation')} className="min-w-[320px] rounded-full">
              Finalizar <ChevronRight className="ml-2 w-6 h-6" />
            </GlassButton>
          </div>
        )}

        {/* EVALUATION STATE */}
        {state === 'evaluation' && (
          <div className="flex flex-col items-center text-center px-6 animate-fade-in max-w-3xl">
            <h2 className="text-6xl md:text-7xl font-bold mb-10 tracking-tighter leading-[0.9] text-black">Como foi<br/><span className="opacity-20 italic font-light">sua descoberta?</span></h2>
            <p className="text-xl text-muted-foreground/60 mb-20 font-medium leading-relaxed">
              Sua avaliação ajuda a elevar o padrão MA Imports.
            </p>
            
            <div className="flex flex-col gap-6 w-full max-w-lg">
              <GlassButton variant="primary" size="xl" className="w-full h-24 text-2xl rounded-3xl shadow-xl">
                <Star className="w-8 h-8 fill-current" /> Avaliar no Google
              </GlassButton>
              <button 
                onClick={() => setState('final')}
                className="text-lg font-bold opacity-30 hover:opacity-100 transition-opacity py-6 tracking-tight"
              >
                Pular Avaliação
              </button>
            </div>
          </div>
        )}

        {/* FINAL STATE */}
        {state === 'final' && (
          <div className="flex flex-col items-center text-center px-6 animate-fade-in max-w-4xl">
            <div className="bg-white p-14 rounded-[5rem] mb-20 shadow-2xl border border-black/5 group">
              <QrCode className="w-72 h-72 text-black transition-transform duration-500 group-hover:scale-95" />
            </div>
            
            <h2 className="text-6xl font-bold mb-8 tracking-tighter text-black">Catálogo Completo.</h2>
            <p className="text-xl text-muted-foreground/60 mb-20 font-medium tracking-tight">Escaneie e descubra todo o ecossistema Apple.</p>

            <div className="flex flex-col gap-6 w-full max-w-lg">
              <GlassButton className="bg-[#25D366] hover:bg-[#20ba59] border-none h-24 text-2xl rounded-[2.5rem] text-white shadow-2xl">
                <MessageCircle className="w-8 h-8 fill-current" /> WhatsApp Direto
              </GlassButton>
              <button 
                onClick={resetToHero}
                className="text-lg font-bold opacity-30 hover:opacity-100 transition-opacity py-8 tracking-tighter"
              >
                ENCERRAR SESSÃO
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="p-12 text-center text-[10px] tracking-[0.5em] font-black uppercase opacity-10 shrink-0 text-black">
        MA IMPORTS — PREMIUM TECHNOLOGY
      </footer>
    </main>
  )
}
