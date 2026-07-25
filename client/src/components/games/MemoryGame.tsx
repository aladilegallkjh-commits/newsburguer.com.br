import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Timer, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

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
  { level: 1, pairs: 4, time: 30, cols: 4 },
  { level: 2, pairs: 6, time: 40, cols: 4 },
  { level: 3, pairs: 8, time: 50, cols: 4 },
  { level: 4, pairs: 10, time: 60, cols: 4 },
  { level: 5, pairs: 10, time: 45, cols: 4 }, // Same pairs, less time
  { level: 6, pairs: 12, time: 70, cols: 4 },
  { level: 7, pairs: 12, time: 55, cols: 4 },
  { level: 8, pairs: 15, time: 80, cols: 5 },
  { level: 9, pairs: 15, time: 65, cols: 5 },
  { level: 10, pairs: 18, time: 90, cols: 6 },
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
        // Match!
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setCards(newCards);
        setFlippedIndices([]);
        setMatches((prev) => prev + 1);
        setIsLocked(false);

        // Check win condition
        if (matches + 1 === config.pairs) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#C9A227', '#F5F0E8']
          });
          if (currentLevel === LEVELS.length) {
            setGameState('completed');
          } else {
            setGameState('won');
          }
        }
      } else {
        // No match
        setTimeout(() => {
          newCards[firstIndex].isFlipped = false;
          newCards[secondIndex].isFlipped = false;
          setCards(newCards);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const handleNextLevel = () => {
    setCurrentLevel(prev => prev + 1);
    initializeGame(currentLevel); // currentLevel is 0-indexed in array, so this starts next level
  };

  const handleRetry = () => {
    initializeGame(currentLevel - 1);
  };

  const getGridCols = () => {
    if (config.cols === 4) return 'grid-cols-4';
    if (config.cols === 5) return 'grid-cols-5';
    if (config.cols === 6) return 'grid-cols-6';
    return 'grid-cols-4';
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto p-4 animate-in fade-in zoom-in duration-300 relative z-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="p-2 rounded-full bg-[#0A0A0A] border border-[#C9A227]/30 text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0A0A0A] transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-display font-bold text-xl text-[#F5F0E8]">Burger Memory</h2>
          <p className="text-sm text-[#C9A227] flex items-center justify-center gap-1">
            <Star size={14} className="fill-[#C9A227]" /> Nível {currentLevel} de 10
          </p>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 bg-[#0A0A0A]/50 border border-[#C9A227]/20 rounded-2xl p-6 backdrop-blur-sm">
          <div className="text-6xl mb-4">🍔🧠</div>
          <h3 className="text-2xl font-bold text-[#F5F0E8]">Treine sua Memória</h3>
          <p className="text-[#8A7A5A] max-w-sm">
            Encontre os pares de ingredientes e lanches antes que o tempo acabe. O jogo vai ficando mais difícil a cada nível!
          </p>
          <button
            onClick={() => initializeGame(currentLevel - 1)}
            className="flex items-center gap-2 bg-[#C9A227] text-[#0A0A0A] px-8 py-3 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(201,162,39,0.4)]"
          >
            <Play fill="currentColor" /> Começar Agora
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {(gameState === 'playing' || gameState === 'lost' || gameState === 'won' || gameState === 'completed') && (
        <div className="flex flex-col flex-1">
          {/* Top Bar (Time & Matches) */}
          <div className="flex justify-between items-center mb-6 bg-[#0A0A0A]/80 border border-[#C9A227]/30 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[#C9A227] font-bold">
              <Timer size={20} className={timeRemaining <= 10 && gameState === 'playing' ? 'animate-ping' : ''} />
              <span className={timeRemaining <= 10 ? 'text-red-500' : ''}>
                00:{timeRemaining.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="text-[#F5F0E8] font-bold">
              Pares: <span className="text-[#C9A227]">{matches}/{config.pairs}</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className={`grid ${getGridCols()} gap-2 sm:gap-3 flex-1 content-start`}>
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                disabled={isLocked || card.isFlipped || card.isMatched || gameState !== 'playing'}
                className={`
                  aspect-square rounded-xl text-3xl sm:text-4xl flex items-center justify-center transition-all duration-300 transform preserve-3d cursor-pointer
                  ${(card.isFlipped || card.isMatched) ? 'rotate-y-180' : ''}
                  ${card.isMatched ? 'opacity-50 scale-95' : 'hover:scale-105 active:scale-95'}
                `}
                style={{
                  perspective: '1000px',
                  backgroundColor: 'transparent',
                }}
              >
                {/* Back of card (visible when not flipped) */}
                <div 
                  className={`absolute inset-0 rounded-xl flex items-center justify-center border-2 border-[#C9A227]/40 shadow-inner backface-hidden transition-all duration-300 ${card.isFlipped || card.isMatched ? 'opacity-0' : 'opacity-100'}`}
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(10,14,11,0.95) 100%)',
                  }}
                >
                  <span className="text-xl sm:text-2xl opacity-40">❓</span>
                </div>
                
                {/* Front of card (visible when flipped) */}
                <div 
                  className={`absolute inset-0 rounded-xl flex items-center justify-center border-2 border-[#C9A227] bg-[#111111] shadow-[0_0_15px_rgba(201,162,39,0.3)] backface-hidden rotate-y-180 transition-all duration-300 ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}
                >
                  {card.emoji}
                </div>
              </button>
            ))}
          </div>

          {/* Result Overlays */}
          {gameState === 'lost' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
              <div className="bg-[#111111] border border-red-500/50 p-8 rounded-2xl text-center max-w-sm w-full mx-4 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-in zoom-in">
                <div className="text-5xl mb-4">⏰</div>
                <h3 className="text-2xl font-bold text-[#F5F0E8] mb-2">O tempo acabou!</h3>
                <p className="text-[#8A7A5A] mb-6">Você encontrou {matches} de {config.pairs} pares.</p>
                <button
                  onClick={handleRetry}
                  className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold text-lg hover:scale-105 transition-all"
                >
                  <RotateCcw size={20} /> Tentar Novamente
                </button>
              </div>
            </div>
          )}

          {gameState === 'won' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
              <div className="bg-[#111111] border border-[#C9A227] p-8 rounded-2xl text-center max-w-sm w-full mx-4 shadow-[0_0_30px_rgba(201,162,39,0.3)] animate-in zoom-in">
                <div className="text-5xl mb-4">🌟</div>
                <h3 className="text-2xl font-bold text-[#F5F0E8] mb-2">Nível {currentLevel} Concluído!</h3>
                <p className="text-[#8A7A5A] mb-6">Faltando {timeRemaining} segundos no relógio.</p>
                <button
                  onClick={handleNextLevel}
                  className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-[0_0_15px_rgba(201,162,39,0.4)]"
                >
                  <Play fill="currentColor" size={20} /> Próximo Nível
                </button>
              </div>
            </div>
          )}

          {gameState === 'completed' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
              <div className="bg-[#111111] border border-[#C9A227] p-8 rounded-2xl text-center max-w-sm w-full mx-4 shadow-[0_0_30px_rgba(201,162,39,0.5)] animate-in zoom-in">
                <div className="text-6xl mb-4 text-[#C9A227]"><Trophy className="mx-auto" size={64} /></div>
                <h3 className="text-3xl font-bold text-[#F5F0E8] mb-2">ZEROU O JOGO!</h3>
                <p className="text-[#8A7A5A] mb-6">Você completou todos os 10 níveis do Jogo da Memória. Sua memória é incrível!</p>
                <button
                  onClick={() => {
                    setCurrentLevel(1);
                    setGameState('start');
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-[0_0_15px_rgba(201,162,39,0.4)]"
                >
                  <RotateCcw size={20} /> Jogar Tudo de Novo
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
