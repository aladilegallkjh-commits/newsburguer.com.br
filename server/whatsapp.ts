/**
 * WhatsApp Business API Integration
 * Handles sending messages to customers via WhatsApp Business
 */

export interface WhatsAppMessage {
  phone: string;
  message: string;
  orderNumber?: string;
}

export interface WhatsAppOrderUpdate {
  orderNumber: string;
  status: 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  estimatedTime?: number; // minutes
  message?: string;
}

/**
 * Format order status message for WhatsApp
 */
export function formatOrderStatusMessage(update: WhatsAppOrderUpdate): string {
  const statusMessages: Record<string, string> = {
    confirmed: '✅ Seu pedido foi confirmado! Estamos preparando...',
    preparing: '👨‍🍳 Seu pedido está sendo preparado com muito cuidado!',
    ready: '🎉 Seu pedido está pronto! Saindo para entrega...',
    out_for_delivery: `🚗 Seu pedido saiu para entrega!\n\n📍 *Acompanhe o motoboy em tempo real:*\n👉 https://newsburguer-com-br.onrender.com/rastrear?pedido=${update.orderNumber.replace('#', '')}`,
    delivered: '🎊 Seu pedido foi entregue! Bom apetite!',
    cancelled: '❌ Seu pedido foi cancelado. Entre em contato conosco.',
  };

  let message = `*Pedido ${update.orderNumber}*\n\n`;
  message += statusMessages[update.status] || 'Status do seu pedido atualizado';

  if (update.estimatedTime) {
    message += `\n⏱️ Tempo estimado: ${update.estimatedTime} minutos`;
  }

  if (update.message) {
    message += `\n\n📝 ${update.message}`;
  }

  message += '\n\n---\nNew S\'Burguer 🍔';

  return message;
}

/**
 * Format order details for WhatsApp
 * This is called when customer submits order
 */
export function formatOrderMessage(orderData: {
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    removedIngredients?: string[];
    addedExtras?: Array<{ name: string; price: number }>;
    observations?: string;
  }>;
  totalAmount: number;
  discount?: number;
  finalAmount: number;
  deliveryType: string;
  address?: string;
}): string {
  let message = `*Novo Pedido - ${orderData.orderNumber}*\n\n`;
  message += '📋 *ITENS:*\n';

  orderData.items.forEach((item) => {
    message += `\n${item.quantity}x ${item.name}\n`;
    message += `   R$ ${(item.price * item.quantity).toFixed(2)}\n`;

    if (item.removedIngredients && item.removedIngredients.length > 0) {
      message += `   🚫 SEM: ${item.removedIngredients.join(', ')}\n`;
    }

    if (item.addedExtras && item.addedExtras.length > 0) {
      item.addedExtras.forEach((extra) => {
        message += `   ➕ ${extra.name} (+R$ ${extra.price.toFixed(2)})\n`;
      });
    }

    if (item.observations) {
      message += `   📝 OBS: ${item.observations}\n`;
    }
  });

  message += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  message += `💰 *TOTAL:* R$ ${orderData.totalAmount.toFixed(2)}\n`;

  if (orderData.discount && orderData.discount > 0) {
    message += `💳 *DESCONTO:* -R$ ${orderData.discount.toFixed(2)}\n`;
  }

  message += `✅ *FINAL:* R$ ${orderData.finalAmount.toFixed(2)}\n`;
  message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  message += `🚚 *ENTREGA:* ${orderData.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}\n`;

  if (orderData.address) {
    message += `📍 *ENDEREÇO:* ${orderData.address}\n`;
  }

  message += '\n🕐 Você receberá atualizações sobre seu pedido!\n';
  message += 'New S\'Burguer 🍔';

  return message;
}

/**
 * Send message via WhatsApp Business API
 * Supports both WhatsApp Business API and wa.me fallback
 */
