import { Link } from 'wouter';
import React from 'react';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart, CartItem } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/menuData';
import { toast } from 'sonner';
import { formatOrderForWhatsApp, openWhatsAppChat } from '@/lib/whatsappUtils';
import CouponInput from '@/components/CouponInput';
import { trpc } from '@/lib/trpc';

const LOGO_URL = '/logo.png';

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const itemTotal = (item.price + (item.customizationPrice || 0)) * item.quantity;

  return (
    <div
      className="flex flex-col gap-3 p-4 sm:p-5 rounded-lg animate-fade-in glass premium-card"
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
            className="w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 hover:bg-[#C9A227]/20 min-w-[32px] min-h-[32px]"
            style={{ background: 'rgba(201,162,39,0.1)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.3)' }}
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
            className="w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 hover:bg-[#C9A227]/20 min-w-[32px] min-h-[32px]"
            style={{ background: 'rgba(201,162,39,0.1)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.3)' }}
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
          className="p-2 rounded-full transition-all duration-150 active:scale-95 hover:bg-red-900/30 hover:text-red-400 min-w-[32px] min-h-[32px] flex items-center justify-center"
          style={{ color: '#8A7A5A' }}
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
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [appliedDiscount, setAppliedDiscount] = React.useState(0);
  const [appliedCoupon, setAppliedCoupon] = React.useState<string | undefined>();
  const { data: settings } = trpc.storeSettings.get.useQuery();
  const isStoreOpen = settings?.isOpen === 1;

  const finalTotal = Math.max(0, total - appliedDiscount);

  const handleCouponApplied = (discount: number, couponCode: string) => {
    setAppliedDiscount(discount);
    setAppliedCoupon(couponCode);
  };

  const handleCouponRemoved = () => {
    setAppliedDiscount(0);
    setAppliedCoupon(undefined);
  };

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: () => {
      const message = formatOrderForWhatsApp(items, finalTotal, customerName, customerPhone);
      openWhatsAppChat(message);
      clearCart();
    },
    onError: (err) => {
      toast.error('Erro ao registrar pedido no sistema: ' + err.message, {
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
      // Fallback para o WhatsApp mesmo se falhar
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
    <div className="min-h-screen selection:bg-[#C9A227] selection:text-black" style={{ background: '#080C09' }}>
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
                className="rounded-lg p-6 sm:p-8 sticky top-24 glass premium-card"
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
                <div className="gold-divider opacity-50 my-5"><div className="w-1 h-1 bg-[#C9A227] rotate-45 mx-2" /></div>

                {/* Customer info */}
                <div className="mb-3 sm:mb-4 space-y-2 sm:space-y-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: '#C9A227' }}>
                      Seu Nome
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Digite seu nome"
                      className="w-full px-4 py-3 rounded-md text-xs sm:text-sm focus:border-[#C9A227] transition-colors"
                      style={{ background: '#080C09', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: '#C9A227' }}>
                      Seu Telefone
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(41) 98701-9702"
                      className="w-full px-4 py-3 rounded-md text-xs sm:text-sm focus:border-[#C9A227] transition-colors"
                      style={{ background: '#080C09', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="gold-divider opacity-50 my-5"><div className="w-1 h-1 bg-[#C9A227] rotate-45 mx-2" /></div>

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
                <div className="gold-divider opacity-50 my-5"><div className="w-1 h-1 bg-[#C9A227] rotate-45 mx-2" /></div>

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
                <div className="gold-divider opacity-50 my-5"><div className="w-1 h-1 bg-[#C9A227] rotate-45 mx-2" /></div>

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
                  className="w-full py-3 rounded-md font-semibold text-xs sm:text-sm transition-all duration-200 active:scale-95 hover:bg-[#C9A227]/10"
                  style={{
                    background: 'transparent',
                    color: '#C9A227',
                    border: '1px solid rgba(201,162,39,0.3)',
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
    </div>
  );
}
