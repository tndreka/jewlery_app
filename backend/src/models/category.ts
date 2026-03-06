import { query } from '../config/database';
import slugify from 'slugify';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  created_at: Date;
  product_count?: number;
}

export const CategoryModel = {
  async findAll(): Promise<Category[]> {
    const result = await query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM products WHERE category_id = c.id AND published = true) as product_count
       FROM categories c
       ORDER BY c.sort_order`
    );
    return result.rows;
  },

  async findBySlug(slug: string): Promise<Category | null> {
    const result = await query('SELECT * FROM categories WHERE slug = $1', [slug]);
    return result.rows[0] || null;
  },

  async findById(id: string): Promise<Category | null> {
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(name: string): Promise<Category> {
    const slug = slugify(name, { lower: true, strict: true });
    const maxOrder = await query('SELECT COALESCE(MAX(sort_order), 0) + 1 as next FROM categories');
    const result = await query(
      'INSERT INTO categories (name, slug, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, maxOrder.rows[0].next]
    );
    return result.rows[0];
  },

  async update(id: string, name: string): Promise<Category | null> {
    const slug = slugify(name, { lower: true, strict: true });
    const result = await query(
      'UPDATE categories SET name = $1, slug = $2 WHERE id = $3 RETURNING *',
      [name, slug, id]
    );
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM categories WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