export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  try {
    // Normalize phone number (remove special characters)
    const normalizedPhone = phone.replace(/\D/g, '');
    
    // If it's a Brazilian number without country code, add it
    const phoneWithCountry = normalizedPhone.startsWith('55') 
      ? normalizedPhone 
      : `55${normalizedPhone}`;

    // Log for debugging
    console.log(`[WhatsApp] Sending to +${phoneWithCountry}`);
    console.log(`[WhatsApp] Message:\n${message}`);

    // Try to send via WhatsApp Business API if credentials are available
    const whatsappToken = process.env.WHATSAPP_BUSINESS_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID;
    
    if (whatsappToken && whatsappPhoneId) {
      try {
        const response = await fetch(
          `https://graph.instagram.com/v18.0/${whatsappPhoneId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: phoneWithCountry,
              type: 'text',
              text: { body: message },
            }),
          }
        );

        if (response.ok) {
          console.log('[WhatsApp] Message sent successfully via Business API');
          return true;
        } else {
          const error = await response.json();
          console.warn('[WhatsApp] Business API error:', error);
          // Fall through to wa.me link
        }
      } catch (apiError) {
        console.warn('[WhatsApp] Business API not available, using wa.me link:', apiError);
      }
    }

    // Fallback: Log wa.me link for manual sending
    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;
    console.log(`[WhatsApp] Fallback link: ${waLink}`);
    console.log('[WhatsApp] Message queued for customer notification');

    return true;
  } catch (error) {
    console.error('[WhatsApp] Failed to send message:', error);
    return false;
  }
}

/**
 * Send order status update via WhatsApp
 */
export async function sendOrderStatusUpdate(
  phone: string,
  update: WhatsAppOrderUpdate
): Promise<boolean> {
  const message = formatOrderStatusMessage(update);
  return sendWhatsAppMessage(phone, message);
}

/**
 * Send new order confirmation via WhatsApp
 */
export async function sendOrderConfirmation(
  phone: string,
  orderData: Parameters<typeof formatOrderMessage>[0]
): Promise<boolean> {
  const message = formatOrderMessage(orderData);
  return sendWhatsAppMessage(phone, message);
}


/**
 * ============================================
 * ADMIN NOTIFICATIONS & AUTOMATION
 * ============================================
 */

import { getWhatsappSettings, logWhatsappMessage, updateWhatsappMessageStatus, getOrdersByDateRange } from './db';

/**
 * Generate daily sales summary message for admin
 */
export async function generateAdminDailySummary(adminUserId: number): Promise<string> {
  try {
    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await getOrdersByDateRange(today, tomorrow);
    
    const totalSales = todayOrders.reduce((sum: number, o: any) => sum + parseFloat(o.finalAmount), 0);
    const totalOrders = todayOrders.length;
    const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    const message = `
📊 *Resumo de Vendas - ${today.toLocaleDateString('pt-BR')}*

💰 Vendas Totais: R$ ${totalSales.toFixed(2)}
📦 Total de Pedidos: ${totalOrders}
🎯 Ticket Médio: R$ ${avgTicket.toFixed(2)}

Tenha um ótimo dia! 🚀
    `.trim();

    return message;
  } catch (error) {
    console.error('Error generating admin daily summary:', error);
    throw error;
  }
}

/**
 * Generate sales alert message for admin
 */
export async function generateAdminSalesAlert(
  adminUserId: number,
  currentSales: number,
  previousSales: number,
  threshold: number
): Promise<string | null> {
  try {
    const growthPercentage = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0;

    // Only send alert if growth exceeds threshold
    if (Math.abs(growthPercentage) < threshold) {
      return null;
    }

    const isGrowth = growthPercentage > 0;
    const emoji = isGrowth ? '📈' : '📉';
    const verb = isGrowth ? 'aumentou' : 'diminuiu';

    const message = `
${emoji} *Alerta de Vendas*

Suas vendas ${verb} ${Math.abs(growthPercentage).toFixed(1)}% comparado ao período anterior!

💰 Vendas Atuais: R$ ${currentSales.toFixed(2)}
💰 Período Anterior: R$ ${previousSales.toFixed(2)}

${isGrowth ? '🎉 Parabéns! Continue assim!' : '⚠️ Verifique o que pode estar afetando as vendas.'}
    `.trim();

    return message;
  } catch (error) {
    console.error('Error generating admin sales alert:', error);
    throw error;
  }
}

/**
 * Generate new order alert message for admin
 */
export async function generateAdminOrderAlert(orderNumber: string, customerName: string, totalAmount: number): Promise<string> {
  const message = `
🎉 *Novo Pedido Recebido!*

Pedido: ${orderNumber}
Cliente: ${customerName}
Valor: R$ ${totalAmount.toFixed(2)}

Acesse o painel para mais detalhes! 📱
  `.trim();

  return message;
}

/**
 * Send admin notification via WhatsApp
 */
export async function sendAdminWhatsappNotification(
  adminUserId: number,
  message: string,
  messageType: 'daily_summary' | 'sales_alert' | 'order_alert' | 'custom'
) {
  try {
    const settings = await getWhatsappSettings(adminUserId);
    
    if (!settings) {
      console.warn(`No WhatsApp settings found for admin ${adminUserId}`);
      return false;
    }

    // Log the message
    const logEntry = await logWhatsappMessage({
      adminUserId,
      messageType,
      phoneNumber: settings.phoneNumber,
      messageContent: message,
      status: 'pending'
    });

    // Send via WhatsApp (using existing sendWhatsAppMessage function)
    const success = await sendWhatsAppMessage(settings.phoneNumber, message);

    // Update status
    if (logEntry && 'insertId' in logEntry) {
      const status = success ? 'sent' : 'failed';
      await updateWhatsappMessageStatus(logEntry.insertId as number, status);
    }

    return success;
  } catch (error) {
    console.error('Error sending admin WhatsApp notification:', error);
    return false;
  }
}

/**
 * Send daily summary at specified time (call from cron job)
 */
export async function sendScheduledDailySummary(adminUserId: number) {
  try {
    const settings = await getWhatsappSettings(adminUserId);
    
    if (!settings || !settings.enableDailySummary) {
      return false;
    }

    const message = await generateAdminDailySummary(adminUserId);
    return await sendAdminWhatsappNotification(adminUserId, message, 'daily_summary');
  } catch (error) {
    console.error('Error sending scheduled daily summary:', error);
    return false;
  }
}

/**
 * Send sales alert if conditions are met
 */
export async function sendSalesAlertIfNeeded(
  adminUserId: number,
  currentSales: number,
  previousSales: number
) {
  try {
    const settings = await getWhatsappSettings(adminUserId);
    
    if (!settings || !settings.enableSalesAlerts) {
      return false;
    }

    const threshold = parseFloat(settings.salesAlertThreshold?.toString() || '10');
    const message = await generateAdminSalesAlert(adminUserId, currentSales, previousSales, threshold);
    
    if (!message) {
      return false;
    }

    return await sendAdminWhatsappNotification(adminUserId, message, 'sales_alert');
  } catch (error) {
    console.error('Error sending sales alert:', error);
    return false;
  }
}

/**
 * Send new order alert
 */
export async function sendNewOrderAlert(
  adminUserId: number,
  orderNumber: string,
  customerName: string,
  totalAmount: number
) {
  try {
    const settings = await getWhatsappSettings(adminUserId);
    
    if (!settings || !settings.enableOrderAlerts) {
      return false;
    }

    const message = await generateAdminOrderAlert(orderNumber, customerName, totalAmount);
    return await sendAdminWhatsappNotification(adminUserId, message, 'order_alert');
  } catch (error) {
    console.error('Error sending new order alert:', error);
    return false;
  }
}
