
"use client"

import * as React from "react"
import Image from "next/image"
import { 
  ChevronRight, Box, RotateCcw, Zap, 
  Star, Trophy, ArrowLeft, Gift, 
  Smartphone
} from "lucide-react"
import { GlassButton } from "@/components/ma/GlassButton"
import { CouponRewards, saveGameSession } from "@/lib/coupon-service"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { cn } from "@/lib/utils"

type AppState = 'hero' | 'choice' | 'game-box' | 'game-wheel' | 'game-speed' | 'game-memory' | 'result' | 'google-incentive' | 'qr-code'
type SpinState = 'idle' | 'spinning' | 'stopping' | 'dragging'

export default function TotemExperience() {
  const [state, setState] = React.useState<AppState>('hero')
  const [reward, setReward] = React.useState<string | null>(null)
  
  // Game States
  const [spinPhase, setSpinPhase] = React.useState<SpinState>('idle')
  const [rotation, setRotation] = React.useState(0)
  const wheelRef = React.useRef<HTMLDivElement>(null)
  
  // Interaction Refs
  const dragStartAngle = React.useRef(0)
  const lastAngle = React.useRef(0)
  const lastTime = React.useRef(0)
  const velocity = React.useRef(0)

  const [speedScore, setSpeedScore] = React.useState(0)
  const [speedActive, setSpeedActive] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(5)
  const [targetPos, setTargetPos] = React.useState({ top: '50%', left: '50%' })
  const [selectedBox, setSelectedBox] = React.useState<number | null>(null)

  // Memory Game State
  const [memoryCards, setMemoryCards] = React.useState<{id: number, icon: any, isFlipped: boolean, isMatched: boolean}[]>([])
  const [flippedCards, setFlippedCards] = React.useState<number[]>([])

  const maLogo = PlaceHolderImages.find(img => img.id === 'ma-logo')?.imageUrl || ""
  const qrImage = PlaceHolderImages.find(img => img.id === 'google-qr')?.imageUrl || ""

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

  const finalizeGame = (gameName: string, selectedReward?: string) => {
    const prize = selectedReward || CouponRewards[Math.floor(Math.random() * CouponRewards.length)]
    setReward(prize)
    saveGameSession(gameName, prize)
    setTimeout(() => {
      setState('result')
    }, 800)
  }

  // --- INTERACTIVE WHEEL LOGIC ---
  
  const getPointerAngle = (e: React.PointerEvent | PointerEvent) => {
    if (!wheelRef.current) return 0
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
    return angle
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (spinPhase !== 'idle') return
    setSpinPhase('dragging')
    const angle = getPointerAngle(e)
    dragStartAngle.current = angle - rotation
    lastAngle.current = angle
    lastTime.current = Date.now()
    velocity.current = 0
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (spinPhase !== 'dragging') return
    const currentAngle = getPointerAngle(e)
    const newRotation = currentAngle - dragStartAngle.current
    
    // Calculate angular velocity
    const now = Date.now()
    const dt = now - lastTime.current
    if (dt > 0) {
      const da = currentAngle - lastAngle.current
      velocity.current = da / dt
    }
    
    setRotation(newRotation)
    lastAngle.current = currentAngle
    lastTime.current = now
  }

  const handlePointerUp = () => {
    if (spinPhase !== 'dragging') return
    
    // If flick velocity is high enough, start spinning then stop automatically
    if (Math.abs(velocity.current) > 0.3) {
      startSpinningAuto()
    } else {
      setSpinPhase('idle')
    }
  }

  const startSpinningAuto = () => {
    setSpinPhase('spinning')
    setRotation(prev => prev % 360)
    
    // Automatically trigger stop after a short "fast spin" period
    setTimeout(() => {
      stopSpinning()
    }, 1200)
  }

  const stopSpinning = () => {
    if (!wheelRef.current) return
    
    // Catch current rotation from the animation
    const computedStyle = window.getComputedStyle(wheelRef.current)
    const matrix = new DOMMatrixReadOnly(computedStyle.transform)
    const currentAngle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI)
    
    setSpinPhase('stopping')
    
    const prizeIndex = Math.floor(Math.random() * CouponRewards.length)
    const selectedPrize = CouponRewards[prizeIndex]
    const sliceAngle = 360 / CouponRewards.length
    
    // Calculate final landing position
    const targetSliceRotation = 360 - (prizeIndex * sliceAngle)
    const finalRotation = currentAngle + (360 * 5) + targetSliceRotation - (currentAngle % 360)
    
    setRotation(finalRotation)
    
    setTimeout(() => {
      finalizeGame('Roda Tech', selectedPrize)
    }, 3200)
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

        {state === 'choice' && (
          <div className="w-full max-w-4xl animate-reveal text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-12 tracking-tighter text-white uppercase">Escolha seu desafio</h2>
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
                  className="bg-white/5 p-6 rounded-[32px] border border-white/10 flex flex-col items-center group active:scale-95 transition-all duration-300 backdrop-blur-3xl hover:bg-white/10"
                >
                  <div className="w-14 h-14 rounded-[18px] bg-[#C5A059]/10 flex items-center justify-center mb-4 group-active:bg-[#C5A059] transition-colors">
                    <game.icon className="w-6 h-6 text-[#C5A059] group-active:text-white" />
                  </div>
                  <h3 className="text-lg font-black mb-1 tracking-tight text-white uppercase">{game.name}</h3>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{game.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {state === 'game-box' && (
          <div className="w-full max-w-3xl animate-reveal text-center">
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
                  <Gift className="w-16 h-16 text-[#C5A059]/30" />
                </button>
              ))}
            </div>
          </div>
        )}

        {state === 'game-wheel' && (
          <div className="flex flex-col items-center animate-reveal">
            <div className="relative mb-8">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-40">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-[#C5A059] filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
              </div>
              <div className="p-6 bg-white/5 rounded-full border border-white/10 backdrop-blur-3xl relative">
                <div 
                  ref={wheelRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className={cn(
                    "w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full bg-white/5 relative flex items-center justify-center overflow-hidden border-4 border-[#C5A059]/20 cursor-grab active:cursor-grabbing",
                    spinPhase === 'spinning' && "animate-[spin_0.8s_linear_infinite]"
                  )}
                  style={{ 
                    transform: (spinPhase === 'stopping' || spinPhase === 'idle' || spinPhase === 'dragging') ? `rotate(${rotation}deg)` : undefined,
                    transition: spinPhase === 'stopping' ? 'transform 3.2s cubic-bezier(0.15, 0, 0.1, 1)' : 'none',
                  } as React.CSSProperties}
                >
                  {CouponRewards.map((prize, i) => (
                    <div 
                      key={i} 
                      className="absolute w-full h-full" 
                      style={{ 
                        transform: `rotate(${i * (360 / CouponRewards.length)}deg)`,
                        background: i % 2 === 0 ? 'rgba(197, 160, 89, 0.08)' : 'transparent',
                        transformOrigin: 'center'
                      }} 
                    >
                       <div 
                        className="absolute top-12 left-1/2 -translate-x-1/2 text-white font-black text-[10px] md:text-xs uppercase tracking-tighter text-center max-w-[80px]"
                       >
                         {prize}
                       </div>
                    </div>
                  ))}
                  <div className="absolute z-30 w-24 h-24 bg-[#001D3D] rounded-full shadow-[0_0_80px_rgba(0,0,0,0.8)] border-4 border-[#C5A059] flex items-center justify-center pointer-events-none">
                    <div className="relative w-12 h-12">
                      <Image src={maLogo} alt="MA Logo" fill className="object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-md space-y-8">
              <div className="text-center mb-4">
                <p className="text-[#C5A059] font-black uppercase text-xs tracking-[0.2em] animate-pulse">
                  Deslize rápido para girar
                </p>
              </div>
              
              <div className="pt-4">
                {spinPhase === 'idle' && (
                  <GlassButton variant="gold" onClick={startSpinningAuto} className="w-full">
                    GIRAR AGORA
                  </GlassButton>
                )}
                
                {(spinPhase === 'spinning' || spinPhase === 'stopping') && (
                  <GlassButton variant="gold" disabled className="w-full opacity-80">
                    SORTEANDO...
                  </GlassButton>
                )}
              </div>
            </div>
          </div>
        )}

        {state === 'game-speed' && (
          <div className="w-full max-w-4xl animate-reveal flex flex-col items-center">
            {!speedActive && speedScore === 0 ? (
              <div className="text-center">
                <h2 className="text-4xl font-black mb-12 text-white uppercase tracking-tighter">Desafio de Reflexo</h2>
                <GlassButton variant="gold" onClick={startSpeedGame} className="min-w-[350px]">COMEÇAR (5S)</GlassButton>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="flex justify-between w-full mb-8">
                  <div className="text-xl font-black text-white/20 uppercase tracking-[0.2em]">Tempo: {timeLeft}s</div>
                  <div className="text-xl font-black uppercase tracking-[0.2em] text-[#C5A059]">Score: {speedScore}</div>
                </div>
                <div className="relative w-full aspect-[16/9] bg-white/5 border border-white/10 rounded-[48px] overflow-hidden backdrop-blur-3xl shadow-inner max-w-3xl">
                  <button
                    onClick={handleTargetHit}
                    className="absolute w-20 h-20 bg-[#C5A059] text-[#001D3D] rounded-[24px] shadow-[0_20px_40px_rgba(197,160,89,0.3)] flex items-center justify-center transition-all duration-100 active:scale-125"
                    style={{ top: targetPos.top, left: targetPos.left }}
                  >
                    <Smartphone className="w-8 h-8 fill-current" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {state === 'game-memory' && (
          <div className="w-full max-w-3xl animate-reveal text-center">
            <h2 className="text-2xl font-black mb-12 text-white/20 uppercase tracking-widest">Encontre os pares</h2>
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
              {memoryCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={cn(
                    "aspect-square rounded-[24px] border border-white/10 flex items-center justify-center transition-all duration-500 transform perspective-1000",
                    card.isFlipped || card.isMatched ? "bg-white/10 rotate-y-0" : "bg-white/5 rotate-y-180 backdrop-blur-xl"
                  )}
                >
                  {(card.isFlipped || card.isMatched) ? (
                    <card.icon className="w-10 h-10 text-[#C5A059]" />
                  ) : (
                    <div className="w-10 h-10 bg-[#C5A059]/10 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {state === 'result' && (
          <div className="flex flex-col items-center text-center animate-reveal">
            <div className="w-32 h-32 rounded-[32px] bg-white flex items-center justify-center mb-8 shadow-2xl p-4">
              <div className="relative w-full h-full">
                <Image src={qrImage} alt="QR" fill className="object-contain" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-white uppercase">Excelente!</h2>
            <p className="text-sm uppercase tracking-[0.4em] font-black text-white/30 mb-8">Seu benefício exclusivo é:</p>
            <div className="bg-white/5 border border-[#C5A059]/30 px-8 py-6 rounded-[32px] backdrop-blur-3xl mb-12 shadow-2xl max-w-lg">
               <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-[#C5A059] uppercase leading-tight">{reward}</h3>
            </div>
            <GlassButton variant="gold" onClick={() => setState('google-incentive')} className="w-full max-w-md">
              RESGATAR <ChevronRight className="w-8 h-8" />
            </GlassButton>
          </div>
        )}

        {state === 'google-incentive' && (
          <div className="flex flex-col items-center text-center animate-reveal">
            <div className="bg-white p-6 rounded-[40px] mb-12 shadow-2xl">
              <div className="relative w-40 h-40">
                <Image src={qrImage} alt="QR Code" fill className="object-contain" />
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter text-white uppercase">Sua opinião é ouro</h2>
            <p className="text-xl text-white/40 font-medium mb-16 max-w-2xl leading-relaxed">
              Avalie nossa loja no Google e ajude a MA Imports a crescer.
            </p>
            <GlassButton variant="gold" onClick={() => setState('qr-code')} className="w-full max-w-lg">
              AVALIAR AGORA
            </GlassButton>
          </div>
        )}

        {state === 'qr-code' && (
          <div className="flex flex-col items-center text-center animate-reveal">
            <div className="bg-white p-10 rounded-[64px] mb-12 shadow-[0_40px_100px_rgba(0,0,0,0.6)] animate-reveal">
              <div className="relative w-80 h-80 md:w-[450px] md:h-[450px]">
                <Image 
                  src={qrImage} 
                  alt="QR Code Google Review" 
                  fill 
                  className="object-contain"
                />
              </div>
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tighter text-white uppercase">Escaneie para avaliar</h2>
            <p className="text-xs text-white/30 font-black uppercase tracking-[0.5em] mb-16">
              OBRIGADO PELA PREFERÊNCIA — MA IMPORTS
            </p>
            <div className="text-xs font-black text-[#C5A059]/40 uppercase tracking-[0.2em] animate-pulse">
              Reiniciando totem em instantes...
            </div>
          </div>
        )}

      </div>

      <footer className="h-20 px-12 flex justify-center items-center border-t border-white/5 bg-black/40 backdrop-blur-md">
        <span className="text-xs tracking-[1em] font-black uppercase text-white/10">
          MA IMPORTS — PREMIUM KIOSK
        </span>
      </footer>

    </main>
  )
}
