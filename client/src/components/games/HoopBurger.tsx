import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelConfig {
  level: number;
  basketSpeed: number;
  ballGravity: number;
  requiredScore: number;
  movementPattern: 'linear' | 'sine' | 'bounce' | 'random';
  amplitude: number; // For sine pattern
}

const LEVELS: LevelConfig[] = [
  { level: 1, basketSpeed: 0, ballGravity: 0.3, requiredScore: 3, movementPattern: 'linear', amplitude: 0 },
  { level: 2, basketSpeed: 1.5, ballGravity: 0.35, requiredScore: 3, movementPattern: 'linear', amplitude: 0 },
  { level: 3, basketSpeed: 2.5, ballGravity: 0.4, requiredScore: 4, movementPattern: 'linear', amplitude: 0 },
  { level: 4, basketSpeed: 3, ballGravity: 0.45, requiredScore: 4, movementPattern: 'sine', amplitude: 60 },
  { level: 5, basketSpeed: 3.5, ballGravity: 0.5, requiredScore: 5, movementPattern: 'sine', amplitude: 80 },
  { level: 6, basketSpeed: 4, ballGravity: 0.55, requiredScore: 5, movementPattern: 'bounce', amplitude: 0 },
  { level: 7, basketSpeed: 4.5, ballGravity: 0.6, requiredScore: 6, movementPattern: 'bounce', amplitude: 0 },
  { level: 8, basketSpeed: 5, ballGravity: 0.65, requiredScore: 6, movementPattern: 'random', amplitude: 0 },
  { level: 9, basketSpeed: 6, ballGravity: 0.7, requiredScore: 7, movementPattern: 'random', amplitude: 0 },
  { level: 10, basketSpeed: 7, ballGravity: 0.75, requiredScore: 8, movementPattern: 'random', amplitude: 100 },
];

const GAME_WIDTH = 360;
const GAME_HEIGHT = 500;
const BASKET_WIDTH = 70;
const BASKET_Y = GAME_HEIGHT - 80;
const BALL_RADIUS = 18;

