export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  material: string | null;
  gemstone: string | null;
  weight: string | null;
  in_stock: boolean;
  featured: boolean;
  image_url: string | null;
  images?: ProductImage[];
  created_at: string;
}

export interface ProductImage {
  id: string;
  url: string;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  product_count: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product_name: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  tracking_number: string | null;
  items: { product_name: string; quantity: number; unit_price: number }[];
  created_at: string;
}
