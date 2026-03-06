import { Router, Request, Response } from 'express';
import { OrderModel } from '../models/order';
import { CartModel } from '../models/cart';

const router = Router();

// Store bot reference for notifications
let botInstance: any = null;
export function setBotInstance(bot: any) {
  botInstance = bot;
}

// POST /api/orders — place order from cart
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customer_name, customer_email, customer_phone, shipping_address } = req.body;

    if (!customer_name || !customer_email || !shipping_address) {
      res.status(400).json({ error: 'Name, email, and shipping address are required' });
      return;
    }

    const sessionId = req.cookies?.cart_session as string | undefined;
    if (!sessionId) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    const cartItems = await CartModel.getBySession(sessionId);
    if (cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
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

    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders/:orderNumber — check order status
router.get('/:orderNumber', async (req: Request, res: Response) => {
  try {
    const orderNumber = req.params.orderNumber as string;
    const order = await OrderModel.findByOrderNumber(orderNumber);
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
