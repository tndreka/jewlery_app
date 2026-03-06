import { Router, Request, Response } from 'express';
import { CategoryModel } from '../models/category';
import { ProductModel } from '../models/product';

const router = Router();

// GET /api/categories
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.findAll();
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/:slug/products
router.get('/:slug/products', async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.query as Record<string, string | undefined>;
    const slug = req.params.slug as string;
    const result = await ProductModel.findAll({
      category: slug,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json(result);
  } catch (err) {
    console.error('Error fetching category products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router;
