import { InlineKeyboard } from 'grammy';
import type { Bot } from 'grammy';
import type { BotContext } from '../index';
import { OrderModel } from '../../models/order';

export function setupOrderHandlers(bot: Bot<BotContext>) {
  // /orders
  bot.command('orders', async (ctx) => {
    const orders = await OrderModel.findRecent(10);
    if (orders.length === 0) {
      await ctx.reply('Nuk ka porosi akoma.');
      return;
    }

    for (const order of orders) {
      const full = await OrderModel.findById(order.id);
      if (!full) continue;

      const statusEmoji: Record<string, string> = {
        pending: '🟡', confirmed: '🟢', shipped: '📦', delivered: '✅', cancelled: '❌',
      };
      const statusNames: Record<string, string> = {
        pending: 'Ne pritje', confirmed: 'Konfirmuar', shipped: 'Derguar', delivered: 'Dorezuar', cancelled: 'Anuluar',
      };

      let msg = `${statusEmoji[order.status] || '⚪'} <b>#${order.order_number}</b>\n`;
      msg += `👤 ${order.customer_name}\n`;
      msg += `📧 ${order.customer_email}\n`;
      if (order.customer_phone) msg += `📱 ${order.customer_phone}\n`;
      msg += `\n`;

      for (const item of full.items || []) {
        msg += `• ${item.product_name} × ${item.quantity} — €${item.unit_price}\n`;
      }
      msg += `\n💰 Totali: €${order.total}\n`;
      msg += `📍 ${order.shipping_address}\n`;
      msg += `Statusi: ${statusNames[order.status] || order.status}`;

      const keyboard = new InlineKeyboard();
      if (order.status === 'pending') {
        keyboard.text('✅ Konfirmo', `order_confirm:${order.id}`)
          .text('❌ Anulo', `order_cancel:${order.id}`);
      } else if (order.status === 'confirmed') {
        keyboard.text('📦 Sheno si Derguar', `order_ship:${order.id}`);
      } else if (order.status === 'shipped') {
        keyboard.text('✅ Sheno si Dorezuar', `order_deliver:${order.id}`);
      }

      await ctx.reply(msg, { parse_mode: 'HTML', reply_markup: keyboard });
    }
  });

  bot.callbackQuery(/^order_confirm:(.+)$/, async (ctx) => {
    const orderId = ctx.match![1];
    await OrderModel.updateStatus(orderId, 'confirmed');
    await ctx.answerCallbackQuery('Porosia u konfirmua');
    await ctx.editMessageText(ctx.msg?.text + '\n\n✅ KONFIRMUAR', { parse_mode: 'HTML' });
  });

  bot.callbackQuery(/^order_cancel:(.+)$/, async (ctx) => {
    const orderId = ctx.match![1];
    await OrderModel.updateStatus(orderId, 'cancelled');
    await ctx.answerCallbackQuery('Porosia u anulua');
    await ctx.editMessageText(ctx.msg?.text + '\n\n❌ ANULUAR', { parse_mode: 'HTML' });
  });

  bot.callbackQuery(/^order_ship:(.+)$/, async (ctx) => {
    const orderId = ctx.match![1];
    ctx.session.editProductId = orderId;
    ctx.session.step = 'order_tracking';
    await ctx.answerCallbackQuery();
    const keyboard = new InlineKeyboard().text('Kalo kodin e gjurmimit', `order_ship_notrack:${orderId}`);
    await ctx.reply('Shkruaj kodin e gjurmimit (ose kalo):', { reply_markup: keyboard });
  });

  bot.callbackQuery(/^order_ship_notrack:(.+)$/, async (ctx) => {
    const orderId = ctx.match![1];
    await OrderModel.updateStatus(orderId, 'shipped');
    ctx.session.step = null;
    await ctx.answerCallbackQuery('U shenua si e derguar');
    await ctx.reply('📦 Porosia u shenua si e derguar.');
  });

  bot.callbackQuery(/^order_deliver:(.+)$/, async (ctx) => {
    const orderId = ctx.match![1];
    await OrderModel.updateStatus(orderId, 'delivered');
    await ctx.answerCallbackQuery('U shenua si e dorezuar');
    await ctx.editMessageText(ctx.msg?.text + '\n\n✅ DOREZUAR', { parse_mode: 'HTML' });
  });

  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.step === 'order_tracking') {
      const trackingNumber = ctx.message.text.trim();
      await OrderModel.setTracking(ctx.session.editProductId!, trackingNumber);
      ctx.session.step = null;
      ctx.session.editProductId = null;
      await ctx.reply(`📦 Derguar me kodin e gjurmimit: ${trackingNumber}`);
      return;
    }
    await next();
  });
}

// Called when a new order comes in
export async function sendOrderNotification(bot: any, order: any) {
  let msg = `🔔 <b>Porosi e Re! #${order.order_number}</b>\n\n`;
  msg += `👤 ${order.customer_name}\n`;
  msg += `📧 ${order.customer_email}\n`;
  if (order.customer_phone) msg += `📱 ${order.customer_phone}\n`;
  msg += `\n`;

  for (const item of order.items || []) {
    msg += `• ${item.product_name} × ${item.quantity} — €${item.unit_price}\n`;
  }
  msg += `\n💰 <b>Totali: €${order.total}</b>\n`;
  msg += `📍 ${order.shipping_address}`;

  const keyboard = new InlineKeyboard()
    .text('✅ Konfirmo', `order_confirm:${order.id}`)
    .text('❌ Refuzo', `order_cancel:${order.id}`);

  const { telegramOwnerChatId } = await import('../../config/env').then(m => m.env);
  await bot.api.sendMessage(telegramOwnerChatId, msg, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}
