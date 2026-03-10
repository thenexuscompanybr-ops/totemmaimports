
"use client"

import * as React from "react"
import Image from "next/image"
import { 
  ChevronRight, Box, RotateCcw, Zap, 
  QrCode, Star, Trophy, ArrowLeft, Gift, 
  Smartphone
} from "lucide-react"
import { GlassButton } from "@/components/ma/GlassButton"
import { CouponRewards, saveGameSession } from "@/lib/coupon-service"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { cn } from "@/lib/utils"

type AppState = 'hero' | 'choice' | 'game-box' | 'game-wheel' | 'game-speed' | 'game-memory' | 'result' | 'google-incentive' | 'qr-code'

export default function TotemExperience() {
  const [state, setState] = React.useState<AppState>('hero')
  const [reward, setReward] = React.useState<string | null>(null)
  
  // Game States
  const [isSpinning, setIsSpinning] = React.useState(false)
  const [rotation, setRotation] = React.useState(0)
  const [speedScore, setSpeedScore] = React.useState(0)
  const [speedActive, setSpeedActive] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(5)
  const [targetPos, setTargetPos] = React.useState({ top: '50%', left: '50%' })
  const [selectedBox, setSelectedBox] = React.useState<number | null>(null)

  // Memory Game State
  const [memoryCards, setMemoryCards] = React.useState<{id: number, icon: any, isFlipped: boolean, isMatched: boolean}[]>([])
  const [flippedCards, setFlippedCards] = React.useState<number[]>([])

  const maLogo = PlaceHolderImages.find(img => img.id === 'ma-logo')?.imageUrl || ""

  const resetToHero = React.useCallback(() => {
    setState('hero')
    setIsSpinning(false)
    setSpeedActive(false)
    setSpeedScore(0)
    setSelectedBox(null)
    setReward(null)
    setFlippedCards([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Inactivity Reset (2 minutes)
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

  // Final Auto-Reset (15 seconds on QR screen)
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
    }, 3000)
  }

  // Speed Game Logic
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

  // Memory Game Logic
  const initMemoryGame = () => {
    const icons = [Smartphone, Box, RotateCcw, Zap, Star, Trophy];
    const cards = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((Icon, index) => ({
        id: index,
        icon: Icon,
        isFlipped: false,
        isMatched: false
      }));
    setMemoryCards(cards);
    setFlippedCards([]);
    setState('game-memory');
  }

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || memoryCards[id].isFlipped || memoryCards[id].isMatched) return;

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    const newCards = memoryCards.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    );
    setMemoryCards(newCards);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (memoryCards[first].icon === memoryCards[second].icon) {
        const matchedCards = newCards.map(card => 
          card.id === first || card.id === second ? { ...card, isMatched: true } : card
        );
        setMemoryCards(matchedCards);
        setFlippedCards([]);
        if (matchedCards.every(card => card.isMatched)) {
          setTimeout(() => finalizeGame('Jogo da Memória'), 800);
        }
      } else {
        setTimeout(() => {
          setMemoryCards(memoryCards.map(card => 
            card.id === first || card.id === second ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }

  return (
    <main className={cn(
      "fixed inset-0 w-screen h-screen flex flex-col overflow-hidden select-none transition-all duration-700 ease-in-out",
      state === 'hero' ? "bg-gradient-to-br from-[#001D3D] via-[#000814] to-[#000000]" : "bg-[#F7F8FA]"
    )}>
      
      {/* Header Fixo */}
      <header className={cn(
        "h-24 px-12 flex justify-between items-center z-50 transition-colors duration-500",
        state === 'hero' ? "bg-transparent border-white/5" : "glass-nav border-b border-[#001D3D]/5"
      )}>
        <div className="flex items-center gap-4 cursor-pointer" onClick={resetToHero}>
          <div className="relative w-16 h-16">
            <Image 
              src={maLogo} 
              alt="MA Imports Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <span className={cn(
            "text-2xl font-bold tracking-tight transition-colors",
            state === 'hero' ? "text-white" : "text-[#001D3D]"
          )}>MA Discovery</span>
        </div>
        {state !== 'hero' && (
          <button onClick={resetToHero} className="flex items-center gap-2 text-lg font-bold text-[#001D3D]/40 active:text-[#001D3D]">
            <ArrowLeft className="w-5 h-5" /> Início
          </button>
        )}
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* TELA 1: HERO */}
        {state === 'hero' && (
          <div className="flex flex-col items-center text-center px-12 animate-reveal max-w-5xl">
            <div className="relative w-32 h-32 mb-12 animate-float">
               <Image 
                src={maLogo} 
                alt="MA Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-extrabold tracking-tight leading-[1] mb-12 text-white">
              Teste sua <span className="text-[#C5A059]">sorte.</span>
            </h1>
            <p className="text-2xl md:text-3xl text-white/50 font-medium mb-20 max-w-3xl leading-relaxed">
              Interaja com nossa tecnologia e ganhe um benefício exclusivo agora mesmo na MA Imports.
            </p>
            <GlassButton 
              size="totem" 
              variant="gold"
              onClick={() => setState('choice')} 
              className="w-full max-w-md"
            >
              COMEÇAR <ChevronRight className="w-8 h-8" />
            </GlassButton>
          </div>
        )}

        {/* TELA DE ESCOLHA */}
        {state === 'choice' && (
          <div className="w-full max-w-7xl px-12 animate-reveal text-center">
            <h2 className="text-5xl font-bold mb-20 tracking-tight text-[#001D3D]">Qual desafio você prefere?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { id: 'game-box', icon: Box, name: 'Caixa Surpresa', desc: 'Sua intuição.', action: () => setState('game-box') },
                { id: 'game-wheel', icon: RotateCcw, name: 'Roleta Tech', desc: 'Sorte pura.', action: () => setState('game-wheel') },
                { id: 'game-speed', icon: Zap, name: 'Toque Rápido', desc: 'Seus reflexos.', action: () => setState('game-speed') },
                { id: 'game-memory', icon: Star, name: 'Memória', desc: 'Foco total.', action: initMemoryGame },
              ].map((game) => (
                <button
                  key={game.id}
                  onClick={game.action}
                  className="bg-white p-12 rounded-[40px] shadow-sm border border-[#001D3D]/5 flex flex-col items-center group active:scale-95 transition-all duration-300"
                >
                  <div className="w-20 h-20 rounded-3xl bg-[#001D3D]/5 flex items-center justify-center mb-8 group-active:bg-[#C5A059] group-active:text-white transition-colors">
                    <game.icon className="w-8 h-8 text-[#C5A059]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight text-[#001D3D]">{game.name}</h3>
                  <p className="text-lg text-[#001D3D]/40 font-medium">{game.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: CAIXA SURPRESA */}
        {state === 'game-box' && (
          <div className="w-full max-w-6xl px-12 animate-reveal text-center">
            <h2 className="text-4xl font-bold mb-16 text-[#001D3D]/40">Escolha uma caixa</h2>
            <div className="grid grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <button 
                  key={i} 
                  onClick={() => { setSelectedBox(i); finalizeGame('Caixa Surpresa'); }}
                  className={cn(
                    "relative aspect-square bg-white rounded-[40px] border border-[#001D3D]/5 flex items-center justify-center active:scale-90 transition-all duration-300 shadow-sm",
                    selectedBox === i && "border-[#C5A059] animate-pulse"
                  )}
                >
                  <Gift className="w-24 h-24 text-[#C5A059]/20" />
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
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-[#C5A059]" />
              </div>
              <div className="p-6 bg-white rounded-full shadow-2xl border border-[#001D3D]/5">
                <div 
                  className="w-[450px] h-[450px] md:w-[600px] md:h-[600px] rounded-full bg-[#F7F8FA] relative transition-transform duration-[3000ms] ease-[cubic-bezier(0.15,0,0.15,1)] flex items-center justify-center overflow-hidden border border-[#001D3D]/5"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {[0, 1, 2, 3].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-full h-full" 
                      style={{ 
                        transform: `rotate(${i * 90}deg)`,
                        background: i % 2 === 0 ? 'white' : 'rgba(0,29,61,0.02)',
                        transformOrigin: 'center'
                      }} 
                    />
                  ))}
                  <div className="absolute z-20 w-40 h-40 bg-white rounded-full shadow-xl flex items-center justify-center">
                    <div className="relative w-20 h-20">
                      <Image src={maLogo} alt="MA Logo" fill className="object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <GlassButton variant="gold" size="totem" onClick={spinWheel} disabled={isSpinning} className="w-full min-w-[400px]">
              {isSpinning ? 'Girando...' : 'GIRAR AGORA'}
            </GlassButton>
          </div>
        )}

        {/* GAME: TOQUE RÁPIDO */}
        {state === 'game-speed' && (
          <div className="w-full max-w-5xl px-12 animate-reveal flex flex-col items-center">
            {!speedActive && speedScore === 0 ? (
              <div className="text-center">
                <h2 className="text-5xl font-extrabold mb-12 text-[#001D3D]">Você é rápido?</h2>
                <GlassButton variant="gold" size="totem" onClick={startSpeedGame} className="min-w-[400px]">COMEÇAR (5s)</GlassButton>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="flex justify-between w-full mb-12">
                  <div className="text-3xl font-bold text-[#001D3D]/30 uppercase tracking-widest">Tempo: {timeLeft}s</div>
                  <div className="text-3xl font-bold uppercase tracking-widest text-[#C5A059]">Score: {speedScore}</div>
                </div>
                <div className="relative w-full aspect-[16/9] bg-white border-2 border-[#001D3D]/5 rounded-[48px] overflow-hidden shadow-inner">
                  <button
                    onClick={handleTargetHit}
                    className="absolute w-32 h-32 bg-[#001D3D] text-[#C5A059] rounded-[32px] shadow-2xl flex items-center justify-center transition-all duration-100 active:scale-125"
                    style={{ top: targetPos.top, left: targetPos.left }}
                  >
                    <Zap className="w-12 h-12 fill-current" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GAME: MEMORY */}
        {state === 'game-memory' && (
          <div className="w-full max-w-4xl px-12 animate-reveal text-center">
            <h2 className="text-4xl font-bold mb-12 text-[#001D3D]/40">Combine os pares</h2>
            <div className="grid grid-cols-4 gap-6">
              {memoryCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={cn(
                    "aspect-square rounded-3xl border border-[#001D3D]/5 flex items-center justify-center text-4xl transition-all duration-500 transform perspective-1000",
                    card.isFlipped || card.isMatched ? "bg-white rotate-y-0" : "bg-[#001D3D]/5 rotate-y-180"
                  )}
                >
                  {(card.isFlipped || card.isMatched) ? (
                    <card.icon className="w-12 h-12 text-[#C5A059]" />
                  ) : (
                    <div className="w-12 h-12 bg-[#C5A059]/10 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TELA 3: RESULTADO */}
        {state === 'result' && (
          <div className="flex flex-col items-center text-center px-12 animate-reveal">
            <div className="w-32 h-32 rounded-[40px] bg-[#001D3D] flex items-center justify-center mb-16 shadow-2xl animate-float">
              <Trophy className="w-16 h-16 text-[#C5A059]" />
            </div>
            <h2 className="text-6xl font-bold mb-6 tracking-tight text-[#001D3D]">Parabéns!</h2>
            <p className="text-xl uppercase tracking-[0.4em] font-bold text-[#001D3D]/30 mb-16">Seu benefício exclusivo é:</p>
            <div className="bg-white border border-[#C5A059]/20 px-20 py-16 rounded-[48px] shadow-sm mb-20">
               <h3 className="text-4xl md:text-6xl font-black tracking-tight text-[#C5A059]">{reward}</h3>
            </div>
            <GlassButton variant="gold" size="totem" onClick={() => setState('google-incentive')} className="w-full max-w-md">
              RESGATAR <ChevronRight className="w-8 h-8" />
            </GlassButton>
          </div>
        )}

        {/* TELA 4: INCENTIVO GOOGLE */}
        {state === 'google-incentive' && (
          <div className="flex flex-col items-center text-center px-12 animate-reveal">
            <div className="flex gap-2 mb-12">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-12 h-12 fill-[#C5A059] text-[#C5A059]" />)}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-10 tracking-tight text-[#001D3D]">Nos ajude a crescer.</h2>
            <p className="text-2xl text-[#001D3D]/50 font-medium mb-20 max-w-2xl leading-relaxed">
              Sua avaliação no Google é muito importante para nós e para outros clientes MA Imports.
            </p>
            <GlassButton variant="gold" size="totem" onClick={() => setState('qr-code')} className="w-full max-w-lg">
              AVALIAR AGORA
            </GlassButton>
          </div>
        )}

        {/* TELA 5: QR CODE */}
        {state === 'qr-code' && (
          <div className="flex flex-col items-center text-center px-12 animate-reveal">
            <div className="bg-white p-20 rounded-[64px] mb-16 shadow-2xl border border-[#001D3D]/5 animate-reveal">
              <QrCode className="w-72 h-72 text-[#001D3D]" />
            </div>
            <h2 className="text-4xl font-bold mb-6 tracking-tight text-[#001D3D]">Escaneie para avaliar</h2>
            <p className="text-xl text-[#001D3D]/30 font-bold uppercase tracking-[0.3em] mb-20">
              Obrigado pela preferência!
            </p>
            <div className="text-sm font-bold text-[#C5A059]/40 uppercase tracking-widest">
              O totem reiniciará em instantes...
            </div>
          </div>
        )}

      </div>

      {/* Footer Fixo */}
      <footer className={cn(
        "h-20 px-12 flex justify-center items-center border-t transition-colors duration-500",
        state === 'hero' ? "border-white/5 bg-black/20" : "border-[#001D3D]/5 bg-white/50"
      )}>
        <span className={cn(
          "text-xs tracking-[0.6em] font-black uppercase opacity-20",
          state === 'hero' ? "text-white" : "text-[#001D3D]"
        )}>
          MA IMPORTS — PREMIUM KIOSK EXPERIENCE
        </span>
      </footer>

    </main>
  )
}
