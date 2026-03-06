import { Bot, session, GrammyError, HttpError } from 'grammy';
import type { Context, SessionFlavor } from 'grammy';
import { env } from '../config/env';
import { setupCommands } from './commands/index';
import { setupAddProduct } from './conversations/addProduct';
import { setupEditProduct } from './conversations/editProduct';
import { setupOrderHandlers } from './commands/orders';

export interface SessionData {
  step: string | null;
  tempProduct: {
    photos: { url: string; cloudinaryId: string }[];
    category_id?: string;
    name?: string;
    price?: number;
    material?: string;
    description?: string;
    sizes?: string[];
  };
  editProductId: string | null;
  editField: string | null;
}

export type BotContext = Context & SessionFlavor<SessionData>;

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(env.telegramBotToken);

  // Session middleware
  bot.use(session({
    initial: (): SessionData => ({
      step: null,
      tempProduct: { photos: [] },
      editProductId: null,
      editField: null,
    }),
  }));

  // Only allow the owner
  bot.use(async (ctx, next) => {
    const chatId = ctx.chat?.id?.toString();
    if (chatId !== env.telegramOwnerChatId) {
      await ctx.reply('Unauthorized. This bot is private.');
      return;
    }
    await next();
  });

  // Setup all handlers
  setupCommands(bot);
  setupAddProduct(bot);
  setupEditProduct(bot);
  setupOrderHandlers(bot);

  // Error handling
  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error('Error in request:', e.description);
    } else if (e instanceof HttpError) {
      console.error('Could not contact Telegram:', e);
    } else {
      console.error('Unknown error:', e);
    }
  });

  return bot;
}

// Send notification to owner
export async function notifyOwner(bot: Bot<BotContext>, message: string, options?: any) {
  await bot.api.sendMessage(env.telegramOwnerChatId, message, {
    parse_mode: 'HTML',
    ...options,
  });
}
