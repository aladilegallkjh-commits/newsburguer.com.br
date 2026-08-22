import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MemoryGame from '@/components/games/MemoryGame';
import BurgerCatcher from '@/components/games/BurgerCatcher';
import HoopBurger from '@/components/games/HoopBurger';
import PuzzleTasty from '@/components/games/PuzzleTasty';
import GamesRanking from '@/components/games/GamesRanking';
import { Gamepad2 } from 'lucide-react';

type GameId = 'memory' | 'catcher' | 'hoop' | 'puzzle' | null;

const GAMES = [
  {
    id: 'memory' as GameId,
    emoji: '🍔',
    title: 'Burger Memory',
    description: 'Encontre os pares de ingredientes antes do tempo acabar!',
    tag: '10 Níveis',
    gradient: 'from-amber-500/20 to-transparent',
    border: 'rgba(201,162,39,0.4)',
  },
  {
    id: 'catcher' as GameId,
    emoji: '🧺',
    title: 'Burger Catcher',
    description: 'Pegue os lanches que caem e desvie das bombas!',
    tag: '10 Níveis',
    gradient: 'from-orange-500/20 to-transparent',
    border: 'rgba(249,115,22,0.4)',
  },
  {
    id: 'hoop' as GameId,
    emoji: '🏀',
    title: 'Hoop Burger',
    description: 'Acerte a cesta em movimento. Mira certeira!',
    tag: '10 Níveis',
    gradient: 'from-red-500/20 to-transparent',
    border: 'rgba(239,68,68,0.4)',
  },
  {
    id: 'puzzle' as GameId,
    emoji: '🧩',
    title: 'Puzzle Tasty',
    description: 'Monte a foto do lanche o mais rápido que puder!',
    tag: '10 Níveis',
    gradient: 'from-purple-500/20 to-transparent',
    border: 'rgba(168,85,247,0.4)',
  },
];

export default function Games() {
  const [activeGame, setActiveGame] = useState<GameId>(null);

  const renderGame = () => {
    switch (activeGame) {
      case 'memory': return <MemoryGame onBack={() => setActiveGame(null)} />;
      case 'catcher': return <BurgerCatcher onBack={() => setActiveGame(null)} />;
      case 'hoop': return <HoopBurger onBack={() => setActiveGame(null)} />;
      case 'puzzle': return <PuzzleTasty onBack={() => setActiveGame(null)} />;
      default: return null;
    }
  };

  if (activeGame) {
    return (
      <div className="min-h-screen text-[#F5F0E8] relative flex flex-col" style={{ background: '#0A0A0A' }}>
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'none',
            backgroundSize: '200px',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.05,
          }}
        />
        <div className="relative z-10 flex-1 flex flex-col pt-4">
          {renderGame()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#F5F0E8] relative flex flex-col" style={{ background: '#0A0A0A' }}>
      {/* Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/fundo-menu.jpg.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
        }}
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.03]"
        style={{
          backgroundImage: 'none',
          backgroundSize: '300px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.95) 100%)' }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-1 container max-w-4xl mx-auto px-4 py-8 mt-16">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#C9A227]/10 text-[#C9A227] mb-4 shadow-[0_0_20px_rgba(201,162,39,0.2)]">
              <Gamepad2 size={40} />
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-3 text-[#F5F0E8] drop-shadow-md">
              Arcade Zone
            </h1>
            <p className="text-[#8A7A5A] text-sm sm:text-base max-w-lg mx-auto">
              4 joguinhos temáticos para se divertir enquanto espera seu pedido! Cada um com <span className="text-[#C9A227]">10 níveis</span> de dificuldade.
            </p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {GAMES.map(game => (
              <div
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                className="relative overflow-hidden rounded-2xl cursor-pointer group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(10,10,10,0.98) 100%)',
                  border: `1px solid ${game.border}`,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
              >
                {/* Glow gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-50 group-hover:opacity-80 transition-opacity`}
                />

                <div className="absolute top-3 right-3 z-10">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-md"
                    style={{ background: game.border, color: '#0A0A0A' }}
                  >
                    {game.tag}
                  </span>
                </div>

                <div className="relative p-6 z-10">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {game.emoji}
                  </div>
                  <h3 className="text-xl font-bold text-[#F5F0E8] mb-2 font-display">{game.title}</h3>
                  <p className="text-sm text-[#8A7A5A] line-clamp-2">{game.description}</p>
                  <div className="mt-4 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform" style={{ color: game.border }}>
                    Jogar Agora →
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Game Ranking & Coupons */}
          <GamesRanking />

          {/* Footer note */}
          <p className="text-center text-[#8A7A5A]/60 text-xs mt-8">
            🎮 News Burguer Arcade Zone — Que comece a diversão!
          </p>
        </div>

        <Footer />
      </div>
    </div>
  );
}
