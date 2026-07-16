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
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [activeCategory, setActiveCategory] = useState('hamburgers');
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const { addItem } = useCart();
  const [, navigate] = useLocation();

  const { data: menuItems, isLoading } = trpc.menu.getAll.useQuery();
  const filtered = (menuItems || []).filter((item: any) => item.category === activeCategory);
  
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
      emoji: product.emoji || '🍔',
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
    <div className="min-h-screen text-[#F5F0E8] relative bg-[#070b08]">
      {/* Global Texture Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url(${MENU_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* Ambient Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#C9A227] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.07]" />
        <div className="absolute top-[40%] right-[-20%] w-[600px] h-[600px] bg-[#0A3A20] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.15]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-[#C9A227] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.05]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Navbar />

      {/* Header */}
      <div
        className="relative pt-24 pb-12 px-4 overflow-hidden flex flex-col items-center justify-center"
        style={{
          background: 'radial-gradient(circle, rgba(13,38,25,0.4) 0%, #070b08 100%)'
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${MENU_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 text-center max-w-lg">
          <p className="text-xs font-serif uppercase tracking-widest text-[#C9A227] mb-1">
            ESCOLHA O SEU
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-2 text-[#F5F0E8]">
            Cardápio
          </h1>
          <div className="flex items-center gap-3 justify-center w-32 mx-auto">
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #C9A227)' }} />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#C9A227]" />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #C9A227)' }} />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container max-w-4xl mx-auto py-6">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide justify-start md:justify-center">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                if (cat.id === 'custom') {
                  navigate('/criar-lanche');
                } else {
                  setActiveCategory(cat.id);
                }
              }}
              className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-lg font-bold whitespace-nowrap transition-all duration-300 uppercase tracking-widest text-[10px] sm:text-xs border"
              style={{
                background: activeCategory === cat.id ? 'rgba(13,38,25,0.8)' : '#0A0E0B',
                color: activeCategory === cat.id ? '#C9A227' : '#8A7A5A',
                borderColor: activeCategory === cat.id ? '#C9A227' : 'rgba(201,162,39,0.15)',
                boxShadow: activeCategory === cat.id ? '0 0 15px rgba(201,162,39,0.2)' : 'none'
              }}
            >
              <span className="text-sm sm:text-base">{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container max-w-3xl mx-auto pb-20 px-4">
        {isLoading ? (
          <div className="text-center py-12">
            <p style={{ color: '#8A7A5A' }} className="text-lg">Carregando cardápio...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#8A7A5A' }} className="text-lg">Nenhum produto disponível nesta categoria</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((item: any) => (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-row items-stretch p-3 sm:p-4 hover:scale-[1.01] gap-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,38,25,0.7) 0%, rgba(7,11,8,0.9) 100%)',
                  border: '1px solid rgba(201,162,39,0.25)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
                onClick={() => setSelectedProduct(item)}
              >
                {/* Product Info (Left) */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Badge */}
                    <span className="text-[9px] sm:text-xs font-serif italic mb-0.5 sm:mb-1 block uppercase tracking-wider text-[#C9A227]">
                      {item.category === 'burgers' ? '★ Destaque' : '✔ Frescor em cada mordida'}
                    </span>
                    
                    {/* Title */}
                    <h3 className="font-serif font-bold text-sm sm:text-xl md:text-2xl mb-0.5 sm:mb-1 text-[#F5F0E8]">
                      {item.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-[11px] sm:text-sm leading-relaxed mb-2 text-[#8A7A5A] line-clamp-2 sm:line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  {/* Price and Button */}
                  <div className="flex items-center gap-2 sm:gap-3 mt-1">
                    <span className="font-bold text-sm sm:text-lg text-[#C9A227]">
                      {formatPrice(item.price)}
                    </span>
                    <div className="flex items-center rounded-lg overflow-hidden border border-[#C9A227]/30 bg-[#0A0A0A]">
                      <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold text-[#F5F0E8] uppercase tracking-wider hidden sm:inline">
                        Adicionar
                      </span>
                      <button
                        className="p-1.5 sm:p-2 bg-[#C9A227] text-[#0A0A0A] hover:bg-[#D4B242] transition-colors flex items-center justify-center"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedProduct(item);
                        }}
                      >
                        {addedItems.has(item.id) ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
                        ) : (
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Image (Right) */}
                <div
                  className="w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 flex-shrink-0 rounded-xl overflow-hidden self-center border border-[#C9A227]/10"
                  style={{ background: '#0D1A14' }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl">
                      {categories.find(c => c.id === item.category)?.emoji || '🍔'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div 
        className="border-t border-b py-6 px-4 bg-[#050906]"
        style={{ borderColor: 'rgba(201,162,39,0.2)' }}
      >
        <div className="container max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          {/* WhatsApp */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded-full bg-[#C9A227]/10 text-[#C9A227]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.116-4.922 5.488-4.922 9.52 0 5.048 3.793 9.168 8.399 9.168h.003c1.565 0 3.068-.294 4.5-.84l3.285 1.031c-.402-1.4-.687-3.41-.687-5.627 0-5.048-3.793-9.168-8.399-9.168" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#F5F0E8]">41 98701-9702</p>
              <p className="text-xs uppercase tracking-wider text-[#8A7A5A]">Faça seu Pedido</p>
            </div>
          </div>
          
          {/* Instagram */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded-full bg-[#C9A227]/10 text-[#C9A227]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#F5F0E8]">@new.sburguer</p>
              <p className="text-xs uppercase tracking-wider text-[#8A7A5A]">Siga no Instagram</p>
            </div>
          </div>

          {/* Delivery */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded-full bg-[#C9A227]/10 text-[#C9A227]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#F5F0E8]">Delivery Rápido & Seguro</p>
              <p className="text-xs uppercase tracking-wider text-[#8A7A5A]">Entrega e Retirada</p>
            </div>
          </div>
        </div>
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
    </div>
  );
}
