import { InlineKeyboard } from 'grammy';
import type { Bot } from 'grammy';
import type { BotContext } from '../index';
import { ProductModel } from '../../models/product';
import { CategoryModel } from '../../models/category';
import { ImageModel } from '../../models/image';
import { uploadImageFromUrl } from '../../config/cloudinary';
import { env } from '../../config/env';

export function setupAddProduct(bot: Bot<BotContext>) {
  // /add command — start adding a product
  bot.command('add', async (ctx) => {
    ctx.session.step = 'add_photos';
    ctx.session.tempProduct = { photos: [] };
    await ctx.reply(
      '📸 <b>Add New Product</b>\n\nSend me the product photos (1-10).\nWhen done, tap "Done" below.',
      {
        parse_mode: 'HTML',
        reply_markup: new InlineKeyboard().text('Done with photos', 'add_photos_done'),
      }
    );
  });

  // Receive photos
  bot.on('message:photo', async (ctx, next) => {
    if (ctx.session.step !== 'add_photos') {
      await next();
      return;
    }

    const photo = ctx.message.photo[ctx.message.photo.length - 1]; // highest resolution
    const file = await ctx.api.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${env.telegramBotToken}/${file.file_path}`;

    try {
      const uploaded = await uploadImageFromUrl(fileUrl);
      ctx.session.tempProduct.photos.push({
        url: uploaded.url,
        cloudinaryId: uploaded.publicId,
      });
      await ctx.reply(`Photo ${ctx.session.tempProduct.photos.length} uploaded ✓ Send more or tap Done.`, {
        reply_markup: new InlineKeyboard().text('Done with photos', 'add_photos_done'),
      });
    } catch (err) {
      console.error('Photo upload error:', err);
      await ctx.reply('Failed to upload photo. Try again.');
    }
  });

  // Done with photos → ask category
  bot.callbackQuery('add_photos_done', async (ctx) => {
    if (ctx.session.tempProduct.photos.length === 0) {
      await ctx.answerCallbackQuery('Please send at least 1 photo first.');
      return;
    }

    ctx.session.step = 'add_category';
    const categories = await CategoryModel.findAll();
    const keyboard = new InlineKeyboard();
    for (const cat of categories) {
      keyboard.text(cat.name, `add_cat:${cat.id}`).row();
    }
    await ctx.answerCallbackQuery();
    await ctx.reply('📂 Select category:', { reply_markup: keyboard });
  });

  // Category selected → ask name
  bot.callbackQuery(/^add_cat:(.+)$/, async (ctx) => {
    ctx.session.tempProduct.category_id = ctx.match![1];
    ctx.session.step = 'add_name';
    await ctx.answerCallbackQuery();
    await ctx.reply('✏️ Product name:');
  });

  // Name → ask price
  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.step === 'add_name') {
      ctx.session.tempProduct.name = ctx.message.text.trim();
      ctx.session.step = 'add_price';
      await ctx.reply('💰 Price (number only, e.g. 250):');
      return;
    }

    if (ctx.session.step === 'add_price') {
      const price = parseFloat(ctx.message.text);
      if (isNaN(price) || price <= 0) {
        await ctx.reply('Please enter a valid price number.');
        return;
      }
      ctx.session.tempProduct.price = price;
      ctx.session.step = 'add_material';

      const keyboard = new InlineKeyboard()
        .text('Gold', 'add_mat:gold').text('Silver', 'add_mat:silver').row()
        .text('Rose Gold', 'add_mat:rose_gold').text('Platinum', 'add_mat:platinum').row()
        .text('Other', 'add_mat:other').text('Skip', 'add_mat:skip');

      await ctx.reply('✨ Material:', { reply_markup: keyboard });
      return;
    }

    if (ctx.session.step === 'add_description') {
      ctx.session.tempProduct.description = ctx.message.text.trim();
      await showProductPreview(ctx);
      return;
    }

    await next();
  });

  // Material selected → ask description
  bot.callbackQuery(/^add_mat:(.+)$/, async (ctx) => {
    const material = ctx.match![1];
    if (material !== 'skip') {
      ctx.session.tempProduct.material = material;
    }
    ctx.session.step = 'add_description';
    await ctx.answerCallbackQuery();

    const keyboard = new InlineKeyboard().text('Skip', 'add_desc_skip');
    await ctx.reply('📝 Description (or tap Skip):', { reply_markup: keyboard });
  });

  // Skip description
  bot.callbackQuery('add_desc_skip', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showProductPreview(ctx);
  });

  // Show preview and confirm
  async function showProductPreview(ctx: BotContext) {
    const tp = ctx.session.tempProduct;
    const category = tp.category_id ? await CategoryModel.findById(tp.category_id) : null;

    let preview = `📋 <b>Preview</b>\n\n`;
    preview += `📸 ${tp.photos.length} photo(s)\n`;
    preview += `📂 ${category?.name || 'No category'}\n`;
    preview += `✏️ <b>${tp.name}</b>\n`;
    preview += `💰 $${tp.price}\n`;
    if (tp.material && tp.material !== 'other') preview += `✨ ${tp.material}\n`;
    if (tp.description) preview += `📝 ${tp.description}\n`;

    ctx.session.step = 'add_confirm';
    const keyboard = new InlineKeyboard()
      .text('✅ Publish', 'add_publish')
      .text('❌ Cancel', 'add_cancel');

    await ctx.reply(preview, { parse_mode: 'HTML', reply_markup: keyboard });
  }

  // Publish product
  bot.callbackQuery('add_publish', async (ctx) => {
    const tp = ctx.session.tempProduct;

    try {
      const product = await ProductModel.create({
        name: tp.name!,
        price: tp.price!,
        category_id: tp.category_id,
        material: tp.material,
        description: tp.description,
      });

      // Save images
      for (const photo of tp.photos) {
        await ImageModel.addToProduct(product.id, photo.url, photo.cloudinaryId);
      }

      // Reset session
      ctx.session.step = null;
      ctx.session.tempProduct = { photos: [] };

      await ctx.answerCallbackQuery('Published!');
      await ctx.editMessageText(
        `✅ <b>${product.name}</b> published!\n\n` +
        `${env.siteUrl}/products/${product.slug}`,
        { parse_mode: 'HTML' }
      );
    } catch (err) {
      console.error('Publish error:', err);
      await ctx.answerCallbackQuery('Error publishing. Try again.');
    }
  });

  // Cancel
  bot.callbackQuery('add_cancel', async (ctx) => {
    ctx.session.step = null;
    ctx.session.tempProduct = { photos: [] };
    await ctx.answerCallbackQuery('Cancelled');
    await ctx.editMessageText('Product creation cancelled.');
  });
}
