import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Product, Category } from '../types';
import ProductCard from '../components/product/ProductCard';

const categoryDescriptions: Record<string, string> = {
  rings: 'Every ring tells a story. From statement pieces to everyday elegance, find the one that speaks to you.',
  necklaces: 'A necklace transforms any look. Delicate chains, bold pendants, and timeless gold pieces crafted to perfection.',
  bracelets: 'Adorn your wrist with handcrafted gold bracelets. Stacked or solo, each piece makes a statement.',
  earrings: 'From subtle studs to dramatic drops, our earrings are designed to frame your face with brilliance.',
  sets: 'Perfectly matched jewelry sets for a complete, coordinated look. The ultimate gift of elegance.',
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getProducts({ limit: '8' }),
    ])
      .then(async ([cats, recent]) => {
        const activeCats = cats.filter(c => c.product_count > 0);
        setCategories(activeCats);
        setRecentProducts(recent.products);

        // Fetch products for each category
        const productMap: Record<string, Product[]> = {};
        await Promise.all(
          activeCats.map(async (cat) => {
            const { products } = await api.getCategoryProducts(cat.slug, { limit: '4' });
            productMap[cat.slug] = products;
          })
        );
        setCategoryProducts(productMap);
      })
      .finally(() => setLoading(false));
  }, []);

  const heroProducts = recentProducts.filter(p => p.image_url).slice(0, 3);

  return (
    <div>
      {/* Hero — Full viewport */}
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

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '1.5s' }}>
          <span className="text-[9px] tracking-[0.4em] uppercase text-white/30 font-light">Scroll</span>
          <div className="w-[1px] h-8 bg-white/20 relative overflow-hidden">
            <div className="w-full h-3 bg-gold/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Category Sections — Icebox-style: each category gets its own showcase */}
      {categories.map((cat, i) => {
        const products = categoryProducts[cat.slug] || [];
        const isEven = i % 2 === 0;

        return (
          <section
            key={cat.id}
            className={`py-16 md:py-28 ${isEven ? 'bg-white' : 'bg-cream'}`}
          >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              {/* Category header — alternating image left/right */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mb-14 md:mb-20 ${
                !isEven ? 'md:direction-rtl' : ''
              }`}>
                {/* Image side */}
                <Link
                  to={`/category/${cat.slug}`}
                  className={`group relative aspect-[4/3] md:aspect-[16/9] overflow-hidden img-zoom ${
                    !isEven ? 'md:order-2' : ''
                  }`}
                >
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center">
                      <span className="font-display text-[64px] text-border/40 font-light italic">{cat.name[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </Link>

                {/* Text side */}
                <div className={`${!isEven ? 'md:order-1 md:text-right' : ''}`}>
                  <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-light">
                    Collection
                  </p>
                  <h2 className="mt-3 font-display text-[32px] md:text-[48px] font-light tracking-[0.05em] leading-tight">
                    {cat.name}
                  </h2>
                  <p className="mt-4 text-[12px] md:text-[13px] text-secondary leading-[1.8] font-light max-w-md">
                    {categoryDescriptions[cat.slug] || `Explore our curated collection of ${cat.name.toLowerCase()}.`}
                  </p>
                  <p className="mt-3 text-[11px] text-secondary/60 font-light">
                    {cat.product_count} pieces
                  </p>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="mt-6 inline-block border border-primary text-primary px-10 py-3.5 text-[10px] tracking-[0.25em] uppercase font-light hover:bg-primary hover:text-white transition-all duration-500"
                  >
                    Shop {cat.name}
                  </Link>
                </div>
              </div>

              {/* Product grid for this category */}
              {products.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 stagger-children">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Show more link */}
              {products.length > 0 && (
                <div className="text-center mt-12">
                  <Link
                    to={`/category/${cat.slug}`}
                    className="link-reveal text-[10px] tracking-[0.2em] uppercase font-light text-secondary hover:text-primary transition-colors"
                  >
                    View All {cat.name}
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Editorial divider */}
      <div className="flex items-center justify-center py-6">
        <div className="h-[1px] w-20 bg-border" />
        <img src="/logo.jpeg" alt="" className="mx-6 h-8 object-contain invert opacity-20" />
        <div className="h-[1px] w-20 bg-border" />
      </div>

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
