
"use client"

import * as React from "react"
import { 
  ChevronRight, Star, Smartphone, Box, RotateCcw, Zap, 
  QrCode, MessageCircle, Trophy, ArrowLeft, Gift, 
  Watch, Laptop, Headphones, Tablet, Speaker, Monitor
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

  // --- Memory Game Logic ---
  const initMemoryGame = () => {
    const icons = [
      { icon: Smartphone, name: 'iPhone' },
      { icon: Watch, name: 'Watch' },
      { icon: Laptop, name: 'Mac' },
      { icon: Headphones, name: 'AirPods' },
      { icon: Tablet, name: 'iPad' },
      { icon: Speaker, name: 'HomePod' },
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
          
          if (matchedCards.every(c => c.isMatched)) {
            finalizeGame('Jogo da Memória')
          }
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

  return (
    <main className="relative z-10 mx-auto max-w-7xl min-h-screen flex flex-col pb-20 font-body antialiased selection:bg-transparent">
      {/* Navigation */}
      <nav className="p-12 md:p-20 flex justify-between items-center animate-fade-in shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center shadow-2xl">
            <Smartphone className="w-10 h-10" />
          </div>
          <span className="font-bold text-4xl tracking-tighter text-black">MA <span className="opacity-20 font-light">Discovery</span></span>
        </div>
        {state !== 'hero' && (
          <button 
            onClick={resetToHero}
            className="flex items-center gap-3 text-xl font-bold opacity-30 hover:opacity-100 transition-all duration-300 active:scale-90"
          >
            <ArrowLeft className="w-7 h-7" /> Início
          </button>
        )}
      </nav>

      <div className="relative flex-1 flex flex-col items-center justify-center py-10 px-6">
        
        {/* HERO STATE - NO IMAGES, JUST PURE TYPOGRAPHY */}
        {state === 'hero' && (
          <div className="flex flex-col items-center text-center animate-fade-in max-w-6xl">
            <h1 className="text-[8rem] md:text-[14rem] font-bold tracking-tighter mb-16 leading-[0.8] text-black">
              Experiência.<br/><span className="text-muted-foreground/10 font-light italic">Discovery.</span>
            </h1>
            <p className="text-3xl md:text-5xl text-muted-foreground/40 mb-28 font-medium max-w-4xl tracking-tight leading-tight">
              A jornada tecnológica da MA Imports começa aqui.<br/>Toque abaixo para descobrir seu benefício.
            </p>
            <GlassButton 
              size="xl" 
              onClick={() => setState('choice')} 
              className="h-32 min-w-[500px] rounded-full shadow-[0_40px_80px_rgba(0,0,0,0.15)] text-4xl animate-pulse"
            >
              Iniciar Descoberta <ChevronRight className="ml-3 w-10 h-10" />
            </GlassButton>
            
            <div className="mt-32 flex gap-12 opacity-5">
              <Laptop className="w-12 h-12" />
              <Watch className="w-12 h-12" />
              <Headphones className="w-12 h-12" />
              <Tablet className="w-12 h-12" />
            </div>
          </div>
        )}

        {/* CHOICE STATE */}
        {state === 'choice' && (
          <div className="w-full animate-fade-in max-w-6xl">
            <h2 className="text-7xl md:text-9xl font-bold mb-32 text-center tracking-tighter text-black">Escolha seu Desafio.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { id: 'game-box', icon: Box, name: 'Caixas', desc: 'Sorte Pura.', color: 'bg-white' },
                { id: 'game-wheel', icon: RotateCcw, name: 'Roda Tech', desc: 'Gire e Ganhe.', color: 'bg-white' },
                { id: 'game-speed', icon: Zap, name: 'Reflexo', desc: 'Toque Rápido.', color: 'bg-white' },
                { id: 'game-memory', icon: Monitor, name: 'Memória', desc: 'Foco Total.', color: 'bg-white', action: initMemoryGame },
              ].map((game) => (
                <button
                  key={game.id}
                  onClick={() => game.action ? game.action() : setState(game.id as any)}
                  className={cn(
                    "relative p-14 rounded-[4rem] border border-black/5 flex flex-col items-center text-center group hover:scale-[1.03] active:scale-95 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden",
                    game.color
                  )}
                >
                  <div className="w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-12 bg-zinc-50 border border-black/5 group-hover:bg-black group-hover:text-white transition-all duration-500">
                    <game.icon className="w-12 h-12 transition-transform duration-500 group-hover:rotate-12" />
                  </div>
                  <h3 className="text-4xl font-bold mb-4 tracking-tighter text-black">{game.name}</h3>
                  <p className="text-xl text-muted-foreground/60 font-medium">{game.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: MEMORY */}
        {state === 'game-memory' && (
          <div className="flex flex-col items-center animate-fade-in w-full max-w-6xl">
            <h2 className="text-7xl font-bold mb-8 tracking-tighter text-black">Jogo da Memória</h2>
            <p className="text-3xl text-muted-foreground/60 mb-20 font-medium">Combine os ícones premium.</p>
            
            <div className="grid grid-cols-3 md:grid-cols-4 gap-8 w-full px-4">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={cn(
                    "relative h-[220px] md:h-[280px] rounded-[4rem] transition-all duration-500 perspective-1000",
                    (card.isFlipped || card.isMatched) ? "rotate-y-180" : ""
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 w-full h-full rounded-[4rem] transition-all duration-500 preserve-3d flex items-center justify-center shadow-sm",
                    (card.isFlipped || card.isMatched) 
                      ? "bg-white border-2 border-black/10" 
                      : "bg-zinc-100 border border-black/5 hover:bg-zinc-200"
                  )}>
                    {(card.isFlipped || card.isMatched) ? (
                      <card.icon className="w-20 h-20 text-black" />
                    ) : (
                      <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center">
                        <Smartphone className="w-8 h-8 text-black/20" />
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
          <div className="flex flex-col items-center animate-fade-in w-full max-w-6xl">
            <h2 className="text-7xl font-bold mb-8 tracking-tighter text-black">Caixa Premiada</h2>
            <p className="text-3xl text-muted-foreground/60 mb-28 font-medium">Revele seu benefício exclusivo.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20 w-full">
              {[0, 1, 2].map((i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setSelectedBox(i)
                    finalizeGame('Caixa Premiada')
                  }}
                  className={cn(
                    "relative h-[450px] bg-white rounded-[6rem] border border-black/5 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-6 flex flex-col items-center justify-center group overflow-hidden active:scale-90",
                    selectedBox === i && "animate-shake bg-zinc-50 border-black/20"
                  )}
                >
                  <div className="relative">
                    <Gift className={cn(
                      "w-40 h-40 text-black transition-all duration-700",
                      selectedBox === i ? "scale-150 rotate-12 opacity-100" : "opacity-10 group-hover:opacity-100 group-hover:scale-125"
                    )} />
                  </div>
                  <div className="mt-16 text-sm font-black uppercase tracking-[0.5em] opacity-20">Selecionar</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: RODA TECH */}
        {state === 'game-wheel' && (
          <div className="flex flex-col items-center animate-fade-in w-full">
            <h2 className="text-7xl font-bold mb-8 tracking-tighter text-black">Roda Tech</h2>
            <p className="text-3xl text-muted-foreground/60 mb-28 font-medium">Gire para descobrir seu prêmio.</p>
            
            <div className="relative mb-32">
              <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 z-30 drop-shadow-2xl">
                <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[60px] border-t-black" />
              </div>
              <div className="relative p-10 bg-white rounded-full shadow-[0_60px_120px_rgba(0,0,0,0.1)] border-[12px] border-black/5">
                <div 
                  className="w-[550px] h-[550px] md:w-[750px] md:h-[750px] rounded-full bg-zinc-50 relative transition-transform duration-[4500ms] ease-[cubic-bezier(0.15,0,0.15,1)] flex items-center justify-center overflow-hidden border-2 border-black/5"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {[0, 1, 2, 3].map((_, i) => (
                    <div key={i} className="wheel-segment" style={{ transform: `rotate(${i * 90}deg) skewY(-45deg)` }} />
                  ))}
                  <div className="absolute z-20 w-48 h-48 bg-white rounded-full shadow-2xl border-[12px] border-zinc-50 flex items-center justify-center">
                    <Smartphone className="w-20 h-20 text-black" />
                  </div>
                </div>
              </div>
            </div>
            <GlassButton size="xl" onClick={spinWheel} disabled={isSpinning} className="h-32 min-w-[500px] rounded-full shadow-2xl text-4xl">
              {isSpinning ? 'Sorteando...' : 'Girar Agora'}
            </GlassButton>
          </div>
        )}

        {/* GAME: TOQUE RÁPIDO */}
        {state === 'game-speed' && (
          <div className="flex flex-col items-center w-full animate-fade-in max-w-6xl">
            {!speedActive && speedScore === 0 ? (
              <div className="text-center">
                <h2 className="text-7xl font-bold mb-8 tracking-tighter text-black">Toque Rápido</h2>
                <p className="text-3xl text-muted-foreground/60 mb-28 font-medium max-w-3xl mx-auto">Sua agilidade define sua recompensa.<br/>Toque nos alvos o mais rápido possível.</p>
                <GlassButton size="xl" onClick={startSpeedGame} className="h-32 min-w-[450px] rounded-full text-4xl">Começar Desafio</GlassButton>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="flex justify-between w-full mb-20 px-16">
                  <div className="flex flex-col">
                    <span className="text-sm uppercase tracking-[0.4em] opacity-30 font-black mb-4">Tempo</span>
                    <div className="text-7xl font-bold tabular-nums">{timeLeft}s</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm uppercase tracking-[0.4em] opacity-30 font-black mb-4">Acertos</span>
                    <div className="text-7xl font-bold tabular-nums">{speedScore}</div>
                  </div>
                </div>
                <div className="relative w-full aspect-[4/3] md:aspect-video bg-white border-4 border-black/5 rounded-[6rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.05)]">
                  <button
                    onClick={handleTargetHit}
                    className="absolute w-40 h-40 bg-black text-white rounded-[3.5rem] shadow-2xl flex items-center justify-center transition-all duration-75 active:scale-125"
                    style={{ top: targetPos.top, left: targetPos.left }}
                  >
                    <Zap className="w-20 h-20 fill-current" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESULT STATE */}
        {state === 'result' && (
          <div className="flex flex-col items-center text-center px-10 animate-scale-in max-w-6xl">
            <div className="w-48 h-48 rounded-[4rem] bg-black text-white flex items-center justify-center mb-24 shadow-[0_40px_80px_rgba(0,0,0,0.2)]">
              <Trophy className="w-24 h-24" />
            </div>
            <h2 className="text-9xl md:text-[12rem] font-bold mb-12 tracking-tighter text-black leading-none">Incrível.</h2>
            <p className="text-4xl font-medium opacity-20 mb-28 tracking-tight">Você conquistou:</p>
            <div className="relative w-full bg-white border border-black/5 p-24 rounded-[7rem] shadow-[0_60px_120px_rgba(0,0,0,0.1)] mb-32 overflow-hidden">
               <h3 className="text-6xl md:text-9xl font-bold tracking-tighter leading-tight relative z-10 text-black">{reward}</h3>
            </div>
            <GlassButton size="xl" onClick={() => setState('evaluation')} className="h-32 min-w-[550px] rounded-full text-4xl">
              Continuar <ChevronRight className="ml-4 w-10 h-10" />
            </GlassButton>
          </div>
        )}

        {/* EVALUATION STATE */}
        {state === 'evaluation' && (
          <div className="flex flex-col items-center text-center px-10 animate-fade-in max-w-5xl">
            <h2 className="text-[6rem] md:text-[10rem] font-bold mb-16 tracking-tighter leading-[0.85] text-black">Sua Experiência.<br/><span className="opacity-10 italic font-light">Avalie-nos.</span></h2>
            <p className="text-3xl text-muted-foreground/40 mb-32 font-medium leading-relaxed max-w-3xl">
              Sua opinião nos ajuda a elevar o padrão de excelência MA Imports.
            </p>
            <div className="flex flex-col gap-12 w-full max-w-2xl">
              <GlassButton variant="primary" size="xl" className="w-full h-36 text-4xl rounded-[4rem] shadow-2xl">
                <Star className="w-12 h-12 fill-current" /> Avaliar no Google
              </GlassButton>
              <button onClick={() => setState('final')} className="text-3xl font-bold opacity-20 hover:opacity-100 transition-opacity py-10 tracking-tight active:scale-95">
                Pular Avaliação
              </button>
            </div>
          </div>
        )}

        {/* FINAL STATE */}
        {state === 'final' && (
          <div className="flex flex-col items-center text-center px-10 animate-fade-in max-w-6xl">
            <div className="bg-white p-24 rounded-[8rem] mb-28 shadow-[0_60px_120px_rgba(0,0,0,0.05)] border border-black/5">
              <QrCode className="w-[450px] h-[450px] text-black opacity-90" />
            </div>
            <h2 className="text-8xl font-bold mb-12 tracking-tighter text-black">Conheça o Catálogo.</h2>
            <p className="text-3xl text-muted-foreground/40 mb-32 font-medium tracking-tight">Escaneie o código acima e explore o ecossistema Apple completo.</p>
            <div className="flex flex-col gap-10 w-full max-w-2xl">
              <GlassButton className="bg-[#25D366] hover:bg-[#20ba59] border-none h-36 text-4xl rounded-[4.5rem] text-white shadow-2xl">
                <MessageCircle className="w-12 h-12 fill-current" /> Falar com Especialista
              </GlassButton>
              <button onClick={resetToHero} className="text-2xl font-black opacity-10 hover:opacity-100 transition-opacity py-12 tracking-[0.3em] uppercase active:scale-95">
                Encerrar Experiência
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="p-20 text-center text-sm tracking-[0.8em] font-black uppercase opacity-5 shrink-0 text-black">
        MA IMPORTS — PREMIUM TECHNOLOGY EXPERIENCE
      </footer>
    </main>
  )
}
