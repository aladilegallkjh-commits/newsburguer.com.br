import { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import ProductCustomizer from '@/components/ProductCustomizer';
import Footer from '@/components/Footer';
import { useCart, CartItemCustomization } from '@/contexts/CartContext';
import { categories, formatPrice, MenuItem } from '@/lib/menuData';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

const MENU_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663785681503/hw2XZYFpsWbStHSB92WGwu/menu-bg-Em9o5MrNXX2xQCaAp5Wz2t.webp';

export default function Menu() {
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.menu-item-scroll-reveal');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          el.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger on mount in case elements are already in view
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [activeCategory, setActiveCategory] = useState('burgers');
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const { addItem } = useCart();
  const [, navigate] = useLocation();

  const { data: menuItems, isLoading } = trpc.menu.getAll.useQuery();
  const filtered = (menuItems || []).filter((item: any) => item.category === activeCategory);
  
  // Resetar produto selecionado quando categoria muda
  useEffect(() => {
    setSelectedProduct(null);
  }, [activeCategory]);
  const activeLabel = categories.find(c => c.id === activeCategory);

  function handleAddWithCustomization(
    product: MenuItem,
    customization: CartItemCustomization,
    customizationPrice: number,
    goToCart: boolean = false
  ) {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      customization,
      customizationPrice,
    });

    setAddedItems(prev => {
      const s = new Set(prev);
      s.add(product.id);
      return s;
    });

    toast.success(`${product.name} adicionado ao pedido!`, {
      style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
    });

    if (goToCart) {
      setTimeout(() => {
        navigate('/cart');
      }, 300);
    } else {
      setTimeout(() => {
        setAddedItems(prev => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }, 1500);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      <Navbar />

      {/* Header */}
      <div
        className="relative pt-16 sm:pt-20 pb-6 sm:pb-10 px-4 overflow-hidden"
        style={{ background: '#0D1A14' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${MENU_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 container text-center">
          <p className="text-xs sm:text-sm font-display mb-2" style={{ color: '#C9A227' }}>
            ESCOLHA O SEU
          </p>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4" style={{ color: '#F5F0E8' }}>
            Cardápio
          </h1>
          <div className="flex items-center gap-3 justify-center w-24 sm:w-32 mx-auto">
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #C9A227)' }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: '#C9A227', flexShrink: 0 }} />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #C9A227)' }} />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container py-6 sm:py-8">
        <div
          className="flex gap-2 overflow-x-auto pb-4 px-2 sm:px-4 -mx-2 sm:-mx-4 scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 text-xs sm:text-sm"
              style={{
                background: activeCategory === cat.id ? '#C9A227' : '#0D1A14',
                color: activeCategory === cat.id ? '#0A0A0A' : '#F5F0E8',
                border: `1px solid ${activeCategory === cat.id ? '#C9A227' : 'rgba(201,162,39,0.15)'}`,
              }}
            >
              <span className="text-base sm:text-lg">{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container pb-20 px-2 sm:px-4">
        {isLoading ? (
          <div className="text-center py-12">
            <p style={{ color: '#8A7A5A' }} className="text-lg">Carregando cardápio...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#8A7A5A' }} className="text-lg">Nenhum produto disponível nesta categoria</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((item: any) => (
            <div
              key={item.id}
              className="rounded-lg overflow-hidden transition-all duration-200 cursor-pointer menu-item-scroll-reveal hover-lift"
              style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}
              onClick={() => setSelectedProduct(item)}
            >
              {/* Product Image */}
              <div
                className="h-32 sm:h-40 flex items-center justify-center text-5xl sm:text-6xl overflow-hidden"
                style={{ background: '#0D1A14' }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{categories.find(c => c.id === item.category)?.emoji || '🍔'}</span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3 sm:p-4">
                <h3 className="font-display font-semibold text-sm sm:text-base mb-1" style={{ color: '#F5F0E8' }}>
                  {item.name}
                </h3>
                <p className="text-xs mb-2 sm:mb-3 line-clamp-2" style={{ color: '#8A7A5A' }}>
                  {item.description}
                </p>

                {/* Price and Button */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base sm:text-lg" style={{ color: '#C9A227' }}>
                    {formatPrice(item.price)}
                  </span>
                  <button
                    className="p-2 sm:p-2.5 rounded-lg transition-all duration-150 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    style={{
                      background: addedItems.has(item.id) ? '#C9A227' : 'rgba(201,162,39,0.1)',
                      color: addedItems.has(item.id) ? '#0A0A0A' : '#C9A227',
                      border: `1px solid ${addedItems.has(item.id) ? '#C9A227' : 'rgba(201,162,39,0.2)'}`,
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedProduct(item);
                    }}
                  >
                    {addedItems.has(item.id) ? <Check size={18} /> : <Plus size={18} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Product Customizer Modal */}
      {selectedProduct && (
        <ProductCustomizer
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(customization, customizationPrice) => {
            handleAddWithCustomization(selectedProduct, customization, customizationPrice);
            setSelectedProduct(null);
          }}
          onAddAndGoToCart={(customization, customizationPrice) => {
            handleAddWithCustomization(selectedProduct, customization, customizationPrice, true);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
