import { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import ProductCustomizer from '@/components/ProductCustomizer';
import Footer from '@/components/Footer';
import { useCart, CartItemCustomization } from '@/contexts/CartContext';
import { menuItems, categories, formatPrice, MenuItem } from '@/lib/menuData';
import { toast } from 'sonner';

const MENU_BG = 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1500&auto=format&fit=crop';

export default function Menu() {
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.menu-item-scroll-reveal');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          el.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const [activeCategory, setActiveCategory] = useState('burgers');
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const { addItem } = useCart();
  const [, navigate] = useLocation();

  const filtered = menuItems.filter(item => item.category === activeCategory);
  
  useEffect(() => {
    setSelectedProduct(null);
  }, [activeCategory]);

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
      style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 20px rgba(201,162,39,0.1)' },
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
    <div className="min-h-screen selection:bg-[#C9A227] selection:text-black" style={{ background: '#080C09' }}>
      <Navbar />

      {/* Elegant Header */}
      <div
        className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 overflow-hidden"
        style={{ background: '#080C09' }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${MENU_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            filter: 'blur(4px)',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,12,9,0.7) 0%, #080C09 100%)' }} />
        
        <div className="relative z-10 container text-center">
          <p className="text-xs sm:text-sm font-display mb-3 tracking-[0.4em] font-semibold" style={{ color: '#C9A227' }}>
            A NOSSA COLEÇÃO
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black mb-6 drop-shadow-lg" style={{ color: '#F5F0E8' }}>
            O Cardápio
          </h1>
          <div className="gold-divider w-32 sm:w-48 mx-auto opacity-70">
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: '#C9A227' }} />
          </div>
        </div>
      </div>

      {/* Minimalist Categories */}
      <div className="container py-8 sm:py-10 sticky top-14 z-20" style={{ background: 'rgba(8,12,9,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,162,39,0.1)' }}>
        <div
          className="flex gap-4 sm:gap-8 overflow-x-auto pb-2 px-2 sm:px-4 -mx-2 sm:-mx-4 scrollbar-hide justify-start md:justify-center"
          style={{ scrollBehavior: 'smooth' }}
        >
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex flex-col items-center gap-2 pb-3 relative transition-all duration-300 flex-shrink-0 group"
            >
              <div className="text-2xl sm:text-3xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300">
                {cat.emoji}
              </div>
              <span 
                className="text-xs sm:text-sm font-display tracking-wider uppercase font-semibold transition-colors duration-300"
                style={{ color: activeCategory === cat.id ? '#C9A227' : '#8A7A5A' }}
              >
                {cat.name}
              </span>
              {/* Animated Underline */}
              <div 
                className="absolute bottom-0 left-0 w-full h-[2px] transition-all duration-300"
                style={{ 
                  background: activeCategory === cat.id ? '#C9A227' : 'transparent',
                  boxShadow: activeCategory === cat.id ? '0 0 10px rgba(201,162,39,0.5)' : 'none',
                  transform: activeCategory === cat.id ? 'scaleX(1)' : 'scaleX(0)'
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Premium Products Grid */}
      <div className="container py-12 pb-24 px-2 sm:px-4 min-h-[50vh]">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p style={{ color: '#8A7A5A' }} className="text-lg font-display italic">O chef está preparando novidades para esta categoria...</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filtered.map((item, index) => (
            <div
              key={item.id}
              className="premium-card rounded-lg overflow-hidden cursor-pointer menu-item-scroll-reveal flex flex-col group h-full"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setSelectedProduct(item)}
            >
              {/* Product Image */}
              <div
                className="h-48 sm:h-56 w-full flex items-center justify-center text-6xl overflow-hidden relative"
                style={{ background: '#0D1A14' }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />
                ) : (
                  <span className="group-hover:scale-110 transition-transform duration-500">{item.emoji}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent opacity-80" />
              </div>

              {/* Product Info */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 relative z-10 -mt-6 bg-[#111111]/90 backdrop-blur-sm">
                <h3 className="font-display font-bold text-lg sm:text-xl mb-2 group-hover:text-gradient transition-colors" style={{ color: '#F5F0E8' }}>
                  {item.name}
                </h3>
                <p className="text-sm mb-6 flex-1 text-[#8A7A5A] leading-relaxed">
                  {item.description}
                </p>

                {/* Price and Action */}
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#8A7A5A] mb-1">A partir de</p>
                    <span className="font-display font-bold text-xl sm:text-2xl" style={{ color: '#C9A227' }}>
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <button
                    className="p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
                    style={{
                      background: addedItems.has(item.id) ? '#C9A227' : 'rgba(201,162,39,0.1)',
                      color: addedItems.has(item.id) ? '#0A0A0A' : '#C9A227',
                      border: `1px solid ${addedItems.has(item.id) ? '#C9A227' : 'rgba(201,162,39,0.3)'}`,
                      boxShadow: addedItems.has(item.id) ? '0 0 15px rgba(201,162,39,0.4)' : 'none',
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedProduct(item);
                    }}
                  >
                    {addedItems.has(item.id) ? <Check size={20} /> : <Plus size={20} />}
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

      <Footer />
    </div>
  );
}
