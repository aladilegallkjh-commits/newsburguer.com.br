import { Trophy, Award, ArrowLeft, Share2, Instagram, Search, X, Flame, Crown, Star, Gift } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { trpc } from '@/lib/trpc';

export default function Ranking() {
  const [activePeriod, setActivePeriod] = useState<'week' | 'month' | 'all'>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyPrizes, setShowOnlyPrizes] = useState(false);
  const { data: rankings, isLoading } = trpc.ranking.getCurrent.useQuery(undefined, { 
    refetchInterval: 5000 
  });

  const weeklyRankings = rankings?.weeklyRankings || [];
  const monthlyRankings = rankings?.monthlyRankings || [];
  const allTimeRankings = rankings?.allTimeRankings || [];

  const currentRankings = activePeriod === 'week' ? weeklyRankings : activePeriod === 'month' ? monthlyRankings : allTimeRankings;
  const periodLabel = activePeriod === 'week' ? 'Semana' : activePeriod === 'month' ? 'Mês' : 'Todos os Tempos';
  const periodIcon = activePeriod === 'week' ? '🔥' : activePeriod === 'month' ? '👑' : '⭐';

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
    const periodText = activePeriod === 'week' ? 'desta semana' : activePeriod === 'month' ? 'deste mês' : 'de todos os tempos';
    const message = `Olá! 🎉 Estou em ${position}º lugar ${medal} no ranking ${periodText} da New S'Burguer! Com ${customer.orderCount} pedidos e R$ ${customer.totalSpent}. Vem pedir também! 🍔`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen text-[#F5F0E8] relative" style={{ background: '#0A0A0A' }}>
      {/* Imagem de fundo em tela cheia - bem visível */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/fundo-ranking.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 0.85,
        }}
      />
      {/* Overlay escuro para manter legibilidade e realçar o vidro */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.3) 50%, rgba(5,5,5,0.7) 100%)' }}
      />

      {/* Elegant background pattern */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none z-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(201, 162, 39, 0.1) 10px,
              rgba(201, 162, 39, 0.1) 20px
            )
          `
        }}
      />

      <div className="relative z-10">
        <Navbar />

        <div className="container pt-20 pb-12 relative z-10">
        {/* Header Section */}
        <div className="mb-12">
          <Link href="/">
            <button
              className="flex items-center gap-2 text-sm mb-6 transition-colors duration-200 hover:text-yellow-500"
              style={{ color: '#8A7A5A' }}
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          </Link>

          {/* Title with Trophy */}
          <div className="flex items-start gap-6 mb-8">
            <div className="text-6xl md:text-7xl">👑</div>
            <div>
              <h1
                className="font-display text-4xl md:text-5xl font-black leading-tight"
                style={{ color: '#F5F0E8' }}
              >
                Ranking de<br />Clientes
              </h1>
              <p className="text-base mt-3" style={{ color: '#C9A227' }}>
                Os melhores clientes ganham prêmios exclusivos!
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 w-48 mb-8">
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #C9A227)' }} />
            <div className="w-2 h-2 rotate-45" style={{ background: '#C9A227', flexShrink: 0 }} />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #C9A227)' }} />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { id: 'week', label: 'Esta Semana', icon: '🔥' },
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
              className="px-5 py-3 rounded-xl font-semibold transition-all duration-200 border"
              style={{
                background: (tab.id === 'prizes' ? showOnlyPrizes : tab.id === activePeriod) ? 'rgba(201,162,39,0.3)' : 'rgba(201,162,39,0.1)',
                color: '#C9A227',
                borderColor: (tab.id === 'prizes' ? showOnlyPrizes : tab.id === activePeriod) ? '#C9A227' : 'rgba(201,162,39,0.2)',
              }}
            >
              {tab.icon} {tab.label}
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
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b font-semibold text-sm"
                style={{
                  background: 'rgba(201,162,39,0.1)',
                  borderColor: 'rgba(201,162,39,0.2)',
                  color: '#C9A227'
                }}
              >
                <div className="col-span-2">Rank</div>
                <div className="col-span-4">Nome</div>
                <div className="col-span-3">Pontos</div>
                <div className="col-span-3 text-center">Prêmio / Ação</div>
              </div>

              {/* Table Rows */}
              {filteredRankings.slice(0, 10).map((customer: any, idx: number) => {
                const position = idx + 1;
                const medal = getMedalEmoji(position);
                const hasPrize = customer.prizeWon !== 'none';

                return (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b items-center hover:bg-opacity-20 transition-colors"
                    style={{
                      background: position <= 3 ? 'rgba(201,162,39,0.05)' : 'transparent',
                      borderColor: 'rgba(201,162,39,0.1)',
                      color: '#F5F0E8'
                    }}
                  >
                    {/* Rank */}
                    <div className="col-span-2 text-center">
                      <span className="text-2xl">{medal}</span>
                    </div>

                    {/* Name */}
                    <div className="col-span-4">
                      <div className="font-semibold">{customer.customerName || 'Cliente'}</div>
                      <div className="text-xs" style={{ color: '#8A7A5A' }}>
                        {customer.orderCount} pedidos
                      </div>
                    </div>

                    {/* Points */}
                    <div className="col-span-3">
                      <div className="font-bold" style={{ color: '#C9A227' }}>
                        R$ {parseFloat(customer.totalSpent || 0).toFixed(2)}
                      </div>
                    </div>

                    {/* Prize and Share */}
                    <div className="col-span-3 flex items-center justify-center gap-3">
                      {hasPrize ? (
                        <span className="text-lg">🎁</span>
                      ) : (
                        <span style={{ color: '#8A7A5A' }} className="text-xs w-[28px] text-center">-</span>
                      )}
                      <button
                        onClick={() => handleShareWhatsApp(customer, position)}
                        className="p-2 rounded-full transition-colors flex items-center justify-center hover:bg-opacity-80"
                        style={{ background: 'rgba(201,162,39,0.1)', color: '#C9A227' }}
                        title="Compartilhar no WhatsApp"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              icon: '🔥',
              title: 'Esta Semana',
              description: 'Top 5 clientes da semana ganham prêmios especiais',
              color: '#FF6B6B'
            },
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
