import { InlineKeyboard } from 'grammy';
import type { Bot } from 'grammy';
import type { BotContext } from '../index';
import { OrderModel } from '../../models/order';

export function setupOrderHandlers(bot: Bot<BotContext>) {
  // /orders — show recent orders
  bot.command('orders', async (ctx) => {
    const orders = await OrderModel.findRecent(10);
    if (orders.length === 0) {
      await ctx.reply('No orders yet.');
      return;
    }

    for (const order of orders) {
      const full = await OrderModel.findById(order.id);
      if (!full) continue;

      const statusEmoji: Record<string, string> = {
        pending: '🟡',
        confirmed: '🟢',
        shipped: '📦',
        delivered: '✅',
        cancelled: '❌',
      };

      let msg = `${statusEmoji[order.status] || '⚪'} <b>#${order.order_number}</b>\n`;
      msg += `👤 ${order.customer_name}\n`;
      msg += `📧 ${order.customer_email}\n`;
      if (order.customer_phone) msg += `📱 ${order.customer_phone}\n`;
      msg += `\n`;

      for (const item of full.items || []) {
        msg += `• ${item.product_name} × ${item.quantity} — $${item.unit_price}\n`;
      }
      msg += `\n💰 Total: $${order.total}\n`;
      msg += `📍 ${order.shipping_address}\n`;
      msg += `Status: ${order.status}`;

      const keyboard = new InlineKeyboard();
      if (order.status === 'pending') {
        keyboard.text('✅ Confirm', `order_confirm:${order.id}`)
          .text('❌ Cancel', `order_cancel:${order.id}`);
      } else if (order.status === 'confirmed') {
        keyboard.text('📦 Mark Shipped', `order_ship:${order.id}`);
      } else if (order.status === 'shipped') {
        keyboard.text('✅ Mark Delivered', `order_deliver:${order.id}`);
      }

      await ctx.reply(msg, { parse_mode: 'HTML', reply_markup: keyboard });
    }
  });

  // Order actions
  bot.callbackQuery(/^order_confirm:(.+)$/, async (ctx) => {
    const orderId = ctx.match![1];
    await OrderModel.updateStatus(orderId, 'confirmed');
    await ctx.answerCallbackQuery('Order confirmed');
    await ctx.editMessageText(ctx.msg?.text + '\n\n✅ CONFIRMED', { parse_mode: 'HTML' });
  });

  bot.callbackQuery(/^order_cancel:(.+)$/, async (ctx) => {
    const orderId = ctx.match![1];
    await OrderModel.updateStatus(orderId, 'cancelled');
    await ctx.answerCallbackQuery('Order cancelled');
    await ctx.editMessageText(ctx.msg?.text + '\n\n❌ CANCELLED', { parse_mode: 'HTML' });
  });

  bot.callbackQuery(/^order_ship:(.+)$/, async (ctx) => {
    const orderId = ctx.match![1];
    ctx.session.editProductId = orderId;
    ctx.session.step = 'order_tracking';
    await ctx.answerCallbackQuery();
    const keyboard = new InlineKeyboard().text('Skip tracking', `order_ship_notrack:${orderId}`);
    await ctx.reply('Enter tracking number (or skip):', { reply_markup: keyboard });
  });

  bot.callbackQuery(/^order_ship_notrack:(.+)$/, async (ctx) => {
    const orderId = ctx.match![1];
    await OrderModel.updateStatus(orderId, 'shipped');
    ctx.session.step = null;
    await ctx.answerCallbackQuery('Marked as shipped');
    await ctx.reply('📦 Order marked as shipped.');
  });

  bot.callbackQuery(/^order_deliver:(.+)$/, async (ctx) => {
    const orderId = ctx.match![1];
    await OrderModel.updateStatus(orderId, 'delivered');
    await ctx.answerCallbackQuery('Marked as delivered');
    await ctx.editMessageText(ctx.msg?.text + '\n\n✅ DELIVERED', { parse_mode: 'HTML' });
  });

  // Tracking number input
  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.step === 'order_tracking') {
      const trackingNumber = ctx.message.text.trim();
      await OrderModel.setTracking(ctx.session.editProductId!, trackingNumber);
      ctx.session.step = null;
      ctx.session.editProductId = null;
      await ctx.reply(`📦 Shipped with tracking: ${trackingNumber}`);
      return;
    }
    await next();
  });
}

// Called when a new order comes in — sends notification to owner
export async function sendOrderNotification(bot: any, order: any) {
  const statusEmoji = '🔔';
  let msg = `${statusEmoji} <b>New Order! #${order.order_number}</b>\n\n`;
  msg += `👤 ${order.customer_name}\n`;
  msg += `📧 ${order.customer_email}\n`;
  if (order.customer_phone) msg += `📱 ${order.customer_phone}\n`;
  msg += `\n`;

  for (const item of order.items || []) {
    msg += `• ${item.product_name} × ${item.quantity} — $${item.unit_price}\n`;
  }
  msg += `\n💰 <b>Total: $${order.total}</b>\n`;
  msg += `📍 ${order.shipping_address}`;

  const keyboard = new InlineKeyboard()
    .text('✅ Confirm', `order_confirm:${order.id}`)
    .text('❌ Reject', `order_cancel:${order.id}`);

  const { telegramOwnerChatId } = await import('../../config/env').then(m => m.env);
  await bot.api.sendMessage(telegramOwnerChatId, msg, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}
