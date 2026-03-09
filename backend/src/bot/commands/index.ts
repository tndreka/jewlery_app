import { InlineKeyboard } from 'grammy';
import type { Bot } from 'grammy';
import type { BotContext } from '../index';
import { ProductModel } from '../../models/product';
import { CategoryModel } from '../../models/category';
import { OrderModel } from '../../models/order';

export function setupCommands(bot: Bot<BotContext>) {

  // ============================================================
  // /start — Main menu with big clear buttons
  // ============================================================
  bot.command('start', async (ctx) => {
    await sendMainMenu(ctx);
  });

  async function sendMainMenu(ctx: BotContext) {
    const keyboard = new InlineKeyboard()
      .text('📦 Produktet', 'menu_products').row()
      .text('➕ Shto Produkt', 'menu_add').row()
      .text('🛒 Porositë', 'menu_orders').row()
      .text('📊 Statistikat', 'menu_stats').row()
      .text('📂 Kategorite', 'menu_categories');

    await ctx.reply(
      '💎 <b>Argjendari Kadriu</b>\n\nÇfarë dëshiron të bësh?',
      { parse_mode: 'HTML', reply_markup: keyboard }
    );
  }

  // Back to main menu
  bot.callbackQuery('menu_main', async (ctx) => {
    await ctx.answerCallbackQuery();
    await sendMainMenu(ctx);
  });

  // ============================================================
  // PRODUCTS — Browse by category first, then see products
  // ============================================================
  bot.command('products', async (ctx) => {
    await showCategoryPicker(ctx, 'browse');
  });

  bot.callbackQuery('menu_products', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showCategoryPicker(ctx, 'browse');
  });

  async function showCategoryPicker(ctx: BotContext, action: string) {
    const categories = await CategoryModel.findAll();
    const keyboard = new InlineKeyboard();
    for (const cat of categories.filter(c => (c.product_count || 0) > 0)) {
      keyboard.text(`${cat.name} (${cat.product_count})`, `${action}_cat:${cat.slug}`).row();
    }
    keyboard.text('📋 Të gjitha', `${action}_cat:all`).row();
    keyboard.text('⬅️ Kthehu', 'menu_main');

    await ctx.reply('📂 Zgjidh kategorinë:', { reply_markup: keyboard });
  }

  // Show products in a category
  bot.callbackQuery(/^browse_cat:(.+)$/, async (ctx) => {
    const slug = ctx.match![1];
    await ctx.answerCallbackQuery();
    await showProductList(ctx, slug);
  });

  async function showProductList(ctx: BotContext, categorySlug: string) {
    let products;
    let title: string;

    if (categorySlug === 'all') {
      const result = await ProductModel.findAll({ limit: 200 });
      products = result.products;
      title = 'Të gjitha produktet';
    } else {
      const result = await ProductModel.findAll({ limit: 200, category: categorySlug });
      products = result.products;
      title = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
    }

    if (products.length === 0) {
      await ctx.reply('Nuk ka produkte në këtë kategori.');
      return;
    }

    let msg = `📦 <b>${title}</b> (${products.length})\n\n`;
    for (const p of products) {
      const stock = p.in_stock ? '✅' : '❌';
      const feat = p.featured ? '⭐' : '';
      const price = p.sale_price
        ? `<s>€${p.price}</s> €${p.sale_price}`
        : `€${p.price}`;
      msg += `${stock}${feat} <b>${p.name}</b> — ${price}\n`;
    }

    const keyboard = new InlineKeyboard();
    // Show product buttons for quick actions (max 20 to fit)
    const displayProducts = products.slice(0, 20);
    for (const p of displayProducts) {
      keyboard.text(p.name, `product_menu:${p.id}`).row();
    }
    keyboard.text('⬅️ Kthehu', 'menu_products');

    await ctx.reply(msg + '\nKliko produktin për veprime:', { parse_mode: 'HTML', reply_markup: keyboard });
  }

  // ============================================================
  // PRODUCT MENU — All actions for a single product in one place
  // ============================================================
  bot.callbackQuery(/^product_menu:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    await ctx.answerCallbackQuery();
    await showProductMenu(ctx, productId);
  });

  async function showProductMenu(ctx: BotContext, productId: string) {
    const product = await ProductModel.findById(productId);
    if (!product) {
      await ctx.reply('Produkti nuk u gjet.');
      return;
    }

    const materialNames: Record<string, string> = {
      gold: 'Ar', silver: 'Argjend', rose_gold: 'Ar Rose', platinum: 'Platin', other: 'Tjetër',
    };

    const stockLabel = product.in_stock ? '✅ Në stok' : '❌ Jashtë stokut';
    const featLabel = product.featured ? '⭐ Në faqen kryesore' : '☆ Jo në faqen kryesore';

    let msg = `💎 <b>${product.name}</b>\n\n`;
    msg += `💰 Çmimi: €${product.price}${product.sale_price ? ` → €${product.sale_price}` : ''}\n`;
    msg += `📦 ${stockLabel}\n`;
    msg += `${featLabel}\n`;
    if (product.material) msg += `✨ ${materialNames[product.material] || product.material}\n`;
    if (product.description) msg += `📝 ${product.description}\n`;
    msg += `\n📂 ${product.category_name || 'Pa kategori'}`;

    const stockBtn = product.in_stock ? '❌ Hiq nga stoku' : '✅ Vendos në stok';
    const featBtn = product.featured ? '☆ Hiq nga faqja' : '⭐ Vendos në faqe';

    const keyboard = new InlineKeyboard()
      .text(stockBtn, `toggle_stock:${productId}`).row()
      .text(featBtn, `toggle_feat:${productId}`).row()
      .text('💰 Ndrysho çmimin', `set_price:${productId}`).text('🏷️ Zbritje', `set_discount:${productId}`).row()
      .text('✏️ Ndrysho emrin', `set_name:${productId}`).row()
      .text('📝 Ndrysho përshkrimin', `set_desc:${productId}`).row()
      .text('📸 Shto foto', `set_photos:${productId}`).row()
      .text('🗑️ Fshi produktin', `del:${productId}`).row()
      .text('⬅️ Kthehu', 'menu_products');

    await ctx.reply(msg, { parse_mode: 'HTML', reply_markup: keyboard });
  }

  // ============================================================
  // QUICK ACTIONS — Toggle stock/featured inline
  // ============================================================
  bot.callbackQuery(/^toggle_stock:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    if (!product) { await ctx.answerCallbackQuery('Nuk u gjet'); return; }
    await ProductModel.update(productId, { in_stock: !product.in_stock });
    const status = !product.in_stock ? '✅ Në stok' : '❌ Jashtë stokut';
    await ctx.answerCallbackQuery(`${product.name}: ${status}`);
    await showProductMenu(ctx, productId);
  });

  bot.callbackQuery(/^toggle_feat:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    if (!product) { await ctx.answerCallbackQuery('Nuk u gjet'); return; }
    await ProductModel.update(productId, { featured: !product.featured });
    const status = !product.featured ? '⭐ Në faqe' : '☆ Hequr nga faqja';
    await ctx.answerCallbackQuery(`${product.name}: ${status}`);
    await showProductMenu(ctx, productId);
  });

  // ============================================================
  // EDIT ACTIONS — Simple text prompts
  // ============================================================
  bot.callbackQuery(/^set_price:(.+)$/, async (ctx) => {
    ctx.session.editProductId = ctx.match![1];
    ctx.session.step = 'quick_price';
    await ctx.answerCallbackQuery();
    await ctx.reply('💰 Shkruaj çmimin e ri (vetëm numrin):');
  });

  bot.callbackQuery(/^set_discount:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    ctx.session.editProductId = productId;
    ctx.session.step = 'quick_discount';
    await ctx.answerCallbackQuery();
    const keyboard = new InlineKeyboard().text('🚫 Hiq zbritjen', `remove_discount:${productId}`);
    await ctx.reply(
      `Çmimi aktual: €${product?.price}${product?.sale_price ? ` (zbritje: €${product.sale_price})` : ''}\n\nShkruaj çmimin me zbritje:`,
      { reply_markup: keyboard }
    );
  });

  bot.callbackQuery(/^remove_discount:(.+)$/, async (ctx) => {
    await ProductModel.update(ctx.match![1], { sale_price: null });
    ctx.session.step = null;
    await ctx.answerCallbackQuery('Zbritja u hoq');
    await ctx.reply('✅ Zbritja u hoq.');
  });

  bot.callbackQuery(/^set_name:(.+)$/, async (ctx) => {
    ctx.session.editProductId = ctx.match![1];
    ctx.session.step = 'quick_name';
    await ctx.answerCallbackQuery();
    await ctx.reply('✏️ Shkruaj emrin e ri:');
  });

  bot.callbackQuery(/^set_desc:(.+)$/, async (ctx) => {
    ctx.session.editProductId = ctx.match![1];
    ctx.session.step = 'quick_desc';
    await ctx.answerCallbackQuery();
    await ctx.reply('📝 Shkruaj përshkrimin e ri:');
  });

  bot.callbackQuery(/^set_photos:(.+)$/, async (ctx) => {
    ctx.session.editProductId = ctx.match![1];
    ctx.session.step = 'edit_add_photos';
    ctx.session.tempProduct = { photos: [] };
    await ctx.answerCallbackQuery();
    await ctx.reply('📸 Dërgo fotot e reja. Kliko Përfundova kur të mbarosh.', {
      reply_markup: new InlineKeyboard().text('✅ Përfundova', 'edit_photos_done'),
    });
  });

  // ============================================================
  // DELETE — with confirmation
  // ============================================================
  bot.callbackQuery(/^del:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    if (!product) { await ctx.answerCallbackQuery('Nuk u gjet'); return; }
    const keyboard = new InlineKeyboard()
      .text('🗑️ Po, fshije', `del_confirm:${productId}`)
      .text('Anulo', `product_menu:${productId}`);
    await ctx.answerCallbackQuery();
    await ctx.reply(`⚠️ Fshi <b>${product.name}</b>?\nKjo nuk mund të kthehet mbrapa.`, {
      parse_mode: 'HTML', reply_markup: keyboard,
    });
  });

  bot.callbackQuery(/^del_confirm:(.+)$/, async (ctx) => {
    try {
      await ProductModel.delete(ctx.match![1]);
      await ctx.answerCallbackQuery('U fshi');
      await ctx.reply('✅ Produkti u fshi.');
    } catch (err) {
      console.error('Delete error:', err);
      await ctx.answerCallbackQuery('Gabim gjatë fshirjes');
      await ctx.reply('❌ Fshirja dështoi. Provo përsëri.');
    }
  });

  // ============================================================
  // TEXT INPUT HANDLER — handles all quick edits
  // ============================================================
  bot.on('message:text', async (ctx, next) => {
    const { step, editProductId } = ctx.session;

    if (step === 'quick_price' && editProductId) {
      const price = parseFloat(ctx.message.text);
      if (isNaN(price) || price <= 0) {
        await ctx.reply('❌ Shkruaj një çmim të vlefshëm.');
        return;
      }
      await ProductModel.update(editProductId, { price });
      ctx.session.step = null;
      await ctx.reply(`✅ Çmimi u ndryshUA: €${price}`);
      return;
    }

    if (step === 'quick_discount' && editProductId) {
      const price = parseFloat(ctx.message.text);
      if (isNaN(price) || price <= 0) {
        await ctx.reply('❌ Shkruaj një çmim të vlefshëm.');
        return;
      }
      await ProductModel.update(editProductId, { sale_price: price });
      ctx.session.step = null;
      await ctx.reply(`✅ Zbritja u vendos: €${price}`);
      return;
    }

    if (step === 'quick_name' && editProductId) {
      const name = ctx.message.text.trim();
      await ProductModel.update(editProductId, { name });
      ctx.session.step = null;
      await ctx.reply(`✅ Emri u ndryshua: ${name}`);
      return;
    }

    if (step === 'quick_desc' && editProductId) {
      const desc = ctx.message.text.trim();
      await ProductModel.update(editProductId, { description: desc });
      ctx.session.step = null;
      await ctx.reply('✅ Përshkrimi u ndryshua.');
      return;
    }

    if (step === 'add_category') {
      const name = ctx.message.text.trim();
      await CategoryModel.create(name);
      ctx.session.step = null;
      await ctx.reply(`✅ Kategoria "${name}" u krijua.`);
      return;
    }

    // Legacy discount handler (from /discount command)
    if (step === 'discount_price' && editProductId) {
      const price = parseFloat(ctx.message.text);
      if (isNaN(price) || price <= 0) {
        await ctx.reply('❌ Shkruaj një çmim të vlefshëm.');
        return;
      }
      await ProductModel.update(editProductId, { sale_price: price });
      ctx.session.step = null;
      ctx.session.editProductId = null;
      await ctx.reply(`✅ Zbritja u vendos: €${price}`);
      return;
    }

    await next();
  });

  // ============================================================
  // STATS
  // ============================================================
  bot.command('stats', async (ctx) => {
    await showStats(ctx);
  });

  bot.callbackQuery('menu_stats', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showStats(ctx);
  });

  async function showStats(ctx: BotContext) {
    const stats = await OrderModel.getStats();
    const { products } = await ProductModel.findAll({ limit: 1000 });
    const outOfStock = products.filter(p => !p.in_stock).length;
    const categories = await CategoryModel.findAll();

    let msg = `📊 <b>Statistikat</b>\n\n`;
    msg += `💰 <b>Shitjet</b>\n`;
    msg += `  Sot: €${stats.today.toFixed(2)}\n`;
    msg += `  Këtë javë: €${stats.week.toFixed(2)}\n`;
    msg += `  Këtë muaj: €${stats.month.toFixed(2)}\n`;
    msg += `  Gjithsej: €${stats.total.toFixed(2)}\n\n`;
    msg += `📦 <b>Inventari</b>\n`;
    msg += `  Produkte: ${products.length}\n`;
    msg += `  Jashtë stokut: ${outOfStock}\n`;
    msg += `  Porosi: ${stats.orderCount}\n\n`;
    msg += `📂 <b>Kategorite</b>\n`;
    for (const c of categories.filter(c => (c.product_count || 0) > 0)) {
      msg += `  ${c.name}: ${c.product_count} produkte\n`;
    }

    const keyboard = new InlineKeyboard().text('⬅️ Kthehu', 'menu_main');
    await ctx.reply(msg, { parse_mode: 'HTML', reply_markup: keyboard });
  }

  // ============================================================
  // CATEGORIES
  // ============================================================
  bot.command('categories', async (ctx) => {
    await showCategories(ctx);
  });

  bot.callbackQuery('menu_categories', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showCategories(ctx);
  });

  async function showCategories(ctx: BotContext) {
    const categories = await CategoryModel.findAll();
    let msg = '📂 <b>Kategorite</b>\n\n';
    for (const c of categories) {
      msg += `• <b>${c.name}</b> — ${c.product_count} produkte\n`;
    }
    const keyboard = new InlineKeyboard()
      .text('➕ Shto Kategori', 'cat_add').row()
      .text('⬅️ Kthehu', 'menu_main');
    await ctx.reply(msg, { parse_mode: 'HTML', reply_markup: keyboard });
  }

  bot.callbackQuery('cat_add', async (ctx) => {
    ctx.session.step = 'add_category';
    await ctx.answerCallbackQuery();
    await ctx.reply('Shkruaj emrin e kategorisë së re:');
  });

  // ============================================================
  // MENU TRIGGERS for /add and /orders (handled by other files)
  // ============================================================
  bot.callbackQuery('menu_add', async (ctx) => {
    await ctx.answerCallbackQuery();
    // Trigger the /add flow
    ctx.session.step = 'add_photos';
    ctx.session.tempProduct = { photos: [] };
    await ctx.reply(
      '📸 <b>Shto Produkt te Ri</b>\n\nDërgo fotot e produktit (1-10).\nKur të mbarosh, kliko "Përfundova" më poshtë.',
      {
        parse_mode: 'HTML',
        reply_markup: new InlineKeyboard().text('✅ Përfundova me fotot', 'add_photos_done'),
      }
    );
  });

  bot.callbackQuery('menu_orders', async (ctx) => {
    await ctx.answerCallbackQuery();
    const orders = await OrderModel.findRecent(10);
    if (orders.length === 0) {
      const keyboard = new InlineKeyboard().text('⬅️ Kthehu', 'menu_main');
      await ctx.reply('Nuk ka porosi akoma.', { reply_markup: keyboard });
      return;
    }

    for (const order of orders) {
      const full = await OrderModel.findById(order.id);
      if (!full) continue;

      const statusEmoji: Record<string, string> = {
        pending: '🟡', confirmed: '🟢', shipped: '📦', delivered: '✅', cancelled: '❌',
      };
      const statusNames: Record<string, string> = {
        pending: 'Në pritje', confirmed: 'Konfirmuar', shipped: 'Dërguar', delivered: 'Dorëzuar', cancelled: 'Anuluar',
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
      msg += `Statusi: ${statusNames[order.status] || order.status}`;

      const keyboard = new InlineKeyboard();
      if (order.status === 'pending') {
        keyboard.text('✅ Konfirmo', `order_confirm:${order.id}`)
          .text('❌ Anulo', `order_cancel:${order.id}`);
      } else if (order.status === 'confirmed') {
        keyboard.text('📦 Shëno si Dërguar', `order_ship:${order.id}`);
      } else if (order.status === 'shipped') {
        keyboard.text('✅ Shëno si Dorëzuar', `order_deliver:${order.id}`);
      }

      await ctx.reply(msg, { parse_mode: 'HTML', reply_markup: keyboard });
    }
  });

  // Keep old commands working as shortcuts
  bot.command('stock', async (ctx) => {
    await showCategoryPicker(ctx, 'browse');
  });

  bot.command('featured', async (ctx) => {
    await showCategoryPicker(ctx, 'browse');
  });

  bot.command('discount', async (ctx) => {
    await showCategoryPicker(ctx, 'browse');
  });

  bot.command('delete', async (ctx) => {
    await showCategoryPicker(ctx, 'browse');
  });
}
