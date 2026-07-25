import { useState, useEffect } from 'react';
import { Trophy, Star, Gift, ChevronDown, ChevronUp } from 'lucide-react';
import { getTopScores, getAllCoupons, getBestLevel, GAME_NAMES } from './gameUtils';

const GAMES = ['memory', 'catcher', 'hoop', 'puzzle'];

export default function GamesRanking() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<string[]>([]);
  const [bestLevels, setBestLevels] = useState<Record<string, number>>({});

  useEffect(() => {
    setCoupons(getAllCoupons());
    const levels: Record<string, number> = {};
    GAMES.forEach(g => { levels[g] = getBestLevel(g); });
    setBestLevels(levels);
  }, []);

  const hasCoupons = coupons.length > 0;
  const hasAnyScore = GAMES.some(g => getTopScores(g, 1).length > 0);

  if (!hasAnyScore && !hasCoupons) return null;

  return (
    <div className="mt-6 mb-2">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={18} style={{ color: '#C9A227' }} />
        <h3 className="font-bold text-[#F5F0E8] text-sm uppercase tracking-wider">Seu Progresso</h3>
      </div>

      <div className="space-y-2">
        {GAMES.map(game => {
          const topScores = getTopScores(game, 3);
          if (topScores.length === 0) return null;
          const bestLvl = bestLevels[game] || 0;
          const isExpanded = expanded === game;

          return (
            <div
              key={game}
              className="rounded-xl overflow-hidden"
              style={{
                background: 'rgba(20,20,20,0.95)',
                border: '1px solid rgba(201,162,39,0.2)',
              }}
            >
              <button
                className="w-full flex items-center justify-between p-3"
                onClick={() => setExpanded(isExpanded ? null : game)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{GAME_NAMES[game]?.split(' ')[0]}</span>
                  <span className="text-sm text-[#F5F0E8] font-bold">{GAME_NAMES[game]?.slice(2)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star size={12} style={{ fill: '#C9A227', color: '#C9A227' }} />
                    <span className="text-xs text-[#C9A227] font-bold">Nível {bestLvl}/10</span>
                  </div>
                  {isExpanded ? <ChevronUp size={16} style={{ color: '#8A7A5A' }} /> : <ChevronDown size={16} style={{ color: '#8A7A5A' }} />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-1">
                  <div
                    className="w-full rounded-full h-1.5 mb-2"
                    style={{ background: 'rgba(201,162,39,0.15)' }}
                  >
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(bestLvl / 10) * 100}%`,
                        background: 'linear-gradient(90deg, #C9A227, #F5D76E)',
                      }}
                    />
                  </div>
                  {topScores.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-[#C9A227]/10 last:border-0">
                      <span className="text-[#8A7A5A]">
                        {['🥇', '🥈', '🥉'][i]} Nível {s.level} — {s.date}
                      </span>
                      <span className="text-[#C9A227] font-bold">{s.score}s restantes</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Coupons section */}
      {hasCoupons && (
        <div
          className="mt-4 p-4 rounded-xl border-2 border-dashed"
          style={{ borderColor: 'rgba(201,162,39,0.5)', background: 'rgba(201,162,39,0.05)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift size={16} style={{ color: '#C9A227' }} />
            <p className="text-sm font-bold text-[#C9A227]">Seus Cupons de Desconto</p>
          </div>
          <div className="space-y-2">
            {coupons.map((c, i) => (
              <div key={i} className="bg-[#0A0A0A] rounded-lg p-2 text-center">
                <p className="font-mono font-bold text-[#C9A227] tracking-widest">{c}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#8A7A5A] mt-2 text-center">
            Mencione o código ao fazer seu pedido no WhatsApp! 🍔
          </p>
        </div>
      )}
    </div>
  );
}
