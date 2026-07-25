import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Timer, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveGameScore, generateCoupon } from './gameUtils';

interface Card {
  id: string;
  emoji: string;
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
  { level: 1, pairs: 4, time: 60, cols: 4 },
  { level: 2, pairs: 6, time: 60, cols: 4 },
  { level: 3, pairs: 8, time: 70, cols: 4 },
  { level: 4, pairs: 10, time: 80, cols: 4 },
  { level: 5, pairs: 10, time: 60, cols: 4 },
  { level: 6, pairs: 12, time: 90, cols: 4 },
  { level: 7, pairs: 12, time: 70, cols: 4 },
  { level: 8, pairs: 15, time: 100, cols: 5 },
  { level: 9, pairs: 15, time: 80, cols: 5 },
  { level: 10, pairs: 18, time: 110, cols: 6 },
];

const ALL_EMOJIS = ['🍔', '🌭', '🍟', '🍕', '🥨', '🌮', '🥗', '🍿', '🥩', '🥓', '🧅', '🧀', '🥒', '🍅', '🥤', '🍦', '🍩', '🍪'];

export default function MemoryGame({ onBack }: { onBack: () => void }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost' | 'completed'>('start');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [coupon, setCoupon] = useState<string | null>(null);

  const config = LEVELS[currentLevel - 1];

  const initializeGame = useCallback((levelIndex: number) => {
    const cfg = LEVELS[levelIndex];
    const emojisToUse = ALL_EMOJIS.slice(0, cfg.pairs);
    const gameCards: Card[] = [...emojisToUse, ...emojisToUse]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: `${emoji}-${index}`,
        emoji,
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

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
        setTotalTime(prev => prev + 1);
      }, 1000);
    } else if (gameState === 'playing' && timeRemaining === 0) {
      setGameState('lost');
    }
    return () => clearInterval(timer);
  }, [gameState, timeRemaining]);

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched || gameState !== 'playing') {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setIsLocked(true);
      const [firstIndex, secondIndex] = newFlippedIndices;

      if (newCards[firstIndex].emoji === newCards[secondIndex].emoji) {
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setCards([...newCards]);
        setFlippedIndices([]);
        setMatches((prev) => prev + 1);
        setIsLocked(false);

        if (matches + 1 === config.pairs) {
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
        setTimeout(() => {
          newCards[firstIndex].isFlipped = false;
          newCards[secondIndex].isFlipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  const handleNextLevel = () => {
    const nextLevel = currentLevel + 1;
    setCurrentLevel(nextLevel);
    initializeGame(nextLevel - 1);
  };

  const handleRetry = () => {
    initializeGame(currentLevel - 1);
  };

  const gridCols = config.cols === 6 ? 6 : config.cols === 5 ? 5 : 4;
  const cardSize = config.cols === 6 ? 48 : config.cols === 5 ? 58 : 72;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto p-4 relative z-10" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-[#0A0A0A] border border-[#C9A227]/30 text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0A0A0A] transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-bold text-xl text-[#F5F0E8]">Burger Memory 🍔</h2>
          <p className="text-sm text-[#C9A227] flex items-center justify-center gap-1">
            <Star size={14} style={{ fill: '#C9A227' }} /> Nível {currentLevel} de 10
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 bg-[#0A0A0A]/60 border border-[#C9A227]/20 rounded-2xl p-6">
          <div className="text-7xl">🍔🧠</div>
          <h3 className="text-2xl font-bold text-[#F5F0E8]">Treine sua Memória</h3>
          <p className="text-[#8A7A5A] max-w-sm">
            Encontre os pares de ingredientes e lanches antes que o tempo acabe! 10 níveis de dificuldade crescente.
          </p>
          <button
            onClick={() => initializeGame(0)}
            className="flex items-center gap-2 bg-[#C9A227] text-[#0A0A0A] px-8 py-3 rounded-xl font-bold text-lg active:scale-95 transition-all"
            style={{ boxShadow: '0 0 15px rgba(201,162,39,0.4)' }}
          >
            <Play size={20} /> Começar Agora
          </button>
        </div>
      )}

      {/* Playing */}
      {(gameState === 'playing' || gameState === 'lost' || gameState === 'won' || gameState === 'completed') && (
        <div className="flex flex-col flex-1">
          {/* HUD */}
          <div className="flex justify-between items-center mb-4 bg-[#0A0A0A]/80 border border-[#C9A227]/30 rounded-xl p-3">
            <div className="flex items-center gap-2 font-bold" style={{ color: timeRemaining <= 10 ? '#ef4444' : '#C9A227' }}>
              <Timer size={20} />
              <span>{Math.floor(timeRemaining / 60).toString().padStart(2,'0')}:{(timeRemaining % 60).toString().padStart(2,'0')}</span>
            </div>
            <div className="text-[#F5F0E8] font-bold text-sm">
              Pares: <span style={{ color: '#C9A227' }}>{matches}/{config.pairs}</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gap: 6,
              width: '100%',
            }}
          >
            {cards.map((card, index) => {
              const isVisible = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  disabled={isLocked || card.isFlipped || card.isMatched || gameState !== 'playing'}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 10,
                    border: isVisible ? '2px solid #C9A227' : '2px solid rgba(201,162,39,0.3)',
                    background: isVisible
                      ? (card.isMatched ? 'rgba(201,162,39,0.1)' : 'rgba(20,20,20,0.95)')
                      : 'linear-gradient(135deg, rgba(201,162,39,0.12) 0%, rgba(10,14,11,0.97) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: cardSize * 0.45,
                    cursor: isVisible || isLocked ? 'default' : 'pointer',
                    opacity: card.isMatched ? 0.5 : 1,
                    transform: card.isMatched ? 'scale(0.92)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    boxShadow: isVisible && !card.isMatched ? '0 0 10px rgba(201,162,39,0.3)' : 'none',
                  }}
                >
                  {isVisible ? card.emoji : '❓'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* OVERLAYS */}
      {gameState === 'lost' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="bg-[#111] border border-red-500/40 p-8 rounded-2xl text-center max-w-xs w-full mx-4" style={{ animation: 'zoomIn 0.3s ease' }}>
            <div className="text-5xl mb-4">⏰</div>
            <h3 className="text-2xl font-bold text-[#F5F0E8] mb-2">O tempo acabou!</h3>
            <p className="text-[#8A7A5A] mb-6">Você encontrou {matches} de {config.pairs} pares.</p>
            <button onClick={handleRetry} className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold text-lg">
              <RotateCcw size={20} /> Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {gameState === 'won' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="bg-[#111] border border-[#C9A227] p-8 rounded-2xl text-center max-w-xs w-full mx-4">
            <div className="text-5xl mb-4">🌟</div>
            <h3 className="text-2xl font-bold text-[#F5F0E8] mb-2">Nível {currentLevel} Concluído!</h3>
            <p className="text-[#8A7A5A] mb-6">Restaram {timeRemaining}s no relógio!</p>
            <button onClick={handleNextLevel} className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold text-lg">
              <Play size={20} /> Próximo Nível
            </button>
          </div>
        </div>
      )}

      {gameState === 'completed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="bg-[#111] border border-[#C9A227] p-8 rounded-2xl text-center max-w-xs w-full mx-4 my-4">
            <Trophy className="mx-auto text-[#C9A227] mb-4" size={60} />
            <h3 className="text-3xl font-bold text-[#F5F0E8] mb-2">ZEROU! 🎉</h3>
            <p className="text-[#8A7A5A] mb-4">Você completou todos os 10 níveis do Burger Memory!</p>
            {coupon && (
              <div className="mb-4 p-4 rounded-xl border-2 border-dashed border-[#C9A227] bg-[#C9A227]/10">
                <p className="text-xs text-[#8A7A5A] mb-1">🎁 Seu cupom de desconto:</p>
                <p className="text-xl font-bold text-[#C9A227] tracking-widest">{coupon}</p>
                <p className="text-xs text-[#8A7A5A] mt-1">Use no WhatsApp ao fazer seu pedido!</p>
              </div>
            )}
            <button onClick={() => { setCurrentLevel(1); setGameState('start'); setCoupon(null); }} className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold text-lg">
              <RotateCcw size={20} /> Jogar de Novo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
