import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../lib/api';
import { useI18n } from '../i18n';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import type { Product, Category } from '../types';
import ProductGrid from '../components/product/ProductGrid';

export default function Shop() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const activeCategory = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 24;

  const headerRef = useScrollAnimation<HTMLDivElement>({ animation: 'fadeUp' });

  useEffect(() => {
    api.getCategories().then(cats => setCategories(cats.filter(c => c.product_count > 0)));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params: Record<string, string> = { limit: String(limit), offset: String((page - 1) * limit) };
    if (activeCategory) params.category = activeCategory;
    (async () => {
      const data = await api.getProducts(params);
      if (!cancelled) { setProducts(data.products); setTotal(data.total); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [activeCategory, page]);

  const setCategory = (cat: string) => {
    const next = new URLSearchParams(searchParams);
    if (cat === activeCategory) next.delete('category');
    else next.set('category', cat);
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="pt-[70px]">
      <Helmet>
        <title>{activeCategory ? `${activeCategory.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — ` : ''}Shop | Argjendari Kadriu</title>
        <meta name="description" content="Browse our collection of handcrafted gold jewelry. Rings, necklaces, bracelets, earrings and sets." />
      </Helmet>
      <div className="bg-cream py-14 md:py-20">
        <div ref={headerRef} className="text-center">
          <p className="text-[10px] tracking-[0.5em] uppercase text-secondary font-light">{t('shop.collection')}</p>
          <h1 className="mt-3 font-display text-[32px] md:text-[48px] font-light tracking-[0.05em]">
            {activeCategory ? activeCategory.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : t('shop.allJewelry')}
          </h1>
          <p className="mt-3 text-[11px] text-secondary font-light tracking-wide">
            {total} {total !== 1 ? t('shop.pieces') : t('shop.piece')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <div className="flex justify-center gap-2 md:gap-3 mb-12 flex-wrap">
          <button
            onClick={() => setCategory('')}
            className={`px-5 py-2 text-[10px] tracking-[0.2em] uppercase font-light border transition-all duration-300 ${
              !activeCategory
                ? 'bg-primary text-white border-primary'
                : 'border-border text-secondary hover:border-primary hover:text-primary'
            }`}
          >
            {t('shop.all')}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={`px-5 py-2 text-[10px] tracking-[0.2em] uppercase font-light border transition-all duration-300 ${
                activeCategory === cat.slug
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <ProductGrid products={products} loading={loading} />

        {total > products.length + (page - 1) * limit && (
          <div className="text-center mt-16">
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set('page', String(page + 1));
                setSearchParams(next);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-block border border-primary text-primary px-12 py-3.5 text-[10px] tracking-[0.25em] uppercase font-light hover:bg-primary hover:text-white transition-all duration-400"
            >
              {t('shop.loadMore')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
