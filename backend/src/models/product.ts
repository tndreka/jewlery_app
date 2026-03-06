import { query } from '../config/database';
import slugify from 'slugify';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category_id: string | null;
  material: string | null;
  gemstone: string | null;
  weight: string | null;
  in_stock: boolean;
  featured: boolean;
  published: boolean;
  created_at: Date;
  updated_at: Date;
  image_url?: string;
  category_name?: string;
  category_slug?: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  material?: string;
  gemstone?: string;
  weight?: string;
}

export const ProductModel = {
  async create(input: CreateProductInput): Promise<Product> {
    const slug = slugify(input.name, { lower: true, strict: true });
    const result = await query(
      `INSERT INTO products (name, slug, description, price, category_id, material, gemstone, weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [input.name, slug, input.description || null, input.price, input.category_id || null,
       input.material || null, input.gemstone || null, input.weight || null]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<Product | null> {
    const result = await query(
      `SELECT p.*,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
       FROM products p WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findBySlug(slug: string): Promise<Product | null> {
    const result = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = $1 AND p.published = true`,
      [slug]
    );
    return result.rows[0] || null;
  },

  async findAll(filters: {
    category?: string;
    material?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ products: Product[]; total: number }> {
    const conditions: string[] = ['p.published = true'];
    const params: any[] = [];
    let paramIdx = 1;

    if (filters.category) {
      conditions.push(`c.slug = $${paramIdx++}`);
      params.push(filters.category);
    }
    if (filters.material) {
      conditions.push(`p.material = $${paramIdx++}`);
      params.push(filters.material);
    }
    if (filters.minPrice) {
      conditions.push(`COALESCE(p.sale_price, p.price) >= $${paramIdx++}`);
      params.push(filters.minPrice);
    }
    if (filters.maxPrice) {
      conditions.push(`COALESCE(p.sale_price, p.price) <= $${paramIdx++}`);
      params.push(filters.maxPrice);
    }
    if (filters.featured) {
      conditions.push('p.featured = true');
    }
    if (filters.search) {
      conditions.push(`(p.name ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx})`);
      params.push(`%${filters.search}%`);
      paramIdx++;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = filters.limit || 24;
    const offset = filters.offset || 0;

    const countResult = await query(
      `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where}`,
      params
    );

    const result = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset]
    );

    return { products: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async update(id: string, fields: Record<string, any>): Promise<Product | null> {
    const allowed = ['name', 'description', 'price', 'sale_price', 'category_id',
      'material', 'gemstone', 'weight', 'in_stock', 'featured', 'published'];
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        updates.push(`${key} = $${idx++}`);
        params.push(value);
      }
    }

    if (fields.name) {
      updates.push(`slug = $${idx++}`);
      params.push(slugify(fields.name, { lower: true, strict: true }));
    }

    if (updates.length === 0) return this.findById(id);

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM products WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },

  async getFeatured(): Promise<Product[]> {
    const result = await query(
      `SELECT p.*, c.name as category_name,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.featured = true AND p.published = true
       ORDER BY p.updated_at DESC
       LIMIT 12`
    );
    return result.rows;
  },

  async getRecent(limit = 10): Promise<Product[]> {
    const result = await query(
      `SELECT p.*,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
       FROM products p
       WHERE p.published = true
       ORDER BY p.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },
};
