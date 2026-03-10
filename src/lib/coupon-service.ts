export interface SessionData {
  id: string;
  timestamp: number;
  game: string;
  reward: string;
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

export function saveGameSession(game: string, reward: string) {
  if (typeof window === 'undefined') return;
  
  const session: SessionData = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    game,
    reward,
    evaluated: false
  };

  const sessions = JSON.parse(localStorage.getItem('ma_sessions') || '[]');
  sessions.push(session);
  localStorage.setItem('ma_sessions', JSON.stringify(sessions));
  
  return session;
}

export function getStats() {
  if (typeof window === 'undefined') return { total: 0, today: 0, sessions: [] };
  
  const sessions: SessionData[] = JSON.parse(localStorage.getItem('ma_sessions') || '[]');
  return {
    total: sessions.length,
    today: sessions.filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString()).length,
    sessions
  };
}
