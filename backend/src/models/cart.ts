import { query } from '../config/database';

export interface CartItem {
  id: string;
  session_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product_name?: string;
  price?: number;
  sale_price?: number;
  in_stock?: boolean;
  image_url?: string;
}

export const CartModel = {
  async getBySession(sessionId: string): Promise<CartItem[]> {
    const result = await query(
      `SELECT ci.*, p.name as product_name, p.price, p.sale_price, p.in_stock,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.session_id = $1
       ORDER BY ci.created_at`,
      [sessionId]
    );
    return result.rows;
  },

  async addItem(sessionId: string, productId: string, variantId: string | null, quantity: number): Promise<CartItem> {
    // Check if item already exists in cart
    const existing = await query(
      'SELECT * FROM cart_items WHERE session_id = $1 AND product_id = $2 AND variant_id IS NOT DISTINCT FROM $3',
      [sessionId, productId, variantId]
    );

    if (existing.rows[0]) {
      const result = await query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2 RETURNING *',
        [quantity, existing.rows[0].id]
      );
      return result.rows[0];
    }

    const result = await query(
      'INSERT INTO cart_items (session_id, product_id, variant_id, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [sessionId, productId, variantId, quantity]
    );
    return result.rows[0];
  },

  async updateQuantity(id: string, sessionId: string, quantity: number): Promise<CartItem | null> {
    const result = await query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND session_id = $3 RETURNING *',
      [quantity, id, sessionId]
    );
    return result.rows[0] || null;
  },

  async removeItem(id: string, sessionId: string): Promise<boolean> {
    const result = await query('DELETE FROM cart_items WHERE id = $1 AND session_id = $2', [id, sessionId]);
    return (result.rowCount ?? 0) > 0;
  },

  async clearSession(sessionId: string): Promise<void> {
    await query('DELETE FROM cart_items WHERE session_id = $1', [sessionId]);
  },
};
