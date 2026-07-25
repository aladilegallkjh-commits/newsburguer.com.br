import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Star, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FallingItem {
  id: number;
  x: number;
  y: number;
  emoji: string;
  type: 'good' | 'bad';
  speed: number;
}

interface LevelConfig {
  level: number;
  targetScore: number;
  fallSpeed: number;
  spawnRate: number; // ms between spawns
  badItemChance: number; // 0 to 1
}

const LEVELS: LevelConfig[] = [
  { level: 1, targetScore: 5, fallSpeed: 2, spawnRate: 1800, badItemChance: 0.1 },
  { level: 2, targetScore: 8, fallSpeed: 2.5, spawnRate: 1600, badItemChance: 0.15 },
  { level: 3, targetScore: 10, fallSpeed: 3, spawnRate: 1400, badItemChance: 0.2 },
  { level: 4, targetScore: 12, fallSpeed: 3.5, spawnRate: 1200, badItemChance: 0.25 },
  { level: 5, targetScore: 15, fallSpeed: 4, spawnRate: 1100, badItemChance: 0.28 },
  { level: 6, targetScore: 15, fallSpeed: 4.5, spawnRate: 1000, badItemChance: 0.3 },
  { level: 7, targetScore: 18, fallSpeed: 5, spawnRate: 900, badItemChance: 0.32 },
  { level: 8, targetScore: 20, fallSpeed: 5.5, spawnRate: 800, badItemChance: 0.35 },
  { level: 9, targetScore: 20, fallSpeed: 6, spawnRate: 700, badItemChance: 0.38 },
  { level: 10, targetScore: 25, fallSpeed: 7, spawnRate: 600, badItemChance: 0.4 },
];

const GOOD_ITEMS = ['🍔', '🌭', '🍟', '🧀', '🥩', '🍕'];
const BAD_ITEMS = ['💣', '🗑️', '🤢', '☠️'];

const TRAY_WIDTH = 80;
const GAME_WIDTH = 360;
const GAME_HEIGHT = 480;

