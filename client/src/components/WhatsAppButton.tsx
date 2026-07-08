import { MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatOrderForWhatsApp, openWhatsAppChat } from '@/lib/whatsappUtils';

export default function WhatsAppButton() {
  const { items, total, itemCount } = useCart();

  if (items.length === 0) return null;

  const handleClick = () => {
    const message = formatOrderForWhatsApp(items, total);
    openWhatsAppChat(message);
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
      style={{
        background: '#25D366',
        color: 'white',
      }}
      title="Enviar pedido via WhatsApp"
    >
      <div className="relative">
        <MessageCircle size={24} />
        {itemCount > 0 && (
          <div
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: '#FF6B6B', color: 'white' }}
          >
            {itemCount > 9 ? '9+' : itemCount}
          </div>
        )}
      </div>
    </button>
  );
}
