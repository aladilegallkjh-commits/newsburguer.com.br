import { Link, useLocation } from 'wouter';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';

const LOGO_URL = '/logo.png';

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

  // Tamanhos dinâmicos baseado no scroll
  const logoSize = scrolled ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-12 h-12 sm:w-20 sm:h-20';
  const navbarBg = scrolled
    ? 'rgba(10, 10, 10, 0.98)'
    : 'rgba(10, 10, 10, 0.7)';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: navbarBg,
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(201, 162, 39, 0.2)' : 'none',
      }}
    >
      <div className="container">
        <div className="flex items-center justify-between py-1 sm:py-2">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300">
              <img
                src={LOGO_URL}
                alt="New S'Burguer"
                className={`${logoSize} object-contain transition-all duration-300`}
                style={{ filter: 'drop-shadow(0 0 8px rgba(201, 162, 39, 0.2))' }}
              />
              <span
                className={`font-display font-bold hidden sm:block transition-all duration-300 text-sm sm:text-base md:text-lg ${
                  scrolled ? 'text-xs sm:text-base' : 'text-sm sm:text-lg'
                }`}
                style={{ color: '#C9A227', letterSpacing: '0.02em' }}
              >
                New S'Burguer
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/">
              <span
                className="text-sm font-medium transition-colors duration-200 cursor-pointer"
                style={{ color: location === '/' ? '#C9A227' : '#8A7A5A' }}
              >
                Início
              </span>
            </Link>
            <Link href="/menu">
              <span
                className="text-sm font-medium transition-colors duration-200 cursor-pointer"
                style={{ color: location === '/menu' ? '#C9A227' : '#8A7A5A' }}
              >
                Cardápio
              </span>
            </Link>
            <Link href="/ranking">
              <span
                className="text-sm font-medium transition-colors duration-200 cursor-pointer"
                style={{ color: location === '/ranking' ? '#C9A227' : '#8A7A5A' }}
              >
                🏆 Ranking
              </span>
            </Link>

          </nav>

          {/* Cart + Mobile Menu */}
          <div className="flex items-center gap-3">
            <Link href="/cart">
              <button
                className="relative p-2 rounded-full transition-all duration-200"
                style={{ color: '#C9A227' }}
                aria-label="Carrinho"
              >
                <ShoppingCart size={scrolled ? 20 : 24} className="transition-all duration-300" />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#C9A227', color: '#0A0A0A' }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-full transition-colors duration-200"
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
