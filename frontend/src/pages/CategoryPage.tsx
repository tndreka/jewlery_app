import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useI18n } from '../i18n';
import type { Product } from '../types';
import ProductGrid from '../components/product/ProductGrid';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getCategoryProducts(slug, { limit: '100' })
      .then(data => setProducts(data.products))
      .finally(() => setLoading(false));
  }, [slug]);

  const title = slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';

  return (
    <div className="pt-[70px]">
      <div className="bg-cream py-14 md:py-20">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.2em] uppercase text-secondary font-light mb-3 animate-fade-up">
            <Link to="/shop" className="hover:text-primary transition-colors">{t('nav.shop')}</Link>
            <span className="text-border">/</span>
            <span className="text-primary">{title}</span>
          </div>
          <h1 className="font-display text-[32px] md:text-[48px] font-light tracking-[0.05em] animate-fade-up" style={{ animationDelay: '100ms' }}>
            {title}
          </h1>
          <p className="mt-3 text-[11px] text-secondary font-light tracking-wide animate-fade-up" style={{ animationDelay: '200ms' }}>
            {products.length} {products.length !== 1 ? t('shop.pieces') : t('shop.piece')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  );
}
