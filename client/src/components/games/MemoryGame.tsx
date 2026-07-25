import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Timer, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveGameScore, generateCoupon } from './gameUtils';

interface Card {
  id: string;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface LevelConfig {
  level: number;
  pairs: number;
  time: number;
  cols: number;
}

const LEVELS: LevelConfig[] = [
  { level: 1, pairs: 4, time: 60, cols: 2 },
  { level: 2, pairs: 6, time: 70, cols: 3 },
  { level: 3, pairs: 8, time: 80, cols: 4 },
  { level: 4, pairs: 10, time: 90, cols: 4 },
  { level: 5, pairs: 10, time: 70, cols: 4 },
  { level: 6, pairs: 12, time: 100, cols: 4 },
  { level: 7, pairs: 12, time: 80, cols: 4 },
  { level: 8, pairs: 15, time: 110, cols: 5 },
  { level: 9, pairs: 15, time: 90, cols: 5 },
  { level: 10, pairs: 18, time: 120, cols: 6 },
];

// Real burger/food images
const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1594212844510-482a0d17042a?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1586816001966-79b736744398?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1550547660-d9450f859349?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1534422119098-b80c5ce3d800?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1527324688151-0e627063f2b1?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1603064752734-4c48eff53d05?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1608767221051-2b9d18f35a2f?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1587898608739-92de4953b81b?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1548340748-6af353c9b4c2?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1624728405078-c1f05ca7c3bc?w=120&h=120&fit=crop',
];

