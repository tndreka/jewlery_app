import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Product, Category } from '../types';
import ProductCard from '../components/product/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getFeatured(), api.getCategories()])
      .then(([feat, cats]) => {
        setFeatured(feat);
        setCategories(cats.filter(c => c.product_count > 0));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="h-screen flex items-center justify-center bg-surface relative overflow-hidden">
        <div className="text-center z-10 px-5">
          <h1 className="text-[28px] md:text-[42px] font-light tracking-[0.3em] uppercase leading-tight">
            Argjendari
            <br />
            Kadriu
          </h1>
          <p className="mt-4 text-[13px] md:text-[14px] text-secondary tracking-[0.15em] font-light">
            Handcrafted Jewelry
          </p>
          <Link
            to="/shop"
            className="inline-block mt-8 bg-primary text-white px-10 py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
          <h2 className="text-center text-[11px] tracking-[0.25em] uppercase text-secondary mb-12">
            Collections
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group relative aspect-[3/4] bg-surface overflow-hidden flex items-end"
              >
                {cat.image_url && (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="relative z-10 w-full p-5 bg-gradient-to-t from-black/40 to-transparent">
                  <p className="text-white text-[12px] tracking-[0.2em] uppercase">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
          <h2 className="text-center text-[11px] tracking-[0.25em] uppercase text-secondary mb-12">
            Featured
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="text-[11px] tracking-[0.2em] uppercase underline underline-offset-4 text-secondary hover:text-primary transition-colors"
            >
              View All
            </Link>
          </div>
        </section>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
