import { CartItem } from '@/contexts/CartContext';
import { formatPrice } from './menuData';

export const WHATSAPP_NUMBER = '5541987019702'; // New S'Burguer

export function formatOrderForWhatsApp(items: CartItem[], total: number, customerName?: string, customerPhone?: string, deliveryType?: 'delivery' | 'pickup', address?: string): string {
  const timestamp = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = `*Olá! Gostaria de fazer um pedido:*\n\n`;
  
  if (customerName) {
    message += `👤 *Cliente:* ${customerName}\n`;
  }
  if (customerPhone) {
    message += `📱 *Telefone:* ${customerPhone}\n`;
  }
  if (customerName || customerPhone) {
    message += `\n`;
  }
  
  if (deliveryType === 'delivery' && address) {
    message += `🛵 *Tipo:* Entrega\n`;
    message += `📍 *Endereço:* ${address}\n\n`;
  } else if (deliveryType === 'pickup') {
    message += `🛍️ *Tipo:* Retirar no Local\n\n`;
  }

  items.forEach((item, index) => {
    message += `${item.emoji} *${item.name}* (${item.quantity}x)\n`;

    // Preço unitário
    const unitPrice = item.price + (item.customizationPrice || 0);
    message += `   R$ ${unitPrice.toFixed(2)}\n`;

    // Customizações
    if (item.customization) {
      const { removedIngredients, addedExtras, notes } = item.customization;

      if (removedIngredients.length > 0) {
        message += `   🚫 SEM: ${removedIngredients.join(', ')}\n`;
      }

      if (addedExtras.length > 0) {
        const extrasText = addedExtras
          .map(e => `${e.name} (+R$ ${e.price.toFixed(2)})`)
          .join(', ');
        message += `   ➕ EXTRAS: ${extrasText}\n`;
      }

      if (notes) {
        message += `   📝 OBS: ${notes}\n`;
      }
    }

    message += '\n';
  });

  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *TOTAL: ${formatPrice(total)}*\n`;
  message += `🕐 Horário: ${timestamp}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `Obrigado! 🙏`;

  return message;
}

export function getWhatsAppLink(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

export function openWhatsAppChat(message: string): void {
  const link = getWhatsAppLink(message);
  window.open(link, '_blank', 'noopener,noreferrer');
}
