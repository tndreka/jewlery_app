import { InlineKeyboard } from 'grammy';
import type { Bot } from 'grammy';
import type { BotContext } from '../index';
import { ProductModel } from '../../models/product';
import { ImageModel } from '../../models/image';
import { uploadImageFromUrl, deleteLocalImage } from '../../config/localUpload';
import { env } from '../../config/env';

export function setupEditProduct(bot: Bot<BotContext>) {
  // /edit command
  bot.command('edit', async (ctx) => {
    const { products } = await ProductModel.findAll({ limit: 50 });
    if (products.length === 0) {
      await ctx.reply('Nuk ka produkte per te ndryshuar. Perdor /add fillimisht.');
      return;
    }

    const keyboard = new InlineKeyboard();
    for (const p of products) {
      keyboard.text(p.name, `edit_pick:${p.id}`).row();
    }
    await ctx.reply('Zgjidh produktin per ta ndryshuar:', { reply_markup: keyboard });
  });

  // Pick product → show edit options
  bot.callbackQuery(/^edit_pick:(.+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const product = await ProductModel.findById(productId);
    if (!product) {
      await ctx.answerCallbackQuery('Produkti nuk u gjet');
      return;
    }

    const materialNames: Record<string, string> = {
      gold: 'Ar', silver: 'Argjend', rose_gold: 'Ar Rose', platinum: 'Platin',
    };

    ctx.session.editProductId = productId;

    const keyboard = new InlineKeyboard()
      .text('Emri', `edit_field:name`).text('Cmimi', `edit_field:price`).row()
      .text('Pershkrimi', `edit_field:description`).text('Materiali', `edit_field:material`).row()
      .text('Shto Foto', `edit_field:photos`).text('Hiq Foto', `edit_field:remove_photos`).row()
      .text('Perfundo', 'edit_done');

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `Duke ndryshuar: <b>${product.name}</b>\n` +
      `Cmimi: €${product.price}${product.sale_price ? ` (zbritje: €${product.sale_price})` : ''}\n` +
      `Materiali: ${materialNames[product.material || ''] || product.material || 'Pa material'}\n` +
      `Pershkrimi: ${product.description || 'Pa pershkrim'}\n\n` +
      `Cfare deshiron te ndryshosh?`,
      { parse_mode: 'HTML', reply_markup: keyboard }
    );
  });

  // Edit field selection
  bot.callbackQuery(/^edit_field:(.+)$/, async (ctx) => {
    const field = ctx.match![1];
    ctx.session.editField = field;

    if (field === 'material') {
      const keyboard = new InlineKeyboard()
        .text('Ar', 'edit_mat:gold').text('Argjend', 'edit_mat:silver').row()
        .text('Ar Rose', 'edit_mat:rose_gold').text('Platin', 'edit_mat:platinum').row()
        .text('Tjeter', 'edit_mat:other');
      await ctx.answerCallbackQuery();
      await ctx.reply('Zgjidh materialin:', { reply_markup: keyboard });
      return;
    }

    if (field === 'photos') {
      ctx.session.step = 'edit_add_photos';
      ctx.session.tempProduct = { photos: [] };
      await ctx.answerCallbackQuery();
      await ctx.reply('Dergo fotot e reja. Kliko Perfundova kur te mbarosh.', {
        reply_markup: new InlineKeyboard().text('Perfundova', 'edit_photos_done'),
      });
      return;
    }

    if (field === 'remove_photos') {
      const images = await ImageModel.findByProduct(ctx.session.editProductId!);
      if (images.length === 0) {
        await ctx.answerCallbackQuery('Nuk ka foto per te hequr');
        return;
      }
      const keyboard = new InlineKeyboard();
      for (let i = 0; i < images.length; i++) {
        keyboard.text(`Foto ${i + 1}`, `edit_rm_photo:${images[i].id}`).row();
      }
      keyboard.text('Perfundova', 'edit_rm_done');
      await ctx.answerCallbackQuery();
      await ctx.reply('Zgjidh foton per ta hequr:', { reply_markup: keyboard });
      return;
    }

    ctx.session.step = `edit_${field}`;
    await ctx.answerCallbackQuery();

    const prompts: Record<string, string> = {
      name: '✏️ Emri i ri:',
      price: '💰 Cmimi i ri:',
      description: '📝 Pershkrimi i ri:',
    };
    await ctx.reply(prompts[field] || `Shkruaj vleren e re:`);
  });

  // Material selection for edit
  bot.callbackQuery(/^edit_mat:(.+)$/, async (ctx) => {
    await ProductModel.update(ctx.session.editProductId!, { material: ctx.match![1] });
    await ctx.answerCallbackQuery('Materiali u ndryshua');
    await ctx.reply('✅ Materiali u ndryshua.');
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
      await ctx.reply('Foto u shtua ✓', {
        reply_markup: new InlineKeyboard().text('Perfundova', 'edit_photos_done'),
      });
    } catch (err) {
      console.error('Photo upload error:', err);
      await ctx.reply('Ngarkimi deshtoi. Provo perseri.');
    }
  });

  bot.callbackQuery('edit_photos_done', async (ctx) => {
    ctx.session.step = null;
    await ctx.answerCallbackQuery('Fotot u ruajten');
    await ctx.reply('✅ Fotot u perditesuan.');
  });

  // Remove photo
  bot.callbackQuery(/^edit_rm_photo:(.+)$/, async (ctx) => {
    const imageId = ctx.match![1];
    const image = await ImageModel.delete(imageId);
    if (image?.cloudinary_id) {
      await deleteLocalImage(image.cloudinary_id).catch(console.error);
    }
    await ctx.answerCallbackQuery('Foto u hoq');
    await ctx.editMessageText('Foto u hoq. Zgjidh nje tjeter ose kliko Perfundova.', {
      reply_markup: new InlineKeyboard().text('Perfundova', 'edit_rm_done'),
    });
  });

  bot.callbackQuery('edit_rm_done', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText('✅ Heqja e fotove perfundoi.');
  });

  // Text input for edit fields
  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.step === 'edit_name') {
      await ProductModel.update(ctx.session.editProductId!, { name: ctx.message.text.trim() });
      await ctx.reply('✅ Emri u ndryshua.');
      ctx.session.step = null;
      return;
    }

    if (ctx.session.step === 'edit_price') {
      const price = parseFloat(ctx.message.text);
      if (isNaN(price) || price <= 0) {
        await ctx.reply('Shkruaj nje cmim te vlefshem.');
        return;
      }
      await ProductModel.update(ctx.session.editProductId!, { price });
      await ctx.reply(`✅ Cmimi u ndryshua ne €${price}`);
      ctx.session.step = null;
      return;
    }

    if (ctx.session.step === 'edit_description') {
      await ProductModel.update(ctx.session.editProductId!, { description: ctx.message.text.trim() });
      await ctx.reply('✅ Pershkrimi u ndryshua.');
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
    await ctx.editMessageText('✅ Ndryshimi perfundoi.');
  });
}
