import { query } from '../config/database';

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  cloudinary_id: string | null;
  sort_order: number;
  created_at: Date;
}

export const ImageModel = {
  async addToProduct(productId: string, url: string, cloudinaryId: string): Promise<ProductImage> {
    const maxOrder = await query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 as next FROM product_images WHERE product_id = $1',
      [productId]
    );
    const result = await query(
      'INSERT INTO product_images (product_id, url, cloudinary_id, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [productId, url, cloudinaryId, maxOrder.rows[0].next]
    );
    return result.rows[0];
  },

  async findByProduct(productId: string): Promise<ProductImage[]> {
    const result = await query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order',
      [productId]
    );
    return result.rows;
  },

  async delete(id: string): Promise<ProductImage | null> {
    const result = await query('DELETE FROM product_images WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  async deleteByProduct(productId: string): Promise<ProductImage[]> {
    const result = await query('DELETE FROM product_images WHERE product_id = $1 RETURNING *', [productId]);
    return result.rows;
  },
};
