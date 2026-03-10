"use client"

import * as React from "react"
import Image from "next/image"
import { 
  ChevronRight, Star, Smartphone, Box, RotateCcw, Zap, 
  QrCode, MessageCircle, Trophy, Timer, MousePointer2 
} from "lucide-react"
import { GlassButton } from "@/components/ma/GlassButton"
import { cn } from "@/lib/utils"
import { generateCouponCode, CouponRewards, saveGameSession } from "@/lib/coupon-service"
import { PlaceHolderImages } from "@/lib/placeholder-images"

type AppState = 'hero' | 'choice' | 'game-box' | 'game-wheel' | 'game-speed' | 'result' | 'evaluation' | 'final'

const IDLE_TIMEOUT = 120000 

export default function MADiscovery() {
  const [state, setState] = React.useState<AppState>('hero')
  const [reward, setReward] = React.useState<{ text: string, code: string } | null>(null)
  
  // Estados para os jogos
  const [isSpinning, setIsSpinning] = React.useState(false)
  const [rotation, setRotation] = React.useState(0)
  const [speedScore, setSpeedScore] = React.useState(0)
  const [speedActive, setSpeedActive] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(10)
  const [targetPos, setTargetPos] = React.useState({ top: '50%', left: '50%' })

  // Reset por inatividade
  React.useEffect(() => {
    let timer: NodeJS.Timeout
    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (state !== 'hero') resetToHero()
      }, IDLE_TIMEOUT)
    }
    window.addEventListener('touchstart', resetTimer)
    resetTimer()
    return () => {
      clearTimeout(timer)
      window.removeEventListener('touchstart', resetTimer)
    }
  }, [state])

  const resetToHero = () => {
    setState('hero')
    setIsSpinning(false)
    setSpeedActive(false)
    setSpeedScore(0)
  }

  const finalizeGame = (gameName: string) => {
    const code = generateCouponCode()
    const prize = CouponRewards[Math.floor(Math.random() * CouponRewards.length)]
    setReward({ text: prize, code })
    saveGameSession(gameName, prize, code)
    setState('result')
  }

  // --- Lógica Roda Tech ---
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

  // --- Lógica Toque Rápido ---
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
    <main className="relative z-10 mx-auto max-w-7xl h-screen flex flex-col overflow-hidden">
      {/* Header Fixo */}
      <nav className="p-10 flex justify-between items-center animate-fade-in shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Smartphone className="text-white w-10 h-10" />
          </div>
          <span className="font-bold text-4xl tracking-tighter">MA <span className="text-primary">Discovery</span></span>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-xs uppercase tracking-widest text-white/50 font-bold glass-dark px-6 py-4 rounded-full border-white/5">
            PREMIUM EXPERIENCE
          </div>
        </div>
      </nav>

      <div className="relative flex-1 flex flex-col items-center justify-center">
        
        {/* HERO STATE */}
        {state === 'hero' && (
          <div className="flex flex-col items-center text-center px-6 animate-fade-in max-w-4xl">
            <div className="relative mb-16 animate-float">
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-150" />
              <Image 
                src={iphoneImg?.imageUrl || ""} 
                alt="iPhone Premium"
                width={360}
                height={720}
                className="relative drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)] rounded-[50px] border-[12px] border-white/5"
                priority
              />
            </div>
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-8 text-gradient leading-none">
              Bem-vindo ao<br/>Amanhã.
            </h1>
            <p className="text-3xl text-muted-foreground mb-16 font-light leading-relaxed max-w-2xl">
              Descubra por que a MA Imports é a escolha número um em tecnologia premium.
            </p>
            <GlassButton size="xl" onClick={() => setState('choice')} className="w-full max-w-md h-28 text-3xl rounded-[40px]">
              EXPERIMENTAR <ChevronRight className="ml-2 w-10 h-10" />
            </GlassButton>
          </div>
        )}

        {/* CHOICE STATE */}
        {state === 'choice' && (
          <div className="w-full px-12 animate-fade-in">
            <h2 className="text-5xl font-bold mb-20 text-center text-gradient">Qual desafio você aceita?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {[
                { id: 'game-box', icon: Box, name: 'Caixa Premiada', desc: 'Sua intuição vale prêmios reais.', color: 'from-blue-500 to-cyan-500' },
                { id: 'game-wheel', icon: RotateCcw, name: 'Roda Tech', desc: 'Gire e ganhe descontos exclusivos.', color: 'from-purple-500 to-pink-500' },
                { id: 'game-speed', icon: Zap, name: 'Toque Rápido', desc: 'Teste seus reflexos em 10 segundos.', color: 'from-amber-400 to-orange-500' },
              ].map((game) => (
                <button
                  key={game.id}
                  onClick={() => setState(game.id as any)}
                  className="glass-dark p-12 rounded-[60px] flex flex-col items-center text-center group hover:bg-white/10 transition-all duration-500 border-white/5 relative overflow-hidden"
                >
                  <div className={cn("w-28 h-28 rounded-[32px] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700 bg-gradient-to-br", game.color)}>
                    <game.icon className="w-14 h-14 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-6">{game.name}</h3>
                  <p className="text-xl text-muted-foreground font-light leading-relaxed">{game.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME: CAIXA PREMIADA */}
        {state === 'game-box' && (
          <div className="flex flex-col items-center animate-fade-in">
            <h2 className="text-5xl font-bold mb-6 text-gradient">Caixa Premiada</h2>
            <p className="text-2xl text-muted-foreground mb-24 font-light">Escolha a caixa que guarda sua sorte.</p>
            <div className="flex gap-16">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  onClick={() => finalizeGame('Caixa Premiada')}
                  className="w-56 h-56 glass-dark rounded-[50px] cursor-pointer transition-all duration-500 hover:scale-110 active:scale-90 flex items-center justify-center group hover:border-primary/50"
                >
                  <Box className="w-24 h-24 text-primary group-hover:text-accent group-hover:rotate-12 transition-all duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GAME: RODA TECH */}
        {state === 'game-wheel' && (
          <div className="flex flex-col items-center animate-fade-in relative">
            <h2 className="text-5xl font-bold mb-6 text-gradient">Roda Tech</h2>
            <p className="text-2xl text-muted-foreground mb-20 font-light">Gire a roleta da tecnologia premium.</p>
            
            <div className="relative mb-20">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
                <div className="w-8 h-12 bg-accent rounded-full border-4 border-white shadow-xl" />
              </div>
              <div 
                className="w-80 h-80 md:w-[500px] md:h-[500px] rounded-full border-[15px] border-white/10 glass-dark shadow-[0_0_100px_rgba(46,151,245,0.2)] transition-transform duration-[4000ms] ease-out flex items-center justify-center overflow-hidden"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="grid grid-cols-2 grid-rows-2 w-full h-full rotate-45">
                   <div className="bg-primary/20 border-white/5 flex items-center justify-center"><Star className="w-12 h-12 -rotate-45" /></div>
                   <div className="bg-accent/20 border-white/5 flex items-center justify-center"><Smartphone className="w-12 h-12 -rotate-45" /></div>
                   <div className="bg-white/5 border-white/5 flex items-center justify-center"><Zap className="w-12 h-12 -rotate-45" /></div>
                   <div className="bg-primary/40 border-white/5 flex items-center justify-center"><Trophy className="w-12 h-12 -rotate-45" /></div>
                </div>
              </div>
            </div>

            <GlassButton size="xl" onClick={spinWheel} disabled={isSpinning} className="w-72 h-24 text-2xl">
              {isSpinning ? 'GIRANDO...' : 'GIRAR AGORA'}
            </GlassButton>
          </div>
        )}

        {/* GAME: TOQUE RÁPIDO */}
        {state === 'game-speed' && (
          <div className="flex flex-col items-center w-full h-full max-h-[70vh] animate-fade-in">
            {!speedActive && speedScore === 0 ? (
              <div className="text-center">
                <h2 className="text-5xl font-bold mb-6 text-gradient">Toque Rápido</h2>
                <p className="text-2xl text-muted-foreground mb-16 font-light">Toque no maior número de ícones em 10 segundos.</p>
                <GlassButton size="xl" onClick={startSpeedGame} className="w-72 h-24 text-2xl">COMEÇAR</GlassButton>
              </div>
            ) : (
              <div className="relative w-full h-full max-w-4xl glass-dark rounded-[60px] overflow-hidden">
                <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-12 z-20">
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase tracking-widest opacity-50 mb-2">TEMPO</span>
                    <div className="text-5xl font-bold flex items-center gap-3"><Timer className="w-8 h-8 text-primary" /> {timeLeft}s</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase tracking-widest opacity-50 mb-2">PONTOS</span>
                    <div className="text-5xl font-bold flex items-center gap-3"><MousePointer2 className="w-8 h-8 text-accent" /> {speedScore}</div>
                  </div>
                </div>
                
                <button
                  onClick={handleTargetHit}
                  className="absolute w-32 h-32 bg-primary rounded-full shadow-[0_0_40px_rgba(46,151,245,0.6)] animate-pulse flex items-center justify-center transition-all duration-150 active:scale-125"
                  style={{ top: targetPos.top, left: targetPos.left }}
                >
                  <Smartphone className="w-12 h-12 text-white" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESULT STATE */}
        {state === 'result' && (
          <div className="flex flex-col items-center text-center px-6 animate-scale-in">
            <div className="w-40 h-40 rounded-full bg-accent/20 flex items-center justify-center mb-12 shadow-[0_0_60px_rgba(201,162,74,0.3)]">
              <Trophy className="w-20 h-20 text-accent" />
            </div>
            <h2 className="text-6xl font-bold mb-6 text-gradient">Parabéns!</h2>
            <p className="text-3xl text-muted-foreground mb-20 font-light">{reward?.text}</p>
            
            <div className="glass-dark px-24 py-16 rounded-[60px] border-accent/20 mb-20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-transparent via-accent to-transparent" />
              <span className="text-lg uppercase tracking-[0.5em] text-accent font-bold mb-8 block opacity-70">CÓDIGO DE RESGATE</span>
              <span className="text-8xl font-bold font-mono tracking-widest text-white">{reward?.code}</span>
            </div>

            <GlassButton size="xl" onClick={() => setState('evaluation')} className="min-w-[400px] h-24 text-2xl">
              CONTINUAR
            </GlassButton>
          </div>
        )}

        {/* EVALUATION STATE */}
        {state === 'evaluation' && (
          <div className="flex flex-col items-center text-center px-6 animate-fade-in max-w-3xl">
            <h2 className="text-6xl font-bold mb-10 leading-tight">Gostou de<br/>jogar conosco?</h2>
            <p className="text-3xl text-muted-foreground mb-20 font-light leading-relaxed">
              Sua avaliação no Google fortalece nossa presença e nos ajuda a trazer mais novidades exclusivas para você.
            </p>
            
            <div className="flex flex-col gap-8 w-full max-w-lg">
              <GlassButton variant="gold" size="xl" className="w-full h-28 flex gap-4 text-3xl shadow-[0_30px_60px_rgba(201,162,74,0.2)]">
                <Star className="w-10 h-10 fill-current" /> AVALIAR NO GOOGLE
              </GlassButton>
              <button 
                onClick={() => setState('final')}
                className="text-2xl text-muted-foreground hover:text-white transition-colors py-6 font-light underline underline-offset-8"
              >
                Talvez mais tarde
              </button>
            </div>
          </div>
        )}

        {/* FINAL STATE */}
        {state === 'final' && (
          <div className="flex flex-col items-center text-center px-6 animate-fade-in">
            <div className="glass-dark p-12 rounded-[70px] mb-16 shadow-2xl">
              <div className="bg-white p-10 rounded-[40px]">
                <QrCode className="w-72 h-72 text-background" />
              </div>
            </div>
            
            <h2 className="text-6xl font-bold mb-8 text-gradient">Acesse o Catálogo</h2>
            <p className="text-2xl text-muted-foreground mb-20 font-light">Escaneie o código acima ou chame um consultor agora.</p>

            <div className="flex flex-col gap-8 w-full max-w-xl">
              <GlassButton className="bg-[#25D366] hover:bg-[#20ba59] border-none h-24 text-2xl shadow-[0_20px_40px_rgba(37,211,102,0.2)]">
                <MessageCircle className="w-8 h-8 fill-current" /> CHAMAR NO WHATSAPP
              </GlassButton>
              <GlassButton variant="secondary" className="h-24 text-2xl" onClick={resetToHero}>
                REINICIAR TUDO
              </GlassButton>
            </div>
          </div>
        )}
      </div>

      <footer className="p-12 text-center text-muted-foreground/30 text-lg tracking-widest font-medium uppercase shrink-0">
        MA IMPORTS © {new Date().getFullYear()} — TECNOLOGIA PREMIUM E SEGURA
      </footer>
    </main>
  )
}
