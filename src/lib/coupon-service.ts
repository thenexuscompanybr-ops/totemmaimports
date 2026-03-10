export interface SessionData {
  id: string;
  timestamp: number;
  game: string;
  reward: string;
  coupon: string;
  evaluated: boolean;
}

export const CouponRewards = [
  "10% de desconto em acessórios",
  "Película 3D de Brinde",
  "R$ 100 de Bônus no iPhone Novo",
  "Cabo Lightning/USB-C Grátis",
  "Limpeza Técnica Cortesia",
  "Upgrade de Memória Exclusivo"
];

export function generateCouponCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MA-${result}`;
}

export function saveGameSession(game: string, reward: string, coupon: string) {
  if (typeof window === 'undefined') return;
  
  const session: SessionData = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    game,
    reward,
    coupon,
    evaluated: false
  };

  const sessions = JSON.parse(localStorage.getItem('ma_sessions') || '[]');
  sessions.push(session);
  localStorage.setItem('ma_sessions', JSON.stringify(sessions));
  
  return session;
}

export function getStats() {
  if (typeof window === 'undefined') return { total: 0, rewards: {} };
  
  const sessions: SessionData[] = JSON.parse(localStorage.getItem('ma_sessions') || '[]');
  return {
    total: sessions.length,
    today: sessions.filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString()).length,
    sessions
  };
}
