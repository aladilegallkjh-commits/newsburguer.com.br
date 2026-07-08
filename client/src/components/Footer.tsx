import { MapPin, Phone, Clock, Instagram, Facebook } from 'lucide-react';

const LOGO_URL = '/logo.png';

// Configurações da loja - Customize aqui
const STORE_INFO = {
  name: "New S'Burguer",
  phone: '(41) 98701-9702',
  whatsapp: '(41) 98701-9702',
  address: 'Dr Luiz Losso Filho, 813 - Curitiba, PR',
  hours: {
    weekday: '19h - 00h',
  },
  delivery: true,
  pickup: true,
  paymentMethods: ['Pix', 'Dinheiro', 'Cartão'],
  social: {
    instagram: 'https://www.instagram.com/new.sburguer?igsh=ajZ3MjQ2Y3dqaHpv',
    facebook: null,
  },
  mapsLink: 'https://maps.app.goo.gl/FhpER2GdZQPH9Pbt9?g_st=ac',
};

export default function Footer() {
  return (
    <footer style={{ background: '#0D1A14', borderTop: '1px solid rgba(201,162,39,0.15)' }}>
      {/* Main content */}
      <div className="container py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <img src={LOGO_URL} alt={STORE_INFO.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              <h3 className="font-display font-bold text-sm sm:text-base" style={{ color: '#C9A227' }}>
                {STORE_INFO.name}
              </h3>
            </div>
            <p className="text-xs sm:text-sm" style={{ color: '#8A7A5A' }}>
              Hambúrgueres artesanais feitos com fogo, servidos com estilo.
            </p>
          </div>

          {/* Location */}
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm sm:text-base" style={{ color: '#F5F0E8' }}>
              Localização
            </h4>
            <div className="space-y-2">
              <a
                href={STORE_INFO.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-2 text-xs sm:text-sm hover:text-yellow-400 transition-colors group"
                style={{ color: '#8A7A5A' }}
              >
                <MapPin size={16} className="flex-shrink-0 mt-0.5 group-hover:text-yellow-400 transition-colors" />
                <div>
                  <p className="underline group-hover:text-yellow-400 transition-colors">{STORE_INFO.address}</p>
                </div>
              </a>
              <a
                href={STORE_INFO.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-2 text-sm hover:text-yellow-400 transition-colors"
                style={{ color: '#8A7A5A' }}
              >
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="underline">Ver no mapa</p>
                </div>
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm sm:text-base" style={{ color: '#F5F0E8' }}>
              Contato
            </h4>
            <div className="space-y-2 text-xs sm:text-sm" style={{ color: '#8A7A5A' }}>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <a href={`tel:${STORE_INFO.phone}`} className="hover:text-white transition-colors">
                  {STORE_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.116-4.922 5.488-4.922 9.52 0 5.048 3.793 9.168 8.399 9.168h.003c1.565 0 3.068-.294 4.5-.84l3.285 1.031c-.402-1.4-.687-3.41-.687-5.627 0-5.048-3.793-9.168-8.399-9.168" />
                </svg>
                <a href={`https://wa.me/${STORE_INFO.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  {STORE_INFO.whatsapp}
                </a>
              </div>
            </div>
          </div>

          {/* Hours & Services */}
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm sm:text-base" style={{ color: '#F5F0E8' }}>
              Informações
            </h4>
            <div className="space-y-2 text-xs sm:text-sm" style={{ color: '#8A7A5A' }}>
              <div className="flex gap-2">
                <Clock size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs sm:text-sm" style={{ color: '#F5F0E8' }}>Segunda a Sábado</p>
                  <p className="text-xs sm:text-sm">{STORE_INFO.hours.weekday}</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="font-semibold mb-1 text-xs sm:text-sm" style={{ color: '#F5F0E8' }}>Serviços</p>
                {STORE_INFO.delivery && <p className="text-xs sm:text-sm">✓ Entrega</p>}
                {STORE_INFO.pickup && <p className="text-xs sm:text-sm">✓ Retirada</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(201,162,39,0.15)', margin: '1.5rem 0 sm:margin-2rem 0' }} />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Payment methods */}
          <div className="text-xs sm:text-sm" style={{ color: '#8A7A5A' }}>
            <span className="font-semibold" style={{ color: '#F5F0E8' }}>Formas de pagamento:</span>
            <span> {STORE_INFO.paymentMethods.join(' • ')}</span>
          </div>

          {/* Social links */}
          <div className="flex gap-4">
            {STORE_INFO.social.instagram && (
              <a
                href={STORE_INFO.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                style={{ background: 'rgba(201,162,39,0.1)', color: '#C9A227' }}
                title="Instagram"
              >
                <Instagram size={18} />
              </a>
            )}
            {STORE_INFO.social.facebook && (
              <a
                href={STORE_INFO.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                style={{ background: 'rgba(201,162,39,0.1)', color: '#C9A227' }}
                title="Facebook"
              >
                <Facebook size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-6 sm:mt-8 pt-4 border-t" style={{ borderColor: 'rgba(201,162,39,0.15)' }}>
          <p className="text-xs" style={{ color: '#4A3A2A' }}>
            © 2025 {STORE_INFO.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
