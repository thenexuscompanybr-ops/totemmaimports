"use client"

import * as React from "react"
import Image from "next/image"
import { 
  ChevronRight, Star, Smartphone, Box, RotateCcw, Zap, 
  QrCode, MessageCircle, Trophy, ArrowLeft, Gift, TouchpadIcon
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

  const resetToHero = React.useCallback(() => {
    setState('hero')
    setIsSpinning(false)
    setSpeedActive(false)
    setSpeedScore(0)
    setSelectedBox(null)
    setReward(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Inactivity Timer for Totem (2 minutes)
  React.useEffect(() => {
    if (state === 'hero') return;

    const timer = setTimeout(() => {
      resetToHero();
    }, 120000); // 2 minutes

    const handleInteraction = () => {
      clearTimeout(timer);
    };

    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('mousedown', handleInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
    };
  }, [state, resetToHero]);

  const finalizeGame = (gameName: string) => {
    const prize = CouponRewards[Math.floor(Math.random() * CouponRewards.length)]
    setReward(prize)
    saveGameSession(gameName, prize)
    setTimeout(() => {
      setState('result')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 1000)
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
    <main className="relative z-10 mx-auto max-w-7xl min-h-screen flex flex-col pb-20 font-body antialiased selection:bg-transparent">
      {/* Navigation */}
      <nav className="p-10 md:p-14 flex justify-between items-center animate-fade-in shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-2xl">
            <Smartphone className="w-8 h-8" />
          </div>
          <span className="font-bold text-3xl tracking-tighter text-black">MA <span className="opacity-20 font-light">Discovery</span></span>
        </div>
        {['game-box', 'game-wheel', 'game-speed', 'choice'].includes(state) && (
          <button 
            onClick={resetToHero}
            className="flex items-center gap-3 text-lg font-bold opacity-30 hover:opacity-100 transition-all duration-300 active:scale-90"
          >
            <ArrowLeft className="w-6 h-6" /> Início
          </button>
        )}
      </nav>

      <div className="relative flex-1 flex flex-col items-center justify-center py-10 px-6">
        
        {/* HERO STATE */}
        {state === 'hero' && (
          <div className="flex flex-col items-center text-center animate-fade-in max-w-5xl">
            <div className="relative mb-20 animate-float">
              <div className="relative w-[300px] h-[600px] md:w-[450px] md:h-[900px]">
                <Image 
                  src={iphoneImg?.imageUrl || ""} 
                  alt="iPhone Premium"
                  fill
                  className="object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.15)]"
                  priority
                />
              </div>
            </div>
            <h1 className="text-7xl md:text-[10rem] font-bold tracking-tighter mb-12 leading-[0.8] text-black">
              Experiência.<br/><span className="text-muted-foreground/20 font-light italic">Discovery.</span>
            </h1>
            <p className="text-2xl md:text-4xl text-muted-foreground/50 mb-20 font-medium max-w-3xl tracking-tight leading-tight">
              Toque para iniciar sua jornada e conquistar benefícios exclusivos.
            </p>
            <GlassButton size="xl" onClick={() => setState('choice')} className="h-28 min-w-[400px] rounded-full shadow-2xl text-3xl animate-pulse">
              Começar <ChevronRight className="ml-3 w-8 h-8" />
            </GlassButton>
          </div>
        )}

        {/* CHOICE STATE */}
        {state === 'choice' && (
          <div className="w-full animate-fade-in max-w-6xl">
            <h2 className="text-6xl md:text-8xl font-bold mb-24 text-center tracking-tighter text-black">Escolha seu Desafio.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { id: 'game-box', icon: Box, name: 'Caixas', desc: 'Sorte Pura.', color: 'from-zinc-50 to-white' },
                { id: 'game-wheel', icon: RotateCcw, name: 'Roda Tech', desc: 'Gire e Ganhe.', color: 'from-zinc-50 to-white' },
                { id: 'game-speed', icon: Zap, name: 'Reflexo', desc: 'Toque Rápido.', color: 'from-zinc-50 to-white' },
              ].map((game) => (
                <button
                  key={game.id}
                  onClick={() => setState(game.id as any)}
                  className={cn(
                    "relative p-16 rounded-[4rem] bg-gradient-to-br border border-black/5 flex flex-col items-center text-center group hover:scale-[1.03] active:scale-95 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden",
                    game.color
                  )}
                >
                  <div className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-12 bg-white shadow-xl border border-black/5 group-hover:bg-black group-hover:text-white transition-all duration-500">
                    <game.icon className="w-14 h-14 transition-transform duration-500 group-hover:rotate-12" />
                  </div>
                  <h3 className="text-4xl font-bold mb-6 tracking-tighter text-black">{game.name}</h3>
                  <p className="text-xl text-muted-foreground/60 font-medium">{game.desc}</p>
                  <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-10 transition-opacity">
                    <ChevronRight className="w-16 h-16" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: CAIXA PREMIADA */}
        {state === 'game-box' && (
          <div className="flex flex-col items-center animate-fade-in w-full max-w-6xl">
            <h2 className="text-6xl font-bold mb-6 tracking-tighter text-black">Caixa Premiada</h2>
            <p className="text-2xl text-muted-foreground/60 mb-24 font-medium">Toque em uma caixa para revelar seu prêmio.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full">
              {[0, 1, 2].map((i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setSelectedBox(i)
                    finalizeGame('Caixa Premiada')
                  }}
                  className={cn(
                    "relative h-[400px] bg-white rounded-[5rem] border border-black/5 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-6 flex flex-col items-center justify-center group overflow-hidden active:scale-90",
                    selectedBox === i && "animate-shake bg-zinc-50 border-black/20"
                  )}
                >
                  <div className="relative">
                    <Gift className={cn(
                      "w-32 h-32 text-black transition-all duration-700",
                      selectedBox === i ? "scale-150 rotate-12 opacity-100" : "opacity-10 group-hover:opacity-100 group-hover:scale-125"
                    )} />
                  </div>
                  <div className="mt-12 text-sm font-black uppercase tracking-[0.4em] opacity-20">Escolher</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: RODA TECH */}
        {state === 'game-wheel' && (
          <div className="flex flex-col items-center animate-fade-in w-full">
            <h2 className="text-6xl font-bold mb-6 tracking-tighter text-black">Roda Tech</h2>
            <p className="text-2xl text-muted-foreground/60 mb-24 font-medium">Gire a roleta e descubra seu benefício.</p>
            
            <div className="relative mb-24">
              {/* Pointer */}
              <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 z-30 drop-shadow-2xl">
                <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[50px] border-t-black" />
              </div>

              {/* Wheel */}
              <div className="relative p-6 bg-white rounded-full shadow-[0_50px_100px_rgba(0,0,0,0.1)] border-[8px] border-black/5">
                <div 
                  className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full bg-zinc-50 relative transition-transform duration-[4500ms] ease-[cubic-bezier(0.15,0,0.15,1)] flex items-center justify-center overflow-hidden border-2 border-black/5"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {[0, 1, 2, 3].map((_, i) => (
                    <div key={i} className="wheel-segment" style={{ transform: `rotate(${i * 90}deg) skewY(-45deg)` }} />
                  ))}
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                    <div className="w-full h-[1px] bg-black rotate-45" />
                    <div className="w-full h-[1px] bg-black -rotate-45" />
                  </div>

                  <div className="absolute z-20 w-40 h-40 bg-white rounded-full shadow-2xl border-[10px] border-zinc-50 flex items-center justify-center">
                    <Smartphone className="w-16 h-16 text-black" />
                  </div>
                </div>
              </div>
            </div>

            <GlassButton size="xl" onClick={spinWheel} disabled={isSpinning} className="h-28 min-w-[400px] rounded-full shadow-2xl text-3xl">
              {isSpinning ? 'Sorteando...' : 'Girar Roleta'}
            </GlassButton>
          </div>
        )}

        {/* GAME: TOQUE RÁPIDO */}
        {state === 'game-speed' && (
          <div className="flex flex-col items-center w-full animate-fade-in max-w-6xl">
            {!speedActive && speedScore === 0 ? (
              <div className="text-center">
                <h2 className="text-6xl font-bold mb-6 tracking-tighter text-black">Toque Rápido</h2>
                <p className="text-2xl text-muted-foreground/60 mb-20 font-medium max-w-2xl mx-auto">Sua agilidade define seu benefício. Toque nos ícones o mais rápido possível.</p>
                <GlassButton size="xl" onClick={startSpeedGame} className="h-28 min-w-[350px] rounded-full text-3xl">Começar Desafio</GlassButton>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="flex justify-between w-full mb-16 px-12">
                  <div className="flex flex-col">
                    <span className="text-sm uppercase tracking-[0.3em] opacity-30 font-black mb-2">Tempo Restante</span>
                    <div className="text-6xl font-bold tabular-nums">{timeLeft}s</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm uppercase tracking-[0.3em] opacity-30 font-black mb-2">Pontuação</span>
                    <div className="text-6xl font-bold tabular-nums">{speedScore}</div>
                  </div>
                </div>

                <div className="relative w-full aspect-[4/3] md:aspect-video bg-white border-2 border-black/5 rounded-[5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.05)]">
                  <button
                    onClick={handleTargetHit}
                    className="absolute w-32 h-32 bg-black text-white rounded-[2.5rem] shadow-2xl flex items-center justify-center transition-all duration-75 active:scale-125 animate-pulse"
                    style={{ top: targetPos.top, left: targetPos.left }}
                  >
                    <Smartphone className="w-16 h-16" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESULT STATE */}
        {state === 'result' && (
          <div className="flex flex-col items-center text-center px-8 animate-scale-in max-w-5xl">
            <div className="w-40 h-40 rounded-[3rem] bg-black text-white flex items-center justify-center mb-20 shadow-[0_30px_60px_rgba(0,0,0,0.2)] animate-bounce">
              <Trophy className="w-20 h-20" />
            </div>
            <h2 className="text-8xl md:text-[10rem] font-bold mb-10 tracking-tighter text-black leading-none">Incrível.</h2>
            <p className="text-3xl font-medium opacity-30 mb-24 tracking-tight">Você conquistou:</p>
            
            <div className="relative w-full bg-white border border-black/5 p-20 rounded-[6rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] mb-24 overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                 <Star className="w-60 h-60 fill-black" />
               </div>
               <h3 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight relative z-10 text-black">{reward}</h3>
            </div>

            <GlassButton size="xl" onClick={() => setState('evaluation')} className="h-28 min-w-[450px] rounded-full text-3xl">
              Continuar <ChevronRight className="ml-3 w-8 h-8" />
            </GlassButton>
          </div>
        )}

        {/* EVALUATION STATE */}
        {state === 'evaluation' && (
          <div className="flex flex-col items-center text-center px-8 animate-fade-in max-w-4xl">
            <h2 className="text-7xl md:text-9xl font-bold mb-12 tracking-tighter leading-[0.85] text-black">Como foi<br/><span className="opacity-20 italic font-light">sua descoberta?</span></h2>
            <p className="text-2xl text-muted-foreground/50 mb-24 font-medium leading-relaxed max-w-2xl">
              Sua avaliação ajuda a elevar o padrão MA Imports.
            </p>
            
            <div className="flex flex-col gap-10 w-full max-w-xl">
              <GlassButton variant="primary" size="xl" className="w-full h-32 text-3xl rounded-[3rem] shadow-2xl">
                <Star className="w-10 h-10 fill-current" /> Avaliar no Google
              </GlassButton>
              <button 
                onClick={() => setState('final')}
                className="text-2xl font-bold opacity-30 hover:opacity-100 transition-opacity py-8 tracking-tight active:scale-95"
              >
                Pular Avaliação
              </button>
            </div>
          </div>
        )}

        {/* FINAL STATE */}
        {state === 'final' && (
          <div className="flex flex-col items-center text-center px-8 animate-fade-in max-w-5xl">
            <div className="bg-white p-20 rounded-[7rem] mb-24 shadow-[0_50px_100px_rgba(0,0,0,0.05)] border border-black/5">
              <QrCode className="w-96 h-96 text-black opacity-90" />
            </div>
            
            <h2 className="text-7xl font-bold mb-10 tracking-tighter text-black">Explore o Catálogo.</h2>
            <p className="text-2xl text-muted-foreground/60 mb-24 font-medium tracking-tight">Escaneie o código acima e conheça todo o ecossistema Apple.</p>

            <div className="flex flex-col gap-8 w-full max-w-xl">
              <GlassButton className="bg-[#25D366] hover:bg-[#20ba59] border-none h-32 text-3xl rounded-[3.5rem] text-white shadow-2xl">
                <MessageCircle className="w-10 h-10 fill-current" /> WhatsApp Direto
              </GlassButton>
              <button 
                onClick={resetToHero}
                className="text-2xl font-black opacity-30 hover:opacity-100 transition-opacity py-10 tracking-[0.2em] uppercase active:scale-95"
              >
                Encerrar Sessão
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="p-16 text-center text-sm tracking-[0.6em] font-black uppercase opacity-10 shrink-0 text-black">
        MA IMPORTS — PREMIUM TECHNOLOGY EXPERIENCE
      </footer>
    </main>
  )
}
