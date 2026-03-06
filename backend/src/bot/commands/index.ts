import { InlineKeyboard } from 'grammy';
import type { Bot } from 'grammy';
import type { BotContext } from '../index';
import { ProductModel } from '../../models/product';
import { CategoryModel } from '../../models/category';
import { OrderModel } from '../../models/order';
import { env } from '../../config/env';

export function setupCommands(bot: Bot<BotContext>) {
  // /start
  bot.command('start', async (ctx) => {
    await ctx.reply(
      `💎 <b>Jewelry Shop Manager</b>\n\n` +
      `Commands:\n` +
      `/add — Add new product\n` +
      `/edit — Edit a product\n` +
      `/delete — Delete a product\n` +
      `/stock — Toggle in/out of stock\n` +
      `/featured — Toggle featured\n` +
      `/discount — Set sale price\n` +
      `/orders — View recent orders\n` +
      `/stats — Sales statistics\n` +
      `/categories — Manage categories\n` +
      `/products — List all products`,
      { parse_mode: 'HTML' }
    );
  });

  // /products — list all products
  bot.command('products', async (ctx) => {
    const { products } = await ProductModel.findAll({ limit: 50 });
    if (products.length === 0) {
      await ctx.reply('No products yet. Use /add to create one.');
      return;
    }

    let msg = '📦 <b>Products</b>\n\n';
    for (const p of products) {
      const stock = p.in_stock ? '✅' : '❌';
      const feat = p.featured ? '⭐' : '';
      const price = p.sale_price
        ? `<s>$${p.price}</s> $${p.sale_price}`
        : `$${p.price}`;
      msg += `${stock} ${feat} <b>${p.name}</b> — ${price}\n`;
    }
    await ctx.reply(msg, { parse_mode: 'HTML' });
  });

  // /stock — toggle stock status
  bot.command('stock', async (ctx) => {
    const { products } = await ProductModel.findAll({ limit: 50 });
    if (products.length === 0) {
      await ctx.reply('No products yet.');
      return;
    }

    const keyboard = new InlineKeyboard();
    for (const p of products) {
      const status = p.in_stock ? '✅' : '❌';
      keyboard.text(`${status} ${p.name}`, `stock:${p.id}`).row();
    }
    await ctx.reply('Tap to toggle stock status:', { reply_markup: keyboard });
  });

  bot.callbackQuery(/^stock:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    if (!product) {
      await ctx.answerCallbackQuery('Product not found');
      return;
    }
    await ProductModel.update(productId, { in_stock: !product.in_stock });
    const newStatus = !product.in_stock ? '✅ In Stock' : '❌ Out of Stock';
    await ctx.answerCallbackQuery(`${product.name}: ${newStatus}`);
    await ctx.editMessageText(`${product.name} is now ${newStatus}`);
  });

  // /featured — toggle featured
  bot.command('featured', async (ctx) => {
    const { products } = await ProductModel.findAll({ limit: 50 });
    const keyboard = new InlineKeyboard();
    for (const p of products) {
      const star = p.featured ? '⭐' : '☆';
      keyboard.text(`${star} ${p.name}`, `feat:${p.id}`).row();
    }
    await ctx.reply('Tap to toggle featured:', { reply_markup: keyboard });
  });

  bot.callbackQuery(/^feat:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    if (!product) {
      await ctx.answerCallbackQuery('Product not found');
      return;
    }
    await ProductModel.update(productId, { featured: !product.featured });
    const status = !product.featured ? '⭐ Featured' : '☆ Not featured';
    await ctx.answerCallbackQuery(`${product.name}: ${status}`);
    await ctx.editMessageText(`${product.name} is now ${status}`);
  });

  // /discount — set sale price
  bot.command('discount', async (ctx) => {
    const { products } = await ProductModel.findAll({ limit: 50 });
    const keyboard = new InlineKeyboard();
    for (const p of products) {
      const label = p.sale_price ? `${p.name} ($${p.sale_price})` : p.name;
      keyboard.text(label, `disc:${p.id}`).row();
    }
    await ctx.reply('Select product to set discount:', { reply_markup: keyboard });
  });

  bot.callbackQuery(/^disc:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    if (!product) {
      await ctx.answerCallbackQuery('Product not found');
      return;
    }
    ctx.session.editProductId = productId;
    ctx.session.step = 'discount_price';
    await ctx.answerCallbackQuery();
    const keyboard = new InlineKeyboard().text('Remove discount', `disc_remove:${productId}`);
    await ctx.reply(
      `Current price: $${product.price}${product.sale_price ? ` (sale: $${product.sale_price})` : ''}\n\nType the new sale price:`,
      { reply_markup: keyboard }
    );
  });

  bot.callbackQuery(/^disc_remove:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    await ProductModel.update(productId, { sale_price: null });
    await ctx.answerCallbackQuery('Discount removed');
    await ctx.editMessageText('Discount removed.');
    ctx.session.step = null;
  });

  // /delete — delete a product
  bot.command('delete', async (ctx) => {
    const { products } = await ProductModel.findAll({ limit: 50 });
    const keyboard = new InlineKeyboard();
    for (const p of products) {
      keyboard.text(p.name, `del:${p.id}`).row();
    }
    await ctx.reply('Select product to delete:', { reply_markup: keyboard });
  });

  bot.callbackQuery(/^del:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    if (!product) {
      await ctx.answerCallbackQuery('Product not found');
      return;
    }
    const keyboard = new InlineKeyboard()
      .text('Yes, delete', `del_confirm:${productId}`)
      .text('Cancel', 'del_cancel');
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(`Delete <b>${product.name}</b>? This cannot be undone.`, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  });

  bot.callbackQuery(/^del_confirm:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    await ProductModel.delete(productId);
    await ctx.answerCallbackQuery('Deleted');
    await ctx.editMessageText('Product deleted.');
  });

  bot.callbackQuery('del_cancel', async (ctx) => {
    await ctx.answerCallbackQuery('Cancelled');
    await ctx.editMessageText('Deletion cancelled.');
  });

  // /stats
  bot.command('stats', async (ctx) => {
    const stats = await OrderModel.getStats();
    const { products } = await ProductModel.findAll({ limit: 1000 });
    const outOfStock = products.filter(p => !p.in_stock).length;

    await ctx.reply(
      `📊 <b>Sales Summary</b>\n\n` +
      `Today: $${stats.today.toFixed(2)}\n` +
      `This week: $${stats.week.toFixed(2)}\n` +
      `This month: $${stats.month.toFixed(2)}\n` +
      `All time: $${stats.total.toFixed(2)}\n\n` +
      `Orders: ${stats.orderCount}\n` +
      `Products: ${products.length}\n` +
      `Out of stock: ${outOfStock}`,
      { parse_mode: 'HTML' }
    );
  });

  // /categories
  bot.command('categories', async (ctx) => {
    const categories = await CategoryModel.findAll();
    let msg = '📂 <b>Categories</b>\n\n';
    for (const c of categories) {
      msg += `• ${c.name} (${c.product_count} products)\n`;
    }
    const keyboard = new InlineKeyboard().text('+ Add Category', 'cat_add');
    await ctx.reply(msg, { parse_mode: 'HTML', reply_markup: keyboard });
  });

  bot.callbackQuery('cat_add', async (ctx) => {
    ctx.session.step = 'add_category';
    await ctx.answerCallbackQuery();
    await ctx.reply('Type the new category name:');
  });

  // Handle text input for discount and category
  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.step === 'discount_price') {
      const price = parseFloat(ctx.message.text);
      if (isNaN(price) || price <= 0) {
        await ctx.reply('Please enter a valid price.');
        return;
      }
      await ProductModel.update(ctx.session.editProductId!, { sale_price: price });
      await ctx.reply(`Sale price set to $${price}`);
      ctx.session.step = null;
      ctx.session.editProductId = null;
      return;
    }

    if (ctx.session.step === 'add_category') {
      const name = ctx.message.text.trim();
      await CategoryModel.create(name);
      await ctx.reply(`Category "${name}" created.`);
      ctx.session.step = null;
      return;
    }

    await next();
  });
}
