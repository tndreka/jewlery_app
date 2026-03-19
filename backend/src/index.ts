import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { createBot } from './bot/index';
import { errorHandler, notFound } from './middleware/errorHandler';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import cartRoutes from './routes/cart';
import orderRoutes, { setBotInstance } from './routes/orders';

async function main() {
  const app = express();

  // Trust proxy (behind nginx)
  app.set('trust proxy', 1);

  // Middleware
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.siteUrl, credentials: true }));
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  // Rate limiting
  app.use('/api/', rateLimit({ windowMs: 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));
  app.use('/api/orders', rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false }));
  app.use('/api/cart', rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false }));

  // Serve uploaded images statically
  app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

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
      bot.start({ onStart: () => console.log('Telegram bot started') })
        .catch((err: unknown) => {
          console.warn('Telegram bot failed to start:', err);
          console.warn('Server will continue running without Telegram bot.');
        });
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
