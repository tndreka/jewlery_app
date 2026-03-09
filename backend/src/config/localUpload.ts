import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const uploadsDir = path.resolve(__dirname, '../../public/uploads/products');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

export async function uploadImageFromUrl(url: string): Promise<{ url: string; publicId: string }> {
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const filePath = path.join(uploadsDir, filename);
  await downloadFile(url, filePath);
  return {
    url: `/uploads/products/${filename}`,
    publicId: filename,
  };
}

export async function deleteLocalImage(publicId: string): Promise<void> {
  const filePath = path.join(uploadsDir, publicId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
