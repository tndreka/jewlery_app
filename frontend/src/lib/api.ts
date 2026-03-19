import type { Product, Category, Cart, CartItem, Order } from '../types';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://argjendari-kadriu.onrender.com' : '');
const BASE = API_URL ? `${API_URL}/api` : '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Products
export const api = {
  getProducts(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ products: Product[]; total: number }>(`/products${qs}`);
  },
  getFeatured() {
    return request<Product[]>('/products/featured');
  },
  getProduct(slug: string) {
    return request<Product>(`/products/${slug}`);
  },
  searchProducts(q: string) {
    return request<{ products: Product[]; total: number }>(`/products/search?q=${encodeURIComponent(q)}`);
  },

  // Categories
  getCategories() {
    return request<Category[]>('/categories');
  },
  getCategoryProducts(slug: string, params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ products: Product[]; total: number }>(`/categories/${slug}/products${qs}`);
  },

  // Cart
  getCart() {
    return request<Cart>('/cart');
  },
  addToCart(product_id: string, quantity = 1) {
    return request<CartItem>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id, quantity }),
    });
  },
  updateCartItem(id: string, quantity: number) {
    return request('/cart/items/' + id, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },
  removeCartItem(id: string) {
    return request('/cart/items/' + id, { method: 'DELETE' });
  },
  clearCart() {
    return request('/cart', { method: 'DELETE' });
  },

  // Orders
  placeOrder(data: { customer_name: string; customer_email: string; customer_phone?: string; shipping_address: string }) {
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getOrder(orderNumber: string) {
    return request<Order>(`/orders/${orderNumber}`);
  },
};
