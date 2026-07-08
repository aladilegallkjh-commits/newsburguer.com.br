import { eq } from 'drizzle-orm';
import { coupons } from '../drizzle/schema';
import { getDb } from './db';

export async function validateCoupon(code: string) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const coupon = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.toUpperCase()))
    .limit(1);

  if (coupon.length === 0) {
    return { valid: false, error: 'Cupom não encontrado' };
  }

  const couponData = coupon[0];

  // Check if coupon is active
  if (!couponData.isActive) {
    return { valid: false, error: 'Cupom inativo' };
  }

  // Check expiration
  if (couponData.expiresAt && new Date() > couponData.expiresAt) {
    return { valid: false, error: 'Cupom expirado' };
  }

  // Check usage limit
  if (couponData.maxUses && couponData.currentUses && couponData.currentUses >= couponData.maxUses) {
    return { valid: false, error: 'Cupom já foi usado o máximo de vezes' };
  }

  return {
    valid: true,
    coupon: {
      code: couponData.code,
      discountType: couponData.discountType,
      discountValue: parseFloat(couponData.discountValue.toString()),
      minOrderAmount: couponData.minOrderAmount ? parseFloat(couponData.minOrderAmount.toString()) : null,
      description: `${couponData.discountType === 'percentage' ? couponData.discountValue + '%' : 'R$ ' + couponData.discountValue} de desconto`,
    },
  };
}

export async function calculateDiscount(
  code: string,
  orderTotal: number
): Promise<{ discountAmount: number; finalTotal: number; couponCode: string }> {
  const validation = await validateCoupon(code);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const couponData = validation.coupon!;

  // Check minimum order value
  if (couponData.minOrderAmount && orderTotal < couponData.minOrderAmount) {
    throw new Error(
      `Valor mínimo do pedido é R$ ${couponData.minOrderAmount.toFixed(2)}`
    );
  }

  let discountAmount = 0;

  if (couponData.discountType === 'percentage') {
    discountAmount = (orderTotal * couponData.discountValue) / 100;
  } else if (couponData.discountType === 'fixed') {
    discountAmount = couponData.discountValue;
  }

  const finalTotal = Math.max(0, orderTotal - discountAmount);

  return {
    discountAmount,
    finalTotal,
    couponCode: code.toUpperCase(),
  };
}

export async function incrementCouponUsage(code: string) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const coupon = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.toUpperCase()))
    .limit(1);

  if (coupon.length > 0) {
    const currentUses = coupon[0].currentUses || 0;
    await db
      .update(coupons)
      .set({ currentUses: currentUses + 1 })
      .where(eq(coupons.code, code.toUpperCase()));
  }
}
