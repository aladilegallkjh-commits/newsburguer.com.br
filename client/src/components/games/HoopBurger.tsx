import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Star, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveGameScore, generateCoupon } from './gameUtils';

interface LevelConfig {
  level: number;
  requiredScore: number;
  maxMisses: number;
  basketSpeed: number; // pixels per frame, 0 = stationary
  basketPattern: 'none' | 'linear' | 'sine' | 'fast';
}

const LEVELS: LevelConfig[] = [
  { level: 1,  requiredScore: 3,  maxMisses: 5, basketSpeed: 0,   basketPattern: 'none'   },
  { level: 2,  requiredScore: 4,  maxMisses: 5, basketSpeed: 1.2, basketPattern: 'linear' },
  { level: 3,  requiredScore: 4,  maxMisses: 4, basketSpeed: 2,   basketPattern: 'linear' },
  { level: 4,  requiredScore: 5,  maxMisses: 4, basketSpeed: 2.5, basketPattern: 'sine'   },
  { level: 5,  requiredScore: 5,  maxMisses: 4, basketSpeed: 3,   basketPattern: 'sine'   },
  { level: 6,  requiredScore: 6,  maxMisses: 3, basketSpeed: 3.5, basketPattern: 'fast'   },
  { level: 7,  requiredScore: 6,  maxMisses: 3, basketSpeed: 4,   basketPattern: 'fast'   },
  { level: 8,  requiredScore: 7,  maxMisses: 3, basketSpeed: 4.5, basketPattern: 'fast'   },
  { level: 9,  requiredScore: 8,  maxMisses: 3, basketSpeed: 5,   basketPattern: 'fast'   },
  { level: 10, requiredScore: 10, maxMisses: 3, basketSpeed: 6,   basketPattern: 'fast'   },
];

const W = 360;
const H = 560;
const BASKET_W = 80;
const BASKET_H = 12;
const BASKET_Y = 130;
const BALL_R = 20;
const SHOOTER_Y = H - 60;
const GRAVITY = 0.45;

interface BallState {
  x: number; y: number;
  vx: number; vy: number;
  active: boolean;
}

