import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { OrderModel } from '../models/order';
import { CartModel } from '../models/cart';
import { sendOrderConfirmation } from '../config/email';

const router = Router();

// Store bot reference for notifications
let botInstance: any = null;
export function setBotInstance(bot: any) {
  botInstance = bot;
}

// Validation schemas
const placeOrderSchema = z.object({
  customer_name: z.string().min(2).max(100).trim(),
  customer_email: z.string().email().max(254).trim().toLowerCase(),
  customer_phone: z.string().max(20).trim().optional().default(''),
  shipping_address: z.string().min(5).max(500).trim(),
});

// POST /api/orders — place order from cart
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = placeOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { customer_name, customer_email, customer_phone, shipping_address } = parsed.data;

    const sessionId = (req.headers['x-cart-session'] as string) || req.cookies?.cart_session;
    if (!sessionId) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    const cartItems = await CartModel.getBySession(sessionId);
    if (cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Check stock for all items
    for (const item of cartItems) {
      if (item.in_stock === false) {
        res.status(400).json({ error: `"${item.product_name}" is out of stock` });
        return;
      }
    }

    const order = await OrderModel.create({
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      items: cartItems.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id || undefined,
        quantity: item.quantity,
      })),
    });

    // Clear cart after order
    await CartModel.clearSession(sessionId);

    // Notify owner via Telegram
    if (botInstance) {
      const { sendOrderNotification } = await import('../bot/commands/orders');
      await sendOrderNotification(botInstance, order).catch(console.error);
    }

    // Send confirmation email
    if (order.items) {
      await sendOrderConfirmation({
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        total: order.total,
        items: order.items.map(i => ({
          product_name: i.product_name,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      }).catch(console.error);
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders/:orderNumber — check order status
router.get('/:orderNumber', async (req: Request, res: Response) => {
  try {
    const orderNumber = z.string().min(1).max(20).safeParse(req.params.orderNumber);
    if (!orderNumber.success) {
      res.status(400).json({ error: 'Invalid order number' });
      return;
    }

    const order = await OrderModel.findByOrderNumber(orderNumber.data);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    // Only return safe fields to public
    res.json({
      order_number: order.order_number,
      status: order.status,
      total: order.total,
      tracking_number: order.tracking_number,
      items: order.items?.map(i => ({
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
      created_at: order.created_at,
    });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
