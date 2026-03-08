import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Product, Category } from '../types';
import ProductCard from '../components/product/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getFeatured(),
      api.getCategories(),
      api.getProducts({ limit: '8' }),
    ])
      .then(([feat, cats, recent]) => {
        setFeatured(feat);
        setCategories(cats.filter(c => c.product_count > 0));
        setRecentProducts(recent.products);
      })
      .finally(() => setLoading(false));
  }, []);

  // Use first product images as hero backgrounds
  const heroProducts = recentProducts.filter(p => p.image_url).slice(0, 3);

  return (
    <div>
      {/* Hero — Full viewport, Zara-style editorial */}
      <section className="relative h-screen bg-primary overflow-hidden">
        {heroProducts.length > 0 && (
          <div className="absolute inset-0">
            <img
              src={heroProducts[0].image_url!}
              alt=""
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
          </div>
        )}

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <div className="animate-fade-up">
            <p className="text-[10px] md:text-[11px] tracking-[0.6em] uppercase text-white/50 font-light">
              Fine Gold Jewelry
            </p>
          </div>

          <h1
            className="mt-4 font-display text-[40px] md:text-[72px] lg:text-[90px] font-light text-white leading-[0.95] tracking-[0.08em] animate-fade-up"
            style={{ animationDelay: '150ms' }}
          >
            Argjendari
            <br />
            <span className="italic font-light">Kadriu</span>
          </h1>

          <div
            className="mt-8 h-[1px] w-16 bg-gold animate-draw-line"
            style={{ animationDelay: '500ms' }}
          />

          <Link
            to="/shop"
            className="mt-10 inline-block border border-white/30 text-white px-12 py-4 text-[10px] tracking-[0.35em] uppercase font-light hover:bg-white hover:text-primary transition-all duration-500 animate-fade-up"
            style={{ animationDelay: '400ms' }}
          >
            Discover Collection
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '1.5s' }}>
          <span className="text-[9px] tracking-[0.4em] uppercase text-white/30 font-light">Scroll</span>
          <div className="w-[1px] h-8 bg-white/20 relative overflow-hidden">
            <div className="w-full h-3 bg-gold/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Category Grid — Zara-style asymmetric editorial layout */}
      {categories.length > 0 && (
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16 md:mb-24">
              <p className="text-[10px] tracking-[0.5em] uppercase text-secondary font-light">Curated</p>
              <h2 className="mt-3 font-display text-[28px] md:text-[42px] font-light tracking-[0.05em]">
                Collections
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className={`group relative overflow-hidden img-zoom ${
                    i === 0 ? 'md:col-span-2 md:row-span-2 aspect-[4/5] md:aspect-auto' : 'aspect-[3/4]'
                  }`}
                >
                  <div className="absolute inset-0 bg-surface">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-cream flex items-center justify-center">
                        <span className="font-display text-[48px] text-border/50 font-light italic">{cat.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                    <h3 className="font-display text-[18px] md:text-[24px] font-light text-white tracking-[0.1em]">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-[10px] tracking-[0.2em] uppercase text-white/50 font-light">
                      {cat.product_count} pieces
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Editorial divider */}
      <div className="flex items-center justify-center py-4">
        <div className="h-[1px] w-20 bg-border" />
        <img src="/logo.jpeg" alt="" className="mx-6 h-8 object-contain invert opacity-20" />
        <div className="h-[1px] w-20 bg-border" />
      </div>

      {/* New Arrivals */}
      {recentProducts.length > 0 && (
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-end justify-between mb-12 md:mb-16">
              <div>
                <p className="text-[10px] tracking-[0.5em] uppercase text-secondary font-light">New In</p>
                <h2 className="mt-3 font-display text-[28px] md:text-[42px] font-light tracking-[0.05em]">
                  Latest Arrivals
                </h2>
              </div>
              <Link
                to="/shop"
                className="link-reveal text-[10px] tracking-[0.2em] uppercase font-light text-secondary hover:text-primary transition-colors hidden md:block"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 stagger-children">
              {recentProducts.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-14 md:hidden">
              <Link
                to="/shop"
                className="inline-block border border-primary text-primary px-10 py-3.5 text-[10px] tracking-[0.25em] uppercase font-light hover:bg-primary hover:text-white transition-all duration-400"
              >
                View All
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured — Horizontal scroll on mobile */}
      {featured.length > 0 && (
        <section className="bg-cream py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-12 md:mb-16">
              <p className="text-[10px] tracking-[0.5em] uppercase text-secondary font-light">Selected</p>
              <h2 className="mt-3 font-display text-[28px] md:text-[42px] font-light tracking-[0.05em]">
                Featured Pieces
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 stagger-children">
              {featured.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="relative py-28 md:py-40 overflow-hidden">
        {heroProducts.length > 1 && (
          <div className="absolute inset-0">
            <img
              src={heroProducts[1].image_url!}
              alt=""
              className="w-full h-full object-cover opacity-15"
            />
          </div>
        )}
        <div className="relative z-10 text-center px-6">
          <p className="text-[10px] tracking-[0.5em] uppercase text-secondary font-light">Visit Us</p>
          <h2 className="mt-4 font-display text-[28px] md:text-[48px] font-light tracking-[0.05em] leading-tight">
            Bulevardi Zogu i Pare
          </h2>
          <p className="mt-4 text-[12px] text-secondary font-light max-w-md mx-auto leading-relaxed">
            Experience our collection in person. Every piece is meant to be touched, worn, and felt.
          </p>
          <a
            href="https://instagram.com/argjendarikadriu"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block border border-primary text-primary px-10 py-3.5 text-[10px] tracking-[0.25em] uppercase font-light hover:bg-primary hover:text-white transition-all duration-500"
          >
            Follow on Instagram
          </a>
        </div>
      </section>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-5 h-5 border border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
