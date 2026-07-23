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

                {/* Conteúdo do Banner */}
                <div className="flex flex-col sm:flex-row items-center p-5 sm:p-6 gap-4 sm:gap-6 relative z-10 h-full">
                  
                  {/* Lado Esquerdo: Textos */}
                  <div className="flex-1 flex flex-col items-start text-left w-full h-full">
                    <div className="flex items-center gap-1.5 mb-2 bg-[#C9A227]/10 px-2 py-1 rounded-full border border-[#C9A227]/20">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span className="text-[9px] sm:text-[10px] font-serif uppercase tracking-widest text-[#C9A227] font-bold">
                        Oferta Exclusiva
                      </span>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F0E8] mb-1 sm:mb-2 leading-tight drop-shadow-md">
                      {promo.title}
                    </h2>
                    
                    {promo.description && (
                      <p className="text-xs sm:text-sm text-[#8A7A5A] mb-4 line-clamp-2 max-w-sm">
                        {promo.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 mt-auto pt-2">
                      <span className="text-xl sm:text-3xl font-bold text-[#C9A227] drop-shadow-md">
                        R$ {parseFloat(promo.discountValue).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Lado Direito: Imagem e Botão */}
                  <div className="w-full sm:w-auto flex flex-col sm:items-end justify-center gap-4 mt-2 sm:mt-0 relative">
                    <div className="relative w-full sm:w-44 h-36 sm:h-36 rounded-xl overflow-hidden bg-[#0A0E0B] border border-[#C9A227]/20 flex items-center justify-center shadow-inner group-hover:border-[#C9A227]/40 transition-colors">
                      {promo.imageUrl ? (
                        <img 
                          src={promo.imageUrl} 
                          alt={promo.title}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                         <span className="text-[#C9A227]/30 font-bold">PROMOÇÃO</span>
                      )}
                    </div>
                    
                    <button className="w-full sm:w-full bg-[#C9A227] text-[#0A0A0A] font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#D4B242] transition-colors shadow-[0_0_15px_rgba(201,162,39,0.3)] hover:shadow-[0_0_20px_rgba(201,162,39,0.5)]">
                      Eu quero!
                      <ArrowRight className="w-4 h-4" />
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
