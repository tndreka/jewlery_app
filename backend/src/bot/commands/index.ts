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
      `💎 <b>Menaxhimi i Dyqanit</b>\n\n` +
      `Komandat:\n` +
      `/add — Shto produkt te ri\n` +
      `/edit — Ndrysho nje produkt\n` +
      `/delete — Fshi nje produkt\n` +
      `/stock — Ndrysho gjendjen e stokut\n` +
      `/featured — Vendos ne faqen kryesore\n` +
      `/discount — Vendos zbritje\n` +
      `/orders — Shiko porositë\n` +
      `/stats — Statistikat e shitjeve\n` +
      `/categories — Menaxho kategorite\n` +
      `/products — Lista e produkteve`,
      { parse_mode: 'HTML' }
    );
  });

  // /products — list all products
  bot.command('products', async (ctx) => {
    const { products } = await ProductModel.findAll({ limit: 50 });
    if (products.length === 0) {
      await ctx.reply('Nuk ka produkte akoma. Perdor /add per te shtuar nje te ri.');
      return;
    }

    let msg = '📦 <b>Produktet</b>\n\n';
    for (const p of products) {
      const stock = p.in_stock ? '✅' : '❌';
      const feat = p.featured ? '⭐' : '';
      const price = p.sale_price
        ? `<s>€${p.price}</s> €${p.sale_price}`
        : `€${p.price}`;
      msg += `${stock} ${feat} <b>${p.name}</b> — ${price}\n`;
    }
    await ctx.reply(msg, { parse_mode: 'HTML' });
  });

  // /stock — toggle stock status
  bot.command('stock', async (ctx) => {
    const { products } = await ProductModel.findAll({ limit: 50 });
    if (products.length === 0) {
      await ctx.reply('Nuk ka produkte akoma.');
      return;
    }

    const keyboard = new InlineKeyboard();
    for (const p of products) {
      const status = p.in_stock ? '✅' : '❌';
      keyboard.text(`${status} ${p.name}`, `stock:${p.id}`).row();
    }
    await ctx.reply('Kliko per te ndryshuar gjendjen e stokut:', { reply_markup: keyboard });
  });

  bot.callbackQuery(/^stock:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    if (!product) {
      await ctx.answerCallbackQuery('Produkti nuk u gjet');
      return;
    }
    await ProductModel.update(productId, { in_stock: !product.in_stock });
    const newStatus = !product.in_stock ? '✅ Ne stok' : '❌ Jashtë stokut';
    await ctx.answerCallbackQuery(`${product.name}: ${newStatus}`);
    await ctx.editMessageText(`${product.name} tani eshte ${newStatus}`);
  });

  // /featured — toggle featured
  bot.command('featured', async (ctx) => {
    const { products } = await ProductModel.findAll({ limit: 50 });
    const keyboard = new InlineKeyboard();
    for (const p of products) {
      const star = p.featured ? '⭐' : '☆';
      keyboard.text(`${star} ${p.name}`, `feat:${p.id}`).row();
    }
    await ctx.reply('Kliko per te vendosur/hequr nga faqja kryesore:', { reply_markup: keyboard });
  });

  bot.callbackQuery(/^feat:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    if (!product) {
      await ctx.answerCallbackQuery('Produkti nuk u gjet');
      return;
    }
    await ProductModel.update(productId, { featured: !product.featured });
    const status = !product.featured ? '⭐ Ne faqen kryesore' : '☆ Hequr nga faqja kryesore';
    await ctx.answerCallbackQuery(`${product.name}: ${status}`);
    await ctx.editMessageText(`${product.name} tani eshte ${status}`);
  });

  // /discount — set sale price
  bot.command('discount', async (ctx) => {
    const { products } = await ProductModel.findAll({ limit: 50 });
    const keyboard = new InlineKeyboard();
    for (const p of products) {
      const label = p.sale_price ? `${p.name} (€${p.sale_price})` : p.name;
      keyboard.text(label, `disc:${p.id}`).row();
    }
    await ctx.reply('Zgjidh produktin per zbritje:', { reply_markup: keyboard });
  });

  bot.callbackQuery(/^disc:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    if (!product) {
      await ctx.answerCallbackQuery('Produkti nuk u gjet');
      return;
    }
    ctx.session.editProductId = productId;
    ctx.session.step = 'discount_price';
    await ctx.answerCallbackQuery();
    const keyboard = new InlineKeyboard().text('Hiq zbritjen', `disc_remove:${productId}`);
    await ctx.reply(
      `Cmimi aktual: €${product.price}${product.sale_price ? ` (zbritje: €${product.sale_price})` : ''}\n\nShkruaj cmimin e ri me zbritje:`,
      { reply_markup: keyboard }
    );
  });

  bot.callbackQuery(/^disc_remove:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    await ProductModel.update(productId, { sale_price: null });
    await ctx.answerCallbackQuery('Zbritja u hoq');
    await ctx.editMessageText('Zbritja u hoq.');
    ctx.session.step = null;
  });

  // /delete — delete a product
  bot.command('delete', async (ctx) => {
    const { products } = await ProductModel.findAll({ limit: 50 });
    const keyboard = new InlineKeyboard();
    for (const p of products) {
      keyboard.text(p.name, `del:${p.id}`).row();
    }
    await ctx.reply('Zgjidh produktin per ta fshire:', { reply_markup: keyboard });
  });

  bot.callbackQuery(/^del:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    if (!product) {
      await ctx.answerCallbackQuery('Produkti nuk u gjet');
      return;
    }
    const keyboard = new InlineKeyboard()
      .text('Po, fshije', `del_confirm:${productId}`)
      .text('Anulo', 'del_cancel');
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(`Fshi <b>${product.name}</b>? Kjo nuk mund te kthehet mbrapa.`, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  });

  bot.callbackQuery(/^del_confirm:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    await ProductModel.delete(productId);
    await ctx.answerCallbackQuery('U fshi');
    await ctx.editMessageText('Produkti u fshi.');
  });

  bot.callbackQuery('del_cancel', async (ctx) => {
    await ctx.answerCallbackQuery('U anulua');
    await ctx.editMessageText('Fshirja u anulua.');
  });

  // /stats
  bot.command('stats', async (ctx) => {
    const stats = await OrderModel.getStats();
    const { products } = await ProductModel.findAll({ limit: 1000 });
    const outOfStock = products.filter(p => !p.in_stock).length;

    await ctx.reply(
      `📊 <b>Statistikat e Shitjeve</b>\n\n` +
      `Sot: €${stats.today.toFixed(2)}\n` +
      `Kete jave: €${stats.week.toFixed(2)}\n` +
      `Kete muaj: €${stats.month.toFixed(2)}\n` +
      `Gjithsej: €${stats.total.toFixed(2)}\n\n` +
      `Porosi: ${stats.orderCount}\n` +
      `Produkte: ${products.length}\n` +
      `Jashtë stokut: ${outOfStock}`,
      { parse_mode: 'HTML' }
    );
  });

  // /categories
  bot.command('categories', async (ctx) => {
    const categories = await CategoryModel.findAll();
    let msg = '📂 <b>Kategorite</b>\n\n';
    for (const c of categories) {
      msg += `• ${c.name} (${c.product_count} produkte)\n`;
    }
    const keyboard = new InlineKeyboard().text('+ Shto Kategori', 'cat_add');
    await ctx.reply(msg, { parse_mode: 'HTML', reply_markup: keyboard });
  });

  bot.callbackQuery('cat_add', async (ctx) => {
    ctx.session.step = 'add_category';
    await ctx.answerCallbackQuery();
    await ctx.reply('Shkruaj emrin e kategorise se re:');
  });

  // Handle text input for discount and category
  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.step === 'discount_price') {
      const price = parseFloat(ctx.message.text);
      if (isNaN(price) || price <= 0) {
        await ctx.reply('Ju lutem shkruani nje cmim te vlefshem.');
        return;
      }
      await ProductModel.update(ctx.session.editProductId!, { sale_price: price });
      await ctx.reply(`Cmimi me zbritje u vendos: €${price}`);
      ctx.session.step = null;
      ctx.session.editProductId = null;
      return;
    }

    if (ctx.session.step === 'add_category') {
      const name = ctx.message.text.trim();
      await CategoryModel.create(name);
      await ctx.reply(`Kategoria "${name}" u krijua.`);
      ctx.session.step = null;
      return;
    }

    await next();
  });
}
