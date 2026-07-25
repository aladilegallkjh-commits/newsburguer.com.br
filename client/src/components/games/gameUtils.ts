// ─── Types ────────────────────────────────────────────────────────────────────

export interface GameScore {
  game: string;
  level: number;
  score: number; // timeRemaining for memory/puzzle, points for catcher/hoop
  date: string;
  playerName?: string;
}

// ─── Coupon logic ──────────────────────────────────────────────────────────────

const COUPON_PREFIXES: Record<string, string> = {
  MEMORY: 'MEM',
  CATCHER: 'CAT',
  HOOP: 'HOP',
  PUZZLE: 'PZL',
};

/**
 * Generates a unique coupon code for completing all 10 levels.
 * Stores it in localStorage so we can show it again if needed.
 */
export function generateCoupon(game: keyof typeof COUPON_PREFIXES): string {
  const prefix = COUPON_PREFIXES[game] ?? 'GAME';
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const code = `${prefix}-${rand}10`;
  const existingCoupons: string[] = JSON.parse(localStorage.getItem('gameCoupons') || '[]');
  if (!existingCoupons.includes(code)) {
    existingCoupons.push(code);
    localStorage.setItem('gameCoupons', JSON.stringify(existingCoupons));
  }
  return code;
}

export function getAllCoupons(): string[] {
  return JSON.parse(localStorage.getItem('gameCoupons') || '[]');
}

// ─── Score logic ───────────────────────────────────────────────────────────────

export function saveGameScore(game: string, level: number, score: number, playerName?: string) {
  const scores: GameScore[] = JSON.parse(localStorage.getItem('gameScores') || '[]');
  scores.push({
    game,
    level,
    score,
    date: new Date().toLocaleDateString('pt-BR'),
    playerName,
  });
  // Keep only last 100 scores
  if (scores.length > 100) scores.splice(0, scores.length - 100);
  localStorage.setItem('gameScores', JSON.stringify(scores));
}

export function getTopScores(game: string, limit = 5): GameScore[] {
  const scores: GameScore[] = JSON.parse(localStorage.getItem('gameScores') || '[]');
  return scores
    .filter(s => s.game === game)
    .sort((a, b) => {
      // For memory/puzzle: higher level first, then higher score (more time remaining = better)
      if (b.level !== a.level) return b.level - a.level;
      return b.score - a.score;
    })
    .slice(0, limit);
}

export function getBestLevel(game: string): number {
  const scores: GameScore[] = JSON.parse(localStorage.getItem('gameScores') || '[]');
  const gameScores = scores.filter(s => s.game === game);
  if (gameScores.length === 0) return 0;
  return Math.max(...gameScores.map(s => s.level));
}

export const GAME_NAMES: Record<string, string> = {
  memory: '🍔 Burger Memory',
  catcher: '🧺 Burger Catcher',
  hoop: '🏀 Hoop Burger',
  puzzle: '🧩 Puzzle Tasty',
};
