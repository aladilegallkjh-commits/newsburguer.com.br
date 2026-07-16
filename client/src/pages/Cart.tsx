import { Link } from 'wouter';
import React from 'react';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, MessageCircle, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart, CartItem } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/menuData';
import { toast } from 'sonner';
import { formatOrderForWhatsApp, openWhatsAppChat } from '@/lib/whatsappUtils';
import CouponInput from '@/components/CouponInput';
import { trpc } from '@/lib/trpc';
import PixQRCode from '@/components/PixQRCode';

const LOGO_URL = '/logo.png';

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const itemTotal = (item.price + (item.customizationPrice || 0)) * item.quantity;

  return (
    <div
      className="flex flex-col gap-3 p-3 sm:p-4 rounded-sm animate-fade-in"
      style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}
    >
      {/* Main row */}
      <div className="flex items-start sm:items-center gap-2 sm:gap-4">
        {/* Emoji */}
        <div
          className="w-12 sm:w-14 h-12 sm:h-14 rounded-sm flex items-center justify-center flex-shrink-0"
          style={{ background: '#0D1A14', fontSize: '1.5rem' }}
        >
          {item.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4
            className="font-display font-semibold text-xs sm:text-sm leading-tight"
            style={{ color: '#F5F0E8' }}
          >
            {item.name}
          </h4>
          <p className="text-xs mt-1" style={{ color: '#8A7A5A' }}>
            R$ {item.price.toFixed(2)}
            {item.customizationPrice && item.customizationPrice > 0 && (
              <> + R$ {item.customizationPrice.toFixed(2)}</>
            )}
          </p>
        </div>

        {/* Quantity controls - mobile stack */}
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 sm:w-7 sm:h-7 rounded-sm flex items-center justify-center transition-all duration-150 active:scale-95 min-w-[32px] min-h-[32px]"
            style={{ background: 'rgba(201,162,39,0.1)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <Minus size={14} />
          </button>
          <span
            className="w-6 text-center text-xs sm:text-sm font-bold"
            style={{ color: '#F5F0E8' }}
          >
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 sm:w-7 sm:h-7 rounded-sm flex items-center justify-center transition-all duration-150 active:scale-95 min-w-[32px] min-h-[32px]"
            style={{ background: 'rgba(201,162,39,0.1)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs sm:text-sm font-bold" style={{ color: '#F5F0E8' }}>
            {formatPrice(itemTotal)}
          </p>
        </div>

        {/* Remove */}
        <button
          onClick={() => removeItem(item.id)}
          className="p-1.5 rounded-sm transition-all duration-150 active:scale-95 min-w-[32px] min-h-[32px] flex items-center justify-center"
          style={{ color: '#4A3A2A' }}
          aria-label="Remover"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Customizations */}
      {item.customization && (
        <div
          className="ml-14 sm:ml-18 pt-3 border-t space-y-2"
          style={{ borderColor: 'rgba(201,162,39,0.1)' }}
        >
          {/* Removed ingredients */}
          {item.customization.removedIngredients.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#C9A227' }}>
                SEM:
              </p>
              <div className="flex flex-wrap gap-1">
                {item.customization.removedIngredients.map(ing => (
                  <span
                    key={ing}
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: 'rgba(201,162,39,0.1)', color: '#8A7A5A' }}
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Added extras */}
          {item.customization.addedExtras.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#C9A227' }}>
                EXTRAS:
              </p>
              <div className="flex flex-wrap gap-1">
                {item.customization.addedExtras.map(extra => (
                  <span
                    key={extra.id}
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: 'rgba(201,162,39,0.1)', color: '#8A7A5A' }}
                  >
                    + {extra.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {item.customization.notes && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#C9A227' }}>
                OBS:
              </p>
              <p className="text-xs" style={{ color: '#8A7A5A' }}>
                {item.customization.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Cart() {
  const { items, total, clearCart, itemCount } = useCart();
  const [customerName, setCustomerName] = React.useState(() => localStorage.getItem('customerName') || '');
  const [customerPhone, setCustomerPhone] = React.useState(() => localStorage.getItem('customerPhone') || '');
  const [appliedDiscount, setAppliedDiscount] = React.useState(0);
  const [appliedCoupon, setAppliedCoupon] = React.useState<string | undefined>();
  const [showPix, setShowPix] = React.useState(false);
  const [orderNumber, setOrderNumber] = React.useState('');
  const [pixFinalTotal, setPixFinalTotal] = React.useState(0);
  const [pixItems, setPixItems] = React.useState(items);
  const [pixName, setPixName] = React.useState('');
  const { data: settings } = trpc.storeSettings.get.useQuery();
  const isStoreOpen = settings?.isOpen === 1;

  const finalTotal = Math.max(0, total - appliedDiscount);

  const handleNameChange = (val: string) => {
    setCustomerName(val);
    localStorage.setItem('customerName', val);
  };

  const handlePhoneChange = (val: string) => {
    setCustomerPhone(val);
    localStorage.setItem('customerPhone', val);
  };

  const handleCouponApplied = (discount: number, couponCode: string) => {
    setAppliedDiscount(discount);
    setAppliedCoupon(couponCode);
  };

  const handleCouponRemoved = () => {
    setAppliedDiscount(0);
    setAppliedCoupon(undefined);
  };

  const handleSendWhatsApp = () => {
    const message = formatOrderForWhatsApp(pixItems, pixFinalTotal, pixName, customerPhone);
    openWhatsAppChat(message);
    setShowPix(false);
    clearCart();
  };

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data: any) => {
      const num = data?.orderNumber || String(Date.now()).slice(-6);
      setOrderNumber(num);
      setPixFinalTotal(finalTotal);
      setPixItems([...items]);
      setPixName(customerName);
      setShowPix(true);
    },
    onError: (err) => {
      toast.error('Erro ao registrar pedido: ' + err.message, {
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
      // Fallback direto pro WhatsApp
      const message = formatOrderForWhatsApp(items, finalTotal, customerName, customerPhone);
      openWhatsAppChat(message);
    }
  });

  function handleOrder() {
    if (!isStoreOpen) {
      toast.error('A loja está fechada no momento.');
      return;
    }
    if (items.length === 0) {
      toast.error('Adicione itens ao carrinho', {
        duration: 2000,
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
      return;
    }
    if (!customerName.trim()) {
      toast.error('Digite seu nome', {
        duration: 2000,
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Digite seu telefone', {
        duration: 2000,
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
      return;
    }
    
    createOrder.mutate({
      customerName,
      customerPhone,
      items: items.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        removedIngredients: i.customization?.removedIngredients || [],
        addedExtras: i.customization?.addedExtras || [],
        observations: i.customization?.notes || ""
      })),
      totalAmount: total,
      discount: appliedDiscount,
      finalAmount: finalTotal,
      deliveryType: "delivery",
    });
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      <Navbar />

      <div className="container pt-16 sm:pt-20 pb-12 px-2 sm:px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link href="/menu">
            <button
              className="flex items-center gap-2 text-xs sm:text-sm mb-3 sm:mb-4 transition-colors duration-200"
              style={{ color: '#8A7A5A' }}
            >
              <ArrowLeft size={16} />
              Voltar ao Cardápio
            </button>
          </Link>
          <h1
            className="font-display text-2xl sm:text-3xl md:text-4xl font-bold"
            style={{ color: '#F5F0E8' }}
          >
            Seu Pedido
          </h1>
          <div className="flex items-center gap-3 mt-2 sm:mt-3 w-24 sm:w-32">
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #C9A227)' }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: '#C9A227', flexShrink: 0 }} />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #C9A227)' }} />
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty cart */
          <div className="text-center py-16 sm:py-20 flex flex-col items-center">
            <ShoppingCart
              size={48}
              className="mb-4 sm:mb-6"
              style={{ color: 'rgba(201,162,39,0.3)' }}
            />
            <h2
              className="font-display text-xl sm:text-2xl font-bold mb-2"
              style={{ color: '#F5F0E8' }}
            >
              Carrinho vazio
            </h2>
            <p className="text-xs sm:text-sm mb-6 sm:mb-8" style={{ color: '#4A3A2A' }}>
              Adicione itens do cardápio para fazer seu pedido
            </p>
            <Link href="/menu">
              <button className="btn-gold text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-3">Ver Cardápio</button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Items list */}
            <div className="lg:col-span-2 flex flex-col gap-2 sm:gap-3">
              {items.map(item => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div
                className="rounded-sm p-4 sm:p-6 sticky top-20 sm:top-24"
                style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
              >
                {/* Logo */}
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4" style={{ borderBottom: '1px solid rgba(201,162,39,0.15)' }}>
                  <img src={LOGO_URL} alt="New S'Burguer" className="w-6 sm:w-8 h-6 sm:h-8 object-contain rounded-full" />
                  <span className="font-display font-bold text-xs sm:text-sm" style={{ color: '#C9A227' }}>
                    New S'Burguer
                  </span>
                </div>

                <h3
                  className="font-display text-base sm:text-lg font-bold mb-3 sm:mb-4"
                  style={{ color: '#F5F0E8' }}
                >
                  Resumo do Pedido
                </h3>

                {/* Items summary */}
                <div className="flex flex-col gap-2 mb-3 sm:mb-4 max-h-48 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                      <span style={{ color: '#8A7A5A' }} className="truncate">
                        {item.name} × {item.quantity}
                      </span>
                      <span style={{ color: '#F5F0E8' }} className="flex-shrink-0 ml-2">
                        {formatPrice(((item.price + (item.customizationPrice || 0)) * item.quantity))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(201,162,39,0.15)', marginBottom: '1rem' }} />

                {/* Customer info */}
                <div className="mb-3 sm:mb-4 space-y-2 sm:space-y-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: '#C9A227' }}>
                      Seu Nome
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Digite seu nome"
                      className="w-full px-3 py-2 rounded-sm text-xs sm:text-sm"
                      style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: '#C9A227' }}>
                      Seu Telefone
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(41) 98701-9702"
                      className="w-full px-3 py-2 rounded-sm text-xs sm:text-sm"
                      style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
                    />
                  </div>

                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(201,162,39,0.15)', marginBottom: '1rem' }} />

                {/* Coupon Section */}
                <div className="mb-3 sm:mb-4">
                  <CouponInput
                    orderTotal={total}
                    onCouponApplied={handleCouponApplied}
                    onCouponRemoved={handleCouponRemoved}
                    appliedCoupon={appliedCoupon}
                  />
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(201,162,39,0.15)', marginBottom: '1rem' }} />

                {/* Subtotal and Discount */}
                <div className="flex flex-col gap-2 mb-3 sm:mb-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span style={{ color: '#8A7A5A' }}>Subtotal</span>
                    <span style={{ color: '#F5F0E8' }}>{formatPrice(total)}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span style={{ color: '#C9A227' }}>Desconto</span>
                      <span style={{ color: '#C9A227' }}>-{formatPrice(appliedDiscount)}</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(201,162,39,0.15)', marginBottom: '1rem' }} />

                {/* Total */}
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <span
                    className="font-display font-bold text-sm sm:text-base"
                    style={{ color: '#F5F0E8' }}
                  >
                    Total
                  </span>
                  <span
                    className="font-bold text-lg sm:text-xl"
                    style={{ color: '#C9A227' }}
                  >
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                <button
                  onClick={handleOrder}
                  disabled={items.length === 0 || createOrder.isPending || !isStoreOpen}
                  className="w-full py-3 sm:py-3 rounded-sm font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-2 sm:mb-3 min-h-[44px]"
                  style={{
                    background: items.length > 0 && isStoreOpen ? '#C9A227' : 'rgba(201,162,39,0.3)',
                    color: items.length > 0 && isStoreOpen ? '#0A0A0A' : '#4A3A2A',
                  }}
                >
                  <MessageCircle size={18} />
                  {createOrder.isPending ? 'Processando...' : !isStoreOpen ? 'Loja Fechada' : 'Finalizar Pedido'}
                </button>

                {/* Clear cart button */}
                <button
                  onClick={clearCart}
                  className="w-full py-2 sm:py-2 rounded-sm font-semibold text-xs sm:text-sm transition-all duration-200 active:scale-95 min-h-[44px]"
                  style={{
                    background: 'rgba(201,162,39,0.1)',
                    color: '#C9A227',
                    border: '1px solid rgba(201,162,39,0.2)',
                  }}
                >
                  Limpar Carrinho
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* PIX Modal */}
      {showPix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div
            className="w-full max-w-sm rounded-2xl p-5 relative max-h-[95vh] overflow-y-auto scrollbar-hide"
            style={{ background: '#0A0A0A', border: '1px solid rgba(201,162,39,0.3)' }}
          >
            {/* Fechar */}
            <button
              onClick={() => { setShowPix(false); clearCart(); }}
              className="absolute top-3 right-3 p-1 rounded-full hover:opacity-70"
              style={{ color: '#8A7A5A' }}
            >
              <X size={20} />
            </button>

            <p className="text-center text-xs mb-1" style={{ color: '#8A7A5A' }}>
              Pedido #{orderNumber} registrado! ✅
            </p>
            <p className="text-center font-bold mb-4" style={{ color: '#F5F0E8' }}>
              Agora finalize o pagamento
            </p>

            <PixQRCode valor={pixFinalTotal} pedidoNumero={orderNumber} />

            {/* Botão WhatsApp */}
            <button
              onClick={handleSendWhatsApp}
              className="w-full mt-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
              style={{ background: '#25D366', color: '#fff' }}
            >
              <MessageCircle size={18} />
              Enviar Pedido pelo WhatsApp
            </button>

            <p className="text-center text-xs mt-3" style={{ color: '#8A7A5A' }}>
              Após pagar o PIX, clique acima para confirmar seu pedido via WhatsApp com o comprovante.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
