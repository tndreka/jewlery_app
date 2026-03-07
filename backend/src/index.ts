import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { createBot } from './bot/index';
import { errorHandler, notFound } from './middleware/errorHandler';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import cartRoutes from './routes/cart';
import orderRoutes, { setBotInstance } from './routes/orders';

async function main() {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors({ origin: env.siteUrl, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // Routes
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  // Start Telegram bot (skip if no valid token)
  if (env.telegramBotToken && env.telegramBotToken !== 'placeholder') {
    try {
      const bot = createBot();
      setBotInstance(bot);
      bot.start({ onStart: () => console.log('Telegram bot started') });
    } catch (err) {
      console.warn('Telegram bot failed to start:', err);
    }
  } else {
    console.log('Telegram bot skipped (no token configured)');
  }

  // Start Express server
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
    console.log(`Environment: ${env.nodeEnv}`);
  });
}

main().catch(console.error);
