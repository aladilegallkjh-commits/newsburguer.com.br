import React from 'react';
import { useLocation } from 'wouter';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/menuData';

export default function FloatingCartButton() {
  const [location, setLocation] = useLocation();
  const { itemCount, total } = useCart();

  if (itemCount === 0 || location === '/cart' || location === '/admin') {
    return null;
  }

  return (
    <button
      onClick={() => setLocation('/cart')}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
      style={{
        background: '#C9A227',
        color: '#0A0A0A',
        boxShadow: '0 10px 25px -5px rgba(201, 162, 39, 0.4)'
      }}
    >
      <div className="relative flex items-center">
        <ShoppingCart size={22} />
        <span
          className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-bold"
          style={{ background: '#0A0A0A', color: '#C9A227' }}
        >
          {itemCount}
        </span>
      </div>
      
      <div className="flex flex-col items-start leading-tight ml-1 border-l border-black/10 pl-3">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Ver Carrinho</span>
        <span className="text-sm font-bold">{formatPrice(total)}</span>
      </div>
      
      <ArrowRight size={18} className="ml-1 opacity-80" />
    </button>
  );
}
