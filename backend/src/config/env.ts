import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL!,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN!,
  telegramOwnerChatId: process.env.TELEGRAM_OWNER_CHAT_ID!,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  },
  apiSecret: process.env.API_SECRET!,
  siteUrl: process.env.SITE_URL || 'http://localhost:5173',
};