export default function BurgerCatcher({ onBack }: { onBack: () => void }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost' | 'completed'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [trayX, setTrayX] = useState(GAME_WIDTH / 2 - TRAY_WIDTH / 2);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [itemIdCounter, setItemIdCounter] = useState(0);

  const gameRef = useRef<HTMLDivElement>(null);
  const trayXRef = useRef(trayX);
  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  const gameStateRef = useRef(gameState);
  const fallingItemsRef = useRef(fallingItems);

  const config = LEVELS[currentLevel - 1];

  // Keep refs in sync
  useEffect(() => { trayXRef.current = trayX; }, [trayX]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { fallingItemsRef.current = fallingItems; }, [fallingItems]);

  const initGame = useCallback((levelIndex: number) => {
    const cfg = LEVELS[levelIndex];
    setScore(0);
    setLives(3);
    setFallingItems([]);
    setTrayX(GAME_WIDTH / 2 - TRAY_WIDTH / 2);
    setGameState('playing');
  }, []);

  // Touch and mouse movement for tray
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (gameStateRef.current !== 'playing') return;
    const rect = gameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - TRAY_WIDTH / 2;
    const clamped = Math.max(0, Math.min(x, GAME_WIDTH - TRAY_WIDTH));
    setTrayX(clamped);
  }, []);

  // Spawn items
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnInterval = setInterval(() => {
      if (gameStateRef.current !== 'playing') return;
      const isBad = Math.random() < config.badItemChance;
      const pool = isBad ? BAD_ITEMS : GOOD_ITEMS;
      const emoji = pool[Math.floor(Math.random() * pool.length)];
      const x = Math.random() * (GAME_WIDTH - 40);

      setItemIdCounter(prev => {
        const newId = prev + 1;
        setFallingItems(items => [...items, {
          id: newId,
          x,
          y: -40,
          emoji,
          type: isBad ? 'bad' : 'good',
          speed: config.fallSpeed,
        }]);
        return newId;
      });
    }, config.spawnRate);

    return () => clearInterval(spawnInterval);
  }, [gameState, currentLevel, config.spawnRate, config.fallSpeed, config.badItemChance]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = setInterval(() => {
      if (gameStateRef.current !== 'playing') return;

      setFallingItems(prev => {
        const tray = trayXRef.current;
        const newItems: FallingItem[] = [];
        let scoreDelta = 0;
        let livesDelta = 0;

        for (const item of prev) {
          const newY = item.y + item.speed;

          // Check catch
          if (newY >= GAME_HEIGHT - 80 && newY <= GAME_HEIGHT - 40) {
            if (item.x >= tray - 20 && item.x <= tray + TRAY_WIDTH) {
              // Caught!
              if (item.type === 'good') {
                scoreDelta += 1;
              } else {
                livesDelta -= 1;
              }
              continue; // Remove item
            }
          }

          // Item fell past bottom
          if (newY > GAME_HEIGHT) {
            if (item.type === 'good') {
              livesDelta -= 1;
            }
            continue; // Remove item
          }

          newItems.push({ ...item, y: newY });
        }

        if (scoreDelta !== 0) {
          setScore(prev => {
            const newScore = prev + scoreDelta;
            if (newScore >= LEVELS[currentLevel - 1].targetScore) {
              confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#C9A227', '#F5F0E8'] });
              if (currentLevel >= LEVELS.length) {
                setGameState('completed');
              } else {
                setGameState('won');
              }
            }
            return newScore;
          });
        }

        if (livesDelta !== 0) {
          setLives(prev => {
            const newLives = Math.max(0, prev + livesDelta);
            if (newLives <= 0) {
              setGameState('lost');
            }
            return newLives;
          });
        }

        return newItems;
      });
    }, 16); // ~60fps

    return () => clearInterval(loop);
  }, [gameState, currentLevel]);

  const handleNextLevel = () => {
    setCurrentLevel(prev => prev + 1);
    initGame(currentLevel);
  };

  const handleRetry = () => {
    initGame(currentLevel - 1);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-4 animate-in fade-in zoom-in duration-300 relative z-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-[#0A0A0A] border border-[#C9A227]/30 text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0A0A0A] transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-display font-bold text-xl text-[#F5F0E8]">Burger Catcher</h2>
          <p className="text-sm text-[#C9A227] flex items-center justify-center gap-1">
            <Star size={14} className="fill-[#C9A227]" /> Nível {currentLevel} de 10
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 bg-[#0A0A0A]/50 border border-[#C9A227]/20 rounded-2xl p-6 backdrop-blur-sm">
          <div className="text-6xl">🍔🧺</div>
          <h3 className="text-2xl font-bold text-[#F5F0E8]">Pega o Lanche!</h3>
          <div className="text-left bg-[#0A0A0A]/60 rounded-xl p-4 space-y-2">
            <p className="text-sm text-[#F5F0E8]">✅ Pegue os <span className="text-[#C9A227] font-bold">lanches e batatas</span></p>
            <p className="text-sm text-[#F5F0E8]">❌ Desvie das <span className="text-red-400 font-bold">bombas e lixo</span></p>
            <p className="text-sm text-[#8A7A5A]">Arraste o dedo para mover a bandeja!</p>
          </div>
          <button
            onClick={() => initGame(currentLevel - 1)}
            className="flex items-center gap-2 bg-[#C9A227] text-[#0A0A0A] px-8 py-3 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(201,162,39,0.4)]"
          >
            <Play fill="currentColor" /> Começar
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {(gameState === 'playing' || gameState === 'won' || gameState === 'lost' || gameState === 'completed') && (
        <div className="flex flex-col flex-1">
          {/* HUD */}
          <div className="flex justify-between items-center mb-3 bg-[#0A0A0A]/80 border border-[#C9A227]/30 rounded-xl p-3">
            <div className="flex gap-1">
              {[1,2,3].map(i => (
                <Heart key={i} size={20} className={i <= lives ? 'text-red-500 fill-red-500' : 'text-[#333]'} />
              ))}
            </div>
            <div className="text-[#F5F0E8] font-bold text-sm">
              Pontos: <span className="text-[#C9A227]">{score}</span>
              <span className="text-[#8A7A5A]">/{config.targetScore}</span>
            </div>
          </div>

          {/* Game Area */}
          <div
            ref={gameRef}
            className="relative overflow-hidden rounded-2xl border border-[#C9A227]/20 cursor-none select-none touch-none"
            style={{
              width: '100%',
              maxWidth: `${GAME_WIDTH}px`,
              height: `${GAME_HEIGHT}px`,
              margin: '0 auto',
              background: 'linear-gradient(180deg, #050505 0%, #111111 100%)',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)',
            }}
            onPointerMove={handlePointerMove}
          >
            {/* Background grid lines */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(201,162,39,0.5) 40px)',
            }} />

            {/* Falling items */}
            {fallingItems.map(item => (
              <div
                key={item.id}
                className="absolute text-3xl select-none pointer-events-none"
                style={{ left: item.x, top: item.y, transform: 'translate(-50%, -50%)' }}
              >
                {item.emoji}
              </div>
            ))}

            {/* Tray */}
            <div
              className="absolute bottom-10 flex items-center justify-center text-2xl transition-none"
              style={{
                left: trayX,
                width: TRAY_WIDTH,
                height: 36,
                background: 'linear-gradient(90deg, #C9A227, #F5D76E, #C9A227)',
                borderRadius: '8px',
                boxShadow: '0 0 15px rgba(201,162,39,0.6)',
              }}
            >
              🍽️
            </div>
          </div>

          {/* Overlays */}
          {gameState === 'lost' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
              <div className="bg-[#111111] border border-red-500/50 p-8 rounded-2xl text-center max-w-xs w-full mx-4 animate-in zoom-in">
                <div className="text-5xl mb-4">💔</div>
                <h3 className="text-2xl font-bold text-[#F5F0E8] mb-2">Você perdeu!</h3>
                <p className="text-[#8A7A5A] mb-6">Pontuação: {score}/{config.targetScore}</p>
                <button onClick={handleRetry} className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold text-lg hover:scale-105 transition-all">
                  <RotateCcw size={20} /> Tentar Novamente
                </button>
              </div>
            </div>
          )}

          {gameState === 'won' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
              <div className="bg-[#111111] border border-[#C9A227] p-8 rounded-2xl text-center max-w-xs w-full mx-4 animate-in zoom-in">
                <div className="text-5xl mb-4">🌟</div>
                <h3 className="text-2xl font-bold text-[#F5F0E8] mb-2">Nível {currentLevel} Concluído!</h3>
                <p className="text-[#8A7A5A] mb-6">Com {lives} {lives === 1 ? 'vida' : 'vidas'} restantes!</p>
                <button onClick={handleNextLevel} className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold text-lg hover:scale-105 transition-all">
                  <Play fill="currentColor" size={20} /> Próximo Nível
                </button>
              </div>
            </div>
          )}

          {gameState === 'completed' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
              <div className="bg-[#111111] border border-[#C9A227] p-8 rounded-2xl text-center max-w-xs w-full mx-4 animate-in zoom-in">
                <Trophy className="mx-auto text-[#C9A227] mb-4" size={60} />
                <h3 className="text-3xl font-bold text-[#F5F0E8] mb-2">CAMPEÃO!</h3>
                <p className="text-[#8A7A5A] mb-6">Você zerou o Burger Catcher! Nenhum lanche escapou!</p>
                <button onClick={() => { setCurrentLevel(1); setGameState('start'); }} className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold text-lg hover:scale-105 transition-all">
                  <RotateCcw size={20} /> Jogar de Novo
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
