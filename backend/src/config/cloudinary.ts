import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

export async function uploadImage(filePath: string): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'jewelry',
    transformation: [
      { width: 1200, height: 1600, crop: 'limit', quality: 'auto' },
    ],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadImageFromUrl(url: string): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(url, {
    folder: 'jewelry',
    transformation: [
      { width: 1200, height: 1600, crop: 'limit', quality: 'auto' },
    ],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