export default function HoopBurger({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    basketX: W / 2 - BASKET_W / 2,
    basketDir: 1,
    sineT: 0,
    ball: { x: W / 2, y: SHOOTER_Y, vx: 0, vy: 0, active: false } as BallState,
    score: 0,
    misses: 0,
    gameRunning: false,
    level: 1,
    aiming: false,
    touchStart: { x: 0, y: 0 },
    touchCurrent: { x: 0, y: 0 },
    passedBasketY: false,
  });

  const [uiState, setUiState] = useState<'start' | 'playing' | 'won' | 'lost' | 'completed'>('start');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayMisses, setDisplayMisses] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const levelRef = useRef(1);

  useEffect(() => {
    const img = new Image();
    img.src = '/logo.png';
    img.onload = () => setLogoImg(img);
  }, []);

  const config = LEVELS[currentLevel - 1];

  // Draw everything on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;
    const cfg = LEVELS[levelRef.current - 1];

    // Background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0A1220';
    ctx.fillRect(0, 0, W, H);

    // Draw logo faintly
    if (logoImg) {
      ctx.save();
      ctx.globalAlpha = 0.05;
      const logoW = 200;
      const logoH = 200;
      ctx.drawImage(logoImg, W/2 - logoW/2, H/2 - logoH/2, logoW, logoH);
      ctx.restore();
    }

    // Stars background
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.arc((i * 53 + 11) % W, (i * 37 + 7) % (H * 0.6), 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Basket backboard
    ctx.fillStyle = 'rgba(201,162,39,0.15)';
    ctx.fillRect(s.basketX + BASKET_W / 2 - 4, BASKET_Y - 50, 8, 50);

    // Basket rim (left post)
    ctx.fillStyle = '#C9A227';
    ctx.shadowColor = 'rgba(201,162,39,0.8)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(s.basketX + 6, BASKET_Y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Basket rim (right post)
    ctx.beginPath();
    ctx.arc(s.basketX + BASKET_W - 6, BASKET_Y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Basket top bar
    ctx.strokeStyle = '#F5D76E';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(s.basketX + 6, BASKET_Y);
    ctx.lineTo(s.basketX + BASKET_W - 6, BASKET_Y);
    ctx.stroke();

    // Net lines
    ctx.strokeStyle = 'rgba(201,162,39,0.5)';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 0;
    const netTop = BASKET_Y;
    const netBottom = BASKET_Y + 45;
    const netLeft = s.basketX + 8;
    const netRight = s.basketX + BASKET_W - 8;
    const netBottomLeft = s.basketX + BASKET_W / 2 - 14;
    const netBottomRight = s.basketX + BASKET_W / 2 + 14;
    ctx.beginPath();
    ctx.moveTo(netLeft, netTop); ctx.lineTo(netBottomLeft, netBottom);
    ctx.moveTo(netRight, netTop); ctx.lineTo(netBottomRight, netBottom);
    // Horizontal net lines
    for (let i = 0; i <= 3; i++) {
      const t = i / 3;
      const lx = netLeft + (netBottomLeft - netLeft) * t;
      const rx = netRight + (netBottomRight - netRight) * t;
      const y = netTop + (netBottom - netTop) * t;
      ctx.moveTo(lx, y); ctx.lineTo(rx, y);
    }
    ctx.stroke();

    // Ball or shooter
    if (s.ball.active) {
      ctx.shadowColor = 'rgba(255,160,50,0.6)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#E8700A';
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      // Ball lines
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(s.ball.x - BALL_R, s.ball.y);
      ctx.lineTo(s.ball.x + BALL_R, s.ball.y);
      ctx.moveTo(s.ball.x, s.ball.y - BALL_R);
      ctx.arc(s.ball.x, s.ball.y, BALL_R * 0.7, -0.5, Math.PI + 0.5);
      ctx.stroke();
    } else {
      // Draw aim line if aiming
      if (s.aiming) {
        const dx = s.touchCurrent.x - s.touchStart.x;
        const dy = s.touchCurrent.y - s.touchStart.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 5) {
          // Trajectory dots
          const power = Math.min(len * 0.16, 22);
          const vx = (dx / len) * power * 0.8;
          const vy = (dy / len) * power;
          let px = W / 2, py = SHOOTER_Y;
          let pvx = vx, pvy = vy;
          ctx.fillStyle = 'rgba(201,162,39,0.5)';
          for (let i = 0; i < 20; i++) {
            pvx *= 0.999;
            pvy += GRAVITY;
            px += pvx;
            py += pvy;
            if (py > H) break;
            ctx.beginPath();
            ctx.arc(px, py, 3 - i * 0.12, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Shooter (hamburger emoji on a platform)
      ctx.shadowColor = 'rgba(201,162,39,0.5)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#C9A227';
      ctx.beginPath();
      ctx.roundRect(W / 2 - 30, SHOOTER_Y + BALL_R - 8, 60, 12, 6);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.font = `${BALL_R * 1.8}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍔', W / 2, SHOOTER_Y);
    }

    // HUD
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, 50);

    ctx.fillStyle = '#F5F0E8';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`❤️ ${cfg.maxMisses - s.misses} vidas`, 16, 25);

    ctx.textAlign = 'right';
    ctx.fillText(`🏀 ${s.score}/${cfg.requiredScore}`, W - 16, 25);

    // Instruction
    if (!s.ball.active && !s.aiming && s.gameRunning) {
      ctx.fillStyle = 'rgba(201,162,39,0.7)';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Arraste de baixo pra cima para atirar!', W / 2, H - 20);
    }
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    const cfg = LEVELS[levelRef.current - 1];
    if (!s.gameRunning) return;

    // Move basket
    if (cfg.basketSpeed > 0) {
      if (cfg.basketPattern === 'linear' || cfg.basketPattern === 'fast') {
        s.basketX += cfg.basketSpeed * s.basketDir;
        if (s.basketX <= 0 || s.basketX >= W - BASKET_W) s.basketDir *= -1;
        s.basketX = Math.max(0, Math.min(s.basketX, W - BASKET_W));
      } else if (cfg.basketPattern === 'sine') {
        s.sineT += 0.025 * cfg.basketSpeed;
        s.basketX = (W / 2 - BASKET_W / 2) + Math.sin(s.sineT) * (W / 2 - BASKET_W / 2 - 10);
      }
    }

    // Ball physics
    if (s.ball.active) {
      s.ball.vx *= 0.999;
      s.ball.vy += GRAVITY;
      s.ball.x += s.ball.vx;
      s.ball.y += s.ball.vy;

      // Wall bounce
      if (s.ball.x <= BALL_R) { s.ball.x = BALL_R; s.ball.vx = Math.abs(s.ball.vx) * 0.6; }
      if (s.ball.x >= W - BALL_R) { s.ball.x = W - BALL_R; s.ball.vx = -Math.abs(s.ball.vx) * 0.6; }

      // Check basket
      const rimLeft = s.basketX + 6;
      const rimRight = s.basketX + BASKET_W - 6;
      const inX = s.ball.x > rimLeft + 5 && s.ball.x < rimRight - 5;
      const crossingY = s.ball.y >= BASKET_Y - 2 && s.ball.y <= BASKET_Y + 20;
      const goingDown = s.ball.vy > 0;

      if (!s.passedBasketY && s.ball.y < BASKET_Y) s.passedBasketY = true;

      if (s.passedBasketY && crossingY && goingDown && inX) {
        // SCORE!
        s.score += 1;
        s.ball = { x: W / 2, y: SHOOTER_Y, vx: 0, vy: 0, active: false };
        s.passedBasketY = false;
        setDisplayScore(s.score);

        confetti({ particleCount: 40, spread: 40, origin: { y: 0.7 }, colors: ['#C9A227', '#fff'] });

        if (s.score >= cfg.requiredScore) {
          s.gameRunning = false;
          saveGameScore('hoop', levelRef.current, s.score);
          if (levelRef.current >= LEVELS.length) {
            const code = generateCoupon('HOOP');
            setCoupon(code);
            setUiState('completed');
          } else {
            setUiState('won');
          }
          draw();
          return;
        }
      }

      // Ball out of bounds (missed)
      if (s.ball.y > H + 10 || (s.passedBasketY && s.ball.y > BASKET_Y + 60 && !inX)) {
        s.misses += 1;
        s.ball = { x: W / 2, y: SHOOTER_Y, vx: 0, vy: 0, active: false };
        s.passedBasketY = false;
        setDisplayMisses(s.misses);

        if (s.misses >= cfg.maxMisses) {
          s.gameRunning = false;
          setUiState('lost');
          draw();
          return;
        }
      }
    }

    draw();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [draw]);

  const startGame = useCallback((levelIdx: number) => {
    const cfg = LEVELS[levelIdx];
    const s = stateRef.current;
    s.basketX = W / 2 - BASKET_W / 2;
    s.basketDir = 1;
    s.sineT = 0;
    s.ball = { x: W / 2, y: SHOOTER_Y, vx: 0, vy: 0, active: false };
    s.score = 0;
    s.misses = 0;
    s.gameRunning = true;
    s.aiming = false;
    s.passedBasketY = false;
    setDisplayScore(0);
    setDisplayMisses(0);
    setUiState('playing');

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  useEffect(() => {
    levelRef.current = currentLevel;
  }, [currentLevel]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (stateRef.current.ball.active || !stateRef.current.gameRunning) return;
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const t = e.touches[0];
    stateRef.current.aiming = true;
    stateRef.current.touchStart = { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    stateRef.current.touchCurrent = { ...stateRef.current.touchStart };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!stateRef.current.aiming) return;
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const t = e.touches[0];
    stateRef.current.touchCurrent = { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!stateRef.current.aiming) return;
    e.preventDefault();
    const s = stateRef.current;
    const dx = s.touchCurrent.x - s.touchStart.x;
    const dy = s.touchCurrent.y - s.touchStart.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 8) {
      const power = Math.min(len * 0.16, 22);
      s.ball = {
        x: W / 2, y: SHOOTER_Y,
        vx: (dx / len) * power * 0.8,
        vy: (dy / len) * power,
        active: true,
      };
      s.passedBasketY = false;
    }
    s.aiming = false;
  };

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (stateRef.current.ball.active || !stateRef.current.gameRunning) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    stateRef.current.aiming = true;
    stateRef.current.touchStart = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    stateRef.current.touchCurrent = { ...stateRef.current.touchStart };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!stateRef.current.aiming) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    stateRef.current.touchCurrent = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handleMouseUp = (_e: React.MouseEvent) => {
    const s = stateRef.current;
    if (!s.aiming) return;
    const dx = s.touchCurrent.x - s.touchStart.x;
    const dy = s.touchCurrent.y - s.touchStart.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 8) {
      const power = Math.min(len * 0.16, 22);
      s.ball = {
        x: W / 2, y: SHOOTER_Y,
        vx: (dx / len) * power * 0.8,
        vy: (dy / len) * power,
        active: true,
      };
      s.passedBasketY = false;
    }
    s.aiming = false;
  };

  const handleNextLevel = () => {
    const next = currentLevel + 1;
    setCurrentLevel(next);
    levelRef.current = next;
    startGame(next - 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 480, margin: '0 auto', padding: 16, boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: '#0A0A0A', border: '1px solid rgba(201,162,39,0.4)', color: '#C9A227', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 18 }}>🏀 Hoop Burger</div>
          <div style={{ color: '#C9A227', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Star size={12} fill="#C9A227" /> Nível {currentLevel} de 10
          </div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Start Screen */}
      {uiState === 'start' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20, background: 'rgba(10,10,10,0.7)', borderRadius: 20, padding: 32, border: '1px solid rgba(201,162,39,0.25)' }}>
          <div style={{ fontSize: 64 }}>🏀</div>
          <div style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 22 }}>Acerte a Cesta!</div>
          <div style={{ background: 'rgba(10,10,10,0.6)', borderRadius: 12, padding: 16, textAlign: 'left', width: '100%' }}>
            <p style={{ color: '#F5F0E8', fontSize: 14, margin: '4px 0' }}>👆 <strong style={{ color: '#C9A227' }}>Arraste o dedo</strong> de baixo pra cima para atirar</p>
            <p style={{ color: '#F5F0E8', fontSize: 14, margin: '4px 0' }}>🏀 Mande o hambúrguer pela <strong style={{ color: '#C9A227' }}>cesta dourada</strong></p>
            <p style={{ color: '#F5F0E8', fontSize: 14, margin: '4px 0' }}>❌ A cesta vai se mover em níveis avançados!</p>
          </div>
          <button onClick={() => startGame(currentLevel - 1)} style={{ background: '#C9A227', color: '#0A0A0A', border: 'none', borderRadius: 12, padding: '14px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 0 16px rgba(201,162,39,0.4)' }}>
            Jogar! 🏀
          </button>
        </div>
      )}

      {/* Canvas game */}
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          width: '100%',
          maxWidth: W,
          borderRadius: 16,
          border: '2px solid rgba(201,162,39,0.25)',
          display: uiState === 'playing' ? 'block' : 'none',
          touchAction: 'none',
          cursor: 'crosshair',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {/* Result overlays */}
      {uiState === 'lost' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 20, padding: 32, textAlign: 'center', maxWidth: 300, width: '90%' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😢</div>
            <div style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Sem vidas!</div>
            <div style={{ color: '#8A7A5A', marginBottom: 20 }}>Você acertou {displayScore} de {config.requiredScore} cestas.</div>
            <button onClick={() => startGame(currentLevel - 1)} style={{ background: '#C9A227', color: '#0A0A0A', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <RotateCcw size={18} /> Tentar de Novo
            </button>
          </div>
        </div>
      )}

      {uiState === 'won' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid rgba(201,162,39,0.6)', borderRadius: 20, padding: 32, textAlign: 'center', maxWidth: 300, width: '90%' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div>
            <div style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Nível {currentLevel} Concluído!</div>
            <div style={{ color: '#8A7A5A', marginBottom: 20 }}>{displayScore} cestas certeiras!</div>
            <button onClick={handleNextLevel} style={{ background: '#C9A227', color: '#0A0A0A', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              🏀 Próximo Nível
            </button>
          </div>
        </div>
      )}

      {uiState === 'completed' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
          <div style={{ background: '#111', border: '2px solid #C9A227', borderRadius: 20, padding: 32, textAlign: 'center', maxWidth: 300, width: '90%', margin: '16px auto' }}>
            <Trophy size={56} style={{ color: '#C9A227', marginBottom: 12 }} />
            <div style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 24, marginBottom: 8 }}>MVP! 🏆</div>
            <div style={{ color: '#8A7A5A', marginBottom: 16 }}>Você zerou o Hoop Burger! Mira incrível!</div>
            {coupon && (
              <div style={{ border: '2px dashed #C9A227', borderRadius: 12, padding: 16, marginBottom: 16, background: 'rgba(201,162,39,0.08)' }}>
                <div style={{ color: '#8A7A5A', fontSize: 12, marginBottom: 4 }}>🎁 Seu cupom:</div>
                <div style={{ color: '#C9A227', fontWeight: 700, fontSize: 20, letterSpacing: 3, fontFamily: 'monospace' }}>{coupon}</div>
                <div style={{ color: '#8A7A5A', fontSize: 11, marginTop: 4 }}>Use no pedido pelo WhatsApp!</div>
              </div>
            )}
            <button onClick={() => { setCurrentLevel(1); levelRef.current = 1; setUiState('start'); setCoupon(null); }} style={{ background: '#C9A227', color: '#0A0A0A', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <RotateCcw size={18} /> Jogar de Novo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
