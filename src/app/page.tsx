"use client"

import * as React from "react"
import { 
  ChevronRight, Smartphone, Box, RotateCcw, Zap, 
  QrCode, MessageCircle, Trophy, ArrowLeft, Gift, 
  Watch, Laptop, Headphones, Tablet, Monitor
} from "lucide-react"
import { GlassButton } from "@/components/ma/GlassButton"
import { CouponRewards, saveGameSession } from "@/lib/coupon-service"
import { cn } from "@/lib/utils"

type AppState = 'hero' | 'choice' | 'game-box' | 'game-wheel' | 'game-speed' | 'game-memory' | 'result' | 'evaluation' | 'final'

interface MemoryCard {
  id: number
  icon: any
  name: string
  isFlipped: boolean
  isMatched: boolean
}

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

  // Memory Game State
  const [cards, setCards] = React.useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = React.useState<number[]>([])

  const resetToHero = React.useCallback(() => {
    setState('hero')
    setIsSpinning(false)
    setSpeedActive(false)
    setSpeedScore(0)
    setSelectedBox(null)
    setReward(null)
    setCards([])
    setFlippedCards([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Inactivity Timer for Totem (2 minutes)
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

  const finalizeGame = (gameName: string) => {
    const prize = CouponRewards[Math.floor(Math.random() * CouponRewards.length)]
    setReward(prize)
    saveGameSession(gameName, prize)
    setTimeout(() => {
      setState('result')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 1000)
  }

  // Memory Game Logic
  const initMemoryGame = () => {
    const icons = [
      { icon: Smartphone, name: 'iPhone' },
      { icon: Watch, name: 'Watch' },
      { icon: Laptop, name: 'Mac' },
      { icon: Headphones, name: 'AirPods' },
      { icon: Tablet, name: 'iPad' },
      { icon: Monitor, name: 'Display' },
    ]
    const gameCards: MemoryCard[] = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        ...item,
        isFlipped: false,
        isMatched: false,
      }))
    setCards(gameCards)
    setState('game-memory')
  }

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return
    const newCards = [...cards]
    newCards[id].isFlipped = true
    setCards(newCards)
    const newFlipped = [...flippedCards, id]
    setFlippedCards(newFlipped)
    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped
      if (cards[firstId].name === cards[secondId].name) {
        setTimeout(() => {
          const matchedCards = [...newCards]
          matchedCards[firstId].isMatched = true
          matchedCards[secondId].isMatched = true
          setCards(matchedCards)
          setFlippedCards([])
          if (matchedCards.every(c => c.isMatched)) finalizeGame('Jogo da Memória')
        }, 500)
      } else {
        setTimeout(() => {
          const resetCards = [...newCards]
          resetCards[firstId].isFlipped = false
          resetCards[secondId].isFlipped = false
          setCards(resetCards)
          setFlippedCards([])
        }, 800)
      }
    }
  }

  // Wheel Logic
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

  // Speed Game Logic
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

  return (
    <main className="relative z-10 mx-auto min-h-screen flex flex-col font-sans selection:bg-black selection:text-white bg-[#F7F8FA]">
      
      {/* Navbar Glass */}
      <nav className="sticky top-0 z-50 glass-nav px-8 md:px-20 h-24 flex justify-between items-center border-b border-black/[0.05]">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={resetToHero}>
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-black">MA Discovery</span>
        </div>
        {state !== 'hero' && (
          <button 
            onClick={resetToHero}
            className="flex items-center gap-2 text-sm font-semibold opacity-60 hover:opacity-100 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Início
          </button>
        )}
      </nav>

      <div className="flex-1 flex flex-col items-center">
        
        {/* HERO SECTION */}
        {state === 'hero' && (
          <section className="w-full flex flex-col items-center justify-center min-h-[85vh] text-center px-6 animate-reveal">
            <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold tracking-tight leading-[1.05] text-black max-w-5xl mb-12">
              Experiência Digital.<br/>
              <span className="text-black/30">Redefinida.</span>
            </h1>
            <p className="text-lg md:text-2xl text-black/60 font-medium max-w-2xl mb-16 leading-relaxed">
              Descubra um novo padrão de tecnologia na MA Imports através de nossos desafios interativos.
            </p>
            <GlassButton 
              size="xl" 
              onClick={() => setState('choice')} 
              className="shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
            >
              Iniciar Descoberta <ChevronRight className="ml-2 w-6 h-6" />
            </GlassButton>
          </section>
        )}

        {/* CHOICE SECTION (Dark Rhythm) */}
        {state === 'choice' && (
          <section className="w-full min-h-[90vh] bg-[#0A0A0C] flex flex-col items-center justify-center py-24 px-6 animate-reveal">
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold mb-20 text-white text-center tracking-tight">Qual o seu desafio hoje?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
              {[
                { id: 'game-box', icon: Box, name: 'Caixas', desc: 'Intuição Pura.' },
                { id: 'game-wheel', icon: RotateCcw, name: 'Roda Tech', desc: 'Momento de Sorte.' },
                { id: 'game-speed', icon: Zap, name: 'Reflexo', desc: 'Agilidade Digital.' },
                { id: 'game-memory', icon: Monitor, name: 'Memória', desc: 'Foco Absoluto.', action: initMemoryGame },
              ].map((game) => (
                <button
                  key={game.id}
                  onClick={() => game.action ? game.action() : setState(game.id as any)}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[28px] flex flex-col items-center text-center group hover:bg-white hover:border-white transition-all duration-500"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:bg-black group-hover:text-white transition-all">
                    <game.icon className="w-7 h-7 text-white group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-black tracking-tight">{game.name}</h3>
                  <p className="text-white/40 group-hover:text-black/60 font-medium">{game.desc}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* GAME: MEMORY */}
        {state === 'game-memory' && (
          <section className="w-full py-20 px-6 animate-reveal max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-black">Jogo da Memória</h2>
              <p className="text-xl text-black/40 font-medium">Combine os produtos premium MA.</p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={cn(
                    "relative h-[160px] md:h-[220px] transition-all duration-500 perspective-1000",
                    (card.isFlipped || card.isMatched) ? "rotate-y-180" : ""
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 w-full h-full rounded-[24px] transition-all duration-500 preserve-3d flex items-center justify-center shadow-sm border",
                    (card.isFlipped || card.isMatched) 
                      ? "bg-white border-black/10" 
                      : "bg-white border-black/[0.05] hover:border-black/20"
                  )}>
                    {(card.isFlipped || card.isMatched) ? (
                      <card.icon className="w-12 h-12 text-black" />
                    ) : (
                      <div className="w-10 h-10 bg-black/[0.03] rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-black/10" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* GAME: CAIXA PREMIADA */}
        {state === 'game-box' && (
          <section className="w-full py-20 px-6 animate-reveal max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-black">Caixa Premiada</h2>
              <p className="text-xl text-black/40 font-medium">Sua intuição leva ao prêmio.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <button 
                  key={i} 
                  onClick={() => { setSelectedBox(i); finalizeGame('Caixa Premiada'); }}
                  className={cn(
                    "relative h-[350px] bg-white rounded-[32px] border border-black/5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col items-center justify-center group active:scale-95",
                    selectedBox === i && "animate-pulse border-black/20"
                  )}
                >
                  <Gift className={cn(
                    "w-20 h-20 transition-all duration-500",
                    selectedBox === i ? "text-black scale-110" : "text-black/10 group-hover:text-black"
                  )} />
                  <span className="mt-10 text-[10px] font-bold uppercase tracking-[0.2em] opacity-20">Escolher</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* GAME: RODA TECH */}
        {state === 'game-wheel' && (
          <section className="w-full py-20 px-6 animate-reveal flex flex-col items-center">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-black">Roda Tech</h2>
              <p className="text-xl text-black/40 font-medium">Gire para descobrir seu benefício.</p>
            </div>
            <div className="relative mb-20">
              <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 z-30">
                <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-black" />
              </div>
              <div className="p-4 bg-white rounded-full shadow-2xl border border-black/5">
                <div 
                  className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-[#F7F8FA] relative transition-transform duration-[4500ms] ease-[cubic-bezier(0.15,0,0.15,1)] flex items-center justify-center overflow-hidden border border-black/5"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {[0, 1, 2, 3].map((_, i) => (
                    <div 
                      key={i} 
                      className="wheel-segment absolute w-full h-full" 
                      style={{ 
                        transform: `rotate(${i * 90}deg)`,
                        background: i % 2 === 0 ? 'white' : 'rgba(0,0,0,0.02)'
                      }} 
                    />
                  ))}
                  <div className="absolute z-20 w-32 h-32 bg-white rounded-full shadow-lg border-4 border-[#F7F8FA] flex items-center justify-center">
                    <Smartphone className="w-10 h-10 text-black" />
                  </div>
                </div>
              </div>
            </div>
            <GlassButton size="xl" onClick={spinWheel} disabled={isSpinning} className="min-w-[320px]">
              {isSpinning ? 'Sorteando...' : 'Girar Agora'}
            </GlassButton>
          </section>
        )}

        {/* GAME: TOQUE RÁPIDO */}
        {state === 'game-speed' && (
          <section className="w-full py-20 px-6 animate-reveal max-w-4xl flex flex-col items-center">
            {!speedActive && speedScore === 0 ? (
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-black">Toque Rápido</h2>
                <p className="text-xl text-black/40 mb-16 font-medium max-w-lg mx-auto">Sua agilidade digital define sua recompensa.</p>
                <GlassButton size="xl" onClick={startSpeedGame} className="min-w-[300px]">Começar</GlassButton>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="flex justify-between w-full mb-12 px-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Tempo</span>
                    <div className="text-4xl font-bold tabular-nums">{timeLeft}s</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Score</span>
                    <div className="text-4xl font-bold tabular-nums">{speedScore}</div>
                  </div>
                </div>
                <div className="relative w-full aspect-[16/10] bg-white border border-black/5 rounded-[32px] overflow-hidden shadow-sm">
                  <button
                    onClick={handleTargetHit}
                    className="absolute w-24 h-24 bg-black text-white rounded-[22px] shadow-xl flex items-center justify-center transition-all duration-75 active:scale-110"
                    style={{ top: targetPos.top, left: targetPos.left }}
                  >
                    <Zap className="w-10 h-10 fill-current" />
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* RESULT SECTION */}
        {state === 'result' && (
          <section className="w-full min-h-[85vh] flex flex-col items-center justify-center text-center px-6 animate-reveal">
            <div className="w-24 h-24 rounded-3xl bg-black flex items-center justify-center mb-12 shadow-2xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-black">Parabéns.</h2>
            <p className="text-lg uppercase tracking-[0.3em] font-bold opacity-30 mb-16">Seu benefício exclusivo:</p>
            <div className="bg-white border border-black/5 p-12 md:p-20 rounded-[40px] shadow-sm mb-20 w-full max-w-4xl">
               <h3 className="text-3xl md:text-6xl font-bold tracking-tight text-black">{reward}</h3>
            </div>
            <GlassButton size="xl" onClick={() => setState('evaluation')} className="min-w-[350px]">
              Continuar <ChevronRight className="ml-2 w-6 h-6" />
            </GlassButton>
          </section>
        )}

        {/* EVALUATION SECTION */}
        {state === 'evaluation' && (
          <section className="w-full min-h-[85vh] bg-[#0A0A0C] flex flex-col items-center justify-center text-center px-6 animate-reveal">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white tracking-tight">
              Sua experiência importa.
            </h2>
            <p className="text-xl text-white/40 mb-20 font-medium max-w-xl">
              Como foi sua jornada hoje na MA Imports? Sua avaliação nos ajuda a evoluir.
            </p>
            <div className="flex flex-col gap-6 w-full max-w-md">
              <GlassButton variant="primary" size="xl" className="bg-white text-black hover:bg-white/90">
                Avaliar no Google
              </GlassButton>
              <button onClick={() => setState('final')} className="text-white/20 hover:text-white transition-colors py-4 font-bold">
                Pular Avaliação
              </button>
            </div>
          </section>
        )}

        {/* FINAL SECTION */}
        {state === 'final' && (
          <section className="w-full min-h-[85vh] flex flex-col items-center justify-center text-center px-6 animate-reveal">
            <div className="bg-white p-16 rounded-[48px] mb-16 shadow-2xl border border-black/5 animate-float">
              <QrCode className="w-64 h-64 text-black/90" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-black">Acesse o catálogo.</h2>
            <p className="text-xl text-black/40 mb-16 font-medium max-w-lg">Escaneie o código e descubra o ecossistema completo da MA Imports.</p>
            <div className="flex flex-col gap-6 w-full max-w-md">
              <GlassButton className="bg-[#25D366] hover:bg-[#20ba59] border-none text-white shadow-lg">
                <MessageCircle className="w-6 h-6 mr-2 fill-current" /> WhatsApp Business
              </GlassButton>
              <button onClick={resetToHero} className="text-[10px] font-bold opacity-20 hover:opacity-100 transition-opacity uppercase tracking-[0.4em] py-8">
                Encerrar Experiência
              </button>
            </div>
          </section>
        )}
      </div>

      <footer className="py-12 px-8 flex justify-center border-t border-black/[0.03]">
        <span className="text-[9px] tracking-[0.5em] font-bold uppercase opacity-10 text-black">
          MA IMPORTS — PREMIUM TECHNOLOGY EXPERIENCE
        </span>
      </footer>
    </main>
  )
}
