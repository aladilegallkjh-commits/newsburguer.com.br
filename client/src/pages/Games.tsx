import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MemoryGame from '@/components/games/MemoryGame';
import { Gamepad2, Lock } from 'lucide-react';

export default function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (activeGame === 'memory') {
    return (
      <div className="min-h-screen text-[#F5F0E8] relative flex flex-col" style={{ background: '#0A0A0A' }}>
        <div 
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/fundo-menu.jpg.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            opacity: 0.15,
          }}
        />
        <div className="relative z-10 flex-1 flex flex-col">
          <MemoryGame onBack={() => setActiveGame(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#F5F0E8] relative flex flex-col" style={{ background: '#0A0A0A' }}>
      {/* Background image */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/fundo-menu.jpg.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 0.3,
        }}
      />
      
      {/* Overlay */}
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
              Divirta-se com nossos joguinhos temáticos enquanto espera seu pedido! Novos jogos e níveis serão liberados em breve.
            </p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Jogo 1: Memory Game */}
            <div 
              onClick={() => setActiveGame('memory')}
              className="relative overflow-hidden rounded-2xl cursor-pointer group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)',
                border: '1px solid rgba(201,162,39,0.4)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
            >
              <div className="absolute top-0 right-0 p-3">
                <span className="bg-[#C9A227] text-[#0A0A0A] text-xs font-bold px-2 py-1 rounded-md">10 Níveis</span>
              </div>
              <div className="p-6">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🍔</div>
                <h3 className="text-xl font-bold text-[#F5F0E8] mb-2 font-display">Burger Memory</h3>
                <p className="text-sm text-[#8A7A5A] line-clamp-2">Treine sua memória encontrando os pares perfeitos do nosso cardápio!</p>
                <div className="mt-4 text-[#C9A227] text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Jogar Agora →
                </div>
              </div>
            </div>

            {/* Jogo 2: Burger Catcher */}
            <div 
              className="relative overflow-hidden rounded-2xl opacity-75"
              style={{
                background: 'linear-gradient(135deg, rgba(20,20,20,0.7) 0%, rgba(10,10,10,0.8) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-2 text-[#8A7A5A]">
                  <Lock size={24} />
                  <span className="text-sm font-bold uppercase tracking-wider">Em Breve (Fase 2)</span>
                </div>
              </div>
              <div className="p-6 opacity-40">
                <div className="text-6xl mb-4">🧺</div>
                <h3 className="text-xl font-bold text-[#F5F0E8] mb-2 font-display">Burger Catcher</h3>
                <p className="text-sm text-[#8A7A5A] line-clamp-2">Pegue os hambúrgueres que caem e desvie das bombas!</p>
              </div>
            </div>

            {/* Jogo 3: Hoop Burger */}
            <div 
              className="relative overflow-hidden rounded-2xl opacity-75"
              style={{
                background: 'linear-gradient(135deg, rgba(20,20,20,0.7) 0%, rgba(10,10,10,0.8) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-2 text-[#8A7A5A]">
                  <Lock size={24} />
                  <span className="text-sm font-bold uppercase tracking-wider">Em Breve (Fase 3)</span>
                </div>
              </div>
              <div className="p-6 opacity-40">
                <div className="text-6xl mb-4">🏀</div>
                <h3 className="text-xl font-bold text-[#F5F0E8] mb-2 font-display">Hoop Burger</h3>
                <p className="text-sm text-[#8A7A5A] line-clamp-2">Acerte a cesta em movimento. Fica mais rápido a cada nível!</p>
              </div>
            </div>

            {/* Jogo 4: Puzzle Tasty */}
            <div 
              className="relative overflow-hidden rounded-2xl opacity-75"
              style={{
                background: 'linear-gradient(135deg, rgba(20,20,20,0.7) 0%, rgba(10,10,10,0.8) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-2 text-[#8A7A5A]">
                  <Lock size={24} />
                  <span className="text-sm font-bold uppercase tracking-wider">Em Breve (Fase 4)</span>
                </div>
              </div>
              <div className="p-6 opacity-40">
                <div className="text-6xl mb-4">🧩</div>
                <h3 className="text-xl font-bold text-[#F5F0E8] mb-2 font-display">Puzzle Tasty</h3>
                <p className="text-sm text-[#8A7A5A] line-clamp-2">Monte o quebra-cabeça dos nossos lanches o mais rápido que puder.</p>
              </div>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
