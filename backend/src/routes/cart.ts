import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { CartModel } from '../models/cart';
import { v4 as uuid } from 'uuid';

const router = Router();

// Get or create session ID from cookie
function getSessionId(req: Request, res: Response): string {
  let sessionId = req.cookies?.cart_session as string | undefined;
  if (!sessionId) {
    sessionId = uuid();
    res.cookie('cart_session', sessionId, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax',
    });
  }
  return sessionId;
}

// GET /api/cart
router.get('/', async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req, res);
    const items = await CartModel.getBySession(sessionId);
    const subtotal = items.reduce((sum, item) => {
      const price = item.sale_price || item.price || 0;
      return sum + price * item.quantity;
    }, 0);
    res.json({ items, subtotal });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart/items
router.post('/items', async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req, res);
    const schema = z.object({
      product_id: z.string().uuid(),
      variant_id: z.string().uuid().nullable().optional(),
      quantity: z.number().int().min(1).max(50).optional().default(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid cart item data' });
      return;
    }
    const { product_id, variant_id, quantity } = parsed.data;
    const item = await CartModel.addItem(sessionId, product_id, variant_id || null, quantity);
    res.status(201).json(item);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// PUT /api/cart/items/:id
router.put('/items/:id', async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req, res);
    const id = req.params.id as string;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      res.status(400).json({ error: 'Valid quantity required' });
      return;
    }
    const item = await CartModel.updateQuantity(id, sessionId, quantity);
    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/cart/items/:id
router.delete('/items/:id', async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req, res);
    const id = req.params.id as string;
    const removed = await CartModel.removeItem(id, sessionId);
    if (!removed) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// DELETE /api/cart
router.delete('/', async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req, res);
    await CartModel.clearSession(sessionId);
    res.json({ success: true });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
