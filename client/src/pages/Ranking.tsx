import { Trophy, Award, ArrowLeft, Share2, Instagram, Search, X, Flame, Crown, Star, Gift } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { trpc } from '@/lib/trpc';

export default function Ranking() {
  const [activePeriod, setActivePeriod] = useState<'month' | 'all'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyPrizes, setShowOnlyPrizes] = useState(false);
  const { data: rankings, isLoading } = trpc.ranking.getCurrent.useQuery(undefined, { 
    refetchInterval: 5000 
  });

  const monthlyRankings = rankings?.monthlyRankings || [];
  const allTimeRankings = rankings?.allTimeRankings || [];

  const currentRankings = activePeriod === 'month' ? monthlyRankings : allTimeRankings;
  const periodLabel = activePeriod === 'month' ? 'Mês' : 'Todos os Tempos';
  const periodIcon = activePeriod === 'month' ? '👑' : '⭐';

  const filteredRankings = currentRankings.filter((customer: any) => {
    const customerName = customer.customerName || 'Cliente';
    const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const hasPrize = customer.prizeWon !== 'none';
    return showOnlyPrizes ? matchesSearch && hasPrize : matchesSearch;
  });

  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return position;
  };

  const handleShareWhatsApp = (customer: any, position: number) => {
    const medal = getMedalEmoji(position);
    const periodText = activePeriod === 'month' ? 'deste mês' : 'de todos os tempos';
    const message = `Olá! 🎉 Estou em ${position}º lugar ${medal} no ranking ${periodText} da New S'Burguer! Com ${customer.orderCount} pedidos e R$ ${customer.totalSpent}. Vem pedir também! 🍔`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen text-[#F5F0E8] relative" style={{ background: '#0A0A0A' }}>
      {/* Imagem de fundo */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/fundo-ranking.jpg.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundAttachment: 'fixed',
          opacity: 0.95,
        }}
      />
      {/* Overlay escuro em gradiente para mesclar com o resto da página */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.8) 40%, rgba(5,5,5,1) 100%)' }}
      />

      <div className="relative z-10">
        <Navbar />

        <div className="container pt-24 pb-12 relative z-10">
        {/* Header Section */}
        <div className="mb-12 relative">
          <Link href="/">
            <button
              className="absolute left-0 top-0 flex items-center gap-2 text-base transition-colors duration-200 hover:text-yellow-500"
              style={{ color: '#8A7A5A' }}
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
          </Link>
          
          <div className="flex flex-col items-center justify-center text-center mb-6 pt-12">
            <h2 
              className="text-sm sm:text-lg tracking-[0.3em] font-bold mb-1" 
              style={{ color: '#C9A227', textTransform: 'uppercase' }}
            >
              Ranking de
            </h2>
            <h1
              className="font-sans font-black leading-none text-6xl sm:text-7xl md:text-[5.5rem] tracking-tight"
              style={{ color: '#F5F0E8', textTransform: 'uppercase', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
            >
              Clientes
            </h1>
            
            {/* Divider com losango (diamond) */}
            <div className="flex items-center gap-3 w-48 sm:w-64 mt-5 mb-4 justify-center">
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #C9A227)' }} />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rotate-45" style={{ background: '#C9A227', flexShrink: 0 }} />
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #C9A227)' }} />
            </div>

            <p className="text-sm sm:text-base mt-2 font-medium" style={{ color: '#F5F0E8' }}>
              Os melhores clientes ganham <br className="sm:hidden" />
              <span style={{ color: '#C9A227' }}> prêmios exclusivos!</span>
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 sm:gap-3 mb-8 w-full justify-between sm:justify-center">
          {[
            { id: 'month', label: 'Este Mês', icon: '👑' },
            { id: 'all', label: 'Todos os Tempos', icon: '⭐' },
            { id: 'prizes', label: 'Apenas Premiados', icon: '🎁' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'prizes') {
                  setShowOnlyPrizes(!showOnlyPrizes);
                } else {
                  setActivePeriod(tab.id as any);
                }
              }}
              className="flex-1 sm:flex-none px-1.5 py-2 sm:px-5 sm:py-3 rounded-xl font-semibold transition-all duration-200 border flex items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-base leading-tight"
              style={{
                background: (tab.id === 'prizes' ? showOnlyPrizes : tab.id === activePeriod) ? 'rgba(201,162,39,0.3)' : 'rgba(201,162,39,0.1)',
                color: '#C9A227',
                borderColor: (tab.id === 'prizes' ? showOnlyPrizes : tab.id === activePeriod) ? '#C9A227' : 'rgba(201,162,39,0.2)',
              }}
            >
              <span className="text-sm sm:text-lg">{tab.icon}</span>
              <span className="text-center">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{
              background: 'rgba(13, 26, 20, 0.6)',
              borderColor: 'rgba(201,162,39,0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Search size={18} style={{ color: '#8A7A5A' }} />
            <input
              type="text"
              placeholder="Buscar cliente por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: '#F5F0E8' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-opacity-20 rounded transition-colors"
              >
                <X size={16} style={{ color: '#8A7A5A' }} />
              </button>
            )}
          </div>
        </div>

        {/* Ranking Table */}
        <div
          className="rounded-xl overflow-hidden border"
          style={{
            background: 'rgba(13, 26, 20, 0.4)',
            borderColor: 'rgba(201,162,39,0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {isLoading ? (
            <div className="p-8 text-center" style={{ color: '#8A7A5A' }}>
              Carregando ranking...
            </div>
          ) : filteredRankings.length === 0 ? (
            <div className="p-8 text-center" style={{ color: '#8A7A5A' }}>
              Nenhum cliente encontrado nesta categoria.
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div
                className="grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-6 py-4 border-b font-bold text-[10px] sm:text-sm tracking-wider uppercase"
                style={{
                  background: 'rgba(201,162,39,0.1)',
                  borderColor: 'rgba(201,162,39,0.2)',
                  color: '#C9A227'
                }}
              >
                <div className="col-span-2 text-center">RANK</div>
                <div className="col-span-4">NOME</div>
                <div className="col-span-3">PONTOS</div>
                <div className="col-span-3 text-center">PRÊMIO / AÇÃO</div>
              </div>

              {/* Table Rows */}
              {filteredRankings.slice(0, 10).map((customer: any, idx: number) => {
                const position = idx + 1;
                const medal = getMedalEmoji(position);
                const hasPrize = customer.prizeWon !== 'none';

                return (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-6 py-4 border-b items-center hover:bg-opacity-20 transition-colors"
                    style={{
                      background: position <= 3 ? 'rgba(201,162,39,0.05)' : 'transparent',
                      borderColor: 'rgba(201,162,39,0.1)',
                      color: '#F5F0E8'
                    }}
                  >
                    {/* Rank */}
                    <div className="col-span-2 text-center">
                      <span className="text-xl sm:text-2xl">{medal}</span>
                    </div>

                    {/* Name */}
                    <div className="col-span-4">
                      <div className="font-semibold text-sm sm:text-base truncate">{customer.customerName || 'Cliente'}</div>
                      <div className="text-[10px] sm:text-xs" style={{ color: '#8A7A5A' }}>
                        {customer.orderCount} pedidos
                      </div>
                    </div>

                    {/* Points */}
                    <div className="col-span-3">
                      <div className="font-bold text-sm sm:text-base whitespace-nowrap" style={{ color: '#C9A227' }}>
                        R$ {parseFloat(customer.totalSpent || 0).toFixed(2)}
                      </div>
                    </div>

                    {/* Prize and Share */}
                    <div className="col-span-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                      {hasPrize ? (
                        <span className="text-base sm:text-lg">🎁</span>
                      ) : (
                        <span style={{ color: '#8A7A5A' }} className="text-xs w-[28px] text-center">-</span>
                      )}
                      <button
                        onClick={() => handleShareWhatsApp(customer, position)}
                        className="p-1.5 sm:p-2 rounded-full transition-colors flex items-center justify-center hover:bg-opacity-80"
                        style={{ background: 'rgba(201,162,39,0.1)', color: '#C9A227' }}
                        title="Compartilhar no WhatsApp"
                      >
                        <Share2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {[
            {
              icon: '👑',
              title: 'Este Mês',
              description: 'Melhor cliente do mês ganha Combo Grátis',
              color: '#FFD93D'
            },
            {
              icon: '⭐',
              title: 'Todos os Tempos',
              description: 'Clientes VIP com mais de 20 pedidos',
              color: '#6BCB77'
            }
          ].map((card, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border"
              style={{
                background: 'rgba(13, 26, 20, 0.4)',
                borderColor: 'rgba(201,162,39,0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="text-4xl mb-3">{card.icon}</div>
              <h3 className="font-semibold mb-2" style={{ color: '#F5F0E8' }}>
                {card.title}
              </h3>
              <p className="text-sm" style={{ color: '#8A7A5A' }}>
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
      </div>
    </div>
  );
}
