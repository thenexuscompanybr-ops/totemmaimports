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

    const timer = setTimeout(() => {
      resetToHero();
    }, 120000);

    const handleInteraction = () => {
      clearTimeout(timer);
    };

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
        }, 1000)
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
    <main className="relative z-10 mx-auto max-w-[1920px] min-h-screen flex flex-col font-body antialiased selection:bg-black selection:text-white">
      {/* Apple-style Navigation */}
      <nav className="sticky top-0 z-50 apple-blur px-12 py-8 flex justify-between items-center border-b border-black/5">
        <div className="flex items-center gap-4 cursor-pointer" onClick={resetToHero}>
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-xl">
            <Smartphone className="w-7 h-7" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-black">MA Discovery</span>
        </div>
        {state !== 'hero' && (
          <button 
            onClick={resetToHero}
            className="flex items-center gap-2 text-sm font-bold opacity-40 hover:opacity-100 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" /> Início
          </button>
        )}
      </nav>

      <div className="relative flex-1 flex flex-col items-center justify-center px-10">
        
        {/* HERO STATE */}
        {state === 'hero' && (
          <div className="flex flex-col items-center text-center animate-fade-in py-20">
            <h1 className="text-[7rem] md:text-[12rem] font-bold tracking-tight mb-8 leading-[0.9] text-black">
              Experiência.<br/>
              <span className="text-muted-foreground/20 font-light">Discovery.</span>
            </h1>
            <p className="text-2xl md:text-4xl text-muted-foreground/60 mb-20 font-medium max-w-4xl tracking-tight">
              A jornada tecnológica da MA Imports começa aqui.<br/>Toque para descobrir seu benefício.
            </p>
            <GlassButton 
              size="xl" 
              onClick={() => setState('choice')} 
              className="h-28 min-w-[450px] rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.12)] text-3xl"
            >
              Iniciar Descoberta <ChevronRight className="ml-3 w-8 h-8" />
            </GlassButton>
          </div>
        )}

        {/* CHOICE STATE */}
        {state === 'choice' && (
          <div className="w-full animate-fade-in max-w-7xl py-20">
            <h2 className="text-6xl md:text-8xl font-bold mb-24 text-center tracking-tight text-black">Escolha seu Desafio.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { id: 'game-box', icon: Box, name: 'Caixas', desc: 'Sorte Pura.', color: 'bg-zinc-50' },
                { id: 'game-wheel', icon: RotateCcw, name: 'Roda Tech', desc: 'Gire e Ganhe.', color: 'bg-zinc-50' },
                { id: 'game-speed', icon: Zap, name: 'Reflexo', desc: 'Toque Rápido.', color: 'bg-zinc-50' },
                { id: 'game-memory', icon: Monitor, name: 'Memória', desc: 'Foco Total.', color: 'bg-zinc-50', action: initMemoryGame },
              ].map((game) => (
                <button
                  key={game.id}
                  onClick={() => game.action ? game.action() : setState(game.id as any)}
                  className={cn(
                    "relative p-12 rounded-[3.5rem] border border-black/[0.03] flex flex-col items-center text-center group hover:scale-[1.02] active:scale-95 transition-all duration-500 shadow-sm hover:shadow-xl overflow-hidden",
                    game.color
                  )}
                >
                  <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 bg-white border border-black/5 group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-sm">
                    <game.icon className="w-10 h-10 transition-transform duration-500 group-hover:rotate-12" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3 tracking-tight text-black">{game.name}</h3>
                  <p className="text-lg text-muted-foreground/50 font-medium">{game.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: MEMORY */}
        {state === 'game-memory' && (
          <div className="flex flex-col items-center animate-fade-in w-full max-w-6xl py-12">
            <h2 className="text-6xl font-bold mb-6 tracking-tight text-black">Jogo da Memória</h2>
            <p className="text-2xl text-muted-foreground/60 mb-16 font-medium">Combine os ícones premium.</p>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-6 w-full px-4">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={cn(
                    "relative h-[200px] md:h-[260px] rounded-[3rem] transition-all duration-500 perspective-1000",
                    (card.isFlipped || card.isMatched) ? "rotate-y-180" : ""
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 w-full h-full rounded-[3rem] transition-all duration-500 preserve-3d flex items-center justify-center shadow-sm",
                    (card.isFlipped || card.isMatched) 
                      ? "bg-white border border-black/10" 
                      : "bg-zinc-50 border border-black/[0.03] hover:bg-zinc-100"
                  )}>
                    {(card.isFlipped || card.isMatched) ? (
                      <card.icon className="w-16 h-16 text-black" />
                    ) : (
                      <div className="w-14 h-14 bg-black/5 rounded-full flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-black/10" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: CAIXA PREMIADA */}
        {state === 'game-box' && (
          <div className="flex flex-col items-center animate-fade-in w-full max-w-6xl py-12">
            <h2 className="text-6xl font-bold mb-6 tracking-tight text-black">Caixa Premiada</h2>
            <p className="text-2xl text-muted-foreground/60 mb-20 font-medium">Escolha uma e revele seu benefício.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
              {[0, 1, 2].map((i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setSelectedBox(i)
                    finalizeGame('Caixa Premiada')
                  }}
                  className={cn(
                    "relative h-[400px] bg-zinc-50 rounded-[4rem] border border-black/[0.03] cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-4 flex flex-col items-center justify-center group active:scale-95",
                    selectedBox === i && "animate-shake bg-white border-black/10"
                  )}
                >
                  <div className="relative">
                    <Gift className={cn(
                      "w-32 h-32 text-black transition-all duration-700",
                      selectedBox === i ? "scale-125 opacity-100" : "opacity-10 group-hover:opacity-100"
                    )} />
                  </div>
                  <div className="mt-12 text-xs font-bold uppercase tracking-[0.3em] opacity-20">Selecionar</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: RODA TECH */}
        {state === 'game-wheel' && (
          <div className="flex flex-col items-center animate-fade-in w-full py-12">
            <h2 className="text-6xl font-bold mb-6 tracking-tight text-black">Roda Tech</h2>
            <p className="text-2xl text-muted-foreground/60 mb-20 font-medium">Gire para descobrir seu prêmio.</p>
            <div className="relative mb-24">
              <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 z-30 drop-shadow-xl">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-black" />
              </div>
              <div className="relative p-8 bg-zinc-50 rounded-full shadow-2xl border-[10px] border-white">
                <div 
                  className="w-[500px] h-[500px] md:w-[650px] md:h-[650px] rounded-full bg-white relative transition-transform duration-[4500ms] ease-[cubic-bezier(0.15,0,0.15,1)] flex items-center justify-center overflow-hidden border border-black/5"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {[0, 1, 2, 3].map((_, i) => (
                    <div key={i} className="wheel-segment" style={{ transform: `rotate(${i * 90}deg) skewY(-45deg)` }} />
                  ))}
                  <div className="absolute z-20 w-40 h-40 bg-white rounded-full shadow-xl border-[10px] border-zinc-50 flex items-center justify-center">
                    <Smartphone className="w-16 h-16 text-black" />
                  </div>
                </div>
              </div>
            </div>
            <GlassButton size="xl" onClick={spinWheel} disabled={isSpinning} className="h-28 min-w-[450px] rounded-full shadow-xl text-3xl">
              {isSpinning ? 'Sorteando...' : 'Girar Agora'}
            </GlassButton>
          </div>
        )}

        {/* GAME: TOQUE RÁPIDO */}
        {state === 'game-speed' && (
          <div className="flex flex-col items-center w-full animate-fade-in max-w-6xl py-12">
            {!speedActive && speedScore === 0 ? (
              <div className="text-center">
                <h2 className="text-6xl font-bold mb-6 tracking-tight text-black">Toque Rápido</h2>
                <p className="text-2xl text-muted-foreground/60 mb-20 font-medium max-w-2xl mx-auto">Sua agilidade define sua recompensa. Toque nos alvos o mais rápido possível.</p>
                <GlassButton size="xl" onClick={startSpeedGame} className="h-28 min-w-[400px] rounded-full text-3xl">Começar Desafio</GlassButton>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="flex justify-between w-full mb-16 px-12">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.3em] opacity-40 font-bold mb-2">Tempo</span>
                    <div className="text-6xl font-bold tabular-nums">{timeLeft}s</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs uppercase tracking-[0.3em] opacity-40 font-bold mb-2">Acertos</span>
                    <div className="text-6xl font-bold tabular-nums">{speedScore}</div>
                  </div>
                </div>
                <div className="relative w-full aspect-[16/10] bg-zinc-50 border border-black/[0.03] rounded-[4rem] overflow-hidden shadow-sm">
                  <button
                    onClick={handleTargetHit}
                    className="absolute w-32 h-32 bg-black text-white rounded-[2.5rem] shadow-2xl flex items-center justify-center transition-all duration-75 active:scale-110"
                    style={{ top: targetPos.top, left: targetPos.left }}
                  >
                    <Zap className="w-16 h-16 fill-current" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESULT STATE */}
        {state === 'result' && (
          <div className="flex flex-col items-center text-center px-10 animate-scale-in max-w-5xl py-20">
            <div className="w-40 h-40 rounded-[2.5rem] bg-black text-white flex items-center justify-center mb-16 shadow-2xl">
              <Trophy className="w-20 h-20" />
            </div>
            <h2 className="text-8xl md:text-9xl font-bold mb-8 tracking-tight text-black leading-none">Incrível.</h2>
            <p className="text-3xl font-medium opacity-20 mb-20 tracking-tight uppercase">Você conquistou:</p>
            <div className="relative w-full bg-zinc-50 border border-black/[0.03] p-20 rounded-[4rem] shadow-sm mb-24 overflow-hidden">
               <h3 className="text-5xl md:text-8xl font-bold tracking-tight leading-tight text-black">{reward}</h3>
            </div>
            <GlassButton size="xl" onClick={() => setState('evaluation')} className="h-28 min-w-[500px] rounded-full text-3xl">
              Continuar <ChevronRight className="ml-3 w-8 h-8" />
            </GlassButton>
          </div>
        )}

        {/* EVALUATION STATE */}
        {state === 'evaluation' && (
          <div className="flex flex-col items-center text-center px-10 animate-fade-in max-w-4xl py-20">
            <h2 className="text-6xl md:text-8xl font-bold mb-12 tracking-tight leading-[0.9] text-black">
              Sua Experiência.<br/>
              <span className="opacity-10 italic font-light">Avalie-nos.</span>
            </h2>
            <p className="text-2xl text-muted-foreground/40 mb-24 font-medium leading-relaxed max-w-2xl">
              Sua opinião nos ajuda a elevar o padrão de excelência MA Imports.
            </p>
            <div className="flex flex-col gap-8 w-full max-w-xl">
              <GlassButton variant="primary" size="xl" className="w-full h-32 text-3xl rounded-[3rem] shadow-xl">
                Avaliar no Google
              </GlassButton>
              <button onClick={() => setState('final')} className="text-2xl font-bold opacity-20 hover:opacity-100 transition-opacity py-8 active:scale-95">
                Pular Avaliação
              </button>
            </div>
          </div>
        )}

        {/* FINAL STATE */}
        {state === 'final' && (
          <div className="flex flex-col items-center text-center px-10 animate-fade-in max-w-5xl py-20">
            <div className="bg-white p-20 rounded-[5rem] mb-20 shadow-2xl border border-black/5">
              <QrCode className="w-[400px] h-[400px] text-black opacity-90" />
            </div>
            <h2 className="text-7xl font-bold mb-8 tracking-tight text-black">Conheça o Catálogo.</h2>
            <p className="text-2xl text-muted-foreground/40 mb-24 font-medium tracking-tight">Escaneie o código acima e explore o ecossistema Apple completo.</p>
            <div className="flex flex-col gap-8 w-full max-w-xl">
              <GlassButton className="bg-[#25D366] hover:bg-[#20ba59] border-none h-32 text-3xl rounded-[3rem] text-white shadow-xl">
                <MessageCircle className="w-10 h-10 fill-current" /> Falar com Especialista
              </GlassButton>
              <button onClick={resetToHero} className="text-xl font-bold opacity-10 hover:opacity-100 transition-opacity py-10 tracking-[0.2em] uppercase active:scale-95">
                Encerrar Experiência
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="p-16 text-center text-[10px] tracking-[0.6em] font-bold uppercase opacity-10 shrink-0 text-black">
        MA IMPORTS — PREMIUM TECHNOLOGY EXPERIENCE
      </footer>
    </main>
  )
}