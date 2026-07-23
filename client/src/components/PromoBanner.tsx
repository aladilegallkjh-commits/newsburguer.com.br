import { openWhatsAppChat } from '@/lib/whatsappUtils';
import { ArrowRight, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useRef } from 'react';

export default function PromoBanner() {
  const { data: promotions = [], isLoading } = trpc.promotions.getActive.useQuery();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (isLoading || promotions.length === 0) {
    return null; // Não exibe o banner se não houver promoções ativas
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 mt-[-10px] mb-6 relative z-20 group">
      
      {/* Navigation Buttons (Only if > 1 promo) */}
      {promotions.length > 1 && (
        <>
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 sm:-ml-4 z-30 w-10 h-10 rounded-full bg-[#0A0A0A] border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0A0A0A] transition-colors shadow-lg opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 sm:-mr-4 z-30 w-10 h-10 rounded-full bg-[#0A0A0A] border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0A0A0A] transition-colors shadow-lg opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={24} />
          </button>
          
          <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-1.5 z-30">
            {promotions.map((_: any, i: number) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#C9A227]/40" />
            ))}
          </div>
        </>
      )}

      {/* Carousel Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
        style={{ scrollBehavior: 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {promotions.map((promo: any) => {
          const handlePromoClick = () => {
             const promoMessage = `Olá! Gostaria de aproveitar a promoção *${promo.title}* (R$ ${parseFloat(promo.discountValue).toFixed(2).replace('.', ',')}) que vi no cardápio online!`;
             openWhatsAppChat(promoMessage);
          };

          return (
            <div 
              key={promo.id} 
              className="flex-shrink-0 w-full snap-center px-1"
            >
              <div 
                onClick={handlePromoClick}
                className="relative w-full rounded-2xl overflow-hidden cursor-pointer shadow-2xl transition-transform hover:scale-[1.01] border h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(10,14,11,0.95) 100%)',
                  borderColor: 'rgba(201,162,39,0.3)',
                }}
              >
                {/* Brilho de fundo no hover */}
                <div className="absolute top-0 left-0 w-full h-full bg-[#C9A227] opacity-0 hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
                
                {/* Padrão de fundo sutil */}
                <div 
                  className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                  style={{ backgroundImage: 'radial-gradient(#C9A227 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />

                {/* Conteúdo do Banner (Compacto e Discreto) */}
                <div className="flex flex-row items-center p-3 sm:p-4 gap-3 sm:gap-4 relative z-10 h-full">
                  
                  {/* Esquerda: Imagem Pequena */}
                  {promo.imageUrl && (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#0A0E0B] border border-[#C9A227]/20 flex items-center justify-center shadow-inner group-hover:border-[#C9A227]/40 transition-colors">
                      <img 
                        src={promo.imageUrl} 
                        alt={promo.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    </div>
                  )}

                  {/* Meio: Textos */}
                  <div className="flex-1 flex flex-col items-start justify-center text-left overflow-hidden">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#C9A227]" />
                      <span className="text-[8px] sm:text-[9px] font-serif uppercase tracking-widest text-[#C9A227] font-bold">
                        Oferta
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-base font-serif font-bold text-[#F5F0E8] leading-tight truncate w-full drop-shadow-md">
                      {promo.title}
                    </h2>
                    <span className="text-sm sm:text-base font-bold text-[#C9A227] mt-0.5 drop-shadow-md">
                      R$ {parseFloat(promo.discountValue).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  
                  {/* Direita: Botão Discreto */}
                  <div className="flex-shrink-0 pr-1 sm:pr-2">
                    <button className="bg-[#C9A227] text-[#0A0A0A] font-bold py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#D4B242] transition-colors shadow-[0_0_10px_rgba(201,162,39,0.2)] hover:shadow-[0_0_15px_rgba(201,162,39,0.4)] text-xs sm:text-sm">
                      <span className="hidden sm:inline">Eu quero</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