export default function HoopBurger({ onBack }: { onBack: () => void }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'aiming' | 'flying' | 'won' | 'lost' | 'completed'>('start');
  const [score, setScore] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [basketX, setBasketX] = useState(GAME_WIDTH / 2 - BASKET_WIDTH / 2);
  const [ballPos, setBallPos] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 130 });
  const [ballVel, setBallVel] = useState({ x: 0, y: 0 });
  const [aimAngle, setAimAngle] = useState<number | null>(null);
  const [powerLine, setPowerLine] = useState<{ x: number; y: number } | null>(null);
  const [isFlying, setIsFlying] = useState(false);
  const [sineT, setSineT] = useState(0);

  const config = LEVELS[currentLevel - 1];
  const ballPosRef = useRef(ballPos);
  const ballVelRef = useRef(ballVel);
  const basketXRef = useRef(basketX);
  const isFlying_ = useRef(isFlying);
  const scoreRef = useRef(score);
  const missCountRef = useRef(missCount);
  const gameStateRef = useRef(gameState);

  useEffect(() => { ballPosRef.current = ballPos; }, [ballPos]);
  useEffect(() => { ballVelRef.current = ballVel; }, [ballVel]);
  useEffect(() => { basketXRef.current = basketX; }, [basketX]);
  useEffect(() => { isFlying_.current = isFlying; }, [isFlying]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { missCountRef.current = missCount; }, [missCount]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const resetBall = useCallback(() => {
    setBallPos({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 130 });
    setBallVel({ x: 0, y: 0 });
    setIsFlying(false);
    setPowerLine(null);
    setAimAngle(null);
  }, []);

  const initGame = useCallback((levelIdx: number) => {
    setScore(0);
    setMissCount(0);
    setBasketX(GAME_WIDTH / 2 - BASKET_WIDTH / 2);
    setSineT(0);
    resetBall();
    setGameState('playing');
  }, [resetBall]);

  // Basket movement
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (config.basketSpeed === 0) return;

    let dir = 1;
    let localT = 0;
    let lastBasketX = GAME_WIDTH / 2 - BASKET_WIDTH / 2;
    let targetX = Math.random() * (GAME_WIDTH - BASKET_WIDTH);

    const interval = setInterval(() => {
      localT += 0.05;
      setSineT(t => t + 0.05);

      switch (config.movementPattern) {
        case 'linear':
          setBasketX(prev => {
            let next = prev + config.basketSpeed * dir;
            if (next <= 0 || next >= GAME_WIDTH - BASKET_WIDTH) dir *= -1;
            return Math.max(0, Math.min(next, GAME_WIDTH - BASKET_WIDTH));
          });
          break;
        case 'sine':
          setBasketX(() => {
            const center = GAME_WIDTH / 2 - BASKET_WIDTH / 2;
            return center + Math.sin(localT * config.basketSpeed * 0.2) * config.amplitude;
          });
          break;
        case 'bounce':
          setBasketX(prev => {
            let next = prev + config.basketSpeed * dir;
            if (next <= 0) { dir = 1; next = 0; }
            if (next >= GAME_WIDTH - BASKET_WIDTH) { dir = -1; next = GAME_WIDTH - BASKET_WIDTH; }
            return next;
          });
          break;
        case 'random':
          setBasketX(prev => {
            const dx = (targetX - prev) * 0.08 * config.basketSpeed;
            if (Math.abs(targetX - prev) < 5) targetX = Math.random() * (GAME_WIDTH - BASKET_WIDTH);
            return prev + dx;
          });
          break;
      }
    }, 16);

    return () => clearInterval(interval);
  }, [gameState, currentLevel, config.basketSpeed, config.movementPattern, config.amplitude]);

  // Physics loop
  useEffect(() => {
    if (!isFlying || gameState !== 'playing') return;

    const loop = setInterval(() => {
      setBallPos(prev => {
        const newPos = { x: prev.x + ballVelRef.current.x, y: prev.y + ballVelRef.current.y };
        setBallVel(v => ({ ...v, y: v.y + config.ballGravity }));

        // Bounce off walls
        if (newPos.x <= BALL_RADIUS || newPos.x >= GAME_WIDTH - BALL_RADIUS) {
          setBallVel(v => ({ ...v, x: -v.x * 0.7 }));
        }

        // Check basket collision
        const bx = basketXRef.current;
        const inBasketX = newPos.x >= bx + 5 && newPos.x <= bx + BASKET_WIDTH - 5;
        const inBasketY = newPos.y >= BASKET_Y - 10 && newPos.y <= BASKET_Y + 20;

        if (inBasketX && inBasketY) {
          // SCORE!
          confetti({ particleCount: 50, spread: 40, origin: { y: 0.7 }, colors: ['#C9A227', '#F5F0E8'] });
          const newScore = scoreRef.current + 1;
          setScore(newScore);
          if (newScore >= LEVELS[currentLevel - 1].requiredScore) {
            if (currentLevel >= LEVELS.length) {
              setGameState('completed');
            } else {
              setGameState('won');
            }
          } else {
            resetBall();
          }
          return { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 130 };
        }

        // Ball fell off bottom - miss
        if (newPos.y > GAME_HEIGHT) {
          const newMiss = missCountRef.current + 1;
          setMissCount(newMiss);
          if (newMiss >= 3) {
            setGameState('lost');
          } else {
            resetBall();
          }
          return { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 130 };
        }

        return newPos;
      });
    }, 16);

    return () => clearInterval(loop);
  }, [isFlying, gameState, currentLevel, config.ballGravity, resetBall]);

  const gameAreaRef = useRef<HTMLDivElement>(null);

  const handleGameAreaClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing' || isFlying) return;

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const ballX = ballPosRef.current.x;
    const ballY = ballPosRef.current.y;

    const dx = clickX - ballX;
    const dy = clickY - ballY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const power = Math.min(dist * 0.05, 8);

    const vx = (dx / dist) * power;
    const vy = (dy / dist) * power;

    setBallVel({ x: vx, y: vy });
    setIsFlying(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isFlying || gameState !== 'playing') return;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setPowerLine({ x: mx, y: my });
  };

  const handleNextLevel = () => {
    setCurrentLevel(prev => prev + 1);
    initGame(currentLevel);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-4 animate-in fade-in zoom-in duration-300 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="p-2 rounded-full bg-[#0A0A0A] border border-[#C9A227]/30 text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0A0A0A] transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-display font-bold text-xl text-[#F5F0E8]">Hoop Burger 🏀</h2>
          <p className="text-sm text-[#C9A227] flex items-center justify-center gap-1">
            <Star size={14} className="fill-[#C9A227]" /> Nível {currentLevel} de 10
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 bg-[#0A0A0A]/50 border border-[#C9A227]/20 rounded-2xl p-6 backdrop-blur-sm">
          <div className="text-6xl">🏀🍔</div>
          <h3 className="text-2xl font-bold text-[#F5F0E8]">Acerte a Cesta!</h3>
          <div className="text-left bg-[#0A0A0A]/60 rounded-xl p-4 space-y-2">
            <p className="text-sm text-[#F5F0E8]">🖱️ <span className="text-[#C9A227]">Clique/Toque</span> na tela para atirar o hambúrguer</p>
            <p className="text-sm text-[#F5F0E8]">🏀 Acerte a <span className="text-[#C9A227]">cesta dourada</span></p>
            <p className="text-sm text-[#F5F0E8]">💀 3 erros = <span className="text-red-400">Game Over</span></p>
            <p className="text-sm text-[#8A7A5A]">A cesta vai ficando mais rápida!</p>
          </div>
          <button
            onClick={() => initGame(currentLevel - 1)}
            className="flex items-center gap-2 bg-[#C9A227] text-[#0A0A0A] px-8 py-3 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(201,162,39,0.4)]"
          >
            <Play fill="currentColor" /> Jogar!
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {(gameState === 'playing' || gameState === 'won' || gameState === 'lost' || gameState === 'completed') && (
        <div className="flex flex-col flex-1">
          {/* HUD */}
          <div className="flex justify-between items-center mb-3 bg-[#0A0A0A]/80 border border-[#C9A227]/30 rounded-xl p-3">
            <div className="text-[#F5F0E8] text-sm font-bold">
              Erros: <span className="text-red-400">{missCount}/3</span>
            </div>
            <div className="text-[#F5F0E8] text-sm font-bold">
              Cestas: <span className="text-[#C9A227]">{score}/{config.requiredScore}</span>
            </div>
          </div>

          {/* Game Area */}
          <div
            ref={gameAreaRef}
            className="relative overflow-hidden rounded-2xl border border-[#C9A227]/20 select-none touch-none"
            style={{
              width: '100%',
              maxWidth: `${GAME_WIDTH}px`,
              height: `${GAME_HEIGHT}px`,
              margin: '0 auto',
              background: 'linear-gradient(180deg, #0A1628 0%, #050505 100%)',
              cursor: isFlying ? 'default' : 'crosshair',
            }}
            onClick={handleGameAreaClick}
            onTouchEnd={handleGameAreaClick}
            onMouseMove={handleMouseMove}
          >
            {/* Stars */}
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute w-1 h-1 rounded-full bg-white opacity-40" style={{
                left: `${(i * 47 + 13) % 100}%`,
                top: `${(i * 31 + 7) % 60}%`,
              }} />
            ))}

            {/* Aim line */}
            {!isFlying && powerLine && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                <line
                  x1={ballPos.x} y1={ballPos.y}
                  x2={powerLine.x} y2={powerLine.y}
                  stroke="rgba(201,162,39,0.4)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
              </svg>
            )}

            {/* Basketball (hamburger) */}
            <div
              className="absolute flex items-center justify-center text-3xl"
              style={{
                left: ballPos.x - BALL_RADIUS,
                top: ballPos.y - BALL_RADIUS,
                width: BALL_RADIUS * 2,
                height: BALL_RADIUS * 2,
                filter: 'drop-shadow(0 0 8px rgba(201,162,39,0.5))',
                transition: isFlying ? 'none' : 'none',
                pointerEvents: 'none',
              }}
            >
              🍔
            </div>

            {/* Basket */}
            <div
              className="absolute"
              style={{ left: basketX, top: BASKET_Y, width: BASKET_WIDTH }}
            >
              {/* Rim posts */}
              <div className="relative" style={{ height: 36 }}>
                <div className="absolute left-0 w-3 h-4 rounded-sm" style={{ background: '#C9A227', boxShadow: '0 0 8px rgba(201,162,39,0.6)' }} />
                <div className="absolute right-0 w-3 h-4 rounded-sm" style={{ background: '#C9A227', boxShadow: '0 0 8px rgba(201,162,39,0.6)' }} />
                {/* Net */}
                <div className="absolute left-3 right-3 top-4" style={{
                  height: 28,
                  background: 'repeating-linear-gradient(to bottom, transparent 0, transparent 6px, rgba(201,162,39,0.4) 6px, rgba(201,162,39,0.4) 7px)',
                  borderLeft: '2px solid rgba(201,162,39,0.5)',
                  borderRight: '2px solid rgba(201,162,39,0.5)',
                  borderBottom: '2px solid rgba(201,162,39,0.5)',
                  clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)',
                }} />
                {/* Rim (top horizontal bar) */}
                <div className="absolute left-0 right-0 top-3 h-1.5 rounded-full" style={{ background: '#F5D76E', boxShadow: '0 0 10px rgba(201,162,39,0.8)' }} />
              </div>
            </div>

            {/* Hint text */}
            {!isFlying && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-[#8A7A5A] animate-pulse">
                Toque na tela para atirar
              </div>
            )}
          </div>

          {/* Overlays */}
          {gameState === 'lost' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
              <div className="bg-[#111111] border border-red-500/50 p-8 rounded-2xl text-center max-w-xs w-full mx-4 animate-in zoom-in">
                <div className="text-5xl mb-4">😢</div>
                <h3 className="text-2xl font-bold text-[#F5F0E8] mb-2">3 Erros!</h3>
                <p className="text-[#8A7A5A] mb-6">Você acertou {score} de {config.requiredScore} cestas.</p>
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
                <p className="text-[#8A7A5A] mb-6">Parabéns! Próximo nível mais difícil...</p>
                <button onClick={handleNextLevel} className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold">
                  <Play fill="currentColor" size={18} /> Próximo Nível
                </button>
              </div>
            </div>
          )}

          {gameState === 'completed' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
              <div className="bg-[#111111] border border-[#C9A227] p-8 rounded-2xl text-center max-w-xs w-full mx-4 animate-in zoom-in">
                <Trophy className="mx-auto text-[#C9A227] mb-4" size={60} />
                <h3 className="text-3xl font-bold text-[#F5F0E8] mb-2">MVP! 🏆</h3>
                <p className="text-[#8A7A5A] mb-6">Você zerou o Hoop Burger! Mira perfeita!</p>
                <button onClick={() => { setCurrentLevel(1); setGameState('start'); }} className="w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#0A0A0A] py-3 rounded-xl font-bold">
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
