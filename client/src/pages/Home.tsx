import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LOGO_URL = '/logo.png';
const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663785681503/hw2XZYFpsWbStHSB92WGwu/hero-bg-5ZMaG7H6TSsgzEUvPhS5fs.webp';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Scroll reveal animation
      const elements = document.querySelectorAll('.scroll-reveal');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
          el.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      <Navbar />

      {/* Hero Section with Parallax */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-12 md:pt-16"
        style={{ background: '#0A0A0A' }}
      >
        {/* Parallax background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            opacity: 0.35,
            transform: `translateY(${scrollY * 0.5}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />

        {/* Dark overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.5) 40%, rgba(10,10,10,0.9) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-4 flex flex-col items-center">
          {/* Logo with glow effect */}
          <div className="animate-fade-in-up mb-6">
            <div className="relative inline-block">
              <div 
                className="absolute inset-0 rounded-full blur-3xl opacity-50"
                style={{
                  background: 'radial-gradient(circle, rgba(201, 162, 39, 0.3) 0%, transparent 70%)',
                  animation: 'pulse 3s ease-in-out infinite',
                }}
              />
              <img
                src={LOGO_URL}
                alt="New S'Burguer"
                className="w-36 h-36 md:w-48 md:h-48 object-contain mx-auto drop-shadow-2xl relative z-10 animate-glow"
                style={{ filter: 'drop-shadow(0 0 40px rgba(201, 162, 39, 0.3))' }}
              />
            </div>
          </div>

          {/* Brand name with gradient text */}
          <div className="animate-fade-in-up stagger-1 mb-2">
            <p
              className="font-display text-sm md:text-base tracking-[0.3em] uppercase mb-1"
              style={{ color: '#C9A227' }}
            >
              Bem-vindo à
            </p>
            <h1
              className="font-display text-3xl sm:text-4xl md:text-7xl font-black leading-none"
              style={{ color: '#F5F0E8' }}
            >
              New S'Burguer
            </h1>
          </div>

          {/* Gold divider ornament */}
          <div className="animate-fade-in-up stagger-2 flex items-center gap-3 my-4 w-48 sm:w-64 md:w-80">
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #C9A227)' }} />
            <div
              className="w-2 h-2 rotate-45"
              style={{ background: '#C9A227', flexShrink: 0 }}
            />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #C9A227)' }} />
          </div>

          {/* Tagline with fade effect */}
          <p
            className="animate-fade-in-up stagger-3 font-display italic text-base sm:text-lg md:text-2xl mb-6 px-2"
            style={{ color: 'rgba(245, 240, 232, 0.75)' }}
          >
            Feito com fogo. Servido com estilo.
          </p>

          {/* CTA Button with premium effect */}
          <div className="animate-fade-in-up stagger-4">
            <Link href="/menu">
              <button className="btn-gold text-sm sm:text-base px-6 sm:px-10 py-3 sm:py-4 rounded-sm hover-lift">
                Ver Cardápio
              </button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div
            className="animate-fade-in-up stagger-5 mt-8 sm:mt-12 md:mt-16 flex flex-col items-center gap-2"
            style={{ color: 'rgba(201, 162, 39, 0.5)' }}
          >
            <span className="text-xs tracking-widest uppercase hidden sm:block">Role para baixo</span>
            <div
              className="w-px h-8 animate-float"
              style={{ background: 'linear-gradient(to bottom, rgba(201, 162, 39, 0.5), transparent)' }}
            />
          </div>
        </div>
      </section>

      {/* Features Section with scroll reveal */}
      <section
        className="py-12 sm:py-20 px-4"
        style={{ background: 'linear-gradient(to bottom, #0A0A0A, #0D1A14)' }}
      >
        <div className="container">
          {/* Section header */}
          <div className="text-center mb-8 sm:mb-14 scroll-reveal">
            <p
              className="font-display text-sm tracking-[0.3em] uppercase mb-3"
              style={{ color: '#C9A227' }}
            >
              Por que escolher a
            </p>
            <h2
              className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
              style={{ color: '#F5F0E8' }}
            >
              New S'Burguer
            </h2>
            <div className="flex items-center justify-center gap-3 w-40 sm:w-48 mx-auto">
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #C9A227)' }} />
              <div className="w-2 h-2 rotate-45" style={{ background: '#C9A227', flexShrink: 0 }} />
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #C9A227)' }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔥',
                title: 'Artesanal',
                desc: 'Hambúrgueres feitos à mão com ingredientes selecionados e carne de primeira qualidade.',
              },
              {
                icon: '⚡',
                title: 'Rápido',
                desc: 'Pedido feito, pedido entregue. Sem demora, sem complicação — só sabor.',
              },
              {
                icon: '✨',
                title: 'Premium',
                desc: 'Ingredientes premium, receitas exclusivas e um padrão de qualidade que você sente no primeiro mordida.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="premium-card rounded-sm p-8 text-center scroll-reveal hover-lift"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-5xl mb-4 inline-block hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3
                  className="font-display text-xl font-bold mb-3"
                  style={{ color: '#C9A227' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8A7A5A' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12 scroll-reveal">
            <Link href="/menu">
              <button className="btn-gold hover-lift">
                Fazer Pedido Agora
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider with gradient */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent, #C9A227, transparent)',
        }}
      />

      {/* Premium Features Section */}
      <section
        className="py-12 sm:py-20 px-4"
        style={{ background: 'linear-gradient(to bottom, #0D1A14, #0A0A0A)' }}
      >
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 scroll-reveal">
              <h2
                className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
                style={{ color: '#F5F0E8' }}
              >
                Experiência Premium
              </h2>
              <p style={{ color: '#8A7A5A' }}>
                Cada detalhe foi pensado para oferecer a melhor experiência
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  title: 'Entrega Rápida',
                  desc: 'Seus pedidos chegam quentes e frescos, sempre no tempo prometido.',
                },
                {
                  title: 'Qualidade Garantida',
                  desc: 'Cada hambúrguer é preparado com cuidado e atenção aos detalhes.',
                },
                {
                  title: 'Atendimento Excepcional',
                  desc: 'Nossa equipe está sempre pronta para oferecer o melhor atendimento.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="glass glass-hover p-6 rounded-lg scroll-reveal"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <h3 className="font-display text-lg font-bold mb-2" style={{ color: '#C9A227' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#8A7A5A' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
