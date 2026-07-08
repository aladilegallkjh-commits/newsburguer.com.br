import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface CouponInputProps {
  orderTotal: number;
  onCouponApplied: (discount: number, couponCode: string) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: string;
}

export default function CouponInput({
  orderTotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const calculateDiscount = trpc.coupons.calculateDiscount.useMutation();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Digite o código do cupom', {
        duration: 2000,
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await calculateDiscount.mutateAsync({
        code: couponCode,
        orderTotal,
      });

      onCouponApplied(result.discountAmount, result.couponCode);
      toast.success(`Cupom aplicado! Desconto de R$ ${result.discountAmount.toFixed(2)}`, {
        duration: 2000,
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
      setCouponCode('');
    } catch (error: any) {
      toast.error(error.message || 'Cupom inválido', {
        duration: 2000,
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setCouponCode('');
    toast.success('Cupom removido', {
      duration: 2000,
      style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
    });
  };

  return (
    <div className="menu-card rounded-sm p-6 mb-6">
      <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#C9A227' }}>
        Código de Cupom
      </p>

      {appliedCoupon ? (
        <div className="flex items-center justify-between p-4 rounded-sm" style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)' }}>
          <div>
            <p className="font-semibold" style={{ color: '#F5F0E8' }}>
              ✓ Cupom aplicado: {appliedCoupon}
            </p>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-sm px-4 py-2 rounded-sm"
            style={{
              background: 'rgba(201,162,39,0.2)',
              color: '#C9A227',
              border: '1px solid rgba(201,162,39,0.3)',
            }}
          >
            Remover
          </button>
        </div>
      ) : (
        <form onSubmit={handleApplyCoupon} className="flex gap-3">
          <input
            type="text"
            placeholder="Ex: DESCONTO10"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 rounded-sm text-sm"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(201,162,39,0.3)',
              color: '#F5F0E8',
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold px-6 py-3 rounded-sm font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Validando...' : 'Aplicar'}
          </button>
        </form>
      )}
    </div>
  );
}
