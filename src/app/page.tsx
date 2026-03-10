
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
type SpinState = 'idle' | 'spinning' | 'stopping'

export default function TotemExperience() {
  const [state, setState] = React.useState<AppState>('hero')
  const [reward, setReward] = React.useState<string | null>(null)
  
  // Game States
  const [spinPhase, setSpinPhase] = React.useState<SpinState>('idle')
  const [rotation, setRotation] = React.useState(0)
  const [speedScore, setSpeedScore] = React.useState(0)
  const [speedActive, setSpeedActive] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(10)
  const [targetPos, setTargetPos] = React.useState({ top: '50%', left: '50%' })
  const [selectedBox, setSelectedBox] = React.useState<number | null>(null)

  // Memory Game State
  const [memoryCards, setMemoryCards] = React.useState<{id: number, icon: any, isFlipped: boolean, isMatched: boolean}[]>([])
  const [flippedCards, setFlippedCards] = React.useState<number[]>([])

  const maLogo = PlaceHolderImages.find(img => img.id === 'ma-logo')?.imageUrl || ""

  const resetToHero = React.useCallback(() => {
    setState('hero')
    setSpinPhase('idle')
    setRotation(0)
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

  // Improved Wheel Logic
  const startSpinning = () => {
    setSpinPhase('spinning')
    setRotation(r => r + 360)
  }

  const stopSpinning = () => {
    setSpinPhase('stopping')
    const extraDegrees = 1440 + Math.random() * 360
    const finalRotation = rotation + extraDegrees
    setRotation(finalRotation)
    
    setTimeout(() => {
      finalizeGame('Roda Tech')
    }, 3200)
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
    <main className="fixed inset-0 w-screen h-screen flex flex-col overflow-hidden select-none transition-all duration-700 ease-in-out bg-[#001D3D] bg-gradient-to-br from-[#001D3D] via-[#000814] to-[#000000]">
      
      {/* Header - Only if not hero */}
      {state !== 'hero' && (
        <header className="h-24 px-12 flex justify-between items-center z-50 glass-nav border-b border-white/5 animate-reveal">
          <div className="flex items-center gap-4 cursor-pointer" onClick={resetToHero}>
            <div className="relative w-14 h-14">
              <Image 
                src={maLogo} 
                alt="MA Imports Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <span className="text-2xl font-black tracking-tight text-white uppercase">MA Discovery</span>
          </div>
          <button onClick={resetToHero} className="flex items-center gap-2 text-lg font-black text-white/40 active:text-white transition-colors uppercase tracking-widest">
            <ArrowLeft className="w-5 h-5" /> Início
          </button>
        </header>
      )}

      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden p-8 md:p-12">
        
        {/* SCREEN 1: HERO */}
        {state === 'hero' && (
          <div className="flex flex-col items-center text-center animate-reveal max-w-6xl">
            <div className="relative w-40 h-40 mb-12 animate-float">
               <Image 
                src={maLogo} 
                alt="MA Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <h1 className="text-[clamp(3.5rem,10vw,8rem)] font-black tracking-tighter leading-[0.9] mb-8 text-white uppercase">
              Teste sua <span className="text-[#C5A059]">sorte.</span>
            </h1>
            <p className="text-2xl md:text-3xl text-white/40 font-medium mb-16 max-w-3xl leading-relaxed">
              Interaja com nossa tecnologia e ganhe um benefício exclusivo agora mesmo na MA Imports.
            </p>
            <GlassButton 
              variant="gold"
              onClick={() => setState('choice')} 
              className="w-full max-w-lg animate-reveal"
            >
              COMEÇAR <ChevronRight className="w-8 h-8" />
            </GlassButton>
          </div>
        )}

        {/* SCREEN: CHOICE */}
        {state === 'choice' && (
          <div className="w-full max-w-5xl animate-reveal text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-16 tracking-tighter text-white uppercase">Escolha seu desafio</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: 'game-box', icon: Box, name: 'Caixas', desc: 'Intuição', action: () => setState('game-box') },
                { id: 'game-wheel', icon: RotateCcw, name: 'Roleta', desc: 'Sorte', action: () => setState('game-wheel') },
                { id: 'game-speed', icon: Zap, name: 'Reflexo', desc: 'Velocidade', action: () => setState('game-speed') },
                { id: 'game-memory', icon: Star, name: 'Memória', desc: 'Foco', action: initMemoryGame },
              ].map((game) => (
                <button
                  key={game.id}
                  onClick={game.action}
                  className="bg-white/5 p-8 rounded-[40px] border border-white/10 flex flex-col items-center group active:scale-95 transition-all duration-300 backdrop-blur-3xl hover:bg-white/10"
                >
                  <div className="w-16 h-16 rounded-[20px] bg-[#C5A059]/10 flex items-center justify-center mb-6 group-active:bg-[#C5A059] transition-colors">
                    <game.icon className="w-7 h-7 text-[#C5A059] group-active:text-white" />
                  </div>
                  <h3 className="text-xl font-black mb-1 tracking-tight text-white uppercase">{game.name}</h3>
                  <p className="text-sm text-white/30 font-bold uppercase tracking-widest">{game.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: BOX SURPRISE */}
        {state === 'game-box' && (
          <div className="w-full max-w-4xl animate-reveal text-center">
            <h2 className="text-3xl font-black mb-16 text-white/20 uppercase tracking-widest">Selecione uma caixa</h2>
            <div className="grid grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <button 
                  key={i} 
                  onClick={() => { setSelectedBox(i); finalizeGame('Caixa Surpresa'); }}
                  className={cn(
                    "relative aspect-square bg-white/5 rounded-[48px] border border-white/10 flex items-center justify-center active:scale-90 transition-all duration-300 backdrop-blur-xl",
                    selectedBox === i && "border-[#C5A059] scale-95 shadow-[0_0_80px_rgba(197,160,89,0.2)]"
                  )}
                >
                  <Gift className="w-20 h-20 text-[#C5A059]/30" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: ROLETA TECH */}
        {state === 'game-wheel' && (
          <div className="flex flex-col items-center animate-reveal">
            <div className="relative mb-16">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-[#C5A059] filter drop-shadow-lg" />
              </div>
              <div className="p-6 bg-white/5 rounded-full border border-white/10 backdrop-blur-3xl">
                <div 
                  className={cn(
                    "w-[450px] h-[450px] md:w-[600px] md:h-[600px] rounded-full bg-white/5 relative transition-transform duration-[3200ms] ease-[cubic-bezier(0.15,0,0.1,1)] flex items-center justify-center overflow-hidden border border-white/10",
                    spinPhase === 'spinning' && "animate-[spin_0.8s_linear_infinite]"
                  )}
                  style={{ transform: spinPhase === 'stopping' ? `rotate(${rotation}deg)` : undefined }}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-full h-full" 
                      style={{ 
                        transform: `rotate(${i * 45}deg)`,
                        background: i % 2 === 0 ? 'rgba(197, 160, 89, 0.05)' : 'transparent',
                        transformOrigin: 'center'
                      }} 
                    >
                       <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white/5 font-black text-3xl uppercase tracking-tighter">
                         MA
                       </div>
                    </div>
                  ))}
                  <div className="absolute z-20 w-32 h-32 bg-[#001D3D] rounded-full shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-white/10 flex items-center justify-center">
                    <div className="relative w-16 h-16">
                      <Image src={maLogo} alt="MA Logo" fill className="object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-md">
              {spinPhase === 'idle' && (
                <GlassButton variant="gold" onClick={startSpinning} className="w-full">
                  GIRAR AGORA
                </GlassButton>
              )}
              
              {spinPhase === 'spinning' && (
                <GlassButton 
                  variant="gold" 
                  onClick={stopSpinning} 
                  className="w-full bg-red-600 text-white shadow-[0_0_60px_rgba(220,38,38,0.2)]"
                >
                  PARAR!
                </GlassButton>
              )}

              {spinPhase === 'stopping' && (
                <GlassButton variant="gold" disabled className="w-full opacity-80">
                  DESACELERANDO...
                </GlassButton>
              )}
            </div>
          </div>
        )}

        {/* GAME: SPEED TOUCH */}
        {state === 'game-speed' && (
          <div className="w-full max-w-5xl animate-reveal flex flex-col items-center">
            {!speedActive && speedScore === 0 ? (
              <div className="text-center">
                <h2 className="text-5xl font-black mb-12 text-white uppercase tracking-tighter">Desafio de Reflexo</h2>
                <GlassButton variant="gold" onClick={startSpeedGame} className="min-w-[400px]">COMEÇAR (10S)</GlassButton>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="flex justify-between w-full mb-12">
                  <div className="text-2xl font-black text-white/20 uppercase tracking-[0.2em]">Tempo: {timeLeft}s</div>
                  <div className="text-2xl font-black uppercase tracking-[0.2em] text-[#C5A059]">Score: {speedScore}</div>
                </div>
                <div className="relative w-full aspect-[16/9] bg-white/5 border border-white/10 rounded-[64px] overflow-hidden backdrop-blur-3xl shadow-inner">
                  <button
                    onClick={handleTargetHit}
                    className="absolute w-24 h-24 bg-[#C5A059] text-[#001D3D] rounded-[24px] shadow-[0_20px_40px_rgba(197,160,89,0.3)] flex items-center justify-center transition-all duration-100 active:scale-125"
                    style={{ top: targetPos.top, left: targetPos.left }}
                  >
                    <Smartphone className="w-10 h-10 fill-current" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GAME: MEMORY */}
        {state === 'game-memory' && (
          <div className="w-full max-w-4xl animate-reveal text-center">
            <h2 className="text-3xl font-black mb-12 text-white/20 uppercase tracking-widest">Encontre os pares</h2>
            <div className="grid grid-cols-4 gap-6">
              {memoryCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={cn(
                    "aspect-square rounded-[32px] border border-white/10 flex items-center justify-center transition-all duration-500 transform perspective-1000",
                    card.isFlipped || card.isMatched ? "bg-white/10 rotate-y-0" : "bg-white/5 rotate-y-180 backdrop-blur-xl"
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

        {/* SCREEN 3: RESULT */}
        {state === 'result' && (
          <div className="flex flex-col items-center text-center animate-reveal">
            <div className="w-32 h-32 rounded-[32px] bg-[#C5A059] flex items-center justify-center mb-12 shadow-[0_30px_60px_rgba(197,160,89,0.3)] animate-float">
              <Trophy className="w-16 h-16 text-[#001D3D]" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter text-white uppercase">Excelente!</h2>
            <p className="text-lg uppercase tracking-[0.4em] font-black text-white/30 mb-12">Seu benefício exclusivo é:</p>
            <div className="bg-white/5 border border-[#C5A059]/30 px-12 py-10 rounded-[48px] backdrop-blur-3xl mb-16 shadow-2xl max-w-2xl">
               <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-[#C5A059] uppercase leading-tight">{reward}</h3>
            </div>
            <GlassButton variant="gold" onClick={() => setState('google-incentive')} className="w-full max-w-lg">
              RESGATAR <ChevronRight className="w-8 h-8" />
            </GlassButton>
          </div>
        )}

        {/* SCREEN 4: GOOGLE INCENTIVE */}
        {state === 'google-incentive' && (
          <div className="flex flex-col items-center text-center animate-reveal">
            <div className="flex gap-3 mb-12">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-12 h-12 fill-[#C5A059] text-[#C5A059] animate-reveal" style={{ animationDelay: `${i*100}ms` }} />)}
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter text-white uppercase">Avalie sua experiência</h2>
            <p className="text-2xl text-white/40 font-medium mb-16 max-w-3xl leading-relaxed">
              Sua avaliação ajuda a MA Imports a oferecer serviços cada vez melhores.
            </p>
            <GlassButton variant="gold" onClick={() => setState('qr-code')} className="w-full max-w-xl">
              AVALIAR AGORA
            </GlassButton>
          </div>
        )}

        {/* SCREEN 5: QR CODE */}
        {state === 'qr-code' && (
          <div className="flex flex-col items-center text-center animate-reveal">
            <div className="bg-white p-12 rounded-[64px] mb-12 shadow-[0_40px_80px_rgba(0,0,0,0.5)] animate-reveal">
              <QrCode className="w-64 h-64 text-[#001D3D]" />
            </div>
            <h2 className="text-4xl font-black mb-6 tracking-tighter text-white uppercase">Escaneie para avaliar</h2>
            <p className="text-xl text-white/30 font-black uppercase tracking-[0.3em] mb-16">
              Obrigado pela preferência!
            </p>
            <div className="text-lg font-black text-[#C5A059]/40 uppercase tracking-[0.2em] animate-pulse">
              Reiniciando totem em instantes...
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="h-20 px-12 flex justify-center items-center border-t border-white/5 bg-black/40 backdrop-blur-md">
        <span className="text-xs tracking-[1em] font-black uppercase text-white/10">
          MA IMPORTS — PREMIUM KIOSK
        </span>
      </footer>

    </main>
  )
}
