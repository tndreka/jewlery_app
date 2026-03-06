import { Router, Request, Response } from 'express';
import { ProductModel } from '../models/product';
import { ImageModel } from '../models/image';

const router = Router();

// GET /api/products — list with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, material, min_price, max_price, search, featured, limit, offset } = req.query as Record<string, string | undefined>;
    const result = await ProductModel.findAll({
      category: category as string,
      material: material as string,
      minPrice: min_price ? parseFloat(min_price as string) : undefined,
      maxPrice: max_price ? parseFloat(max_price as string) : undefined,
      search: search as string,
      featured: featured === 'true',
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
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
    const q = req.query.q as string | undefined;
    if (!q || q.length < 2) {
      res.json({ products: [], total: 0 });
      return;
    }
    const result = await ProductModel.findAll({ search: q, limit: 10 });
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
