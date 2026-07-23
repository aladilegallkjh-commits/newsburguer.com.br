import { openWhatsAppChat } from '@/lib/whatsappUtils';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function PromoBanner() {
  const handlePromoClick = () => {
    // Aqui você pode personalizar a mensagem que vai para o WhatsApp
    const promoMessage = `Olá! Gostaria de aproveitar o *Combo Explosão Burger + Fritas* (R$ 39,90) que vi na promoção do cardápio online!`;
    openWhatsAppChat(promoMessage);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 mt-[-10px] mb-6 relative z-20">
      <div 
        onClick={handlePromoClick}
        className="relative w-full rounded-2xl overflow-hidden cursor-pointer group shadow-2xl transition-transform hover:scale-[1.01] border"
        style={{
          background: 'linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(10,14,11,0.95) 100%)',
          borderColor: 'rgba(201,162,39,0.3)',
        }}
      >
        {/* Brilho de fundo no hover */}
        <div className="absolute top-0 left-0 w-full h-full bg-[#C9A227] opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
        
        {/* Padrão de fundo sutil */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: 'radial-gradient(#C9A227 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />

        {/* Conteúdo do Banner */}
        <div className="flex flex-col sm:flex-row items-center p-5 sm:p-6 gap-4 sm:gap-6 relative z-10">
          
          {/* Lado Esquerdo: Textos */}
          <div className="flex-1 flex flex-col items-start text-left w-full">
            <div className="flex items-center gap-1.5 mb-2 bg-[#C9A227]/10 px-2 py-1 rounded-full border border-[#C9A227]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="text-[9px] sm:text-[10px] font-serif uppercase tracking-widest text-[#C9A227] font-bold">
                Oferta Exclusiva
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F0E8] mb-1 sm:mb-2 leading-tight drop-shadow-md">
              Combo Explosão <span className="text-[#C9A227]">+</span> Fritas
            </h2>
            
            <p className="text-xs sm:text-sm text-[#8A7A5A] mb-4 line-clamp-2 max-w-sm">
              Dois hambúrgueres artesanais com muito queijo e bacon, acompanhados de fritas crocantes. Peça já o seu direto no WhatsApp!
            </p>
            
            <div className="flex items-center gap-3 mt-auto">
              <span className="text-xl sm:text-3xl font-bold text-[#C9A227] drop-shadow-md">
                R$ 39,90
              </span>
              <span className="text-xs sm:text-sm text-[#8A7A5A] line-through opacity-70">
                R$ 55,00
              </span>
            </div>
          </div>
          
          {/* Lado Direito: Imagem e Botão */}
          <div className="w-full sm:w-auto flex flex-col sm:items-end justify-center gap-4 mt-2 sm:mt-0 relative">
            <div className="relative w-full sm:w-44 h-36 sm:h-36 rounded-xl overflow-hidden bg-[#0A0E0B] border border-[#C9A227]/20 flex items-center justify-center shadow-inner group-hover:border-[#C9A227]/40 transition-colors">
               <img 
                 src="https://images.unsplash.com/photo-1594212202636-1e9674fa7731?w=500&h=400&fit=crop" 
                 alt="Combo Burger e Fritas"
                 className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
               />
               <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-[#8A1A1A] rounded-full flex items-center justify-center rotate-12 border-4 border-[#070b08] shadow-lg">
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-[#F5F0E8] font-bold text-[10px]">OFF</span>
                    <span className="text-[#C9A227] font-black text-sm">-25%</span>
                  </div>
               </div>
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
}
