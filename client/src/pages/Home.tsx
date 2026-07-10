import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LOGO_URL = '/logo.png';
const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663785681503/hw2XZYFpsWbStHSB92WGwu/hero-bg-5ZMaG7H6TSsgzEUvPhS5fs.webp';
const FEATURED_BURGER = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1500&auto=format&fit=crop';
const FEATURED_BURGER_2 = 'https://images.unsplash.com/photo-1594212691516-7463f6fb39e3?q=80&w=1500&auto=format&fit=crop';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Scroll reveal animation
      const elements = document.querySelectorAll('.scroll-reveal');
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

  return (
    <div className="min-h-screen font-sans selection:bg-[#C9A227] selection:text-black" style={{ background: '#080C09' }}>
      <Navbar />

      {/* Hero Section with Deep Parallax */}
      <section
        className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
        style={{ background: '#080C09' }}
      >
        {/* Parallax background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            transform: `scale(1.1) translateY(${scrollY * 0.4}px)`,
            transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        />

        {/* Dramatic vignette overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, #080C09 90%), linear-gradient(to bottom, rgba(8,12,9,0.8) 0%, rgba(8,12,9,0.2) 40%, rgba(8,12,9,1) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-4 flex flex-col items-center mt-20">
          <div className="animate-fade-in-up mb-8 relative group">
            <div 
              className="absolute inset-0 rounded-full blur-3xl opacity-40 transition-opacity duration-700 group-hover:opacity-70"
              style={{
                background: 'radial-gradient(circle, rgba(201, 162, 39, 0.5) 0%, transparent 70%)',
                animation: 'pulse 4s ease-in-out infinite',
              }}
            />
            <img
              src={LOGO_URL}
              alt="New S'Burguer"
              className="w-40 h-40 md:w-56 md:h-56 object-contain mx-auto drop-shadow-2xl relative z-10 hover:scale-105 transition-transform duration-700"
              style={{ filter: 'drop-shadow(0 0 50px rgba(201, 162, 39, 0.4))' }}
            />
          </div>

          <div className="animate-fade-in-up stagger-1 mb-4">
            <p className="font-display text-xs md:text-sm tracking-[0.4em] uppercase mb-4 text-[#C9A227] font-semibold">
              A Arte do Hambúrguer
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-none text-[#F5F0E8] drop-shadow-xl">
              NEW S'BURGUER
            </h1>
          </div>

          <div className="animate-fade-in-up stagger-2 gold-divider w-64 md:w-96 my-6 opacity-70">
            <div className="w-1.5 h-1.5 rotate-45 bg-[#C9A227]" />
          </div>

          <p className="animate-fade-in-up stagger-3 font-display italic text-lg sm:text-xl md:text-2xl mb-10 px-4 text-[#8A7A5A] max-w-2xl leading-relaxed">
            Feito com fogo. Servido com estilo. Uma experiência gastronômica inesquecível em cada mordida.
          </p>

          <div className="animate-fade-in-up stagger-4 flex flex-col sm:flex-row gap-4 items-center">
            <Link href="/menu">
              <button className="btn-gold text-sm px-12 py-4 hover-lift">
                Fazer Pedido
              </button>
            </Link>
            <Link href="#destaques">
              <button className="text-sm px-8 py-4 font-semibold uppercase tracking-widest text-[#C9A227] border border-[#C9A227]/30 hover:border-[#C9A227] hover:bg-[#C9A227]/10 transition-all duration-300 rounded-sm">
                Descobrir
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Destaques do Chef (Bento Box / Premium Grid) */}
      <section id="destaques" className="py-24 px-4 relative" style={{ background: '#080C09' }}>
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9A227]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container max-w-6xl relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <p className="font-display text-xs tracking-[0.4em] uppercase mb-3 text-[#C9A227]">Assinatura</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-[#F5F0E8] mb-6">Destaques do Chef</h2>
            <div className="gold-divider w-40 mx-auto opacity-50"><div className="w-1 h-1 bg-[#C9A227] rotate-45"/></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Featured Item 1 */}
            <div className="lg:col-span-2 group relative h-[400px] rounded-lg overflow-hidden scroll-reveal premium-card cursor-pointer">
              <img src={FEATURED_BURGER} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-40" alt="Supreme Smash" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080C09] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="inline-block px-3 py-1 border border-[#C9A227]/50 text-[#C9A227] text-xs uppercase tracking-widest font-semibold mb-4 glass rounded-full">Mais Vendido</span>
                <h3 className="font-display text-3xl font-bold text-[#F5F0E8] mb-2 group-hover:text-gradient transition-colors">Supreme Smash Duplo</h3>
                <p className="text-[#8A7A5A] text-sm md:text-base max-w-md mb-4">Dois blends de 100g prensados na chapa, queijo cheddar inglês derretido, bacon rústico e molho especial trufado.</p>
                <p className="text-[#C9A227] text-2xl font-bold font-display">R$ 42,90</p>
              </div>
            </div>

            {/* Featured Item 2 */}
            <div className="group relative h-[400px] rounded-lg overflow-hidden scroll-reveal premium-card cursor-pointer" style={{ animationDelay: '0.2s' }}>
              <img src={FEATURED_BURGER_2} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50 group-hover:opacity-30" alt="Black Angus" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080C09] via-[#080C09]/50 to-transparent opacity-90" />
              <div className="absolute bottom-0 left-0 p-8 w-full text-center">
                <h3 className="font-display text-2xl font-bold text-[#F5F0E8] mb-2 group-hover:text-gradient">Black Angus Premium</h3>
                <p className="text-[#8A7A5A] text-sm mb-4">Blend 200g de Angus certificado, cebola caramelizada no Jack Daniel's e queijo brie.</p>
                <p className="text-[#C9A227] text-xl font-bold font-display">R$ 54,90</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12 scroll-reveal" style={{ animationDelay: '0.4s' }}>
            <Link href="/menu">
              <span className="inline-flex items-center gap-2 text-[#C9A227] hover:text-[#F5F0E8] transition-colors cursor-pointer text-sm tracking-widest uppercase font-semibold pb-1 border-b border-[#C9A227]/30 hover:border-[#F5F0E8]">
                Ver Cardápio Completo &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* A Experiência (Storytelling) */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #080C09 0%, #0a110c 100%)' }}>
        {/* Subtle geometric pattern background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#C9A227 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        
        <div className="container max-w-5xl relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-[#F5F0E8] mb-6">A Experiência</h2>
            <div className="gold-divider w-40 mx-auto opacity-50"><div className="w-1 h-1 bg-[#C9A227] rotate-45"/></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                title: 'Ingredientes Premium',
                desc: 'Selecionamos apenas cortes nobres e insumos frescos. Sem atalhos, apenas a pura essência do sabor.',
              },
              {
                number: '02',
                title: 'Fogo Perfeito',
                desc: 'A temperatura exata e o tempo preciso para garantir a reação de Maillard que cria nossa crosta inconfundível.',
              },
              {
                number: '03',
                title: 'Entrega Impecável',
                desc: 'Da grelha até a sua porta, mantemos o padrão intacto. O burger chega quente, montado e irresistível.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass glass-hover p-10 rounded-lg scroll-reveal text-center relative overflow-hidden group"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="absolute -top-4 -right-4 text-7xl font-display font-black text-[#C9A227] opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                  {feature.number}
                </div>
                <div className="text-[#C9A227] text-sm tracking-widest font-bold mb-4 font-display">{feature.number}</div>
                <h3 className="font-display text-xl font-bold mb-4 text-[#F5F0E8]">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[#8A7A5A]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
