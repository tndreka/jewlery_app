import { query, pool } from '../config/database';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  stripe_payment_id: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  items: { product_id: string; variant_id?: string; quantity: number }[];
}

export const OrderModel = {
  async create(input: CreateOrderInput): Promise<Order> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Generate order number
      const countResult = await client.query('SELECT COUNT(*) FROM orders');
      const orderNumber = `JW-${String(parseInt(countResult.rows[0].count) + 1).padStart(4, '0')}`;

      // Calculate totals from product prices
      let subtotal = 0;
      const itemDetails: { product_id: string; variant_id: string | null; product_name: string; quantity: number; unit_price: number }[] = [];

      for (const item of input.items) {
        const productResult = await client.query('SELECT name, price, sale_price FROM products WHERE id = $1', [item.product_id]);
        if (!productResult.rows[0]) throw new Error(`Product ${item.product_id} not found`);
        const product = productResult.rows[0];
        const unitPrice = product.sale_price || product.price;
        subtotal += unitPrice * item.quantity;
        itemDetails.push({
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          product_name: product.name,
          quantity: item.quantity,
          unit_price: unitPrice,
        });
      }

      const shippingCost = 0; // Free shipping for now
      const total = subtotal + shippingCost;

      const orderResult = await client.query(
        `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, shipping_address, subtotal, shipping_cost, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [orderNumber, input.customer_name, input.customer_email, input.customer_phone || null,
         input.shipping_address, subtotal, shippingCost, total]
      );

      const order = orderResult.rows[0];

      for (const item of itemDetails) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, variant_id, product_name, quantity, unit_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [order.id, item.product_id, item.variant_id, item.product_name, item.quantity, item.unit_price]
        );
      }

      await client.query('COMMIT');

      return { ...order, items: itemDetails };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async findById(id: string): Promise<Order | null> {
    const result = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (!result.rows[0]) return null;
    const items = await query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    return { ...result.rows[0], items: items.rows };
  },

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const result = await query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
    if (!result.rows[0]) return null;
    const items = await query('SELECT * FROM order_items WHERE order_id = $1', [result.rows[0].id]);
    return { ...result.rows[0], items: items.rows };
  },

  async findRecent(limit = 10): Promise<Order[]> {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC LIMIT $1', [limit]);
    return result.rows;
  },

  async updateStatus(id: string, status: string): Promise<Order | null> {
    const result = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  },

  async setTracking(id: string, trackingNumber: string): Promise<Order | null> {
    const result = await query(
      'UPDATE orders SET tracking_number = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [trackingNumber, 'shipped', id]
    );
    return result.rows[0] || null;
  },

  async getStats(): Promise<{ today: number; week: number; month: number; total: number; orderCount: number }> {
    const result = await query(`
      SELECT
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE THEN total ELSE 0 END), 0) as today,
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN total ELSE 0 END), 0) as week,
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN total ELSE 0 END), 0) as month,
        COALESCE(SUM(total), 0) as total,
        COUNT(*) as order_count
      FROM orders WHERE status != 'cancelled'
    `);
    return {
      today: parseFloat(result.rows[0].today),
      week: parseFloat(result.rows[0].week),
      month: parseFloat(result.rows[0].month),
      total: parseFloat(result.rows[0].total),
      orderCount: parseInt(result.rows[0].order_count),
    };
  },
};
