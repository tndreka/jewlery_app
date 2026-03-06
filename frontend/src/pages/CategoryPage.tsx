import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Product } from '../types';
import ProductGrid from '../components/product/ProductGrid';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getCategoryProducts(slug)
      .then(data => setProducts(data.products))
      .finally(() => setLoading(false));
  }, [slug]);

  const title = slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';

  return (
    <div className="pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <h1 className="text-center text-[13px] tracking-[0.25em] uppercase mb-10">{title}</h1>
        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  );
}
