import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ProductModel } from '../models/product';
import { ImageModel } from '../models/image';

const router = Router();

const listSchema = z.object({
  category: z.string().max(100).optional(),
  material: z.string().max(100).optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  search: z.string().max(200).optional(),
  featured: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

// GET /api/products — list with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const parsed = listSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid query parameters' });
      return;
    }
    const { category, material, min_price, max_price, search, featured, limit, offset } = parsed.data;
    const result = await ProductModel.findAll({
      category,
      material,
      minPrice: min_price,
      maxPrice: max_price,
      search,
      featured: featured === 'true',
      limit,
      offset,
    });
    res.json(result);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/featured
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const products = await ProductModel.getFeatured();
    res.json(products);
  } catch (err) {
    console.error('Error fetching featured:', err);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// GET /api/products/search?q=
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = z.string().max(200).optional().safeParse(req.query.q);
    if (!q.success || !q.data || q.data.length < 2) {
      res.json({ products: [], total: 0 });
      return;
    }
    const result = await ProductModel.findAll({ search: q.data, limit: 10 });
    res.json(result);
  } catch (err) {
    console.error('Error searching:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const product = await ProductModel.findBySlug(slug);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const images = await ImageModel.findByProduct(product.id);
    res.json({ ...product, images });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
