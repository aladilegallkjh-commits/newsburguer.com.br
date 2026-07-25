import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Star, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveGameScore, generateCoupon } from './gameUtils';
import { trpc } from '@/lib/trpc';

interface LevelConfig {
  level: number;
  grid: number; // NxN
  timeLimit: number; // seconds
}

const LEVELS: LevelConfig[] = [
  { level: 1, grid: 2, timeLimit: 60 },
  { level: 2, grid: 2, timeLimit: 40 },
  { level: 3, grid: 3, timeLimit: 90 },
  { level: 4, grid: 3, timeLimit: 70 },
  { level: 5, grid: 3, timeLimit: 55 },
  { level: 6, grid: 4, timeLimit: 120 },
  { level: 7, grid: 4, timeLimit: 100 },
  { level: 8, grid: 4, timeLimit: 80 },
  { level: 9, grid: 5, timeLimit: 150 },
  { level: 10, grid: 5, timeLimit: 120 },
];

// Images of burgers for the puzzle
const PUZZLE_IMAGES = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1594212844510-482a0d17042a?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1586816001966-79b736744398?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=400&auto=format&fit=crop',
];

interface PuzzlePiece {
  id: number; // correct position
  currentPos: number; // where it currently is
}

export default function PuzzleTasty({ onBack }: { onBack: () => void }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost' | 'completed'>('start');
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [moves, setMoves] = useState(0);
  const [coupon, setCoupon] = useState<string | null>(null);

  const { data: menuItems = [] } = trpc.menu.getAll.useQuery();

  const config = LEVELS[currentLevel - 1];
  const totalPieces = config.grid * config.grid;
  
  const dbImages = menuItems.map((m: any) => m.imageUrl).filter(Boolean);
  const activeImages = dbImages.length > 0 ? dbImages : PUZZLE_IMAGES;
  const imageUrl = activeImages[imageIndex % activeImages.length];

  const shufflePieces = useCallback((n: number) => {
    const arr = Array.from({ length: n * n }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Ensure it's not already solved
    const isSolved = arr.every((v, i) => v === i);
    if (isSolved) arr.reverse();
    return arr.map((id, pos) => ({ id, currentPos: pos }));
  }, []);

  const initGame = useCallback((levelIdx: number) => {
    const cfg = LEVELS[levelIdx];
    setPieces(shufflePieces(cfg.grid));
    setSelectedPiece(null);
    setTimeRemaining(cfg.timeLimit);
    setMoves(0);
    setGameState('playing');
    setImageIndex(levelIdx % PUZZLE_IMAGES.length);
  }, [shufflePieces]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameState('lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  // Check win condition
  const checkWin = (updatedPieces: PuzzlePiece[]) => {
    const isSolved = updatedPieces.every(p => p.id === p.currentPos);
    if (isSolved) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#C9A227', '#F5F0E8'] });
      saveGameScore('puzzle', currentLevel, timeRemaining);
      if (currentLevel >= LEVELS.length) {
        const code = generateCoupon('PUZZLE');
        setCoupon(code);
        setGameState('completed');
      } else {
        setGameState('won');
      }
    }
  };

  const handlePieceClick = (pos: number) => {
    if (gameState !== 'playing') return;

    if (selectedPiece === null) {
      setSelectedPiece(pos);
    } else if (selectedPiece === pos) {
      setSelectedPiece(null);
    } else {
      // Swap the two pieces
      const updated = [...pieces];
      const idx1 = updated.findIndex(p => p.currentPos === selectedPiece);
      const idx2 = updated.findIndex(p => p.currentPos === pos);
      updated[idx1] = { ...updated[idx1], currentPos: pos };
      updated[idx2] = { ...updated[idx2], currentPos: selectedPiece };
      setPieces(updated);
      setSelectedPiece(null);
      setMoves(m => m + 1);
      checkWin(updated);
    }
  };

  // Piece size calculations
  const BOARD_SIZE = Math.min(320, window.innerWidth - 48);
  const pieceSize = BOARD_SIZE / config.grid;

  const getPieceStyle = (piece: PuzzlePiece) => {
    const col = piece.id % config.grid;
    const row = Math.floor(piece.id / config.grid);
    return {
      width: pieceSize,
      height: pieceSize,
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: `${BOARD_SIZE}px ${BOARD_SIZE}px`,
      backgroundPosition: `-${col * pieceSize}px -${row * pieceSize}px`,
    };
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-4 animate-in fade-in zoom-in duration-300 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="p-2 rounded-full bg-[#0A0A0A] border border-[#C9A227]/30 text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0A0A0A] transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-display font-bold text-xl text-[#F5F0E8]">Puzzle Tasty 🧩</h2>
          <p className="text-sm text-[#C9A227] flex items-center justify-center gap-1">
            <Star size={14} className="fill-[#C9A227]" /> Nível {currentLevel} de 10
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 bg-[#0A0A0A]/50 border border-[#C9A227]/20 rounded-2xl p-6 backdrop-blur-sm">
          <div className="text-6xl">🧩🍔</div>
          <h3 className="text-2xl font-bold text-[#F5F0E8]">Monte o Lanche!</h3>
          <div className="text-left bg-[#0A0A0A]/60 rounded-xl p-4 space-y-2">
            <p className="text-sm text-[#F5F0E8]">🖱️ <span className="text-[#C9A227]">Selecione 2 peças</span> para trocá-las de lugar</p>
            <p className="text-sm text-[#F5F0E8]">⏱️ Monte antes do <span className="text-red-400">tempo acabar</span></p>
            <p className="text-sm text-[#8A7A5A]">As peças vão aumentando conforme sobe de nível!</p>
          </div>
          <button
            onClick={() => initGame(currentLevel - 1)}
            className="flex items-center gap-2 bg-[#C9A227] text-[#0A0A0A] px-8 py-3 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(201,162,39,0.4)]"
          >
            <Play fill="currentColor" /> Montar!
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {(gameState === 'playing' || gameState === 'won' || gameState === 'lost' || gameState === 'completed') && (
        <div className="flex flex-col flex-1">
          {/* HUD */}
          <div className="flex justify-between items-center mb-3 bg-[#0A0A0A]/80 border border-[#C9A227]/30 rounded-xl p-3">
            <div className="flex items-center gap-1 text-[#C9A227] font-bold">
              <Timer size={18} className={timeRemaining <= 15 ? 'animate-pulse text-red-500' : ''} />
              <span className={timeRemaining <= 15 ? 'text-red-500' : ''}>
                {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="text-[#8A7A5A] text-sm">
              Grade: <span className="text-[#C9A227] font-bold">{config.grid}x{config.grid}</span>
            </div>
            <div className="text-[#F5F0E8] text-sm font-bold">
              Movimentos: <span className="text-[#C9A227]">{moves}</span>
            </div>
          </div>

          {/* Puzzle Board */}
          <div className="flex justify-center mb-4">
            <div
              className="relative"
              style={{
                width: BOARD_SIZE,
                height: BOARD_SIZE,
                display: 'grid',
                gridTemplateColumns: `repeat(${config.grid}, 1fr)`,
                gap: 2,
                background: '#000',
                borderRadius: 12,
                overflow: 'hidden',
                border: '2px solid rgba(201,162,39,0.3)',
                boxShadow: '0 0 20px rgba(0,0,0,0.8)',
              }}
            >
              {/* Render in position order */}
              {Array.from({ length: totalPieces }, (_, pos) => {
                const piece = pieces.find(p => p.currentPos === pos);
                if (!piece) return null;
                const isSelected = selectedPiece === pos;
                return (
                  <div
                    key={piece.id}
                    onClick={() => handlePieceClick(pos)}
                    className={`relative cursor-pointer transition-all duration-150 ${isSelected ? 'scale-95 z-10' : 'hover:brightness-110'}`}
                    style={{
                      ...getPieceStyle(piece),
                      outline: isSelected ? '3px solid #C9A227' : '1px solid rgba(0,0,0,0.5)',
                      boxShadow: isSelected ? '0 0 15px rgba(201,162,39,0.7)' : 'none',
                    }}
                  >
                    {/* Position indicator (small dot) */}
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">{piece.id + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reference image (small thumbnail) */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-[#8A7A5A] text-xs">Referência:</span>
            <img
              src={imageUrl}
              alt="Referência"
              className="w-12 h-12 rounded-md object-cover border border-[#C9A227]/30"
            />
          </div>

          {/* Overlays */}
          {gameState === 'lost' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
              <div className="bg-[#111111] border border-red-500/50 p-8 rounded-2xl text-center max-w-xs w-full mx-4 animate-in zoom-in">
                <div className="text-5xl mb-4">⏰</div>
                <h3 className="text-2xl font-bold text-[#F5F0E8] mb-2">Tempo Esgotado!</h3>
                <p className="text-[#8A7A5A] mb-6">Você fez {moves} movimentos.</p>
                <button onClick={() => initGame(currentLevel - 1)} className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold">
                  <RotateCcw size={18} /> Tentar Novamente
                </button>
              </div>
            </div>
          )}

          {gameState === 'won' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
              <div className="bg-[#111111] border border-[#C9A227] p-8 rounded-2xl text-center max-w-xs w-full mx-4 animate-in zoom-in">
                <div className="text-5xl mb-4">🌟</div>
                <h3 className="text-2xl font-bold text-[#F5F0E8] mb-2">Nível {currentLevel} Concluído!</h3>
                <p className="text-[#8A7A5A] mb-6">Em {moves} movimentos! Próxima grade maior...</p>
                <button onClick={() => { setCurrentLevel(l => l + 1); initGame(currentLevel); }} className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold">
                  <Play fill="currentColor" size={18} /> Próximo Nível
                </button>
              </div>
            </div>
          )}

          {gameState === 'completed' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
              <div className="bg-[#111111] border border-[#C9A227] p-8 rounded-2xl text-center max-w-xs w-full mx-4 animate-in zoom-in">
                <Trophy className="mx-auto text-[#C9A227] mb-4" size={60} />
                <h3 className="text-3xl font-bold text-[#F5F0E8] mb-2">PUZZLE MASTER!</h3>
                <p className="text-[#8A7A5A] mb-4">Você montou todos os 10 quebra-cabeças! Incrível!</p>
                {coupon && (
                  <div className="mb-4 p-3 rounded-xl border-2 border-dashed border-[#C9A227] bg-[#C9A227]/10">
                    <p className="text-xs text-[#8A7A5A] mb-1">🎁 Cupom de desconto:</p>
                    <p className="text-lg font-bold text-[#C9A227] tracking-widest">{coupon}</p>
                    <p className="text-xs text-[#8A7A5A] mt-1">Use no pedido pelo WhatsApp!</p>
                  </div>
                )}
                <button onClick={() => { setCurrentLevel(1); setGameState('start'); setCoupon(null); }} className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold">
                  <RotateCcw size={18} /> Jogar de Novo
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
