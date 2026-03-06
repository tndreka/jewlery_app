import { InlineKeyboard } from 'grammy';
import type { Bot } from 'grammy';
import type { BotContext } from '../index';
import { ProductModel } from '../../models/product';
import { ImageModel } from '../../models/image';
import { uploadImageFromUrl } from '../../config/cloudinary';
import { deleteImage } from '../../config/cloudinary';
import { env } from '../../config/env';

export function setupEditProduct(bot: Bot<BotContext>) {
  // /edit command — show product list
  bot.command('edit', async (ctx) => {
    const { products } = await ProductModel.findAll({ limit: 50 });
    if (products.length === 0) {
      await ctx.reply('No products to edit. Use /add first.');
      return;
    }

    const keyboard = new InlineKeyboard();
    for (const p of products) {
      keyboard.text(p.name, `edit_pick:${p.id}`).row();
    }
    await ctx.reply('Select product to edit:', { reply_markup: keyboard });
  });

  // Pick product → show edit options
  bot.callbackQuery(/^edit_pick:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    if (!product) {
      await ctx.answerCallbackQuery('Product not found');
      return;
    }

    ctx.session.editProductId = productId;

    const keyboard = new InlineKeyboard()
      .text('Name', `edit_field:name`).text('Price', `edit_field:price`).row()
      .text('Description', `edit_field:description`).text('Material', `edit_field:material`).row()
      .text('Add Photos', `edit_field:photos`).text('Remove Photos', `edit_field:remove_photos`).row()
      .text('Done', 'edit_done');

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `Editing: <b>${product.name}</b>\n` +
      `Price: $${product.price}${product.sale_price ? ` (sale: $${product.sale_price})` : ''}\n` +
      `Material: ${product.material || 'N/A'}\n` +
      `Description: ${product.description || 'N/A'}\n\n` +
      `What do you want to change?`,
      { parse_mode: 'HTML', reply_markup: keyboard }
    );
  });

  // Edit field selection
  bot.callbackQuery(/^edit_field:(.+)$/, async (ctx) => {
    const field = ctx.match![1];
    ctx.session.editField = field;

    if (field === 'material') {
      const keyboard = new InlineKeyboard()
        .text('Gold', 'edit_mat:gold').text('Silver', 'edit_mat:silver').row()
        .text('Rose Gold', 'edit_mat:rose_gold').text('Platinum', 'edit_mat:platinum').row()
        .text('Other', 'edit_mat:other');
      await ctx.answerCallbackQuery();
      await ctx.reply('Select material:', { reply_markup: keyboard });
      return;
    }

    if (field === 'photos') {
      ctx.session.step = 'edit_add_photos';
      ctx.session.tempProduct = { photos: [] };
      await ctx.answerCallbackQuery();
      await ctx.reply('Send new photos. Tap Done when finished.', {
        reply_markup: new InlineKeyboard().text('Done', 'edit_photos_done'),
      });
      return;
    }

    if (field === 'remove_photos') {
      const images = await ImageModel.findByProduct(ctx.session.editProductId!);
      if (images.length === 0) {
        await ctx.answerCallbackQuery('No photos to remove');
        return;
      }
      const keyboard = new InlineKeyboard();
      for (let i = 0; i < images.length; i++) {
        keyboard.text(`Photo ${i + 1}`, `edit_rm_photo:${images[i].id}`).row();
      }
      keyboard.text('Done', 'edit_rm_done');
      await ctx.answerCallbackQuery();
      await ctx.reply('Select photo to remove:', { reply_markup: keyboard });
      return;
    }

    ctx.session.step = `edit_${field}`;
    await ctx.answerCallbackQuery();

    const prompts: Record<string, string> = {
      name: '✏️ New name:',
      price: '💰 New price:',
      description: '📝 New description:',
    };
    await ctx.reply(prompts[field] || `Enter new ${field}:`);
  });

  // Material selection for edit
  bot.callbackQuery(/^edit_mat:(.+)$/, async (ctx) => {
    await ProductModel.update(ctx.session.editProductId!, { material: ctx.match![1] });
    await ctx.answerCallbackQuery('Material updated');
    await ctx.reply('✅ Material updated.');
    ctx.session.editField = null;
  });

  // Photo upload during edit
  bot.on('message:photo', async (ctx, next) => {
    if (ctx.session.step !== 'edit_add_photos') {
      await next();
      return;
    }

    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const file = await ctx.api.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${env.telegramBotToken}/${file.file_path}`;

    try {
      const uploaded = await uploadImageFromUrl(fileUrl);
      await ImageModel.addToProduct(ctx.session.editProductId!, uploaded.url, uploaded.publicId);
      await ctx.reply('Photo added ✓', {
        reply_markup: new InlineKeyboard().text('Done', 'edit_photos_done'),
      });
    } catch (err) {
      console.error('Photo upload error:', err);
      await ctx.reply('Failed to upload. Try again.');
    }
  });

  bot.callbackQuery('edit_photos_done', async (ctx) => {
    ctx.session.step = null;
    await ctx.answerCallbackQuery('Photos saved');
    await ctx.reply('✅ Photos updated.');
  });

  // Remove photo
  bot.callbackQuery(/^edit_rm_photo:(.+)$/, async (ctx) => {
    const imageId = ctx.match![1];
    const image = await ImageModel.delete(imageId);
    if (image?.cloudinary_id) {
      await deleteImage(image.cloudinary_id).catch(console.error);
    }
    await ctx.answerCallbackQuery('Photo removed');
    await ctx.editMessageText('Photo removed. Select another or tap Done.', {
      reply_markup: new InlineKeyboard().text('Done', 'edit_rm_done'),
    });
  });

  bot.callbackQuery('edit_rm_done', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText('✅ Done removing photos.');
  });

  // Text input for edit fields
  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.step === 'edit_name') {
      await ProductModel.update(ctx.session.editProductId!, { name: ctx.message.text.trim() });
      await ctx.reply('✅ Name updated.');
      ctx.session.step = null;
      return;
    }

    if (ctx.session.step === 'edit_price') {
      const price = parseFloat(ctx.message.text);
      if (isNaN(price) || price <= 0) {
        await ctx.reply('Enter a valid price.');
        return;
      }
      await ProductModel.update(ctx.session.editProductId!, { price });
      await ctx.reply(`✅ Price updated to $${price}`);
      ctx.session.step = null;
      return;
    }

    if (ctx.session.step === 'edit_description') {
      await ProductModel.update(ctx.session.editProductId!, { description: ctx.message.text.trim() });
      await ctx.reply('✅ Description updated.');
      ctx.session.step = null;
      return;
    }

    await next();
  });

  // Done editing
  bot.callbackQuery('edit_done', async (ctx) => {
    ctx.session.editProductId = null;
    ctx.session.editField = null;
    ctx.session.step = null;
    await ctx.answerCallbackQuery();
    await ctx.editMessageText('✅ Editing complete.');
  });
}