export default function MemoryGame({ onBack }: { onBack: () => void }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost' | 'completed'>('start');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [coupon, setCoupon] = useState<string | null>(null);
  const lockTimer = useRef<NodeJS.Timeout | null>(null);

  const config = LEVELS[currentLevel - 1];

  const initializeGame = useCallback((levelIndex: number) => {
    const cfg = LEVELS[levelIndex];
    const imagesToUse = FOOD_IMAGES.slice(0, cfg.pairs);
    const gameCards: Card[] = [...imagesToUse, ...imagesToUse]
      .sort(() => Math.random() - 0.5)
      .map((imageUrl, index) => ({
        id: `${imageUrl}-${index}`,
        imageUrl,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(gameCards);
    setFlippedIndices([]);
    setMatches(0);
    setTimeRemaining(cfg.time);
    setGameState('playing');
    setIsLocked(false);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeRemaining > 0) {
      timer = setInterval(() => setTimeRemaining(p => p - 1), 1000);
    } else if (gameState === 'playing' && timeRemaining === 0) {
      setGameState('lost');
    }
    return () => clearInterval(timer);
  }, [gameState, timeRemaining]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (lockTimer.current) clearTimeout(lockTimer.current); };
  }, []);

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched || gameState !== 'playing') return;

    const newCards = cards.map((c, i) => i === index ? { ...c, isFlipped: true } : c);
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      const [a, b] = newFlipped;

      if (newCards[a].imageUrl === newCards[b].imageUrl) {
        // Match!
        const matched = newCards.map((c, i) =>
          i === a || i === b ? { ...c, isMatched: true } : c
        );
        setCards(matched);
        setFlippedIndices([]);
        const newMatches = matches + 1;
        setMatches(newMatches);
        setIsLocked(false);

        if (newMatches === config.pairs) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#C9A227', '#F5F0E8'] });
          saveGameScore('memory', currentLevel, timeRemaining);
          if (currentLevel === LEVELS.length) {
            const code = generateCoupon('MEMORY');
            setCoupon(code);
            setGameState('completed');
          } else {
            setGameState('won');
          }
        }
      } else {
        // No match — flip back after 900ms
        lockTimer.current = setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, isFlipped: false } : c
          ));
          setFlippedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  const handleNextLevel = () => {
    const next = currentLevel + 1;
    setCurrentLevel(next);
    initializeGame(next - 1);
  };

  const cardStyle = {
    borderRadius: 10,
    overflow: 'hidden' as const,
    cursor: 'pointer',
    aspectRatio: '1' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 480, margin: '0 auto', padding: 16, minHeight: '100vh', boxSizing: 'border-box' as const }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          onClick={onBack}
          style={{ width: 40, height: 40, borderRadius: '50%', background: '#0A0A0A', border: '1px solid rgba(201,162,39,0.4)', color: '#C9A227', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={22} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 18 }}>🍔 Burger Memory</div>
          <div style={{ color: '#C9A227', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Star size={12} fill="#C9A227" /> Nível {currentLevel} de 10
          </div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Start */}
      {gameState === 'start' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20, background: 'rgba(10,10,10,0.6)', borderRadius: 20, padding: 32, border: '1px solid rgba(201,162,39,0.2)' }}>
          <div style={{ fontSize: 64 }}>🍔</div>
          <div style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 22 }}>Treine sua Memória!</div>
          <div style={{ color: '#8A7A5A', fontSize: 14, maxWidth: 280 }}>
            Encontre os pares de fotos dos lanches. O jogo vai ficando mais difícil a cada nível!
          </div>
          <button
            onClick={() => initializeGame(0)}
            style={{ background: '#C9A227', color: '#0A0A0A', border: 'none', borderRadius: 12, padding: '14px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 16px rgba(201,162,39,0.4)' }}
          >
            <Play size={18} fill="#0A0A0A" /> Começar!
          </button>
        </div>
      )}

      {/* Playing */}
      {(gameState === 'playing' || gameState === 'lost' || gameState === 'won' || gameState === 'completed') && (
        <>
          {/* HUD */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(201,162,39,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: timeRemaining <= 10 ? '#ef4444' : '#C9A227', fontWeight: 700 }}>
              <Timer size={18} />
              {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 14 }}>
              Pares: <span style={{ color: '#C9A227' }}>{matches}/{config.pairs}</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
              gap: 6,
              width: '100%',
            }}
          >
            {cards.map((card, index) => {
              const visible = card.isFlipped || card.isMatched;
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  style={{
                    ...cardStyle,
                    border: visible ? '2px solid #C9A227' : '2px solid rgba(201,162,39,0.25)',
                    opacity: card.isMatched ? 0.5 : 1,
                    transform: card.isMatched ? 'scale(0.93)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    background: visible ? '#111' : 'linear-gradient(135deg, rgba(201,162,39,0.1), rgba(10,10,10,0.97))',
                    position: 'relative',
                  }}
                >
                  {visible ? (
                    <img
                      src={card.imageUrl}
                      alt="lanche"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 8 }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(201,162,39,0.12), rgba(10,10,10,0.95))',
                      borderRadius: 8,
                      fontSize: 24,
                    }}>
                      🍔
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* OVERLAYS */}
      {gameState === 'lost' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 20, padding: 32, textAlign: 'center', maxWidth: 300, width: '90%' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⏰</div>
            <div style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Tempo esgotado!</div>
            <div style={{ color: '#8A7A5A', marginBottom: 20 }}>Você encontrou {matches} de {config.pairs} pares.</div>
            <button onClick={() => initializeGame(currentLevel - 1)} style={{ background: '#C9A227', color: '#0A0A0A', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15 }}>
              <RotateCcw size={18} /> Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {gameState === 'won' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid rgba(201,162,39,0.6)', borderRadius: 20, padding: 32, textAlign: 'center', maxWidth: 300, width: '90%' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div>
            <div style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Nível {currentLevel} Concluído!</div>
            <div style={{ color: '#8A7A5A', marginBottom: 20 }}>Restaram {timeRemaining}s no relógio!</div>
            <button onClick={handleNextLevel} style={{ background: '#C9A227', color: '#0A0A0A', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15 }}>
              <Play size={18} fill="#0A0A0A" /> Próximo Nível
            </button>
          </div>
        </div>
      )}

      {gameState === 'completed' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
          <div style={{ background: '#111', border: '2px solid #C9A227', borderRadius: 20, padding: 32, textAlign: 'center', maxWidth: 300, width: '90%', margin: '16px auto' }}>
            <Trophy size={56} style={{ color: '#C9A227', marginBottom: 12 }} />
            <div style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 24, marginBottom: 8 }}>ZEROU! 🎉</div>
            <div style={{ color: '#8A7A5A', marginBottom: 16 }}>Você completou todos os 10 níveis!</div>
            {coupon && (
              <div style={{ border: '2px dashed #C9A227', borderRadius: 12, padding: 16, marginBottom: 16, background: 'rgba(201,162,39,0.08)' }}>
                <div style={{ color: '#8A7A5A', fontSize: 12, marginBottom: 4 }}>🎁 Seu cupom de desconto:</div>
                <div style={{ color: '#C9A227', fontWeight: 700, fontSize: 20, letterSpacing: 3, fontFamily: 'monospace' }}>{coupon}</div>
                <div style={{ color: '#8A7A5A', fontSize: 11, marginTop: 4 }}>Mencione no pedido pelo WhatsApp!</div>
              </div>
            )}
            <button onClick={() => { setCurrentLevel(1); setGameState('start'); setCoupon(null); }} style={{ background: '#C9A227', color: '#0A0A0A', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15 }}>
              <RotateCcw size={18} /> Jogar de Novo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
