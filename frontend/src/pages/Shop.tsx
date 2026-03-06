import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Product } from '../types';
import ProductGrid from '../components/product/ProductGrid';

const materials = ['gold', 'silver', 'rose_gold', 'platinum'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const activeMaterial = searchParams.get('material') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 24;

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { limit: String(limit), offset: String((page - 1) * limit) };
    if (activeMaterial) params.material = activeMaterial;
    api.getProducts(params)
      .then(data => { setProducts(data.products); setTotal(data.total); })
      .finally(() => setLoading(false));
  }, [activeMaterial, page]);

  const setMaterial = (mat: string) => {
    const next = new URLSearchParams(searchParams);
    if (mat === activeMaterial) next.delete('material');
    else next.set('material', mat);
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <h1 className="text-center text-[13px] tracking-[0.25em] uppercase mb-8">All Products</h1>

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {materials.map(mat => (
            <button
              key={mat}
              onClick={() => setMaterial(mat)}
              className={`px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase border transition-colors ${
                activeMaterial === mat
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              {mat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <ProductGrid products={products} loading={loading} />

        {/* Load more */}
        {total > products.length + (page - 1) * limit && (
          <div className="text-center mt-12">
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set('page', String(page + 1));
                setSearchParams(next);
              }}
              className="text-[11px] tracking-[0.2em] uppercase underline underline-offset-4 text-secondary hover:text-primary"
            >
              Load More
            </button>
          </div>
        )}

        <p className="text-center text-[11px] text-secondary mt-6 tracking-wide">
          {total} product{total !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
