import { Link, useLocation } from 'wouter';
import { ShoppingCart, Menu, X, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';

const LOGO_URL = '/logo.png';

// Mapa de rota → rota anterior (fallback caso não tenha histórico)
const BACK_ROUTES: Record<string, string> = {
  '/menu': '/',
  '/cart': '/menu',
  '/criar-lanche': '/menu',
  '/ranking': '/',
  '/rastrear': '/',
  '/avaliacoes': '/',
};

export default function Navbar() {
  const { itemCount } = useCart();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location === '/';
  const backRoute = BACK_ROUTES[location] ?? '/';

  function handleBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = backRoute;
    }
  }

  // Tamanhos dinâmicos baseado no scroll
  const logoSize = scrolled ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-12 h-12 sm:w-20 sm:h-20';
  const navbarBg = scrolled
    ? 'rgba(10, 10, 10, 0.98)'
    : 'rgba(10, 10, 10, 0.7)';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: '#000000',
        borderBottom: '1px solid rgba(201, 162, 39, 0.15)',
      }}
    >
      <div className="container">
        <div className="flex items-center justify-between py-3 sm:py-4">

          {/* Left side: back button + logo */}
          <div className="flex items-center gap-6">
            {/* Botão voltar — aparece em todas as páginas exceto Home */}
            {!isHome && (
              <button
                onClick={handleBack}
                className="flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105"
                style={{
                  width: '46px',
                  height: '46px',
                  background: 'transparent',
                  border: '1px solid rgba(201,162,39,0.8)',
                  borderRadius: '14px',
                  color: '#C9A227',
                }}
                aria-label="Voltar"
              >
                <ArrowLeft size={24} strokeWidth={2} />
              </button>
            )}

            {/* Logo */}
            <Link href="/">
              <div className="flex items-center cursor-pointer transition-all duration-300 hover:scale-105">
                <img
                  src={LOGO_URL}
                  alt="New S'Burguer"
                  className="object-contain"
                  style={{ 
                    width: '68px',
                    height: '68px',
                    filter: 'drop-shadow(0 0 12px rgba(201, 162, 39, 0.6))',
                    borderRadius: '50%'
                  }}
                />
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/">
              <span className="text-sm font-medium transition-colors duration-200 cursor-pointer" style={{ color: location === '/' ? '#C9A227' : '#8A7A5A' }}>
                Início
              </span>
            </Link>
            <Link href="/menu">
              <span className="text-sm font-medium transition-colors duration-200 cursor-pointer" style={{ color: location === '/menu' ? '#C9A227' : '#8A7A5A' }}>
                Cardápio
              </span>
            </Link>
            <Link href="/ranking">
              <span className="text-sm font-medium transition-colors duration-200 cursor-pointer" style={{ color: location === '/ranking' ? '#C9A227' : '#8A7A5A' }}>
                🏆 Ranking
              </span>
            </Link>
          </nav>

          {/* Cart + Mobile Menu */}
          <div className="flex items-center gap-6">
            <Link href="/cart">
              <button
                className="relative transition-all duration-200 hover:scale-110"
                style={{ color: '#C9A227' }}
                aria-label="Carrinho"
              >
                <ShoppingCart size={28} strokeWidth={2} />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#C9A227', color: '#0A0A0A' }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden transition-all duration-200 hover:scale-110"
              style={{ color: '#C9A227' }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav
            className="md:hidden py-4 border-t flex flex-col gap-4 animate-fade-in"
            style={{ borderColor: 'rgba(201, 162, 39, 0.2)' }}
          >
            <Link href="/" onClick={() => setMenuOpen(false)}>
              <span
                className="block text-sm font-medium py-2 cursor-pointer"
                style={{ color: location === '/' ? '#C9A227' : '#8A7A5A' }}
              >
                Início
              </span>
            </Link>
            <Link href="/menu" onClick={() => setMenuOpen(false)}>
              <span
                className="block text-sm font-medium py-2 cursor-pointer"
                style={{ color: location === '/menu' ? '#C9A227' : '#8A7A5A' }}
              >
                Cardápio
              </span>
            </Link>
            <Link href="/ranking" onClick={() => setMenuOpen(false)}>
              <span
                className="block text-sm font-medium py-2 cursor-pointer"
                style={{ color: location === '/ranking' ? '#C9A227' : '#8A7A5A' }}
              >
                🏆 Ranking
              </span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
